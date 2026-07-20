import { Suspense } from "react";
import {
  InventoryList,
  InventoryTableSkeleton,
} from "@/components/inventory/inventory-list";

export const dynamic = "force-dynamic";
export const runtime = "edge";

type PageProps = {
  searchParams: Promise<{
    search?: string;
    category?: string;
    stock?: string;
  }>;
};

export default async function InventoryPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <Suspense fallback={<InventoryTableSkeleton />}>
      <InventoryList
        search={params.search}
        category={params.category}
        stock={params.stock}
      />
    </Suspense>
  );
}
