"use client";

import { Clock, ReceiptText, Wallet } from "lucide-react";
import { useGym } from "@/components/gym-provider";
import { formatCurrency } from "@/lib/members/format";
import type { ExpensesSummary } from "@/lib/types";
import styles from "./expenses.module.css";

type ExpensesSummaryCardsProps = {
  summary: ExpensesSummary;
};

export function ExpensesSummaryCards({ summary }: ExpensesSummaryCardsProps) {
  const { currencySymbol } = useGym();
  const prevMonth = new Date();
  prevMonth.setMonth(prevMonth.getMonth() - 1);
  const prevLabel = prevMonth.toLocaleDateString("en-GB", { month: "long" });

  const trend =
    summary.trendPercent == null
      ? null
      : `${summary.trendPercent >= 0 ? "+" : ""}${summary.trendPercent.toFixed(1)}% vs ${prevLabel}`;

  const salaryShare =
    summary.thisMonthTotal > 0
      ? Math.round((summary.salariesPaid / summary.thisMonthTotal) * 100)
      : 0;

  return (
    <div className={styles.kpiGrid}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardLabel}>This Month&apos;s Expenses</span>
          <div className={`${styles.iconBox} ${styles.iconBoxGrey}`}>
            <ReceiptText size={17} strokeWidth={2} />
          </div>
        </div>
        <div className={`${styles.num} ${styles.kpiValue}`}>
          {formatCurrency(summary.thisMonthTotal, currencySymbol)}
        </div>
        {trend ? (
          <div className={styles.kpiMeta}>{trend}</div>
        ) : (
          <div className={styles.kpiMeta}>No prior month data</div>
        )}
      </div>

      <div className={`${styles.card} ${styles.cardSalary}`}>
        <div className={styles.cardHeader}>
          <span className={styles.cardLabel}>
            Salaries Paid · {summary.monthLabel.split(" ")[0]}
          </span>
          <div className={`${styles.iconBox} ${styles.iconBoxAmber}`}>
            <Wallet size={17} strokeWidth={2} />
          </div>
        </div>
        <div className={`${styles.num} ${styles.kpiValue}`}>
          {formatCurrency(summary.salariesPaid, currencySymbol)}
        </div>
        <div className={`${styles.kpiMeta} ${styles.kpiMetaAmber}`}>
          {summary.salariesPaidCount} of {summary.staffTotal} staff paid
          {summary.thisMonthTotal > 0 ? ` · ${salaryShare}% of expenses` : ""}
        </div>
      </div>

      <div className={`${styles.card} ${styles.cardPending}`}>
        <div className={styles.cardHeader}>
          <span className={`${styles.cardLabel} ${styles.cardLabelPending}`}>
            Pending / Unpaid
          </span>
          <div className={`${styles.iconBox} ${styles.iconBoxAmber}`}>
            <Clock size={17} strokeWidth={2} />
          </div>
        </div>
        <div
          className={`${styles.num} ${styles.kpiValue} ${styles.kpiValueAmber}`}
        >
          {formatCurrency(summary.pendingTotal, currencySymbol)}
        </div>
        <div className={`${styles.kpiMeta} ${styles.kpiMetaAmber}`}>
          {summary.pendingCount} item
          {summary.pendingCount === 1 ? "" : "s"} awaiting payment
        </div>
      </div>
    </div>
  );
}
