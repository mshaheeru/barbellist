"use client";

import { useCallback, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar } from "lucide-react";
import {
  EXPENSE_CATEGORY_LABELS,
  PAYMENT_METHOD_LABELS,
} from "@/lib/expenses/format";
import type { ExpenseCategory, PaymentMethod } from "@/lib/types";
import styles from "./expenses.module.css";

const CATEGORIES: (ExpenseCategory | "all")[] = [
  "all",
  "salary",
  "utilities",
  "maintenance",
  "cleaning",
  "repairs",
  "equipment",
  "rent",
  "miscellaneous",
];

const METHODS: (PaymentMethod | "all")[] = [
  "all",
  "cash",
  "easypaisa",
  "jazzcash",
  "bank_transfer",
];

type ExpensesToolbarProps = {
  category?: string;
  payment_method?: string;
  recorded_by?: string;
  date_from?: string;
  date_to?: string;
  staffOptions: { id: string; name: string }[];
};

export function ExpensesToolbar({
  category = "all",
  payment_method = "all",
  recorded_by = "all",
  date_from,
  date_to,
  staffOptions,
}: ExpensesToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "" || value === "all") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      startTransition(() => {
        router.push(`/dashboard/expenses?${params.toString()}`);
      });
    },
    [router, searchParams, startTransition],
  );

  return (
    <div className={styles.toolbarRow}>
      <div className={styles.dateRange}>
        <Calendar size={15} strokeWidth={2} color="#6B6B62" />
        <input
          type="date"
          className={styles.dateInput}
          value={date_from ?? ""}
          onChange={(e) =>
            updateParams({ date_from: e.target.value || null })
          }
          aria-label="From date"
        />
        <span style={{ color: "#a0a096" }}>–</span>
        <input
          type="date"
          className={styles.dateInput}
          value={date_to ?? ""}
          onChange={(e) => updateParams({ date_to: e.target.value || null })}
          aria-label="To date"
        />
      </div>

      <select
        className={styles.filterSelect}
        value={category}
        onChange={(e) => updateParams({ category: e.target.value })}
        aria-label="Category"
      >
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            Category:{" "}
            {c === "all" ? "All" : EXPENSE_CATEGORY_LABELS[c]}
          </option>
        ))}
      </select>

      <select
        className={styles.filterSelect}
        value={recorded_by}
        onChange={(e) => updateParams({ recorded_by: e.target.value })}
        aria-label="Added by"
      >
        <option value="all">Added by: All Staff</option>
        {staffOptions.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      <select
        className={styles.filterSelect}
        value={payment_method}
        onChange={(e) => updateParams({ payment_method: e.target.value })}
        aria-label="Payment method"
      >
        {METHODS.map((m) => (
          <option key={m} value={m}>
            Payment: {m === "all" ? "All Methods" : PAYMENT_METHOD_LABELS[m]}
          </option>
        ))}
      </select>

      <div className={styles.legend}>
        <span className={styles.legendBar} />
        Amber bar = salary
      </div>
    </div>
  );
}
