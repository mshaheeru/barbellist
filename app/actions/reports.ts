"use server";

import { getActionContext } from "@/lib/auth/get-action-context";
import {
  canViewReports,
  getReportsVisibility,
} from "@/lib/auth/permissions";
import { buildReportsCsv } from "@/lib/reports/csv";
import {
  defaultReportsRange,
  fetchAttendanceHeatmap,
  fetchExpenseBreakdownForRange,
  fetchMonthlySeries,
  fetchPackageDistribution,
  fetchPaymentMethodBreakdown,
  fetchReportsKpis,
  formatReportsRangeLabel,
  profitTrendMonths,
} from "@/lib/reports/queries";
import type { ReportsData, ReportsDateRange } from "@/lib/reports/types";

function parseRange(
  from?: string | null,
  to?: string | null,
): ReportsDateRange {
  const fallback = defaultReportsRange();
  const iso = /^\d{4}-\d{2}-\d{2}$/;
  const safeFrom = from && iso.test(from) ? from : fallback.from;
  const safeTo = to && iso.test(to) ? to : fallback.to;
  if (safeFrom > safeTo) {
    return { from: safeTo, to: safeFrom };
  }
  return { from: safeFrom, to: safeTo };
}

export async function getReportsData(
  from?: string | null,
  to?: string | null,
): Promise<{
  data: ReportsData | null;
  error: string | null;
}> {
  try {
    const ctx = await getActionContext();
    if (!ctx) return { data: null, error: "Not authenticated" };

    if (!canViewReports(ctx.role)) {
      return { data: null, error: "Forbidden" };
    }

    const visibility = getReportsVisibility(ctx.role);
    const range = parseRange(from, to);
    const includeExpenses = visibility.showExpenses;

    const [
      kpis,
      packages,
      paymentMethods,
      monthly,
      expenseBreakdown,
      heatmap,
    ] = await Promise.all([
      fetchReportsKpis(ctx.supabase, ctx.gymId, range),
      visibility.showPackages
        ? fetchPackageDistribution(ctx.supabase, ctx.gymId)
        : Promise.resolve({ slices: [], total: 0 }),
      visibility.showPaymentMethods
        ? fetchPaymentMethodBreakdown(ctx.supabase, ctx.gymId, range)
        : Promise.resolve([]),
      fetchMonthlySeries(ctx.supabase, ctx.gymId, range, includeExpenses),
      visibility.showExpenses
        ? fetchExpenseBreakdownForRange(ctx.supabase, ctx.gymId, range)
        : Promise.resolve({ bars: [], total: 0 }),
      visibility.showHeatmap
        ? fetchAttendanceHeatmap(ctx.supabase, ctx.gymId, range)
        : Promise.resolve({ cells: [], maxCount: 0, peakLabel: null }),
    ]);

    const trendMonthKeys = new Set(
      profitTrendMonths(range.from, range.to).map(
        (m) =>
          `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, "0")}`,
      ),
    );
    const profitTrend = monthly.filter((p) => trendMonthKeys.has(p.monthKey));

    const maskedProfit = visibility.showProfitValue
      ? profitTrend
      : profitTrend.map((p) => ({ ...p, profit: 0, expenses: 0 }));

    const profits = profitTrend.map((p) => p.profit);
    const profitAvgPerMonth =
      visibility.showProfitValue && profits.length > 0
        ? Math.round(
            profits.reduce((s, n) => s + n, 0) / profits.length,
          )
        : null;
    const profitDeltaFromStart =
      visibility.showProfitValue && profits.length >= 2
        ? profits[profits.length - 1]! - profits[0]!
        : null;

    const maskedKpis = {
      ...kpis,
      revenueTotal: visibility.showRevenue ? kpis.revenueTotal : 0,
      revenueTrendPercent: visibility.showRevenue
        ? kpis.revenueTrendPercent
        : null,
      sparkline: visibility.showRevenue ? kpis.sparkline : [],
      newMembers: visibility.showNewVsChurned ? kpis.newMembers : 0,
      churnedMembers: visibility.showNewVsChurned ? kpis.churnedMembers : 0,
      netMembers: visibility.showNewVsChurned ? kpis.netMembers : 0,
      avgRetentionMonths: visibility.showRetention
        ? kpis.avgRetentionMonths
        : null,
      retentionYoYDelta: visibility.showRetention
        ? kpis.retentionYoYDelta
        : null,
    };

    return {
      data: {
        range,
        rangeLabel: formatReportsRangeLabel(range.from, range.to),
        visibility,
        kpis: maskedKpis,
        packageDistribution: packages.slices,
        packageMemberTotal: packages.total,
        paymentMethods,
        profitTrend: maskedProfit,
        profitAvgPerMonth,
        profitDeltaFromStart,
        expenseBreakdown: expenseBreakdown.bars,
        expenseTotal: expenseBreakdown.total,
        heatmap,
      },
      error: null,
    };
  } catch (e) {
    return {
      data: null,
      error: e instanceof Error ? e.message : "Failed to load reports",
    };
  }
}

export async function exportReportsCsv(
  from?: string | null,
  to?: string | null,
): Promise<{ csv: string | null; error: string | null }> {
  try {
    const ctx = await getActionContext();
    if (!ctx) return { csv: null, error: "Not authenticated" };

    const visibility = getReportsVisibility(ctx.role);
    if (!visibility.canExport) {
      return { csv: null, error: "Forbidden" };
    }

    const range = parseRange(from, to);
    const monthly = await fetchMonthlySeries(
      ctx.supabase,
      ctx.gymId,
      range,
      visibility.showExpenses,
    );

    return { csv: buildReportsCsv(monthly), error: null };
  } catch (e) {
    return {
      csv: null,
      error: e instanceof Error ? e.message : "Failed to export CSV",
    };
  }
}
