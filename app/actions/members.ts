"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  fetchMemberById,
  fetchMembersList,
  type MembersListParams,
} from "@/lib/members/queries";
import {
  addNote,
  deleteNote,
  serializeMemberNotes,
  updateNote,
  type MemberNote,
} from "@/lib/members/notes";
import {
  createMemberWithPaymentSchema,
  freezeMemberSchema,
  memberNoteSchema,
  updateMemberSchema,
  type CreateMemberWithPaymentInput,
  type FreezeMemberInput,
  type UpdateMemberInput,
} from "@/lib/validations/members";
import type { MemberProfile, MembersListResult, Package } from "@/lib/types";
import { signMemberQrToken } from "@/lib/qr/sign-member-token";
import {
  sendPaymentReceipt,
  sendWelcomeNewMember,
} from "@/app/actions/whatsapp";
import { isWhatsAppConfigured } from "@/lib/whatsapp/cloud";

async function getAuthenticatedContext(): Promise<{
  gymId: string;
  userId: string;
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const gymId = user?.user_metadata?.gym_id as string | undefined;
  if (!gymId || !user) return null;
  return { gymId, userId: user.id };
}

async function getAuthenticatedGymId(): Promise<string | null> {
  const ctx = await getAuthenticatedContext();
  return ctx?.gymId ?? null;
}

export async function getMembersList(
  params: MembersListParams = {},
): Promise<{ data: MembersListResult | null; error: string | null }> {
  try {
    const gymId = await getAuthenticatedGymId();
    if (!gymId) return { data: null, error: "Not authenticated" };

    const supabase = await createClient();
    const result = await fetchMembersList(supabase, gymId, params);
    return { data: result, error: null };
  } catch (e) {
    return {
      data: null,
      error: e instanceof Error ? e.message : "Failed to load members",
    };
  }
}

export async function getMemberById(
  id: string,
): Promise<{ data: MemberProfile | null; error: string | null }> {
  try {
    const gymId = await getAuthenticatedGymId();
    if (!gymId) return { data: null, error: "Not authenticated" };

    const supabase = await createClient();
    const member = await fetchMemberById(supabase, gymId, id);
    return { data: member, error: null };
  } catch (e) {
    return {
      data: null,
      error: e instanceof Error ? e.message : "Failed to load member",
    };
  }
}

export async function updateMember(
  id: string,
  raw: UpdateMemberInput,
): Promise<{ error: string | null }> {
  const parsed = updateMemberSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const gymId = await getAuthenticatedGymId();
  if (!gymId) return { error: "Not authenticated" };

  const supabase = await createClient();
  const payload = { ...parsed.data };
  if (payload.email === "") payload.email = null;

  const { error } = await supabase
    .from("members")
    .update(payload)
    .eq("gym_id", gymId)
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/members");
  revalidatePath(`/dashboard/members/${id}`);
  return { error: null };
}

export async function deleteMember(
  id: string,
): Promise<{ error: string | null }> {
  const gymId = await getAuthenticatedGymId();
  if (!gymId) return { error: "Not authenticated" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("members")
    .update({ status: "cancelled" })
    .eq("gym_id", gymId)
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/members");
  return { error: null };
}

export async function freezeMember(
  id: string,
  raw: FreezeMemberInput,
): Promise<{ error: string | null }> {
  const parsed = freezeMemberSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const gymId = await getAuthenticatedGymId();
  if (!gymId) return { error: "Not authenticated" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("members")
    .update({
      status: "frozen",
      freeze_start: parsed.data.freeze_start,
      freeze_end: parsed.data.freeze_end,
      freeze_reason: parsed.data.reason,
    })
    .eq("gym_id", gymId)
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/members");
  revalidatePath(`/dashboard/members/${id}`);
  return { error: null };
}

export async function unfreezeMember(
  id: string,
): Promise<{ error: string | null }> {
  const gymId = await getAuthenticatedGymId();
  if (!gymId) return { error: "Not authenticated" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("members")
    .update({
      status: "active",
      freeze_start: null,
      freeze_end: null,
      freeze_reason: null,
    })
    .eq("gym_id", gymId)
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/members");
  revalidatePath(`/dashboard/members/${id}`);
  return { error: null };
}

export async function updateMemberNotes(
  id: string,
  notes: MemberNote[],
): Promise<{ error: string | null }> {
  const gymId = await getAuthenticatedGymId();
  if (!gymId) return { error: "Not authenticated" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("members")
    .update({ notes: serializeMemberNotes(notes) })
    .eq("gym_id", gymId)
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/members/${id}`);
  return { error: null };
}

export async function addMemberNote(
  id: string,
  text: string,
): Promise<{ error: string | null }> {
  const parsed = memberNoteSchema.safeParse({ text });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid note" };
  }

  const { data: member, error: fetchError } = await getMemberById(id);
  if (fetchError || !member) {
    return { error: fetchError ?? "Member not found" };
  }

  const updated = addNote(member.notes_list, parsed.data.text);
  return updateMemberNotes(id, updated);
}

export async function editMemberNote(
  id: string,
  noteId: string,
  text: string,
): Promise<{ error: string | null }> {
  const parsed = memberNoteSchema.safeParse({ text });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid note" };
  }

  const { data: member, error: fetchError } = await getMemberById(id);
  if (fetchError || !member) {
    return { error: fetchError ?? "Member not found" };
  }

  const updated = updateNote(member.notes_list, noteId, parsed.data.text);
  return updateMemberNotes(id, updated);
}

export async function removeMemberNote(
  id: string,
  noteId: string,
): Promise<{ error: string | null }> {
  const { data: member, error: fetchError } = await getMemberById(id);
  if (fetchError || !member) {
    return { error: fetchError ?? "Member not found" };
  }

  const updated = deleteNote(member.notes_list, noteId);
  return updateMemberNotes(id, updated);
}

export async function getPackagesForGym(): Promise<{
  data: Package[] | null;
  error: string | null;
}> {
  try {
    const gymId = await getAuthenticatedGymId();
    if (!gymId) return { data: null, error: "Not authenticated" };

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("packages")
      .select("*")
      .eq("gym_id", gymId)
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) return { data: null, error: error.message };
    return { data: (data as Package[]) ?? [], error: null };
  } catch (e) {
    return {
      data: null,
      error: e instanceof Error ? e.message : "Failed to load packages",
    };
  }
}

function addDays(date: Date, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function firstOfMonth(date: Date): string {
  return new Date(date.getFullYear(), date.getMonth(), 1)
    .toISOString()
    .slice(0, 10);
}

export async function createMemberWithPayment(
  raw: CreateMemberWithPaymentInput,
): Promise<{ memberId: string | null; error: string | null }> {
  const parsed = createMemberWithPaymentSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      memberId: null,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const ctx = await getAuthenticatedContext();
  if (!ctx) return { memberId: null, error: "Not authenticated" };

  const supabase = await createClient();
  const data = parsed.data;

  const { data: pkg, error: pkgError } = await supabase
    .from("packages")
    .select("id, price, duration_days, name")
    .eq("gym_id", ctx.gymId)
    .eq("id", data.package_id)
    .maybeSingle();

  if (pkgError || !pkg) {
    return { memberId: null, error: "Selected package not found" };
  }

  const packagePrice = Number(pkg.price);
  if (data.amount > packagePrice) {
    return { memberId: null, error: "Payment amount cannot exceed package price" };
  }

  const today = new Date();
  const membershipStart = today.toISOString().slice(0, 10);
  const membershipEnd = addDays(today, pkg.duration_days);

  const email = data.email === "" ? null : (data.email ?? null);

  const { data: member, error: memberError } = await supabase
    .from("members")
    .insert({
      gym_id: ctx.gymId,
      name: data.name,
      phone: data.phone,
      whatsapp: data.whatsapp || null,
      email,
      photo_url: data.photo_url || null,
      date_of_birth: data.date_of_birth || null,
      gender: data.gender || null,
      address: data.address || null,
      emergency_contact_name: data.emergency_contact_name || null,
      emergency_contact_phone: data.emergency_contact_phone || null,
      height_cm: data.height_cm,
      weight_kg: data.weight_kg,
      fitness_goals: data.fitness_goals,
      package_id: data.package_id,
      membership_start: membershipStart,
      membership_end: membershipEnd,
      status: "active",
    })
    .select("id")
    .single();

  if (memberError || !member) {
    return {
      memberId: null,
      error: memberError?.message ?? "Failed to create member",
    };
  }

  let qrToken: string;
  try {
    qrToken = await signMemberQrToken(member.id, ctx.gymId);
  } catch (e) {
    await supabase.from("members").delete().eq("id", member.id);
    return {
      memberId: null,
      error: e instanceof Error ? e.message : "Failed to sign QR token",
    };
  }

  const { error: qrUpdateError } = await supabase
    .from("members")
    .update({
      card_qr_token: qrToken,
      card_issued_at: new Date().toISOString(),
    })
    .eq("id", member.id)
    .eq("gym_id", ctx.gymId);

  if (qrUpdateError) {
    return { memberId: null, error: qrUpdateError.message };
  }

  const { data: staffRow } = await supabase
    .from("staff")
    .select("id")
    .eq("auth_user_id", ctx.userId)
    .maybeSingle();

  const feeStatus =
    data.amount >= packagePrice ? "paid" : data.is_partial ? "partial" : "paid";

  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .insert({
      gym_id: ctx.gymId,
      member_id: member.id,
      amount: data.amount,
      payment_type: "membership",
      payment_method: data.payment_method,
      is_partial: data.is_partial,
      covers_from: membershipStart,
      covers_to: membershipEnd,
      notes: data.notes || null,
      receipt_sent: false,
      recorded_by: staffRow?.id ?? null,
    })
    .select("id")
    .single();

  if (paymentError || !payment) {
    return {
      memberId: null,
      error: paymentError?.message ?? "Failed to record payment",
    };
  }

  const { error: feeDueError } = await supabase.from("fee_dues").insert({
    gym_id: ctx.gymId,
    member_id: member.id,
    amount_due: packagePrice,
    amount_paid: data.amount,
    due_date: membershipStart,
    status: feeStatus,
    generated_for_month: firstOfMonth(today),
  });

  if (feeDueError) {
    return { memberId: null, error: feeDueError.message };
  }

  // Best-effort WhatsApp — onboarding succeeds even if send fails / unconfigured
  if (isWhatsAppConfigured()) {
    if (data.send_whatsapp_receipt && (data.whatsapp || data.phone)) {
      await sendPaymentReceipt(payment.id);
    }
    if (data.whatsapp || data.phone) {
      await sendWelcomeNewMember(member.id);
    }
  }

  revalidatePath("/dashboard/members");
  revalidatePath(`/dashboard/members/${member.id}`);
  return { memberId: member.id, error: null };
}
