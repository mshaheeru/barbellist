import { Suspense } from "react";
import { CardsPageClient } from "@/components/cards/cards-page-client";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{
    member?: string;
  }>;
};

function CardsFallback() {
  return (
    <div
      style={{
        padding: "28px 34px",
        color: "#7a7a70",
        fontSize: 14.5,
      }}
    >
      Loading card generator…
    </div>
  );
}

export default async function CardsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <Suspense fallback={<CardsFallback />}>
      <CardsPageClient initialMemberId={params.member} />
    </Suspense>
  );
}
