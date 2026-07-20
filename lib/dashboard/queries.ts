import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchLiveGymCounts } from "@/lib/attendance/queries";
import {
  EXPENSE_CATEGORY_LABELS,
  endOfMonthIso,
  monthLabel,
  previousMonthRange,
  startOfMonthIso,
} from "@/lib/expenses/format";
import {
  avatarToneFromName,
  daysUntil,
  getInitials,
} from "@/lib/members/format";
import type { ExpenseCategory } from "@/lib/types";
import type {
  DashboardAtRiskMember,
  DashboardChartPoint,
  DashboardExpenseBar,
  DashboardExpiringMember,
  DashboardFeeAlert,
  DashboardKpis,
} from "@/lib/dashboard/types";

type RawOverdueDue = {
  id: string;
  member_id: string;
  amount_due: number;
  amount_paid: number;
  due_date: string;
  status: string;
  members:
    | {
        name: string;
        phone: string | null;
        photo_url: string | null;
        packages: { name: string } | { name: string }[] | null;
      }
    | {
        name: string;
        phone: string | null;
        photo_url: string | null;
        packages: { name: string } | { name: string }[] | null;
      }[]
    | null;
};

type RawMemberAttendance = {
  id: string;
  name: string;
  phone: string | null;
  photo_url: string | null;
  membership_end: string | null;
  packages: { name: string } | { name: string }[] | null;
  attendance: { check_in_at: string }[] | null;
};

function unwrapRel<T>(rel: T | T[] | null | undefined): T | null {
  if (!rel) return null;
  if (Array.isArray(rel)) return rel[0] ?? null;
  return rel;
}

function unwrapPackage(
  pkg: { name: string } | { name: string }[] | null | undefined,
): string | null {
  const p = unwrapRel(pkg);
  return p?.name ?? null;
}

function trendPercent(current: number, previous: number): number | null {
  if (previous === 0) {
    if (current === 0) return 0;
    return null;
  }
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function shortMonthLabel(date: Date): string {
  return date.toLocaleDateString("en-GB", { month: "short" });
}

function daysOverdue(dueDate: string): number {
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.round(
    (today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24),
  );
  return days > 0 ? days : 0;
}

function daysSince(iso: string | null): number {
  if (!iso) return 9999;
  const then = new Date(iso);
  then.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round(
    (today.getTime() - then.getTime()) / (1000 * 60 * 60 * 24),
  );
}

function sumAmounts(rows: { amount: number | string }[] | null): number {
  return (rows ?? []).reduce((sum, r) => sum + Number(r.amount ?? 0), 0);
}

function lastSixMonthStarts(now = new Date()): Date[] {
  const months: Date[] = [];
  for (let i = 5; i >= 0; i -= 1) {
    months.push(new Date(now.getFullYear(), now.getMonth() - i, 1));
  }
  return months;
}

export async function fetchDashboardKpis(
  supabase: SupabaseClient,
  gymId: string,
  options: { includeExpenses: boolean; includeAttendance: boolean },
): Promise<DashboardKpis> {
  const now = new Date();
  const monthStart = startOfMonthIso(now);
  const monthEnd = endOfMonthIso(now);
  const prev = previousMonthRange(now);
  const monthStartIso = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
  ).toISOString();
  const monthEndIso = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  ).toISOString();
  const prevStartIso = new Date(
    `${prev.start}T00:00:00.000Z`,
  ).toISOString();
  const prevEndIso = new Date(`${prev.end}T23:59:59.999Z`).toISOString();

  const [
    activeRes,
    newRes,
    revenueRes,
    lastRevenueRes,
    overdueRes,
    expensesRes,
    lastExpensesRes,
    liveCounts,
  ] = await Promise.all([
    supabase
      .from("members")
      .select("id", { count: "exact", head: true })
      .eq("gym_id", gymId)
      .eq("status", "active"),
    supabase
      .from("members")
      .select("id", { count: "exact", head: true })
      .eq("gym_id", gymId)
      .gte("joined_at", monthStartIso)
      .lte("joined_at", monthEndIso),
    supabase
      .from("payments")
      .select("amount")
      .eq("gym_id", gymId)
      .gte("paid_at", monthStartIso)
      .lte("paid_at", monthEndIso),
    supabase
      .from("payments")
      .select("amount")
      .eq("gym_id", gymId)
      .gte("paid_at", prevStartIso)
      .lte("paid_at", prevEndIso),
    supabase
      .from("fee_dues")
      .select("member_id, amount_due, amount_paid")
      .eq("gym_id", gymId)
      .eq("status", "overdue"),
    options.includeExpenses
      ? supabase
          .from("expenses")
          .select("amount")
          .eq("gym_id", gymId)
          .gte("expense_date", monthStart)
          .lte("expense_date", monthEnd)
          .neq("status", "cancelled")
      : Promise.resolve({ data: null, error: null }),
    options.includeExpenses
      ? supabase
          .from("expenses")
          .select("amount")
          .eq("gym_id", gymId)
          .gte("expense_date", prev.start)
          .lte("expense_date", prev.end)
          .neq("status", "cancelled")
      : Promise.resolve({ data: null, error: null }),
    options.includeAttendance
      ? fetchLiveGymCounts(supabase, gymId)
      : Promise.resolve(null),
  ]);

  if (activeRes.error) throw new Error(activeRes.error.message);
  if (newRes.error) throw new Error(newRes.error.message);
  if (revenueRes.error) throw new Error(revenueRes.error.message);
  if (lastRevenueRes.error) throw new Error(lastRevenueRes.error.message);
  if (overdueRes.error) throw new Error(overdueRes.error.message);
  if (expensesRes.error) throw new Error(expensesRes.error.message);
  if (lastExpensesRes.error) throw new Error(lastExpensesRes.error.message);

  const revenueThisMonth = sumAmounts(revenueRes.data);
  const revenueLastMonth = sumAmounts(lastRevenueRes.data);

  const expensesThisMonth = options.includeExpenses
    ? sumAmounts(expensesRes.data)
    : null;
  const expensesLastMonth = options.includeExpenses
    ? sumAmounts(lastExpensesRes.data)
    : null;

  const profitThisMonth =
    expensesThisMonth != null ? revenueThisMonth - expensesThisMonth : null;
  const profitLastMonth =
    expensesLastMonth != null ? revenueLastMonth - expensesLastMonth : null;

  const overdueRows = overdueRes.data ?? [];
  const overdueBalance = overdueRows.reduce(
    (sum, d) =>
      sum + Math.max(0, Number(d.amount_due) - Number(d.amount_paid ?? 0)),
    0,
  );
  const overdueMemberCount = new Set(overdueRows.map((r) => r.member_id)).size;

  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  return {
    activeMembers: activeRes.count ?? 0,
    newMembersThisMonth: newRes.count ?? 0,
    revenueThisMonth,
    revenueLastMonth,
    revenueTrendPercent: trendPercent(revenueThisMonth, revenueLastMonth),
    expensesThisMonth,
    expensesLastMonth,
    expensesTrendPercent:
      expensesThisMonth != null && expensesLastMonth != null
        ? trendPercent(expensesThisMonth, expensesLastMonth)
        : null,
    profitThisMonth,
    profitLastMonth,
    profitTrendPercent:
      profitThisMonth != null && profitLastMonth != null
        ? trendPercent(profitThisMonth, profitLastMonth)
        : null,
    overdueBalance,
    overdueMemberCount,
    monthLabel: monthLabel(now),
    lastMonthLabel: monthLabel(lastMonthDate),
    checkInsToday: liveCounts?.checkInsToday ?? null,
  };
}

export async function fetchDashboardChart(
  supabase: SupabaseClient,
  gymId: string,
  includeExpenses: boolean,
): Promise<DashboardChartPoint[]> {
  const months = lastSixMonthStarts();
  const rangeStart = startOfMonthIso(months[0]!);
  const rangeEnd = endOfMonthIso(months[months.length - 1]!);
  const rangeStartIso = new Date(
    months[0]!.getFullYear(),
    months[0]!.getMonth(),
    1,
  ).toISOString();
  const last = months[months.length - 1]!;
  const rangeEndIso = new Date(
    last.getFullYear(),
    last.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  ).toISOString();

  const [paymentsRes, expensesRes] = await Promise.all([
    supabase
      .from("payments")
      .select("amount, paid_at")
      .eq("gym_id", gymId)
      .gte("paid_at", rangeStartIso)
      .lte("paid_at", rangeEndIso),
    includeExpenses
      ? supabase
          .from("expenses")
          .select("amount, expense_date")
          .eq("gym_id", gymId)
          .gte("expense_date", rangeStart)
          .lte("expense_date", rangeEnd)
          .neq("status", "cancelled")
      : Promise.resolve({ data: [] as { amount: number; expense_date: string }[], error: null }),
  ]);

  if (paymentsRes.error) throw new Error(paymentsRes.error.message);
  if (expensesRes.error) throw new Error(expensesRes.error.message);

  const revenueByKey = new Map<string, number>();
  const expensesByKey = new Map<string, number>();

  for (const row of paymentsRes.data ?? []) {
    const d = new Date(row.paid_at);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    revenueByKey.set(key, (revenueByKey.get(key) ?? 0) + Number(row.amount));
  }

  for (const row of expensesRes.data ?? []) {
    const d = new Date(`${row.expense_date}T12:00:00`);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    expensesByKey.set(key, (expensesByKey.get(key) ?? 0) + Number(row.amount));
  }

  return months.map((m) => {
    const key = `${m.getFullYear()}-${m.getMonth()}`;
    const revenue = revenueByKey.get(key) ?? 0;
    const expenses = includeExpenses ? (expensesByKey.get(key) ?? 0) : 0;
    return {
      month: shortMonthLabel(m),
      revenue,
      expenses,
      profit: revenue - expenses,
    };
  });
}

export async function fetchExpenseBreakdown(
  supabase: SupabaseClient,
  gymId: string,
): Promise<DashboardExpenseBar[]> {
  const now = new Date();
  const monthStart = startOfMonthIso(now);
  const monthEnd = endOfMonthIso(now);

  const { data, error } = await supabase
    .from("expenses")
    .select("amount, category")
    .eq("gym_id", gymId)
    .gte("expense_date", monthStart)
    .lte("expense_date", monthEnd)
    .neq("status", "cancelled");

  if (error) throw new Error(error.message);

  const totals = new Map<ExpenseCategory, number>();
  for (const row of data ?? []) {
    const cat = row.category as ExpenseCategory;
    totals.set(cat, (totals.get(cat) ?? 0) + Number(row.amount));
  }

  const sorted = [...totals.entries()].sort((a, b) => b[1] - a[1]);
  const max = sorted[0]?.[1] ?? 0;

  return sorted.map(([category, amount], index) => ({
    category,
    label: EXPENSE_CATEGORY_LABELS[category] ?? category,
    amount,
    widthPercent: max > 0 ? Math.max(4, Math.round((amount / max) * 100)) : 0,
    tone: index === 0 ? ("amber" as const) : ("green" as const),
  }));
}

export async function fetchFeeAlerts(
  supabase: SupabaseClient,
  gymId: string,
  limit = 10,
): Promise<DashboardFeeAlert[]> {
  const { data, error } = await supabase
    .from("fee_dues")
    .select(
      `
      id, member_id, amount_due, amount_paid, due_date, status,
      members!inner(name, phone, photo_url, packages(name))
    `,
    )
    .eq("gym_id", gymId)
    .eq("status", "overdue")
    .order("due_date", { ascending: true })
    .limit(50);

  if (error) throw new Error(error.message);

  const rows = ((data ?? []) as unknown as RawOverdueDue[])
    .map((row) => {
      const member = unwrapRel(row.members);
      const balance = Math.max(
        0,
        Number(row.amount_due) - Number(row.amount_paid ?? 0),
      );
      const days = daysOverdue(row.due_date);
      const name = member?.name ?? "Unknown";
      return {
        feeDueId: row.id,
        memberId: row.member_id,
        name,
        initials: getInitials(name),
        tone: avatarToneFromName(name) === "amber" ? ("amber" as const) : ("green" as const),
        photoUrl: member?.photo_url ?? null,
        phone: member?.phone ?? null,
        packageName: unwrapPackage(member?.packages),
        balance,
        daysOverdue: days,
      };
    })
    .sort((a, b) => b.daysOverdue - a.daysOverdue)
    .slice(0, limit);

  return rows;
}

export async function fetchAtRiskMembers(
  supabase: SupabaseClient,
  gymId: string,
  limit = 10,
): Promise<DashboardAtRiskMember[]> {
  const cutoffDays = 10;
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - cutoffDays);
  const cutoffIso = cutoff.toISOString();

  const [membersRes, recentRes, lastCheckRes] = await Promise.all([
    supabase
      .from("members")
      .select("id, name, phone, photo_url")
      .eq("gym_id", gymId)
      .eq("status", "active"),
    supabase
      .from("attendance")
      .select("member_id")
      .eq("gym_id", gymId)
      .eq("person_type", "member")
      .not("member_id", "is", null)
      .gte("check_in_at", cutoffIso),
    supabase
      .from("attendance")
      .select("member_id, check_in_at")
      .eq("gym_id", gymId)
      .eq("person_type", "member")
      .not("member_id", "is", null)
      .order("check_in_at", { ascending: false })
      .limit(2000),
  ]);

  if (membersRes.error) throw new Error(membersRes.error.message);
  if (recentRes.error) throw new Error(recentRes.error.message);
  if (lastCheckRes.error) throw new Error(lastCheckRes.error.message);

  const recentlyActive = new Set(
    (recentRes.data ?? [])
      .map((r) => r.member_id as string | null)
      .filter((id): id is string => Boolean(id)),
  );

  const lastCheckIn = new Map<string, string>();
  for (const row of lastCheckRes.data ?? []) {
    const id = row.member_id as string | null;
    if (!id || lastCheckIn.has(id)) continue;
    lastCheckIn.set(id, row.check_in_at);
  }

  const atRisk: DashboardAtRiskMember[] = [];
  for (const row of membersRes.data ?? []) {
    if (recentlyActive.has(row.id)) continue;
    const last = lastCheckIn.get(row.id) ?? null;
    const absent = daysSince(last);
    const name = row.name;
    atRisk.push({
      memberId: row.id,
      name,
      initials: getInitials(name),
      tone:
        avatarToneFromName(name) === "amber"
          ? ("amber" as const)
          : ("green" as const),
      photoUrl: row.photo_url,
      phone: row.phone,
      daysAbsent: last ? absent : 9999,
    });
  }

  return atRisk
    .sort((a, b) => b.daysAbsent - a.daysAbsent)
    .slice(0, limit);
}

export async function fetchExpiringMembers(
  supabase: SupabaseClient,
  gymId: string,
): Promise<DashboardExpiringMember[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().slice(0, 10);
  const inSeven = new Date(today);
  inSeven.setDate(inSeven.getDate() + 7);
  const inSevenStr = inSeven.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("members")
    .select(
      `
      id, name, phone, photo_url, membership_end,
      packages(name)
    `,
    )
    .eq("gym_id", gymId)
    .eq("status", "active")
    .not("membership_end", "is", null)
    .gte("membership_end", todayStr)
    .lte("membership_end", inSevenStr)
    .order("membership_end", { ascending: true });

  if (error) throw new Error(error.message);

  return ((data ?? []) as unknown as RawMemberAttendance[]).map((row) => {
    const name = row.name;
    const left = daysUntil(row.membership_end) ?? 0;
    return {
      memberId: row.id,
      name,
      initials: getInitials(name),
      tone:
        avatarToneFromName(name) === "amber"
          ? ("amber" as const)
          : ("green" as const),
      photoUrl: row.photo_url,
      packageName: unwrapPackage(row.packages),
      daysLeft: Math.max(0, left),
    };
  });
}
