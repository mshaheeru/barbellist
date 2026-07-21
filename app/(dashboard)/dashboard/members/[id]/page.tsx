import { Suspense } from "react";
import { MemberProfileContent } from "@/components/members/member-profile-content";
import { MembersTableSkeleton } from "@/components/members/members-empty-state";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export default async function MemberProfilePage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const { tab } = await searchParams;

  return (
    <Suspense fallback={<MembersTableSkeleton />}>
      <MemberProfileContent id={id} tab={tab} />
    </Suspense>
  );
}
