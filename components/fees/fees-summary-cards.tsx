"use client";

import { CalendarClock, CircleDollarSign, TriangleAlert } from "lucide-react";
import { useGym } from "@/components/gym-provider";
import { formatCurrency } from "@/lib/members/format";
import type { FeesOverviewSummary } from "@/lib/types";
import styles from "./fees.module.css";

type FeesSummaryCardsProps = {
  summary: FeesOverviewSummary;
};

export function FeesSummaryCards({ summary }: FeesSummaryCardsProps) {
  const { currencySymbol } = useGym();

  return (
    <div className={styles.kpiGrid}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardLabel}>Collected This Month</span>
          <div className={`${styles.iconBox} ${styles.iconBoxGreen}`}>
            <CircleDollarSign size={16} strokeWidth={2} />
          </div>
        </div>
        <div
          className={`${styles.num} ${styles.kpiValue} ${styles.kpiValueGreen}`}
        >
          {formatCurrency(summary.collectedThisMonth, currencySymbol)}
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardLabel}>Outstanding</span>
          <div className={`${styles.iconBox} ${styles.iconBoxRed}`}>
            <TriangleAlert size={16} strokeWidth={2} />
          </div>
        </div>
        <div
          className={`${styles.num} ${styles.kpiValue} ${styles.kpiValueRed}`}
        >
          {formatCurrency(summary.outstanding, currencySymbol)}
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardLabel}>Due This Week</span>
          <div className={`${styles.iconBox} ${styles.iconBoxAmber}`}>
            <CalendarClock size={16} strokeWidth={2} />
          </div>
        </div>
        <div
          className={`${styles.num} ${styles.kpiValue} ${styles.kpiValueAmber}`}
        >
          {formatCurrency(summary.dueThisWeek, currencySymbol)}
        </div>
      </div>
    </div>
  );
}
