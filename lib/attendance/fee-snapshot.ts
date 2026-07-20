import {
  computeFeeDisplayStatus,
  type FeeDisplayStatus,
} from "@/lib/members/fee-status";
import type { FeeDue, MemberStatus } from "@/lib/types";

export type FeeSnapshotAtCheckin = "clear" | "overdue" | "due_soon";

export type FeeSnapshotResult = {
  snapshot: FeeSnapshotAtCheckin;
  display: FeeDisplayStatus;
  overdueAmount: number;
  overdueDays: number | null;
};

function unpaidBalance(due: Pick<FeeDue, "amount_due" | "amount_paid">) {
  return Math.max(0, Number(due.amount_due) - Number(due.amount_paid ?? 0));
}

export function toFeeSnapshotAtCheckin(
  display: FeeDisplayStatus,
  memberStatus: MemberStatus,
): FeeSnapshotAtCheckin {
  if (memberStatus === "frozen" || display.kind === "overdue") {
    return "overdue";
  }
  if (display.kind === "due_soon") {
    return "due_soon";
  }
  return "clear";
}

export function computeFeeSnapshotAtCheckin(
  memberStatus: MemberStatus,
  feeDues: Pick<
    FeeDue,
    "status" | "due_date" | "amount_due" | "amount_paid"
  >[],
): FeeSnapshotResult {
  const display = computeFeeDisplayStatus(memberStatus, feeDues);
  const snapshot = toFeeSnapshotAtCheckin(display, memberStatus);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let overdueAmount = 0;
  let overdueDays = display.kind === "overdue" ? display.days : null;

  for (const due of feeDues) {
    if (due.status === "paid" || due.status === "waived") continue;
    const dueDate = new Date(due.due_date);
    dueDate.setHours(0, 0, 0, 0);
    const isOverdue =
      due.status === "overdue" || dueDate < today;
    if (isOverdue) {
      overdueAmount += unpaidBalance(due);
    }
  }

  if (memberStatus === "frozen" && overdueAmount === 0) {
    overdueDays = overdueDays ?? 0;
  }

  return {
    snapshot,
    display,
    overdueAmount,
    overdueDays,
  };
}
