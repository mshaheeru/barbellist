"use server";

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
import { createClient } from "@/lib/supabase/server";
import type { StaffRole } from "@/lib/types";

async function getAuthenticatedContext(): Promise<{
  gymId: string;
  role: StaffRole | null;
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const gymId = user?.user_metadata?.gym_id as string | undefined;
  if (!gymId || !user) return null;

  const role = (user.user_metadata?.role as StaffRole | undefined) ?? null;
  return { gymId, role };
}

export async function getDashboardData(): Promise<{
  data: DashboardData | null;
  error: string | null;
}> {
  try {
    const ctx = await getAuthenticatedContext();
    if (!ctx) return { data: null, error: "Not authenticated" };

    const visibility = getDashboardVisibility(ctx.role);
    const includeExpenses = canManageExpenses(ctx.role);
    const includeAttendance = visibility.showAttendanceStats;
    const supabase = await createClient();

    const [kpis, chart, expenseBreakdown, feeAlerts, atRisk, expiring] =
      await Promise.all([
        fetchDashboardKpis(supabase, ctx.gymId, {
          includeExpenses,
          includeAttendance,
        }),
        visibility.showChart
          ? fetchDashboardChart(supabase, ctx.gymId, includeExpenses)
          : Promise.resolve([]),
        visibility.showExpenseBreakdown && includeExpenses
          ? fetchExpenseBreakdown(supabase, ctx.gymId)
          : Promise.resolve([]),
        visibility.showFeeAlerts
          ? fetchFeeAlerts(supabase, ctx.gymId, 10)
          : Promise.resolve([]),
        visibility.showAtRisk
          ? fetchAtRiskMembers(supabase, ctx.gymId, 10)
          : Promise.resolve([]),
        visibility.showExpiring
          ? fetchExpiringMembers(supabase, ctx.gymId)
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
