import {
  computeFeeDisplayStatus,
  type FeeDisplayStatus,
} from "@/lib/members/fee-status";
import type { FeeDue, MemberStatus } from "@/lib/types";

export type FeeSnapshotAtCheckin = "clear" | "overdue" | "due_soon";

/** Logged when an inactive member tries to check in (not counted as in-gym). */
export type DeniedCheckInStatus =
  | "denied_frozen"
  | "denied_expired"
  | "denied_cancelled";

export function deniedStatusForMember(
  status: MemberStatus,
): DeniedCheckInStatus | null {
  if (status === "frozen") return "denied_frozen";
  if (status === "expired") return "denied_expired";
  if (status === "cancelled") return "denied_cancelled";
  return null;
}

export function isDeniedCheckInStatus(
  status: string | null | undefined,
): status is DeniedCheckInStatus {
  return (
    status === "denied_frozen" ||
    status === "denied_expired" ||
    status === "denied_cancelled"
  );
}

export function deniedCheckInLabel(status: string | null | undefined): string {
  if (status === "denied_frozen") return "Frozen — denied";
  if (status === "denied_expired") return "Expired — denied";
  if (status === "denied_cancelled") return "Cancelled — denied";
  return "Denied entry";
}

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
