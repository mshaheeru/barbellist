import { Suspense } from "react";
import {
  ExpensesList,
  ExpensesTableSkeleton,
} from "@/components/expenses/expenses-list";

type PageProps = {
  searchParams: Promise<{
    category?: string;
    payment_method?: string;
    recorded_by?: string;
    date_from?: string;
    date_to?: string;
  }>;
};

export default async function ExpensesPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <Suspense fallback={<ExpensesTableSkeleton />}>
      <ExpensesList
        category={params.category}
        payment_method={params.payment_method}
        recorded_by={params.recorded_by}
        date_from={params.date_from}
        date_to={params.date_to}
      />
    </Suspense>
  );
}
