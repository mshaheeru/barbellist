import type { ReportsMonthPoint } from "@/lib/reports/types";

function escapeCsvCell(value: string | number): string {
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function buildReportsCsv(rows: ReportsMonthPoint[]): string {
  const header =
    "month,revenue,expenses,profit,new_members,churned_members,active_members";
  const lines = rows.map((r) =>
    [
      r.monthKey,
      r.revenue,
      r.expenses,
      r.profit,
      r.newMembers,
      r.churnedMembers,
      r.activeMembers,
    ]
      .map(escapeCsvCell)
      .join(","),
  );
  return [header, ...lines].join("\n");
}
