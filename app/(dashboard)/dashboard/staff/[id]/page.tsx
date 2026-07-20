import { Suspense } from "react";
import { StaffProfileContent } from "@/components/staff/staff-profile-content";
import { StaffProfileSkeleton } from "@/components/staff/staff-skeletons";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export default async function StaffProfilePage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const { tab } = await searchParams;

  return (
    <Suspense fallback={<StaffProfileSkeleton />}>
      <StaffProfileContent id={id} tab={tab} />
    </Suspense>
  );
}
