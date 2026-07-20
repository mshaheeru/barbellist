"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { PageHeaderStart } from "@/components/dashboard/page-header-start";
import { RecordExpenseModal } from "@/components/modals/record-expense-modal";
import type { ExpensesListResult } from "@/lib/types";
import styles from "./expenses.module.css";

type ExpensesPageHeaderProps = {
  summary: ExpensesListResult["summary"];
  staffOptions: ExpensesListResult["staffOptions"];
  currentStaffId: string | null;
  canRecord: boolean;
  canRecordSalary: boolean;
};

export function ExpensesPageHeader({
  summary,
  staffOptions,
  currentStaffId,
  canRecord,
  canRecordSalary,
}: ExpensesPageHeaderProps) {
  const [opened, setOpened] = useState(false);

  return (
    <>
      <div className={styles.pageHeader}>
        <PageHeaderStart
          title="Expenses"
          titleClassName={styles.pageTitle}
          subtitleClassName={styles.pageSubtitle}
          subtitle={`${summary.monthLabel} · ${summary.entryCount} entries recorded`}
        />
        {canRecord ? (
          <button
            type="button"
            className={styles.addBtn}
            onClick={() => setOpened(true)}
          >
            <Plus size={17} strokeWidth={2.2} />
            Record Expense
          </button>
        ) : null}
      </div>
      <RecordExpenseModal
        opened={opened}
        onClose={() => setOpened(false)}
        staffOptions={staffOptions}
        currentStaffId={currentStaffId}
        canRecordSalary={canRecordSalary}
      />
    </>
  );
}
