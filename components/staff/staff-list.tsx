import { Suspense } from "react";
import { getStaffList } from "@/app/actions/staff";
import {
  staffFilterSchema,
  staffSortSchema,
  type StaffFilter,
  type StaffSort,
} from "@/lib/validations/staff";
import { StaffToolbar } from "./staff-toolbar";
import { StaffTable } from "./staff-table";
import { StaffPageHeaderClient } from "./staff-page-header";
import styles from "./staff.module.css";

type StaffListProps = {
  search?: string;
  filter?: string;
  sort?: string;
  currencySymbol: string;
  canViewSalary: boolean;
};

function parseFilter(raw?: string): StaffFilter {
  const result = staffFilterSchema.safeParse(raw ?? "all");
  return result.success ? result.data : "all";
}

function parseSort(raw?: string): StaffSort {
  const result = staffSortSchema.safeParse(raw ?? "name_asc");
  return result.success ? result.data : "name_asc";
}

export async function StaffList({
  search,
  filter: filterRaw,
  sort: sortRaw,
  currencySymbol,
  canViewSalary,
}: StaffListProps) {
  const filter = parseFilter(filterRaw);
  const sort = parseSort(sortRaw);

  const { data, error } = await getStaffList({
    search,
    filter,
    sort,
  });

  if (error || !data) {
    return (
      <div className={styles.errorBox}>
        {error ?? "Failed to load staff. Please try again."}
      </div>
    );
  }

  const monthLabel = new Intl.DateTimeFormat("en-GB", {
    month: "short",
  }).format(new Date());

  return (
    <>
      <Suspense fallback={null}>
        <StaffToolbar
          counts={data.meta.counts}
          currentFilter={filter}
          currentSort={sort}
          currentSearch={search ?? ""}
        />
      </Suspense>

      {data.data.length === 0 ? (
        <div className={styles.emptyState}>
          <h2 className={styles.emptyTitle}>No staff yet</h2>
          <p className={styles.emptyText}>
            Add your first team member to get started.
          </p>
        </div>
      ) : (
        <StaffTable
          staff={data.data}
          currencySymbol={currencySymbol}
          canViewSalary={canViewSalary}
          monthLabel={monthLabel}
        />
      )}
    </>
  );
}

export async function StaffPageHeader({
  canManage,
  canViewSalary,
  currencySymbol,
}: {
  canManage: boolean;
  canViewSalary: boolean;
  currencySymbol: string;
}) {
  const { data } = await getStaffList({ filter: "all" });
  const meta = data?.meta;

  return (
    <StaffPageHeaderClient
      canManage={canManage}
      total={meta?.total ?? 0}
      clockedIn={meta?.clockedInToday ?? 0}
      monthlyPayroll={canViewSalary ? (meta?.monthlyPayroll ?? 0) : null}
      currencySymbol={currencySymbol}
    />
  );
}
