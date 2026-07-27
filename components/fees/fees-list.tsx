import { Suspense } from "react";
import { getFeesOverview } from "@/app/actions/fees";
import {
  feeSortSchema,
  feeStatusFilterSchema,
  type FeeSort,
  type FeeStatusFilter,
} from "@/lib/validations/fees";
import { FeesEmptyState, FeesTableSkeleton } from "./fees-empty-state";
import { FeesPageHeaderClient } from "./fees-page-header";
import { FeesSummaryCards } from "./fees-summary-cards";
import { FeesTable } from "./fees-table";
import { FeesToolbar } from "./fees-toolbar";
import styles from "./fees.module.css";

function parseStatus(raw?: string): FeeStatusFilter {
  const result = feeStatusFilterSchema.safeParse(raw ?? "all");
  return result.success ? result.data : "all";
}

function parseSort(raw?: string): FeeSort {
  const result = feeSortSchema.safeParse(raw ?? "due_date_asc");
  return result.success ? result.data : "due_date_asc";
}

type FeesListProps = {
  status?: string;
  sort?: string;
  date_from?: string;
  date_to?: string;
  cursor?: string;
};

export async function FeesList({
  status: statusRaw,
  sort: sortRaw,
  date_from,
  date_to,
  cursor,
}: FeesListProps) {
  const status = parseStatus(statusRaw);
  const sort = parseSort(sortRaw);

  const { data, error } = await getFeesOverview({
    status,
    sort,
    date_from,
    date_to,
    cursor,
  });

  if (error || !data) {
    return (
      <div className={styles.errorBox}>
        {error ?? "Failed to load fees. Please try again."}
      </div>
    );
  }

  return (
    <>
      <FeesPageHeaderClient
        overdueMemberCount={data.summary.overdueMemberCount}
        outstanding={data.summary.outstanding}
      />
      <FeesSummaryCards summary={data.summary} />
      <Suspense fallback={null}>
        <FeesToolbar
          currentStatus={status}
          currentSort={sort}
          dateFrom={date_from}
          dateTo={date_to}
        />
      </Suspense>

      {data.data.length === 0 ? (
        <FeesEmptyState />
      ) : (
        <FeesTable
          rows={data.data}
          nextCursor={data.meta.nextCursor}
          hasCursor={Boolean(cursor)}
          total={data.meta.total}
          showing={data.data.length}
        />
      )}
    </>
  );
}

export function FeesPageHeader({
  summary,
}: {
  summary?: {
    overdueMemberCount: number;
    outstanding: number;
  };
}) {
  return (
    <FeesPageHeaderClient
      overdueMemberCount={summary?.overdueMemberCount ?? 0}
      outstanding={summary?.outstanding ?? 0}
    />
  );
}

export { FeesTableSkeleton };
