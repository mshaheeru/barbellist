"use server";

import { revalidatePath } from "next/cache";
import { logAuditAction } from "@/lib/audit/log-action";
import { getActionContext } from "@/lib/auth/get-action-context";
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
import type {
  FeesOverviewResult,
  MemberPaymentContext,
  PaymentMethod,
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

export async function getFeesOverview(
  raw: FeesTableParams = {},
): Promise<{ data: FeesOverviewResult | null; error: string | null }> {
  try {
    const ctx = await getActionContext({ includeStaff: true });
    if (!ctx) return { data: null, error: "Not authenticated" };

    const parsed = feesFilterSchema.safeParse(raw);
    const params = parsed.success ? parsed.data : {};

    const result = await fetchFeesOverview(ctx.supabase, ctx.gymId, params);
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
    const ctx = await getActionContext({ includeStaff: true });
    if (!ctx) return { data: null, error: "Not authenticated" };

    const member = await fetchMemberPaymentContext(
      ctx.supabase,
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

export type RecordedPaymentSummary = {
  id: string;
  amount: number;
  payment_method: PaymentMethod | null;
  paid_at: string;
  covers_from: string | null;
  covers_to: string | null;
  receipt_sent: boolean;
  receipt_generated: boolean;
};

export async function recordPayment(
  raw: RecordPaymentInput,
): Promise<{ payment: RecordedPaymentSummary | null; error: string | null }> {
  const parsed = recordPaymentSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      payment: null,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const ctx = await getActionContext({ includeStaff: true });
  if (!ctx) return { payment: null, error: "Not authenticated" };
  if (!canRecordPayment(ctx.role)) {
    return { payment: null, error: "You do not have permission to record payments" };
  }

  const data = parsed.data;
  const { supabase } = ctx;

  const member = await fetchMemberPaymentContext(
    supabase,
    ctx.gymId,
    data.member_id,
  );
  if (!member) return { payment: null, error: "Member not found" };
  if (member.total_balance <= 0) {
    return { payment: null, error: "No outstanding balance for this member" };
  }

  let fifoResult;
  try {
    fifoResult = applyFifoPayment(member.outstanding_dues, data.amount);
  } catch (e) {
    return {
      payment: null,
      error: e instanceof Error ? e.message : "Invalid payment amount",
    };
  }

  const dueUpdateResults = await Promise.all(
    fifoResult.updates.map((update) =>
      supabase
        .from("fee_dues")
        .update({
          amount_paid: update.newAmountPaid,
          status: update.newStatus,
        })
        .eq("id", update.feeDueId)
        .eq("gym_id", ctx.gymId),
    ),
  );
  const dueError = dueUpdateResults.find((r) => r.error)?.error;
  if (dueError) {
    return { payment: null, error: dueError.message };
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
      receipt_generated: false,
      recorded_by: ctx.staffId,
    })
    .select(
      "id, amount, payment_method, paid_at, covers_from, covers_to, receipt_sent, receipt_generated",
    )
    .single();

  if (paymentError) {
    return { payment: null, error: paymentError.message };
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

  return {
    payment: {
      id: payment.id,
      amount: Number(payment.amount),
      payment_method: payment.payment_method as PaymentMethod | null,
      paid_at: payment.paid_at,
      covers_from: payment.covers_from,
      covers_to: payment.covers_to,
      receipt_sent: Boolean(payment.receipt_sent),
      receipt_generated: Boolean(payment.receipt_generated),
    },
    error: null,
  };
}

export async function markReceiptGenerated(
  paymentId: string,
): Promise<{ error: string | null }> {
  if (!paymentId) return { error: "Payment id is required" };

  const ctx = await getActionContext({ includeStaff: true });
  if (!ctx) return { error: "Not authenticated" };

  const { supabase } = ctx;
  const { data: existing, error: fetchError } = await supabase
    .from("payments")
    .select("id, receipt_generated, member_id")
    .eq("id", paymentId)
    .eq("gym_id", ctx.gymId)
    .maybeSingle();

  if (fetchError) return { error: fetchError.message };
  if (!existing) return { error: "Payment not found" };
  if (existing.receipt_generated) return { error: null };

  const { error } = await supabase
    .from("payments")
    .update({ receipt_generated: true })
    .eq("id", paymentId)
    .eq("gym_id", ctx.gymId)
    .eq("receipt_generated", false);

  if (error) return { error: error.message };

  if (existing.member_id) {
    revalidatePath(`/dashboard/members/${existing.member_id}`);
  }
  revalidatePath("/dashboard/fees");

  return { error: null };
}

export async function waiveFeeDue(
  feeDueId: string,
): Promise<{ error: string | null }> {
  const parsed = waiveFeeDueSchema.safeParse({ fee_due_id: feeDueId });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const ctx = await getActionContext({ includeStaff: true });
  if (!ctx) return { error: "Not authenticated" };
  if (!canWaiveFee(ctx.role)) {
    return { error: "Only the gym owner can waive fees" };
  }

  const { supabase } = ctx;
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
  const ctx = await getActionContext({ includeStaff: true });
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
    const result = await generateMonthlyDues(ctx.supabase, ctx.gymId);

    await logAuditAction(ctx.supabase, {
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
