import type { FeeDue, FeeDueStatus } from "@/lib/types";

export type UnpaidFeeDue = Pick<
  FeeDue,
  "id" | "amount_due" | "amount_paid" | "due_date" | "generated_for_month"
>;

export type FifoFeeDueUpdate = {
  feeDueId: string;
  newAmountPaid: number;
  newStatus: FeeDueStatus;
};

export type FifoPaymentResult = {
  updates: FifoFeeDueUpdate[];
  coversFrom: string | null;
  coversTo: string | null;
};

function dueBalance(due: UnpaidFeeDue): number {
  return Math.max(0, Number(due.amount_due) - Number(due.amount_paid ?? 0));
}

/**
 * Apply payment amount FIFO across oldest unpaid dues first.
 * Throws if payment exceeds total outstanding balance.
 */
export function applyFifoPayment(
  unpaidDues: UnpaidFeeDue[],
  paymentAmount: number,
): FifoPaymentResult {
  if (paymentAmount <= 0) {
    throw new Error("Payment amount must be positive");
  }

  const sorted = [...unpaidDues].sort(
    (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime(),
  );

  const totalOutstanding = sorted.reduce((sum, due) => sum + dueBalance(due), 0);

  if (paymentAmount > totalOutstanding + 0.001) {
    throw new Error(
      `Payment amount exceeds outstanding balance of ${totalOutstanding.toFixed(2)}`,
    );
  }

  let remaining = paymentAmount;
  const updates: FifoFeeDueUpdate[] = [];
  let coversFrom: string | null = null;
  let coversTo: string | null = null;

  for (const due of sorted) {
    if (remaining <= 0) break;

    const balance = dueBalance(due);
    if (balance <= 0) continue;

    const applied = Math.min(remaining, balance);
    const newAmountPaid = Number(due.amount_paid ?? 0) + applied;
    const fullyPaid = Math.abs(newAmountPaid - Number(due.amount_due)) < 0.001;

    updates.push({
      feeDueId: due.id,
      newAmountPaid,
      newStatus: fullyPaid ? "paid" : "partial",
    });

    const period = due.generated_for_month ?? due.due_date;
    if (!coversFrom) coversFrom = period;
    if (fullyPaid) coversTo = period;

    remaining -= applied;
  }

  return { updates, coversFrom, coversTo };
}
