import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  ExpenseCategory,
  ExpenseListRow,
  ExpensesListResult,
  ExpensesSummary,
  PaymentMethod,
} from "@/lib/types";
import {
  endOfMonthIso,
  monthLabel,
  previousMonthRange,
  startOfMonthIso,
} from "@/lib/expenses/format";

export type ExpensesListParams = {
  category?: ExpenseCategory | "all";
  payment_method?: PaymentMethod | "all";
  recorded_by?: string | "all";
  date_from?: string;
  date_to?: string;
  status?: "paid" | "pending" | "cancelled";
};

type RawExpense = {
  id: string;
  gym_id: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  payment_method: PaymentMethod | null;
  staff_id: string | null;
  salary_month: string | null;
  is_salary_full_month: boolean;
  receipt_url: string | null;
  recorded_by: string | null;
  expense_date: string;
  status: "paid" | "pending" | "cancelled";
  notes: string | null;
  created_at: string;
  updated_at: string;
  recorder: { name: string } | { name: string }[] | null;
  staff_member: { name: string } | { name: string }[] | null;
};

function unwrapName(
  rel: { name: string } | { name: string }[] | null,
): string | null {
  if (!rel) return null;
  if (Array.isArray(rel)) return rel[0]?.name ?? null;
  return rel.name;
}

function sumAmounts(
  rows: { amount: number | string; category?: string; status?: string }[],
  filter?: (row: { amount: number | string; category?: string; status?: string }) => boolean,
): number {
  return rows
    .filter((r) => (filter ? filter(r) : true))
    .reduce((sum, r) => sum + Number(r.amount ?? 0), 0);
}

export async function fetchExpensesOverview(
  supabase: SupabaseClient,
  gymId: string,
  params: ExpensesListParams = {},
): Promise<ExpensesListResult> {
  const now = new Date();
  const monthStart = startOfMonthIso(now);
  const monthEnd = endOfMonthIso(now);
  const prev = previousMonthRange(now);

  let listQuery = supabase
    .from("expenses")
    .select(
      `
      *,
      recorder:staff!expenses_recorded_by_fkey(name),
      staff_member:staff!expenses_staff_id_fkey(name)
    `,
    )
    .eq("gym_id", gymId)
    .neq("status", "cancelled")
    .order("expense_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (params.category && params.category !== "all") {
    listQuery = listQuery.eq("category", params.category);
  }
  if (params.payment_method && params.payment_method !== "all") {
    listQuery = listQuery.eq("payment_method", params.payment_method);
  }
  if (params.recorded_by && params.recorded_by !== "all") {
    listQuery = listQuery.eq("recorded_by", params.recorded_by);
  }
  if (params.date_from) {
    listQuery = listQuery.gte("expense_date", params.date_from);
  }
  if (params.date_to) {
    listQuery = listQuery.lte("expense_date", params.date_to);
  }
  if (params.status) {
    listQuery = listQuery.eq("status", params.status);
  }

  const [listRes, monthRes, lastMonthRes, pendingRes, staffRes] =
    await Promise.all([
      listQuery,
      supabase
        .from("expenses")
        .select("amount, category, status")
        .eq("gym_id", gymId)
        .gte("expense_date", monthStart)
        .lte("expense_date", monthEnd)
        .neq("status", "cancelled"),
      supabase
        .from("expenses")
        .select("amount")
        .eq("gym_id", gymId)
        .gte("expense_date", prev.start)
        .lte("expense_date", prev.end)
        .neq("status", "cancelled"),
      supabase
        .from("expenses")
        .select("amount")
        .eq("gym_id", gymId)
        .eq("status", "pending"),
      supabase
        .from("staff")
        .select("id, name, photo_url, role, monthly_salary, status")
        .eq("gym_id", gymId)
        .eq("status", "active")
        .order("name"),
    ]);

  if (listRes.error) throw new Error(listRes.error.message);

  const rows = (listRes.data ?? []) as RawExpense[];
  const data: ExpenseListRow[] = rows.map((row) => ({
    id: row.id,
    gym_id: row.gym_id,
    category: row.category,
    description: row.description,
    amount: Number(row.amount),
    payment_method: row.payment_method,
    staff_id: row.staff_id,
    salary_month: row.salary_month,
    is_salary_full_month: row.is_salary_full_month,
    receipt_url: row.receipt_url,
    recorded_by: row.recorded_by,
    expense_date: row.expense_date,
    status: row.status,
    notes: row.notes,
    created_at: row.created_at,
    updated_at: row.updated_at,
    recorded_by_name: unwrapName(row.recorder),
    staff_name: unwrapName(row.staff_member),
  }));

  const monthRows = monthRes.data ?? [];
  const thisMonthTotal = sumAmounts(monthRows);
  const lastMonthTotal = sumAmounts(lastMonthRes.data ?? []);
  const salariesPaid = sumAmounts(
    monthRows,
    (r) => r.category === "salary" && r.status !== "cancelled",
  );
  const salariesPaidCount = monthRows.filter(
    (r) => r.category === "salary",
  ).length;
  const pendingTotal = sumAmounts(pendingRes.data ?? []);
  const pendingCount = pendingRes.data?.length ?? 0;
  const staffTotal = staffRes.data?.length ?? 0;

  let trendPercent: number | null = null;
  if (lastMonthTotal > 0) {
    trendPercent =
      ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100;
  } else if (thisMonthTotal > 0) {
    trendPercent = 100;
  }

  const summary: ExpensesSummary = {
    thisMonthTotal,
    lastMonthTotal,
    trendPercent,
    salariesPaid,
    salariesPaidCount,
    staffTotal,
    pendingTotal,
    pendingCount,
    entryCount: data.length,
    monthLabel: monthLabel(now),
  };

  return {
    summary,
    data,
    staffOptions: (staffRes.data ?? []).map((s) => ({
      id: s.id,
      name: s.name,
      photo_url: s.photo_url,
      role: s.role,
      monthly_salary: s.monthly_salary != null ? Number(s.monthly_salary) : null,
    })),
    meta: { total: data.length },
  };
}
