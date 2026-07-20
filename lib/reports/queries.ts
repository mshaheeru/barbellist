import type { SupabaseClient } from "@supabase/supabase-js";
import {
  EXPENSE_CATEGORY_LABELS,
  PAYMENT_METHOD_LABELS,
  endOfMonthIso,
  startOfMonthIso,
} from "@/lib/expenses/format";
import type {
  ReportsDateRange,
  ReportsDonutSlice,
  ReportsExpenseBar,
  ReportsHeatmap,
  ReportsKpis,
  ReportsMonthPoint,
} from "@/lib/reports/types";
import type { ExpenseCategory, PaymentMethod } from "@/lib/types";

const PACKAGE_FALLBACK_COLORS = [
  "#1B5E3C",
  "#A9C4B4",
  "#C9861B",
  "#2E7D4F",
  "#DDB877",
  "#4E9A6E",
];

const PAYMENT_METHOD_COLORS: Record<string, string> = {
  cash: "#1B5E3C",
  easypaisa: "#2E7D4F",
  jazzcash: "#C9861B",
  bank_transfer: "#DDB877",
  card: "#4E9A6E",
  other: "#A9C4B4",
};

const HEATMAP_BUCKET_START_HOURS = [6, 8, 10, 12, 14, 16, 18, 20] as const;

function sumAmounts(rows: { amount: number | string }[] | null): number {
  return (rows ?? []).reduce((sum, r) => sum + Number(r.amount ?? 0), 0);
}

function trendPercent(current: number, previous: number): number | null {
  if (previous === 0) {
    if (current === 0) return 0;
    return null;
  }
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function parseDateOnly(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y!, m! - 1, d!);
}

function toDateOnly(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function startOfDayIso(dateOnly: string): string {
  return new Date(`${dateOnly}T00:00:00.000`).toISOString();
}

function endOfDayIso(dateOnly: string): string {
  return new Date(`${dateOnly}T23:59:59.999`).toISOString();
}

function shortMonthLabel(date: Date): string {
  return date.toLocaleDateString("en-GB", { month: "short" });
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

/** Inclusive list of calendar months spanning [from, to]. */
export function monthsInRange(from: string, to: string): Date[] {
  const start = parseDateOnly(from);
  const end = parseDateOnly(to);
  const months: Date[] = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  const last = new Date(end.getFullYear(), end.getMonth(), 1);
  while (cursor <= last) {
    months.push(new Date(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return months;
}

/** Profit trend shows at most last 6 months of the selected range. */
export function profitTrendMonths(from: string, to: string): Date[] {
  const all = monthsInRange(from, to);
  if (all.length <= 6) return all;
  return all.slice(-6);
}

function previousPeriod(range: ReportsDateRange): ReportsDateRange {
  const from = parseDateOnly(range.from);
  const to = parseDateOnly(range.to);
  const days =
    Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const prevTo = new Date(from);
  prevTo.setDate(prevTo.getDate() - 1);
  const prevFrom = new Date(prevTo);
  prevFrom.setDate(prevFrom.getDate() - (days - 1));
  return { from: toDateOnly(prevFrom), to: toDateOnly(prevTo) };
}

export function formatReportsRangeLabel(from: string, to: string): string {
  const a = parseDateOnly(from);
  const b = parseDateOnly(to);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  return `${fmt(a)} – ${fmt(b)}`;
}

export function defaultReportsRange(now = new Date()): ReportsDateRange {
  return {
    from: startOfMonthIso(now),
    to: endOfMonthIso(now),
  };
}

function monthsBetween(joinedAt: string, asOf: Date): number {
  const joined = new Date(joinedAt);
  if (Number.isNaN(joined.getTime())) return 0;
  const ms = asOf.getTime() - joined.getTime();
  if (ms <= 0) return 0;
  return ms / (1000 * 60 * 60 * 24 * 30.4375);
}

function hourBucketIndex(hour: number): number | null {
  if (hour < 6 || hour >= 22) return null;
  return Math.min(7, Math.floor((hour - 6) / 2));
}

/** JS getDay(): 0=Sun … 6=Sat → Mon=0 … Sun=6 */
function mondayIndex(jsDay: number): number {
  return jsDay === 0 ? 6 : jsDay - 1;
}

export async function fetchReportsKpis(
  supabase: SupabaseClient,
  gymId: string,
  range: ReportsDateRange,
): Promise<ReportsKpis> {
  const prev = previousPeriod(range);
  const fromIso = startOfDayIso(range.from);
  const toIso = endOfDayIso(range.to);
  const prevFromIso = startOfDayIso(prev.from);
  const prevToIso = endOfDayIso(prev.to);

  const sparkMonths = profitTrendMonths(range.from, range.to);
  const sparkStart = sparkMonths[0]
    ? startOfDayIso(startOfMonthIso(sparkMonths[0]))
    : fromIso;

  const [
    revenueRes,
    prevRevenueRes,
    sparkPaymentsRes,
    newRes,
    churnRes,
    activeJoinedRes,
  ] = await Promise.all([
    supabase
      .from("payments")
      .select("amount")
      .eq("gym_id", gymId)
      .gte("paid_at", fromIso)
      .lte("paid_at", toIso),
    supabase
      .from("payments")
      .select("amount")
      .eq("gym_id", gymId)
      .gte("paid_at", prevFromIso)
      .lte("paid_at", prevToIso),
    supabase
      .from("payments")
      .select("amount, paid_at")
      .eq("gym_id", gymId)
      .gte("paid_at", sparkStart)
      .lte("paid_at", toIso),
    supabase
      .from("members")
      .select("id", { count: "exact", head: true })
      .eq("gym_id", gymId)
      .gte("joined_at", fromIso)
      .lte("joined_at", toIso),
    // Churn proxy: cancelled/expired members whose updated_at falls in range
    // (no status_changed_at column yet)
    supabase
      .from("members")
      .select("id", { count: "exact", head: true })
      .eq("gym_id", gymId)
      .in("status", ["cancelled", "expired"])
      .gte("updated_at", fromIso)
      .lte("updated_at", toIso),
    supabase
      .from("members")
      .select("joined_at")
      .eq("gym_id", gymId)
      .eq("status", "active")
      .not("joined_at", "is", null),
  ]);

  if (revenueRes.error) throw new Error(revenueRes.error.message);
  if (prevRevenueRes.error) throw new Error(prevRevenueRes.error.message);
  if (sparkPaymentsRes.error) throw new Error(sparkPaymentsRes.error.message);
  if (newRes.error) throw new Error(newRes.error.message);
  if (churnRes.error) throw new Error(churnRes.error.message);
  if (activeJoinedRes.error) throw new Error(activeJoinedRes.error.message);

  const revenueTotal = sumAmounts(revenueRes.data);
  const prevRevenue = sumAmounts(prevRevenueRes.data);

  const byMonth = new Map<string, number>();
  for (const row of sparkPaymentsRes.data ?? []) {
    const d = new Date(row.paid_at);
    const key = monthKey(d);
    byMonth.set(key, (byMonth.get(key) ?? 0) + Number(row.amount));
  }
  const sparkline = sparkMonths.map((m) => byMonth.get(monthKey(m)) ?? 0);

  const now = new Date();
  const yearAgo = new Date(now);
  yearAgo.setFullYear(yearAgo.getFullYear() - 1);

  const joinedDates = (activeJoinedRes.data ?? [])
    .map((r) => r.joined_at as string | null)
    .filter((j): j is string => Boolean(j));

  let avgRetentionMonths: number | null = null;
  let retentionYoYDelta: number | null = null;

  if (joinedDates.length > 0) {
    const avgNow =
      joinedDates.reduce((s, j) => s + monthsBetween(j, now), 0) /
      joinedDates.length;
    avgRetentionMonths = Math.round(avgNow * 10) / 10;

    const thenMembers = joinedDates.filter((j) => new Date(j) <= yearAgo);
    if (thenMembers.length > 0) {
      const avgThen =
        thenMembers.reduce((s, j) => s + monthsBetween(j, yearAgo), 0) /
        thenMembers.length;
      retentionYoYDelta = Math.round((avgNow - avgThen) * 10) / 10;
    }
  }

  const newMembers = newRes.count ?? 0;
  const churnedMembers = churnRes.count ?? 0;

  return {
    revenueTotal,
    revenueTrendPercent: trendPercent(revenueTotal, prevRevenue),
    sparkline,
    newMembers,
    churnedMembers,
    netMembers: newMembers - churnedMembers,
    avgRetentionMonths,
    retentionYoYDelta,
  };
}

export async function fetchPackageDistribution(
  supabase: SupabaseClient,
  gymId: string,
): Promise<{ slices: ReportsDonutSlice[]; total: number }> {
  const { data, error } = await supabase
    .from("members")
    .select("package_id, packages(id, name, color)")
    .eq("gym_id", gymId)
    .eq("status", "active");

  if (error) throw new Error(error.message);

  const counts = new Map<
    string,
    { label: string; color: string | null; count: number }
  >();

  for (const row of data ?? []) {
    const pkgRaw = row.packages as
      | { id: string; name: string; color: string | null }
      | { id: string; name: string; color: string | null }[]
      | null;
    const pkg = Array.isArray(pkgRaw) ? pkgRaw[0] : pkgRaw;
    const key = pkg?.id ?? row.package_id ?? "none";
    const label = pkg?.name ?? "No package";
    const existing = counts.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      counts.set(key, { label, color: pkg?.color ?? null, count: 1 });
    }
  }

  const total = [...counts.values()].reduce((s, c) => s + c.count, 0);
  const slices: ReportsDonutSlice[] = [...counts.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .map(([key, item], index) => ({
      key,
      label: item.label,
      value: item.count,
      percent: total > 0 ? Math.round((item.count / total) * 100) : 0,
      color:
        item.color ||
        PACKAGE_FALLBACK_COLORS[index % PACKAGE_FALLBACK_COLORS.length]!,
    }));

  return { slices, total };
}

export async function fetchPaymentMethodBreakdown(
  supabase: SupabaseClient,
  gymId: string,
  range: ReportsDateRange,
): Promise<ReportsDonutSlice[]> {
  const { data, error } = await supabase
    .from("payments")
    .select("amount, payment_method")
    .eq("gym_id", gymId)
    .gte("paid_at", startOfDayIso(range.from))
    .lte("paid_at", endOfDayIso(range.to));

  if (error) throw new Error(error.message);

  const totals = new Map<string, number>();
  for (const row of data ?? []) {
    const method = (row.payment_method as string) || "other";
    totals.set(method, (totals.get(method) ?? 0) + Number(row.amount));
  }

  const grand = [...totals.values()].reduce((s, n) => s + n, 0);

  return [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([key, value]) => ({
      key,
      label:
        PAYMENT_METHOD_LABELS[key as PaymentMethod] ??
        key.replace(/_/g, " "),
      value,
      percent: grand > 0 ? Math.round((value / grand) * 100) : 0,
      color: PAYMENT_METHOD_COLORS[key] ?? "#A9C4B4",
    }));
}

export async function fetchMonthlySeries(
  supabase: SupabaseClient,
  gymId: string,
  range: ReportsDateRange,
  includeExpenses: boolean,
): Promise<ReportsMonthPoint[]> {
  const months = monthsInRange(range.from, range.to);
  if (months.length === 0) return [];

  const rangeStartIso = startOfDayIso(startOfMonthIso(months[0]!));
  const last = months[months.length - 1]!;
  const rangeEndIso = endOfDayIso(endOfMonthIso(last));
  const expenseStart = startOfMonthIso(months[0]!);
  const expenseEnd = endOfMonthIso(last);

  const [paymentsRes, expensesRes, joinsRes, churnRes, activeRes] =
    await Promise.all([
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
            .gte("expense_date", expenseStart)
            .lte("expense_date", expenseEnd)
            .neq("status", "cancelled")
        : Promise.resolve({
            data: [] as { amount: number; expense_date: string }[],
            error: null,
          }),
      supabase
        .from("members")
        .select("joined_at")
        .eq("gym_id", gymId)
        .gte("joined_at", rangeStartIso)
        .lte("joined_at", rangeEndIso),
      supabase
        .from("members")
        .select("updated_at")
        .eq("gym_id", gymId)
        .in("status", ["cancelled", "expired"])
        .gte("updated_at", rangeStartIso)
        .lte("updated_at", rangeEndIso),
      supabase
        .from("members")
        .select("id", { count: "exact", head: true })
        .eq("gym_id", gymId)
        .eq("status", "active"),
    ]);

  if (paymentsRes.error) throw new Error(paymentsRes.error.message);
  if (expensesRes.error) throw new Error(expensesRes.error.message);
  if (joinsRes.error) throw new Error(joinsRes.error.message);
  if (churnRes.error) throw new Error(churnRes.error.message);
  if (activeRes.error) throw new Error(activeRes.error.message);

  const revenueByKey = new Map<string, number>();
  const expensesByKey = new Map<string, number>();
  const newByKey = new Map<string, number>();
  const churnByKey = new Map<string, number>();

  for (const row of paymentsRes.data ?? []) {
    const d = new Date(row.paid_at);
    const key = monthKey(d);
    revenueByKey.set(key, (revenueByKey.get(key) ?? 0) + Number(row.amount));
  }

  for (const row of expensesRes.data ?? []) {
    const d = new Date(`${row.expense_date}T12:00:00`);
    const key = monthKey(d);
    expensesByKey.set(key, (expensesByKey.get(key) ?? 0) + Number(row.amount));
  }

  for (const row of joinsRes.data ?? []) {
    if (!row.joined_at) continue;
    const key = monthKey(new Date(row.joined_at));
    newByKey.set(key, (newByKey.get(key) ?? 0) + 1);
  }

  for (const row of churnRes.data ?? []) {
    if (!row.updated_at) continue;
    const key = monthKey(new Date(row.updated_at));
    churnByKey.set(key, (churnByKey.get(key) ?? 0) + 1);
  }

  const activeMembers = activeRes.count ?? 0;

  return months.map((m) => {
    const key = monthKey(m);
    const revenue = revenueByKey.get(key) ?? 0;
    const expenses = includeExpenses ? (expensesByKey.get(key) ?? 0) : 0;
    return {
      monthKey: key,
      month: shortMonthLabel(m),
      revenue,
      expenses,
      profit: revenue - expenses,
      newMembers: newByKey.get(key) ?? 0,
      churnedMembers: churnByKey.get(key) ?? 0,
      activeMembers,
    };
  });
}

export async function fetchExpenseBreakdownForRange(
  supabase: SupabaseClient,
  gymId: string,
  range: ReportsDateRange,
): Promise<{ bars: ReportsExpenseBar[]; total: number }> {
  const { data, error } = await supabase
    .from("expenses")
    .select("amount, category")
    .eq("gym_id", gymId)
    .gte("expense_date", range.from)
    .lte("expense_date", range.to)
    .neq("status", "cancelled");

  if (error) throw new Error(error.message);

  const totals = new Map<ExpenseCategory, number>();
  for (const row of data ?? []) {
    const cat = row.category as ExpenseCategory;
    totals.set(cat, (totals.get(cat) ?? 0) + Number(row.amount));
  }

  const sorted = [...totals.entries()].sort((a, b) => b[1] - a[1]);
  const max = sorted[0]?.[1] ?? 0;
  const total = sorted.reduce((s, [, n]) => s + n, 0);

  const bars: ReportsExpenseBar[] = sorted.map(([category, amount]) => ({
    category,
    label:
      category === "salary"
        ? "Salaries"
        : category === "miscellaneous"
          ? "Miscellaneous"
          : (EXPENSE_CATEGORY_LABELS[category] ?? category),
    amount,
    widthPercent: max > 0 ? Math.max(4, Math.round((amount / max) * 100)) : 0,
    tone: category === "salary" ? "amber" : "green",
  }));

  return { bars, total };
}

export async function fetchAttendanceHeatmap(
  supabase: SupabaseClient,
  gymId: string,
  range: ReportsDateRange,
): Promise<ReportsHeatmap> {
  const { data, error } = await supabase
    .from("attendance")
    .select("check_in_at")
    .eq("gym_id", gymId)
    .gte("check_in_at", startOfDayIso(range.from))
    .lte("check_in_at", endOfDayIso(range.to));

  if (error) throw new Error(error.message);

  const grid = new Map<string, number>();
  let maxCount = 0;

  for (const row of data ?? []) {
    const d = new Date(row.check_in_at);
    const day = mondayIndex(d.getDay());
    const bucket = hourBucketIndex(d.getHours());
    if (bucket == null) continue;
    const key = `${day}-${bucket}`;
    const next = (grid.get(key) ?? 0) + 1;
    grid.set(key, next);
    if (next > maxCount) maxCount = next;
  }

  const cells = [];
  for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
    for (let bucketIndex = 0; bucketIndex < 8; bucketIndex += 1) {
      const count = grid.get(`${dayIndex}-${bucketIndex}`) ?? 0;
      const intensity =
        maxCount > 0 ? Math.min(5, Math.ceil((count / maxCount) * 5)) : 0;
      cells.push({ dayIndex, bucketIndex, count, intensity });
    }
  }

  let peakLabel: string | null = null;
  let bestScore = 0;
  for (let bucketIndex = 0; bucketIndex < 8; bucketIndex += 1) {
    let weekdaySum = 0;
    for (let dayIndex = 0; dayIndex < 5; dayIndex += 1) {
      weekdaySum += grid.get(`${dayIndex}-${bucketIndex}`) ?? 0;
    }
    if (weekdaySum > bestScore) {
      bestScore = weekdaySum;
      const start = HEATMAP_BUCKET_START_HOURS[bucketIndex]!;
      const end = start + 2;
      if (start >= 12) {
        const s = start === 12 ? 12 : start - 12;
        const e = end === 12 ? 12 : end > 12 ? end - 12 : end;
        peakLabel = `${s}–${e} PM on weekdays`;
      } else {
        peakLabel = `${start}–${end} AM on weekdays`;
      }
    }
  }

  if (bestScore === 0) peakLabel = null;

  return { cells, maxCount, peakLabel };
}
