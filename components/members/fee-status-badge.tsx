import type { FeeDisplayStatus } from "@/lib/types";

const badgeStyles: Record<
  FeeDisplayStatus["kind"],
  React.CSSProperties
> = {
  paid: { background: "#E4F1E9", color: "#2E7D4F" },
  overdue: { background: "#F9E4E1", color: "#C0392B" },
  due_soon: { background: "#FBEFD6", color: "#B07A15" },
  frozen: { background: "#EDEBE4", color: "#7A7A70" },
};

type FeeStatusBadgeProps = {
  status: FeeDisplayStatus;
};

export function FeeStatusBadge({ status }: FeeStatusBadgeProps) {
  const style = badgeStyles[status.kind];
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
      {status.label}
    </span>
  );
}
