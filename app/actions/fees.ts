"use server";

import { revalidatePath } from "next/cache";
import { logAuditAction } from "@/lib/audit/log-action";
import {
  canGenerateMonthlyDues,
  canRecordPayment,
  canWaiveFee,
} from "@/lib/auth/permissions";
import { applyFifoPayment } from "@/lib/fees/apply-fifo-payment";
import { generateMonthlyDues } from "@/lib/fees/generate-monthly-dues";
import {
  fetchFeesOverview,
  fetchMemberPaymentContext,
  type FeesTableParams,
} from "@/lib/fees/queries";
import { createClient } from "@/lib/supabase/server";
import type {
  FeesOverviewResult,
  MemberPaymentContext,
  StaffRole,
} from "@/lib/types";
import {
  feesFilterSchema,
  recordPaymentSchema,
  waiveFeeDueSchema,
  type RecordPaymentInput,
} from "@/lib/validations/fees";
import {
  sendBulkReminders,
  sendFeeReminder,
  sendPaymentReceipt,
} from "@/app/actions/whatsapp";

async function getAuthenticatedContext(): Promise<{
  gymId: string;
  userId: string;
  role: StaffRole | null;
  staffId: string | null;
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const gymId = user?.user_metadata?.gym_id as string | undefined;
  if (!gymId || !user) return null;

  const role = (user.user_metadata?.role as StaffRole | undefined) ?? null;

  const { data: staffRow } = await supabase
    .from("staff")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  return {
    gymId,
    userId: user.id,
    role,
    staffId: staffRow?.id ?? null,
  };
}

export async function getFeesOverview(
  raw: FeesTableParams = {},
): Promise<{ data: FeesOverviewResult | null; error: string | null }> {
  try {
    const ctx = await getAuthenticatedContext();
    if (!ctx) return { data: null, error: "Not authenticated" };

    const parsed = feesFilterSchema.safeParse(raw);
    const params = parsed.success ? parsed.data : {};

    const supabase = await createClient();
    const result = await fetchFeesOverview(supabase, ctx.gymId, params);
    return { data: result, error: null };
  } catch (e) {
    return {
      data: null,
      error: e instanceof Error ? e.message : "Failed to load fees",
    };
  }
}

export async function getMemberForPayment(
  memberId: string,
): Promise<{ data: MemberPaymentContext | null; error: string | null }> {
  try {
    const ctx = await getAuthenticatedContext();
    if (!ctx) return { data: null, error: "Not authenticated" };

    const supabase = await createClient();
    const member = await fetchMemberPaymentContext(
      supabase,
      ctx.gymId,
      memberId,
    );
    if (!member) return { data: null, error: "Member not found" };
    return { data: member, error: null };
  } catch (e) {
    return {
      data: null,
      error: e instanceof Error ? e.message : "Failed to load member",
    };
  }
}

export async function recordPayment(
  raw: RecordPaymentInput,
): Promise<{ paymentId: string | null; error: string | null }> {
  const parsed = recordPaymentSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      paymentId: null,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const ctx = await getAuthenticatedContext();
  if (!ctx) return { paymentId: null, error: "Not authenticated" };
  if (!canRecordPayment(ctx.role)) {
    return { paymentId: null, error: "You do not have permission to record payments" };
  }

  const data = parsed.data;
  const supabase = await createClient();

  const member = await fetchMemberPaymentContext(
    supabase,
    ctx.gymId,
    data.member_id,
  );
  if (!member) return { paymentId: null, error: "Member not found" };
  if (member.total_balance <= 0) {
    return { paymentId: null, error: "No outstanding balance for this member" };
  }

  let fifoResult;
  try {
    fifoResult = applyFifoPayment(member.outstanding_dues, data.amount);
  } catch (e) {
    return {
      paymentId: null,
      error: e instanceof Error ? e.message : "Invalid payment amount",
    };
  }

  for (const update of fifoResult.updates) {
    const { error: dueError } = await supabase
      .from("fee_dues")
      .update({
        amount_paid: update.newAmountPaid,
        status: update.newStatus,
      })
      .eq("id", update.feeDueId)
      .eq("gym_id", ctx.gymId);

    if (dueError) {
      return { paymentId: null, error: dueError.message };
    }
  }

  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .insert({
      gym_id: ctx.gymId,
      member_id: data.member_id,
      amount: data.amount,
      payment_type: "membership",
      payment_method: data.payment_method,
      is_partial: data.is_partial,
      covers_from: fifoResult.coversFrom,
      covers_to: fifoResult.coversTo,
      notes: data.notes || null,
      receipt_sent: false,
      recorded_by: ctx.staffId,
    })
    .select("id")
    .single();

  if (paymentError) {
    return { paymentId: null, error: paymentError.message };
  }

  if (data.send_whatsapp_receipt && (member.whatsapp || member.phone)) {
    // Best-effort: payment succeeds even if WhatsApp fails
    await sendPaymentReceipt(payment.id);
  }

  await logAuditAction(supabase, {
    gymId: ctx.gymId,
    actorStaffId: ctx.staffId,
    action: "payment_recorded",
    entityType: "payment",
    entityId: payment.id,
    details: {
      member_id: data.member_id,
      amount: data.amount,
      payment_method: data.payment_method,
      fee_due_updates: fifoResult.updates,
    },
  });

  revalidatePath("/dashboard/fees");
  revalidatePath("/dashboard/members");
  revalidatePath(`/dashboard/members/${data.member_id}`);

  return { paymentId: payment.id, error: null };
}

export async function waiveFeeDue(
  feeDueId: string,
): Promise<{ error: string | null }> {
  const parsed = waiveFeeDueSchema.safeParse({ fee_due_id: feeDueId });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const ctx = await getAuthenticatedContext();
  if (!ctx) return { error: "Not authenticated" };
  if (!canWaiveFee(ctx.role)) {
    return { error: "Only the gym owner can waive fees" };
  }

  const supabase = await createClient();
  const { data: due, error: fetchError } = await supabase
    .from("fee_dues")
    .select("id, member_id, status")
    .eq("gym_id", ctx.gymId)
    .eq("id", feeDueId)
    .maybeSingle();

  if (fetchError) return { error: fetchError.message };
  if (!due) return { error: "Fee due not found" };
  if (due.status === "paid" || due.status === "waived") {
    return { error: "This fee cannot be waived" };
  }

  const { error } = await supabase
    .from("fee_dues")
    .update({ status: "waived" })
    .eq("id", feeDueId)
    .eq("gym_id", ctx.gymId);

  if (error) return { error: error.message };

  await logAuditAction(supabase, {
    gymId: ctx.gymId,
    actorStaffId: ctx.staffId,
    action: "fee_waived",
    entityType: "fee_due",
    entityId: feeDueId,
    details: { member_id: due.member_id },
  });

  revalidatePath("/dashboard/fees");
  revalidatePath(`/dashboard/members/${due.member_id}`);

  return { error: null };
}

/** @deprecated Prefer sendFeeReminder from @/app/actions/whatsapp */
export async function queueFeeReminder(
  feeDueId: string,
): Promise<{ error: string | null }> {
  return sendFeeReminder(feeDueId);
}

/** @deprecated Prefer sendBulkReminders from @/app/actions/whatsapp */
export async function queueBulkReminders(
  feeDueIds: string[],
): Promise<{
  sent: number;
  failed: number;
  skipped: number;
  error: string | null;
}> {
  if (feeDueIds.length === 0) {
    return { sent: 0, failed: 0, skipped: 0, error: "No fees selected" };
  }

  const result = await sendBulkReminders({ ids: feeDueIds });
  return {
    sent: result.sent,
    failed: result.failed,
    skipped: result.skipped_no_whatsapp,
    error: result.error,
  };
}

/**
 * Generate monthly dues and mark overdue rows.
 * Will be invoked by Supabase Edge Function cron in Prompt 12.
 */
export async function runGenerateMonthlyDues(): Promise<{
  created: number;
  markedOverdue: number;
  error: string | null;
}> {
  const ctx = await getAuthenticatedContext();
  if (!ctx) {
    return { created: 0, markedOverdue: 0, error: "Not authenticated" };
  }
  if (!canGenerateMonthlyDues(ctx.role)) {
    return {
      created: 0,
      markedOverdue: 0,
      error: "You do not have permission to generate monthly dues",
    };
  }

  try {
    const supabase = await createClient();
    const result = await generateMonthlyDues(supabase, ctx.gymId);

    await logAuditAction(supabase, {
      gymId: ctx.gymId,
      actorStaffId: ctx.staffId,
      action: "monthly_dues_generated",
      entityType: "gym",
      entityId: ctx.gymId,
      details: result,
    });

    revalidatePath("/dashboard/fees");
    return { ...result, error: null };
  } catch (e) {
    return {
      created: 0,
      markedOverdue: 0,
      error: e instanceof Error ? e.message : "Failed to generate dues",
    };
  }
}
