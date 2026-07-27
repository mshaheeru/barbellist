"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getActionContextWithRole } from "@/lib/auth/get-action-context";
import {
  canAccessDangerZone,
  canAccessSettings,
  canEditWhatsAppCredentials,
  canManageStaff,
} from "@/lib/auth/permissions";
import { buildGymDataZip } from "@/lib/settings/export";
import {
  fetchSettingsPageData,
  mergeGymSettings,
} from "@/lib/settings/queries";
import {
  parseWhatsAppCredentials,
  type SettingsPageData,
} from "@/lib/settings/types";
import {
  cardTemplateSchema,
  deleteGymSchema,
  gymProfileSchema,
  inviteStaffSchema,
  updateStaffRoleSchema,
  whatsappCredentialsSchema,
  type CardTemplateInput,
  type GymProfileInput,
  type InviteStaffInput,
  type WhatsAppCredentialsInput,
} from "@/lib/validations/settings";
import { updateReminderSchedule } from "@/app/actions/whatsapp";
import type { ReminderScheduleSettings } from "@/lib/whatsapp/schedule";
import {
  normalizeWhatsAppNumber,
  resolveWhatsAppCredentials,
  sendWhatsAppMessage,
} from "@/lib/whatsapp/cloud";
import type { StaffRole } from "@/lib/types";

function revalidateSettings() {
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
}

export async function getSettingsPageData(): Promise<{
  data: SettingsPageData | null;
  error: string | null;
}> {
  try {
    const ctx = await getActionContextWithRole();
    if (!ctx) return { data: null, error: "Not authenticated" };
    if (!canAccessSettings(ctx.role)) {
      return { data: null, error: "You do not have access to settings" };
    }

    const data = await fetchSettingsPageData(ctx.supabase, ctx.gymId, ctx.role);
    return { data, error: null };
  } catch (e) {
    return {
      data: null,
      error: e instanceof Error ? e.message : "Failed to load settings",
    };
  }
}

export async function updateGymProfile(
  raw: GymProfileInput,
): Promise<{ error: string | null }> {
  const parsed = gymProfileSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const ctx = await getActionContextWithRole();
  if (!ctx) return { error: "Not authenticated" };
  if (!canAccessSettings(ctx.role)) {
    return { error: "You do not have permission to update gym profile" };
  }

  const data = parsed.data;
  const { error } = await ctx.supabase
    .from("gyms")
    .update({
      name: data.name.trim(),
      address: data.address?.trim() || null,
      city: data.city?.trim() || null,
      country: data.country,
      phone: data.phone?.trim() || null,
      whatsapp: data.whatsapp?.trim() || null,
      email: data.email?.trim() || null,
      timezone: data.timezone,
      currency: data.currency,
      currency_symbol: data.currency_symbol,
    })
    .eq("id", ctx.gymId);

  if (error) return { error: error.message };
  revalidateSettings();
  return { error: null };
}

export async function uploadGymLogo(
  formData: FormData,
): Promise<{ data: { logo_url: string } | null; error: string | null }> {
  const ctx = await getActionContextWithRole();
  if (!ctx) return { data: null, error: "Not authenticated" };
  if (!canAccessSettings(ctx.role)) {
    return { data: null, error: "You do not have permission to upload a logo" };
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { data: null, error: "No file provided" };
  }
  if (!file.type.startsWith("image/")) {
    return { data: null, error: "Only image files are allowed" };
  }
  if (file.size > 2 * 1024 * 1024) {
    return { data: null, error: "Logo must be under 2MB" };
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const path = `${ctx.gymId}/logo.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: uploadError } = await ctx.supabase.storage
    .from("gym-assets")
    .upload(path, buffer, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    return { data: null, error: uploadError.message };
  }

  const {
    data: { publicUrl },
  } = ctx.supabase.storage.from("gym-assets").getPublicUrl(path);

  // Cache-bust so clients refresh the image
  const logo_url = `${publicUrl}?t=${Date.now()}`;

  const { error } = await ctx.supabase
    .from("gyms")
    .update({ logo_url })
    .eq("id", ctx.gymId);

  if (error) return { data: null, error: error.message };

  revalidateSettings();
  return { data: { logo_url }, error: null };
}

export async function updateGymSettings(
  key: "card_template" | "reminders" | "whatsapp",
  value: unknown,
): Promise<{ error: string | null }> {
  const ctx = await getActionContextWithRole();
  if (!ctx) return { error: "Not authenticated" };
  if (!canAccessSettings(ctx.role)) {
    return { error: "You do not have permission to update settings" };
  }

  if (key === "card_template") {
    const parsed = cardTemplateSchema.safeParse(value);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid card template" };
    }
    value = parsed.data;
  }

  if (key === "whatsapp" && !canEditWhatsAppCredentials(ctx.role)) {
    return { error: "Only the owner can update WhatsApp credentials" };
  }

  const result = await mergeGymSettings(ctx.supabase, ctx.gymId, {
    [key]: value,
  });
  if (result.error) return result;

  revalidateSettings();
  return { error: null };
}

export async function saveSettingsBundle(input: {
  profile: GymProfileInput;
  reminders: ReminderScheduleSettings;
  cardTemplate: CardTemplateInput;
  whatsapp?: WhatsAppCredentialsInput | null;
}): Promise<{ error: string | null }> {
  const profileResult = await updateGymProfile(input.profile);
  if (profileResult.error) return profileResult;

  const reminderResult = await updateReminderSchedule(input.reminders);
  if (reminderResult.error) return reminderResult;

  const cardResult = await updateGymSettings(
    "card_template",
    input.cardTemplate,
  );
  if (cardResult.error) return cardResult;

  if (input.whatsapp) {
    const waResult = await updateWhatsAppCredentials(input.whatsapp);
    if (waResult.error) return waResult;
  }

  return { error: null };
}

export async function updateWhatsAppCredentials(
  raw: WhatsAppCredentialsInput,
): Promise<{ error: string | null }> {
  const parsed = whatsappCredentialsSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const ctx = await getActionContextWithRole();
  if (!ctx) return { error: "Not authenticated" };
  if (!canEditWhatsAppCredentials(ctx.role)) {
    return { error: "Only the owner can update WhatsApp credentials" };
  }

  const { data: gym } = await ctx.supabase
    .from("gyms")
    .select("settings")
    .eq("id", ctx.gymId)
    .maybeSingle();

  const existing =
    gym?.settings &&
    typeof gym.settings === "object" &&
    !Array.isArray(gym.settings)
      ? (gym.settings as Record<string, unknown>)
      : {};
  const currentWa = parseWhatsAppCredentials(existing.whatsapp);

  const nextToken = parsed.data.api_token?.trim();
  // Empty / masked placeholder keeps existing token
  const keepToken =
    !nextToken ||
    nextToken.startsWith("••••") ||
    nextToken === currentWa.api_token;

  const next = {
    api_token: keepToken ? currentWa.api_token : nextToken,
    phone_number_id:
      parsed.data.phone_number_id?.trim() || currentWa.phone_number_id || "",
  };

  const result = await mergeGymSettings(ctx.supabase, ctx.gymId, {
    whatsapp: next,
  });
  if (result.error) return result;

  revalidateSettings();
  return { error: null };
}

export async function testWhatsAppConnection(): Promise<{
  error: string | null;
}> {
  const ctx = await getActionContextWithRole();
  if (!ctx) return { error: "Not authenticated" };
  if (!canAccessSettings(ctx.role)) {
    return { error: "You do not have permission to test WhatsApp" };
  }

  const { data: gym } = await ctx.supabase
    .from("gyms")
    .select("name, whatsapp, settings")
    .eq("id", ctx.gymId)
    .maybeSingle();

  if (!gym) return { error: "Gym not found" };

  const settings =
    gym.settings && typeof gym.settings === "object" && !Array.isArray(gym.settings)
      ? (gym.settings as Record<string, unknown>)
      : {};
  const wa = parseWhatsAppCredentials(settings.whatsapp);
  const creds = resolveWhatsAppCredentials(wa);
  if (!creds.configured) {
    return {
      error:
        "WhatsApp is not configured. Add API credentials in Settings first.",
    };
  }

  const { data: ownerStaff } = await ctx.supabase
    .from("staff")
    .select("whatsapp, phone, name")
    .eq("gym_id", ctx.gymId)
    .eq("role", "owner")
    .limit(1)
    .maybeSingle();

  const to =
    gym.whatsapp ||
    ownerStaff?.whatsapp ||
    ownerStaff?.phone ||
    null;

  if (!to || !normalizeWhatsAppNumber(to)) {
    return {
      error:
        "No WhatsApp number on file. Set the gym WhatsApp number in Gym Profile.",
    };
  }

  const result = await sendWhatsAppMessage(
    to,
    "welcome_new_member",
    [gym.name ?? "Barbellist", ownerStaff?.name ?? "Owner", "TEST"],
    wa,
  );

  if (!result.success) {
    return { error: result.error ?? "Test message failed" };
  }

  return { error: null };
}

export async function updateStaffRole(
  staffId: string,
  role: StaffRole,
): Promise<{ error: string | null }> {
  const parsed = updateStaffRoleSchema.safeParse({ staffId, role });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const ctx = await getActionContextWithRole();
  if (!ctx) return { error: "Not authenticated" };
  if (!canManageStaff(ctx.role)) {
    return { error: "Only owners and managers can change roles" };
  }
  if (role === "owner" && ctx.role !== "owner") {
    return { error: "Only the owner can assign the owner role" };
  }

  const { data: target } = await ctx.supabase
    .from("staff")
    .select("id, role, auth_user_id")
    .eq("id", staffId)
    .eq("gym_id", ctx.gymId)
    .maybeSingle();

  if (!target) return { error: "Staff member not found" };
  if (target.role === "owner" && role !== "owner") {
    const { count } = await ctx.supabase
      .from("staff")
      .select("id", { count: "exact", head: true })
      .eq("gym_id", ctx.gymId)
      .eq("role", "owner");
    if ((count ?? 0) <= 1) {
      return { error: "Cannot demote the only owner" };
    }
  }

  const { error } = await ctx.supabase
    .from("staff")
    .update({ role })
    .eq("id", staffId)
    .eq("gym_id", ctx.gymId);

  if (error) return { error: error.message };

  if (target.auth_user_id) {
    try {
      const admin = createAdminClient();
      const { data: userData } = await admin.auth.admin.getUserById(
        target.auth_user_id,
      );
      if (userData.user) {
        await admin.auth.admin.updateUserById(target.auth_user_id, {
          user_metadata: {
            ...userData.user.user_metadata,
            role,
            gym_id: ctx.gymId,
          },
        });
      }
    } catch {
      // Staff row updated; metadata sync best-effort
    }
  }

  revalidatePath("/dashboard/staff");
  revalidateSettings();
  return { error: null };
}

export async function inviteStaffMember(
  raw: InviteStaffInput,
): Promise<{ data: { id: string } | null; error: string | null }> {
  const parsed = inviteStaffSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      data: null,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const ctx = await getActionContextWithRole();
  if (!ctx) return { data: null, error: "Not authenticated" };
  if (!canManageStaff(ctx.role)) {
    return { data: null, error: "Only owners and managers can invite staff" };
  }

  const { name, email, role } = parsed.data;
  let authUserId: string | null = null;

  try {
    const admin = createAdminClient();
    const { data: invited, error: inviteError } =
      await admin.auth.admin.inviteUserByEmail(email, {
        data: {
          gym_id: ctx.gymId,
          role,
          name,
        },
      });

    if (inviteError || !invited.user) {
      return {
        data: null,
        error: inviteError?.message ?? "Failed to send invite",
      };
    }
    authUserId = invited.user.id;

    const { data: row, error } = await ctx.supabase
      .from("staff")
      .insert({
        gym_id: ctx.gymId,
        auth_user_id: authUserId,
        name: name.trim(),
        email,
        role,
        status: "active",
        joining_date: new Date().toISOString().slice(0, 10),
      })
      .select("id")
      .single();

    if (error || !row) {
      try {
        await admin.auth.admin.deleteUser(authUserId);
      } catch {
        // cleanup best-effort
      }
      return { data: null, error: error?.message ?? "Failed to create staff" };
    }

    revalidatePath("/dashboard/staff");
    revalidateSettings();
    return { data: { id: row.id }, error: null };
  } catch (e) {
    return {
      data: null,
      error: e instanceof Error ? e.message : "Failed to invite staff",
    };
  }
}

export async function removeStaffAccess(
  staffId: string,
): Promise<{ error: string | null }> {
  const ctx = await getActionContextWithRole();
  if (!ctx) return { error: "Not authenticated" };
  if (!canManageStaff(ctx.role)) {
    return { error: "Only owners and managers can remove access" };
  }

  const { data: target } = await ctx.supabase
    .from("staff")
    .select("id, role, auth_user_id, name")
    .eq("id", staffId)
    .eq("gym_id", ctx.gymId)
    .maybeSingle();

  if (!target) return { error: "Staff member not found" };
  if (!target.auth_user_id) {
    return { error: "This staff member has no app access" };
  }
  if (target.auth_user_id === ctx.userId) {
    return { error: "You cannot remove your own access" };
  }
  if (target.role === "owner") {
    return { error: "Cannot remove access from an owner" };
  }

  try {
    const admin = createAdminClient();
    await admin.auth.admin.deleteUser(target.auth_user_id);
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Failed to remove auth user",
    };
  }

  const { error } = await ctx.supabase
    .from("staff")
    .update({ auth_user_id: null })
    .eq("id", staffId)
    .eq("gym_id", ctx.gymId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/staff");
  revalidateSettings();
  return { error: null };
}

export async function exportAllData(): Promise<{
  data: { base64: string; filename: string } | null;
  error: string | null;
}> {
  const ctx = await getActionContextWithRole();
  if (!ctx) return { data: null, error: "Not authenticated" };
  if (!canAccessDangerZone(ctx.role)) {
    return { data: null, error: "Only the owner can export data" };
  }

  const result = await buildGymDataZip(ctx.supabase, ctx.gymId);
  if ("error" in result) return { data: null, error: result.error };
  return { data: result, error: null };
}

export async function deleteGym(
  confirmationName: string,
): Promise<{ error: string | null }> {
  const parsed = deleteGymSchema.safeParse({ confirmationName });
  if (!parsed.success) {
    return { error: "Confirmation name is required" };
  }

  const ctx = await getActionContextWithRole();
  if (!ctx) return { error: "Not authenticated" };
  if (!canAccessDangerZone(ctx.role)) {
    return { error: "Only the owner can delete the gym" };
  }

  const { data: gym } = await ctx.supabase
    .from("gyms")
    .select("id, name")
    .eq("id", ctx.gymId)
    .maybeSingle();

  if (!gym) return { error: "Gym not found" };
  if (gym.name.trim() !== parsed.data.confirmationName.trim()) {
    return { error: "Gym name does not match" };
  }

  const { data: staffRows } = await ctx.supabase
    .from("staff")
    .select("auth_user_id")
    .eq("gym_id", ctx.gymId)
    .not("auth_user_id", "is", null);

  try {
    const admin = createAdminClient();
    for (const row of staffRows ?? []) {
      if (row.auth_user_id) {
        try {
          await admin.auth.admin.deleteUser(row.auth_user_id);
        } catch {
          // continue
        }
      }
    }

    const { error } = await admin.from("gyms").delete().eq("id", ctx.gymId);
    if (error) return { error: error.message };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Failed to delete gym",
    };
  }

  await ctx.supabase.auth.signOut();
  redirect("/");
}
