import type { FeeDue, MemberStatus } from "@/lib/types";

export type FeeDisplayKind = "frozen" | "overdue" | "due_soon" | "paid";

export type FeeDisplayStatus = {
  kind: FeeDisplayKind;
  label: string;
  days: number | null;
};

type FeeDueSlice = Pick<FeeDue, "status" | "due_date" | "amount_due" | "amount_paid">;

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function daysBetween(from: Date, to: Date) {
  const ms = startOfDay(to).getTime() - startOfDay(from).getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

function isUnpaidDue(due: FeeDueSlice) {
  if (due.status === "paid" || due.status === "waived") return false;
  const balance = Number(due.amount_due) - Number(due.amount_paid ?? 0);
  return balance > 0 || due.status === "overdue" || due.status === "pending" || due.status === "partial";
}

export function computeFeeDisplayStatus(
  memberStatus: MemberStatus,
  feeDues: FeeDueSlice[],
  now = new Date(),
): FeeDisplayStatus {
  if (memberStatus === "frozen") {
    return { kind: "frozen", label: "Frozen", days: null };
  }

  const today = startOfDay(now);
  const unpaid = feeDues.filter(isUnpaidDue);

  let maxOverdueDays = 0;
  let hasOverdue = false;

  for (const due of unpaid) {
    const dueDate = startOfDay(new Date(due.due_date));
    if (due.status === "overdue" || dueDate < today) {
      hasOverdue = true;
      const days = daysBetween(dueDate, today);
      if (days > maxOverdueDays) maxOverdueDays = days;
    }
  }

  if (hasOverdue) {
    return {
      kind: "overdue",
      label: `Overdue ${maxOverdueDays}d`,
      days: maxOverdueDays,
    };
  }

  let minDaysUntilDue: number | null = null;
  for (const due of unpaid) {
    const dueDate = startOfDay(new Date(due.due_date));
    const days = daysBetween(today, dueDate);
    if (days >= 0 && days <= 7) {
      if (minDaysUntilDue === null || days < minDaysUntilDue) {
        minDaysUntilDue = days;
      }
    }
  }

  if (minDaysUntilDue !== null) {
    return {
      kind: "due_soon",
      label: minDaysUntilDue === 0 ? "Due today" : `Due in ${minDaysUntilDue}d`,
      days: minDaysUntilDue,
    };
  }

  return { kind: "paid", label: "Paid", days: null };
}

export function memberMatchesFeeFilter(
  kind: FeeDisplayKind,
  filter: "overdue" | "due_soon",
): boolean {
  if (filter === "overdue") return kind === "overdue";
  if (filter === "due_soon") return kind === "due_soon";
  return false;
}
