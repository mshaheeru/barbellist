import { Suspense } from "react";
import { AttendanceList } from "@/components/attendance/attendance-list";
import { AttendancePageSkeleton } from "@/components/attendance/attendance-empty-state";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{
    range?: string;
    filter?: string;
  }>;
};

export default async function AttendancePage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <Suspense fallback={<AttendancePageSkeleton />}>
      <AttendanceList range={params.range} />
    </Suspense>
  );
}
