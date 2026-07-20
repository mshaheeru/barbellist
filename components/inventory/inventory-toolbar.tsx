"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { INVENTORY_CATEGORY_LABELS } from "@/lib/inventory/format";
import type { InventoryCategory } from "@/lib/types";
import type { StockStatusFilter } from "@/lib/validations/inventory";
import styles from "./inventory.module.css";

const CATEGORIES: (InventoryCategory | "all")[] = [
  "all",
  "supplements",
  "drinks",
  "snacks",
  "accessories",
  "apparel",
  "other",
];

const STOCK_FILTERS: { key: StockStatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "in_stock", label: "In Stock" },
  { key: "low", label: "Low" },
  { key: "out", label: "Out of Stock" },
];

type InventoryToolbarProps = {
  search?: string;
  category?: string;
  stock?: string;
};

export function InventoryToolbar({
  search: initialSearch = "",
  category = "all",
  stock = "all",
}: InventoryToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [search, setSearch] = useState(initialSearch);

  useEffect(() => {
    setSearch(initialSearch);
  }, [initialSearch]);

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
        router.push(`/dashboard/inventory?${params.toString()}`);
      });
    },
    [router, searchParams, startTransition],
  );

  useEffect(() => {
    const t = setTimeout(() => {
      if (search !== initialSearch) {
        updateParams({ search: search || null });
      }
    }, 300);
    return () => clearTimeout(t);
  }, [search, initialSearch, updateParams]);

  return (
    <div className={styles.toolbarRow}>
      <div className={styles.searchWrap}>
        <Search size={18} color="#9A9A90" strokeWidth={2} />
        <input
          className={styles.searchInput}
          placeholder="Search items…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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
            Category: {c === "all" ? "All" : INVENTORY_CATEGORY_LABELS[c]}
          </option>
        ))}
      </select>
      <select
        className={styles.filterSelect}
        value={stock}
        onChange={(e) => updateParams({ stock: e.target.value })}
        aria-label="Stock status"
      >
        {STOCK_FILTERS.map((s) => (
          <option key={s.key} value={s.key}>
            Stock: {s.label}
          </option>
        ))}
      </select>
    </div>
  );
}
