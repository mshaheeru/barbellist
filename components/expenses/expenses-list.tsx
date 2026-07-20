import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getExpenses } from "@/app/actions/expenses";
import {
  canManageExpenses,
  canRecordExpense,
  canRecordSalary,
} from "@/lib/auth/permissions";
import type { ExpenseCategory, PaymentMethod, StaffRole } from "@/lib/types";
import { ExpensesPageHeader } from "./expenses-page-header";
import { ExpensesSummaryCards } from "./expenses-summary-cards";
import { ExpensesTable } from "./expenses-table";
import { ExpensesToolbar } from "./expenses-toolbar";
import styles from "./expenses.module.css";

type ExpensesListProps = {
  category?: string;
  payment_method?: string;
  recorded_by?: string;
  date_from?: string;
  date_to?: string;
};

export async function ExpensesList(props: ExpensesListProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const role = (user?.user_metadata?.role as StaffRole | undefined) ?? null;
  const gymId = user?.user_metadata?.gym_id as string | undefined;

  let currentStaffId: string | null = null;
  if (user && gymId) {
    const { data: staff } = await supabase
      .from("staff")
      .select("id")
      .eq("gym_id", gymId)
      .eq("auth_user_id", user.id)
      .maybeSingle();
    currentStaffId = staff?.id ?? null;
  }

  const { data, error } = await getExpenses({
    category: (props.category as ExpenseCategory | "all") || "all",
    payment_method:
      (props.payment_method as PaymentMethod | "all") || "all",
    recorded_by: props.recorded_by || "all",
    date_from: props.date_from,
    date_to: props.date_to,
  });

  if (error || !data) {
    return (
      <div className={styles.errorBox}>
        {error ?? "Failed to load expenses."}
      </div>
    );
  }

  const canRecord = canRecordExpense(role);
  const canManage = canManageExpenses(role);
  const canSalary = canRecordSalary(role);

  return (
    <>
      <ExpensesPageHeader
        summary={data.summary}
        staffOptions={data.staffOptions}
        currentStaffId={currentStaffId}
        canRecord={canRecord}
        canRecordSalary={canSalary}
      />
      <ExpensesSummaryCards summary={data.summary} />
      <Suspense fallback={null}>
        <ExpensesToolbar
          category={props.category}
          payment_method={props.payment_method}
          recorded_by={props.recorded_by}
          date_from={props.date_from}
          date_to={props.date_to}
          staffOptions={data.staffOptions}
        />
      </Suspense>
      <ExpensesTable rows={data.data} canManage={canManage} />
    </>
  );
}

export function ExpensesTableSkeleton() {
  return (
    <div>
      <div className={styles.skeleton} style={{ height: 64 }} />
      <div className={styles.kpiGrid}>
        <div className={styles.skeleton} />
        <div className={styles.skeleton} />
        <div className={styles.skeleton} />
      </div>
      <div className={styles.skeleton} style={{ height: 320 }} />
    </div>
  );
}
