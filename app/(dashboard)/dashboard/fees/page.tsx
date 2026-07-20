import { Suspense } from "react";
import { FeesList, FeesTableSkeleton } from "@/components/fees/fees-list";

export const dynamic = "force-dynamic";
export const runtime = "edge";

type PageProps = {
  searchParams: Promise<{
    status?: string;
    sort?: string;
    date_from?: string;
    date_to?: string;
    cursor?: string;
  }>;
};

export default async function FeesPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <Suspense fallback={<FeesTableSkeleton />}>
      <FeesList
        status={params.status}
        sort={params.sort}
        date_from={params.date_from}
        date_to={params.date_to}
        cursor={params.cursor}
      />
    </Suspense>
  );
}
