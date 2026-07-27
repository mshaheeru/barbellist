import { Suspense } from "react";
import { getDashboardData } from "@/app/actions/dashboard";
import {
  DashboardSkeleton,
  OwnerDashboard,
} from "@/components/dashboard/owner-dashboard";
import { getDashboardVisibility } from "@/lib/auth/permissions";
import type { DashboardData } from "@/lib/dashboard/types";
import type { StaffRole } from "@/lib/types";

export const dynamic = "force-dynamic";

function emptyDashboard(role: StaffRole | null = null): DashboardData {
  return {
    visibility: getDashboardVisibility(role),
    kpis: {
      activeMembers: 0,
      newMembersThisMonth: 0,
      revenueThisMonth: 0,
      revenueLastMonth: 0,
      revenueTrendPercent: null,
      expensesThisMonth: null,
      expensesLastMonth: null,
      expensesTrendPercent: null,
      profitThisMonth: null,
      profitLastMonth: null,
      profitTrendPercent: null,
      overdueBalance: 0,
      overdueMemberCount: 0,
      monthLabel: new Date().toLocaleDateString("en-GB", {
        month: "long",
        year: "numeric",
      }),
      lastMonthLabel: "",
      checkInsToday: null,
    },
    chart: [],
    expenseBreakdown: [],
    feeAlerts: [],
    atRisk: [],
    expiring: [],
  };
}

async function DashboardContent() {
  const { data, error } = await getDashboardData();

  if (error || !data) {
    return <OwnerDashboard data={emptyDashboard()} />;
  }

  return <OwnerDashboard data={data} />;
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
