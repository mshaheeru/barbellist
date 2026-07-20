"use client";

import { useCallback, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import type { FeeSort, FeeStatusFilter } from "@/lib/validations/fees";
import styles from "./fees.module.css";

const STATUS_FILTERS: { key: FeeStatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "paid", label: "Paid" },
  { key: "pending", label: "Pending" },
  { key: "overdue", label: "Overdue" },
  { key: "partial", label: "Partial" },
  { key: "waived", label: "Waived" },
];

const SORT_CYCLE: FeeSort[] = [
  "due_date_asc",
  "due_date_desc",
  "amount_desc",
  "amount_asc",
  "overdue_desc",
  "overdue_asc",
];

const SORT_LABELS: Record<FeeSort, string> = {
  due_date_asc: "Due date (earliest)",
  due_date_desc: "Due date (latest)",
  amount_desc: "Amount (high to low)",
  amount_asc: "Amount (low to high)",
  overdue_desc: "Days overdue (most)",
  overdue_asc: "Days overdue (least)",
};

type FeesToolbarProps = {
  currentStatus: FeeStatusFilter;
  currentSort: FeeSort;
  dateFrom?: string;
  dateTo?: string;
};

export function FeesToolbar({
  currentStatus,
  currentSort,
  dateFrom,
  dateTo,
}: FeesToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      params.delete("cursor");
      startTransition(() => {
        router.push(`/dashboard/fees?${params.toString()}`);
      });
    },
    [router, searchParams, startTransition],
  );

  const cycleSort = () => {
    const idx = SORT_CYCLE.indexOf(currentSort);
    const next = SORT_CYCLE[(idx + 1) % SORT_CYCLE.length];
    updateParams({ sort: next === "due_date_asc" ? null : next });
  };

  return (
    <>
      <div className={styles.toolbarRow}>
        <div className={styles.dateRange}>
          <input
            type="date"
            className={styles.dateInput}
            value={dateFrom ?? ""}
            onChange={(e) =>
              updateParams({ date_from: e.target.value || null })
            }
            aria-label="Due date from"
          />
          <span className={styles.dateSep}>to</span>
          <input
            type="date"
            className={styles.dateInput}
            value={dateTo ?? ""}
            onChange={(e) => updateParams({ date_to: e.target.value || null })}
            aria-label="Due date to"
          />
        </div>
        <button
          type="button"
          className={styles.sortBtn}
          onClick={cycleSort}
          title={SORT_LABELS[currentSort]}
        >
          <SlidersHorizontal size={16} color="#6B6B62" strokeWidth={2} />
          Sort · {SORT_LABELS[currentSort]}
        </button>
      </div>

      <div className={styles.filterRow}>
        {STATUS_FILTERS.map(({ key, label }) => {
          const active = currentStatus === key;
          return (
            <button
              key={key}
              type="button"
              className={`${styles.filterChip} ${active ? styles.filterChipActive : ""}`}
              onClick={() =>
                updateParams({ status: key === "all" ? null : key })
              }
            >
              {label}
            </button>
          );
        })}
      </div>
    </>
  );
}
