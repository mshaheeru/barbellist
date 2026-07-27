"use server";

import { getActionContext } from "@/lib/auth/get-action-context";
import {
  canManageExpenses,
  getDashboardVisibility,
} from "@/lib/auth/permissions";
import {
  fetchAtRiskMembers,
  fetchDashboardChart,
  fetchDashboardKpis,
  fetchExpenseBreakdown,
  fetchExpiringMembers,
  fetchFeeAlerts,
} from "@/lib/dashboard/queries";
import type { DashboardData } from "@/lib/dashboard/types";

export async function getDashboardData(): Promise<{
  data: DashboardData | null;
  error: string | null;
}> {
  try {
    const ctx = await getActionContext();
    if (!ctx) return { data: null, error: "Not authenticated" };

    const visibility = getDashboardVisibility(ctx.role);
    const includeExpenses = canManageExpenses(ctx.role);
    const includeAttendance = visibility.showAttendanceStats;

    const [kpis, chart, expenseBreakdown, feeAlerts, atRisk, expiring] =
      await Promise.all([
        fetchDashboardKpis(ctx.supabase, ctx.gymId, {
          includeExpenses,
          includeAttendance,
        }),
        visibility.showChart
          ? fetchDashboardChart(ctx.supabase, ctx.gymId, includeExpenses)
          : Promise.resolve([]),
        visibility.showExpenseBreakdown && includeExpenses
          ? fetchExpenseBreakdown(ctx.supabase, ctx.gymId)
          : Promise.resolve([]),
        visibility.showFeeAlerts
          ? fetchFeeAlerts(ctx.supabase, ctx.gymId, 10)
          : Promise.resolve([]),
        visibility.showAtRisk
          ? fetchAtRiskMembers(ctx.supabase, ctx.gymId, 10)
          : Promise.resolve([]),
        visibility.showExpiring
          ? fetchExpiringMembers(ctx.supabase, ctx.gymId)
          : Promise.resolve([]),
      ]);

    // Role masking: cashiers get revenue chart without expense/profit series
    const maskedChart =
      visibility.showChart && !visibility.showExpenses
        ? chart.map((p) => ({
            ...p,
            expenses: 0,
            profit: 0,
          }))
        : chart;

    const maskedKpis = {
      ...kpis,
      expensesThisMonth: visibility.showExpenses
        ? kpis.expensesThisMonth
        : null,
      expensesLastMonth: visibility.showExpenses
        ? kpis.expensesLastMonth
        : null,
      expensesTrendPercent: visibility.showExpenses
        ? kpis.expensesTrendPercent
        : null,
      profitThisMonth: visibility.showProfitValue ? kpis.profitThisMonth : null,
      profitLastMonth: visibility.showProfitValue ? kpis.profitLastMonth : null,
      profitTrendPercent: visibility.showProfitValue
        ? kpis.profitTrendPercent
        : null,
      overdueBalance: visibility.showOverdue ? kpis.overdueBalance : 0,
      overdueMemberCount: visibility.showOverdue ? kpis.overdueMemberCount : 0,
      revenueThisMonth: visibility.showRevenue ? kpis.revenueThisMonth : 0,
      revenueLastMonth: visibility.showRevenue ? kpis.revenueLastMonth : 0,
      revenueTrendPercent: visibility.showRevenue
        ? kpis.revenueTrendPercent
        : null,
    };

    return {
      data: {
        visibility,
        kpis: maskedKpis,
        chart: maskedChart,
        expenseBreakdown,
        feeAlerts,
        atRisk,
        expiring,
      },
      error: null,
    };
  } catch (e) {
    return {
      data: null,
      error: e instanceof Error ? e.message : "Failed to load dashboard",
    };
  }
}
