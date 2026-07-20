import type { CSSProperties } from "react";
import type { FeeDueStatus } from "@/lib/types";

const statusStyles: Record<
  FeeDueStatus,
  { label: string; style: CSSProperties }
> = {
  paid: {
    label: "Paid",
    style: { background: "#E4F1E9", color: "#2E7D4F" },
  },
  pending: {
    label: "Pending",
    style: { background: "#FBEFD6", color: "#B07A15" },
  },
  overdue: {
    label: "Overdue",
    style: { background: "#F9E4E1", color: "#C0392B" },
  },
  partial: {
    label: "Partial",
    style: { background: "#E8EEF2", color: "#4A6670" },
  },
  waived: {
    label: "Waived",
    style: { background: "#EDEBE4", color: "#7A7A70" },
  },
};

type FeeDueStatusPillProps = {
  status: FeeDueStatus;
};

export function FeeDueStatusPill({ status }: FeeDueStatusPillProps) {
  const { label, style } = statusStyles[status];
  return (
    <span
      style={{
        ...style,
        fontWeight: 700,
        fontSize: 12,
        padding: "4px 10px",
        borderRadius: 20,
        display: "inline-block",
      }}
    >
      {label}
    </span>
  );
}

export function feeDueMonthLabel(
  generatedForMonth: string | null,
  dueDate: string,
): string {
  const iso = generatedForMonth ?? dueDate;
  if (!iso) return "Fee";
  const date = new Date(iso);
  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
  }).format(date);
}
