import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getReportsData } from "@/app/actions/reports";
import {
  ReportsPage,
  ReportsSkeleton,
} from "@/components/reports/reports-page";
import {
  canViewReports,
  getReportsVisibility,
} from "@/lib/auth/permissions";
import {
  defaultReportsRange,
  formatReportsRangeLabel,
} from "@/lib/reports/queries";
import type { ReportsData } from "@/lib/reports/types";
import { createClient } from "@/lib/supabase/server";
import type { StaffRole } from "@/lib/types";

export const dynamic = "force-dynamic";

function emptyReports(
  from: string,
  to: string,
  role: StaffRole | null,
): ReportsData {
  return {
    range: { from, to },
    rangeLabel: formatReportsRangeLabel(from, to),
    visibility: getReportsVisibility(role),
    kpis: {
      revenueTotal: 0,
      revenueTrendPercent: null,
      sparkline: [],
      newMembers: 0,
      churnedMembers: 0,
      netMembers: 0,
      avgRetentionMonths: null,
      retentionYoYDelta: null,
    },
    packageDistribution: [],
    packageMemberTotal: 0,
    paymentMethods: [],
    profitTrend: [],
    profitAvgPerMonth: null,
    profitDeltaFromStart: null,
    expenseBreakdown: [],
    expenseTotal: 0,
    heatmap: { cells: [], maxCount: 0, peakLabel: null },
  };
}

type SearchParams = Promise<{ from?: string; to?: string }>;

async function ReportsContent({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const role = (user?.user_metadata?.role as StaffRole | undefined) ?? null;

  if (!canViewReports(role)) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const fallback = defaultReportsRange();
  const from = params.from ?? fallback.from;
  const to = params.to ?? fallback.to;

  const { data, error } = await getReportsData(from, to);

  if (error || !data) {
    return <ReportsPage initialData={emptyReports(from, to, role)} />;
  }

  return <ReportsPage initialData={data} />;
}

export default function ReportsRoute({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <Suspense fallback={<ReportsSkeleton />}>
      <ReportsContent searchParams={searchParams} />
    </Suspense>
  );
}
