"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Paperclip } from "lucide-react";
import { notifications } from "@mantine/notifications";
import { deleteExpense, getReceiptSignedUrl } from "@/app/actions/expenses";
import { useGym } from "@/components/gym-provider";
import {
  EXPENSE_CATEGORY_LABELS,
  EXPENSE_CATEGORY_PILL,
  PAYMENT_METHOD_LABELS,
  formatExpenseDate,
} from "@/lib/expenses/format";
import { formatCurrency } from "@/lib/members/format";
import type { ExpenseListRow } from "@/lib/types";
import styles from "./expenses.module.css";

type ExpensesTableProps = {
  rows: ExpenseListRow[];
  canManage: boolean;
};

export function ExpensesTable({ rows, canManage }: ExpensesTableProps) {
  const { currencySymbol } = useGym();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const openReceipt = (path: string) => {
    startTransition(async () => {
      const { url, error } = await getReceiptSignedUrl(path);
      if (error || !url) {
        notifications.show({
          color: "red",
          message: error ?? "Could not open receipt",
        });
        return;
      }
      window.open(url, "_blank", "noopener,noreferrer");
    });
  };

  const cancelExpense = (id: string) => {
    if (!confirm("Cancel this expense?")) return;
    startTransition(async () => {
      const { error } = await deleteExpense(id);
      if (error) {
        notifications.show({ color: "red", message: error });
        return;
      }
      notifications.show({ color: "green", message: "Expense cancelled." });
      router.refresh();
    });
  };

  if (rows.length === 0) {
    return (
      <div className={styles.tableWrap}>
        <div className={styles.emptyState}>
          No expenses match these filters. Record your first expense to get
          started.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.tableWrap}>
      <div className={styles.tableHead}>
        <span>Date</span>
        <span>Category</span>
        <span>Description</span>
        <span>Added By</span>
        <span>Method</span>
        <span style={{ textAlign: "right" }}>Amount</span>
        <span style={{ textAlign: "center" }}>Rcpt</span>
        <span />
      </div>
      {rows.map((row) => {
        const pill = EXPENSE_CATEGORY_PILL[row.category];
        return (
          <div
            key={row.id}
            className={`${styles.tableRow} ${
              row.category === "salary" ? styles.tableRowSalary : ""
            }`}
          >
            <span className={`${styles.num} ${styles.dateCell}`}>
              {formatExpenseDate(row.expense_date)}
            </span>
            <span>
              <span
                className={styles.pill}
                style={{ background: pill.background, color: pill.color }}
              >
                {EXPENSE_CATEGORY_LABELS[row.category]}
              </span>
            </span>
            <span className={styles.descCell}>{row.description}</span>
            <span className={styles.mutedCell}>
              {row.recorded_by_name ?? "—"}
            </span>
            <span className={styles.mutedCell}>
              {row.payment_method
                ? PAYMENT_METHOD_LABELS[row.payment_method]
                : "—"}
            </span>
            <span className={`${styles.num} ${styles.amountCell}`}>
              {formatCurrency(row.amount, currencySymbol)}
            </span>
            <span>
              {row.receipt_url ? (
                <button
                  type="button"
                  className={styles.receiptBtn}
                  onClick={() => openReceipt(row.receipt_url!)}
                  disabled={pending}
                  aria-label="View receipt"
                >
                  <Paperclip size={16} strokeWidth={2} />
                </button>
              ) : (
                <span className={styles.receiptEmpty}>—</span>
              )}
            </span>
            <span style={{ textAlign: "center" }}>
              {canManage ? (
                <button
                  type="button"
                  className={styles.menuBtn}
                  onClick={() => cancelExpense(row.id)}
                  disabled={pending}
                  aria-label="Cancel expense"
                  title="Cancel expense"
                >
                  ⋯
                </button>
              ) : null}
            </span>
          </div>
        );
      })}
    </div>
  );
}
