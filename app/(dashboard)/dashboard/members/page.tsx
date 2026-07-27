import { Suspense } from "react";
import { getMembersFilterCounts } from "@/app/actions/members";
import {
  MembersList,
  MembersPageHeader,
} from "@/components/members/members-list";
import {
  MembersTableSkeleton,
} from "@/components/members/members-empty-state";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{
    q?: string;
    filter?: string;
    sort?: string;
    cursor?: string;
  }>;
};

async function HeaderWithCounts() {
  const { data } = await getMembersFilterCounts();
  return (
    <MembersPageHeader counts={data ?? undefined} />
  );
}

export default async function MembersPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <>
      <Suspense fallback={<MembersPageHeader />}>
        <HeaderWithCounts />
      </Suspense>

      <Suspense fallback={<MembersTableSkeleton />}>
        <MembersList
          search={params.q}
          filter={params.filter}
          sort={params.sort}
          cursor={params.cursor}
        />
      </Suspense>
    </>
  );
}
