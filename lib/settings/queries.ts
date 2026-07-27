import type { SupabaseClient } from "@supabase/supabase-js";
import type { Gym, StaffRole } from "@/lib/types";
import {
  DEFAULT_REMINDER_SCHEDULE,
  type ReminderScheduleSettings,
} from "@/lib/whatsapp/schedule";
import {
  maskToken,
  parseCardTemplate,
  parseWhatsAppCredentials,
  type SettingsPageData,
  type SettingsStaffRow,
} from "@/lib/settings/types";
import {
  canAccessDangerZone,
  canEditWhatsAppCredentials,
  canViewBilling,
} from "@/lib/auth/permissions";
import { resolveWhatsAppCredentials } from "@/lib/whatsapp/cloud";

function parseReminders(raw: unknown): ReminderScheduleSettings {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ...DEFAULT_REMINDER_SCHEDULE };
  }
  const o = raw as Record<string, unknown>;
  return {
    days_before_due:
      typeof o.days_before_due === "number"
        ? o.days_before_due
        : DEFAULT_REMINDER_SCHEDULE.days_before_due,
    on_due_date:
      typeof o.on_due_date === "boolean"
        ? o.on_due_date
        : DEFAULT_REMINDER_SCHEDULE.on_due_date,
    overdue_every_days:
      typeof o.overdue_every_days === "number"
        ? o.overdue_every_days
        : DEFAULT_REMINDER_SCHEDULE.overdue_every_days,
    max_per_due:
      typeof o.max_per_due === "number"
        ? o.max_per_due
        : DEFAULT_REMINDER_SCHEDULE.max_per_due,
  };
}

export async function fetchSettingsPageData(
  supabase: SupabaseClient,
  gymId: string,
  role: StaffRole,
): Promise<SettingsPageData> {
  const [gymRes, staffRes, membersRes] = await Promise.all([
    supabase
      .from("gyms")
      .select(
        "id, name, slug, address, city, country, phone, whatsapp, email, logo_url, timezone, currency, currency_symbol, settings, subscription_plan, subscription_status, trial_ends_at, created_at, updated_at",
      )
      .eq("id", gymId)
      .single(),
    supabase
      .from("staff")
      .select("id, name, email, photo_url, role, status, auth_user_id")
      .eq("gym_id", gymId)
      .order("name", { ascending: true }),
    supabase
      .from("members")
      .select("id", { count: "exact", head: true })
      .eq("gym_id", gymId)
      .eq("status", "active"),
  ]);

  if (gymRes.error || !gymRes.data) {
    throw new Error(gymRes.error?.message ?? "Gym not found");
  }

  const gym = gymRes.data as Gym;
  const settings =
    gym.settings && typeof gym.settings === "object" && !Array.isArray(gym.settings)
      ? (gym.settings as Record<string, unknown>)
      : {};

  const reminders = parseReminders(settings.reminders);
  const cardTemplate = parseCardTemplate(settings.card_template);
  const wa = parseWhatsAppCredentials(settings.whatsapp);
  const resolved = resolveWhatsAppCredentials(wa);

  const staff: SettingsStaffRow[] = (
    (staffRes.data ?? []) as Array<{
      id: string;
      name: string;
      email: string | null;
      photo_url: string | null;
      role: StaffRole;
      status: string;
      auth_user_id: string | null;
    }>
  ).map((s) => ({
    ...s,
    has_app_access: Boolean(s.auth_user_id),
  }));

  return {
    gym,
    reminders,
    cardTemplate,
    whatsappConfigured: resolved.configured,
    whatsappHasToken: Boolean(wa.api_token || process.env.WHATSAPP_API_TOKEN),
    whatsappPhoneNumberId:
      wa.phone_number_id ||
      process.env.WHATSAPP_PHONE_NUMBER_ID?.trim() ||
      "",
    whatsappTokenMasked: canEditWhatsAppCredentials(role)
      ? maskToken(wa.api_token || process.env.WHATSAPP_API_TOKEN)
      : null,
    staff,
    activeMemberCount: membersRes.count ?? 0,
    role,
    canEditCredentials: canEditWhatsAppCredentials(role),
    canViewBilling: canViewBilling(role),
    canAccessDangerZone: canAccessDangerZone(role),
  };
}

export async function mergeGymSettings(
  supabase: SupabaseClient,
  gymId: string,
  patch: Record<string, unknown>,
): Promise<{ error: string | null }> {
  const { data: gym, error: fetchError } = await supabase
    .from("gyms")
    .select("settings")
    .eq("id", gymId)
    .maybeSingle();

  if (fetchError) return { error: fetchError.message };

  const existing =
    gym?.settings &&
    typeof gym.settings === "object" &&
    !Array.isArray(gym.settings)
      ? (gym.settings as Record<string, unknown>)
      : {};

  const { error } = await supabase
    .from("gyms")
    .update({
      settings: {
        ...existing,
        ...patch,
      },
    })
    .eq("id", gymId);

  return { error: error?.message ?? null };
}
