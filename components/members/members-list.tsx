import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getMembersList } from "@/app/actions/members";
import {
  memberFilterSchema,
  memberSortSchema,
  type MemberFilter,
  type MemberSort,
} from "@/lib/validations/members";
import { MembersEmptyState } from "./members-empty-state";
import { MembersPagination } from "./members-pagination";
import { MembersTable } from "./members-table";
import { MembersToolbar } from "./members-toolbar";
import { PageHeaderStart } from "@/components/dashboard/page-header-start";
import styles from "./members.module.css";

type MembersListProps = {
  search?: string;
  filter?: string;
  sort?: string;
  cursor?: string;
};

function parseFilter(raw?: string): MemberFilter {
  const result = memberFilterSchema.safeParse(raw ?? "all");
  return result.success ? result.data : "all";
}

function parseSort(raw?: string): MemberSort {
  const result = memberSortSchema.safeParse(raw ?? "joined_desc");
  return result.success ? result.data : "joined_desc";
}

export async function MembersList({
  search,
  filter: filterRaw,
  sort: sortRaw,
  cursor,
}: MembersListProps) {
  const filter = parseFilter(filterRaw);
  const sort = parseSort(sortRaw);

  const { data, error } = await getMembersList({
    search,
    filter,
    sort,
    cursor,
  });

  if (error || !data) {
    return (
      <div className={styles.errorBox}>
        {error ?? "Failed to load members. Please try again."}
      </div>
    );
  }

  const { counts } = data.meta;

  return (
    <>
      <Suspense fallback={null}>
        <MembersToolbar
          counts={counts}
          currentFilter={filter}
          currentSort={sort}
          currentSearch={search ?? ""}
        />
      </Suspense>

      {data.data.length === 0 ? (
        <MembersEmptyState />
      ) : (
        <>
          <MembersTable members={data.data} />
          <MembersPagination
            showing={data.data.length}
            total={data.meta.total}
            nextCursor={data.meta.nextCursor}
            hasCursor={Boolean(cursor)}
          />
        </>
      )}
    </>
  );
}

export function MembersPageHeader({
  counts,
}: {
  counts?: {
    active: number;
    overdue: number;
    frozen: number;
  };
}) {
  const active = counts?.active ?? 0;
  const overdue = counts?.overdue ?? 0;
  const frozen = counts?.frozen ?? 0;

  return (
    <div className={styles.pageHeader}>
      <PageHeaderStart
        title="Members"
        titleClassName={styles.pageTitle}
        subtitleClassName={styles.pageSubtitle}
        subtitle={`${active} active · ${overdue} overdue · ${frozen} frozen`}
      />
      <Link href="/dashboard/members/new" className={styles.addBtn}>
        <Plus size={17} strokeWidth={2.2} />
        Add Member
      </Link>
    </div>
  );
}
