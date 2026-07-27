import type { StaffRole } from "@/lib/types";
export { firstOfMonthIso, addMonthsIso } from "@/lib/format/date";

export function formatStaffRole(role: StaffRole): string {
  const labels: Record<StaffRole, string> = {
    owner: "Owner",
    manager: "Manager",
    cashier: "Cashier",
    trainer: "Trainer",
    cleaner: "Cleaner",
    other: "Other",
  };
  return labels[role] ?? role;
}

export function formatStaffRoleSubtitle(role: StaffRole): string {
  if (role === "cashier") return "Cashier / Front Desk";
  return formatStaffRole(role);
}

/** Count Mon–Sat days in a month (Pakistan gyms typically 6-day weeks). */
export function countWorkingDaysInMonth(year: number, month: number): number {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let count = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const dow = new Date(year, month, d).getDay();
    if (dow !== 0) count += 1; // exclude Sunday
  }
  return count;
}
