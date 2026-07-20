"use client";

import { AlertTriangle, Package, TrendingUp } from "lucide-react";
import { useGym } from "@/components/gym-provider";
import { formatCurrency } from "@/lib/members/format";
import type { InventorySummary } from "@/lib/types";
import styles from "./inventory.module.css";

type InventorySummaryCardsProps = {
  summary: InventorySummary;
};

export function InventorySummaryCards({ summary }: InventorySummaryCardsProps) {
  const { currencySymbol } = useGym();
  const monthName = summary.monthLabel.split(" ")[0];

  const trend =
    summary.salesTrendPercent == null
      ? null
      : `${summary.salesTrendPercent >= 0 ? "+" : ""}${Math.round(
          summary.salesTrendPercent,
        )}% vs previous month`;

  return (
    <div className={styles.kpiGrid}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardLabel}>Items in Stock</span>
          <div className={`${styles.iconBox} ${styles.iconBoxGreen}`}>
            <Package size={17} strokeWidth={2} />
          </div>
        </div>
        <div className={`${styles.num} ${styles.kpiValue}`}>
          {summary.itemsInStock}{" "}
          <span className={styles.kpiUnit}>SKUs</span>
        </div>
        <div className={styles.kpiMeta}>
          {formatCurrency(summary.stockValueAtCost, currencySymbol)} stock
          value at cost
        </div>
      </div>

      <div className={`${styles.card} ${styles.cardAlert}`}>
        <div className={styles.cardHeader}>
          <span className={`${styles.cardLabel} ${styles.cardLabelAlert}`}>
            Low Stock Alerts
          </span>
          <div className={`${styles.iconBox} ${styles.iconBoxAmber}`}>
            <AlertTriangle size={17} strokeWidth={2} />
          </div>
        </div>
        <div
          className={`${styles.num} ${styles.kpiValue} ${styles.kpiValueAmber}`}
        >
          {summary.lowStockCount}{" "}
          <span className={styles.kpiUnit}>items</span>
        </div>
        <div className={`${styles.kpiMeta} ${styles.kpiMetaAmber}`}>
          {summary.outOfStockCount} out of stock · reorder soon
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardLabel}>Sales · {monthName}</span>
          <div className={`${styles.iconBox} ${styles.iconBoxGreen}`}>
            <TrendingUp size={17} strokeWidth={2} />
          </div>
        </div>
        <div
          className={`${styles.num} ${styles.kpiValue} ${styles.kpiValueGreen}`}
        >
          {formatCurrency(summary.salesThisMonth, currencySymbol)}
        </div>
        {trend ? (
          <div className={`${styles.kpiMeta} ${styles.kpiMetaGreen}`}>
            {trend}
          </div>
        ) : (
          <div className={styles.kpiMeta}>No prior month data</div>
        )}
      </div>
    </div>
  );
}
