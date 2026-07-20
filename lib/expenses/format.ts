import type { ExpenseCategory, PaymentMethod } from "@/lib/types";

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  salary: "Salary",
  utilities: "Utilities",
  maintenance: "Maintenance",
  cleaning: "Cleaning",
  repairs: "Repairs",
  equipment: "Equipment",
  rent: "Rent",
  miscellaneous: "Misc.",
};

export const EXPENSE_CATEGORY_PILL: Record<
  ExpenseCategory,
  { background: string; color: string }
> = {
  salary: { background: "#F7ECD6", color: "#B07A15" },
  utilities: { background: "#E3EAEE", color: "#4E6C7C" },
  maintenance: { background: "#E8E6E1", color: "#4A4A42" },
  cleaning: { background: "#E7F0EA", color: "#2E7D4F" },
  repairs: { background: "#F2E2D8", color: "#A05A34" },
  equipment: { background: "#E7F0EA", color: "#1B5E3C" },
  rent: { background: "#E8E4EE", color: "#6B5B7A" },
  miscellaneous: { background: "#EDEBE4", color: "#7A7A70" },
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Cash",
  easypaisa: "EasyPaisa",
  jazzcash: "JazzCash",
  bank_transfer: "Bank Transfer",
  card: "Card",
  other: "Other",
};

export function formatExpenseDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function monthLabel(date = new Date()): string {
  return date.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

export function firstOfMonth(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`;
}

export function startOfMonthIso(date = new Date()): string {
  return firstOfMonth(date);
}

export function endOfMonthIso(date = new Date()): string {
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return end.toISOString().slice(0, 10);
}

export function previousMonthRange(date = new Date()): {
  start: string;
  end: string;
} {
  const prev = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  return {
    start: startOfMonthIso(prev),
    end: endOfMonthIso(prev),
  };
}

export function normalizeSalaryMonth(value: string): string {
  if (value.length === 7) return `${value}-01`;
  return value.slice(0, 10);
}
