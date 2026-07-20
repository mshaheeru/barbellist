"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import type { StaffFilter, StaffSort } from "@/lib/validations/staff";
import type { StaffListResult } from "@/lib/types";
import styles from "./staff.module.css";

const FILTERS: { key: StaffFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "trainer", label: "Trainers" },
  { key: "cashier", label: "Front Desk" },
  { key: "cleaner", label: "Cleaners" },
  { key: "manager", label: "Managers" },
  { key: "owner", label: "Owner" },
];

const SORT_CYCLE: StaffSort[] = [
  "name_asc",
  "name_desc",
  "joined_desc",
  "joined_asc",
  "salary_desc",
  "salary_asc",
];

const SORT_LABELS: Record<StaffSort, string> = {
  name_asc: "Name A–Z",
  name_desc: "Name Z–A",
  joined_desc: "Newest first",
  joined_asc: "Oldest first",
  salary_desc: "Salary high–low",
  salary_asc: "Salary low–high",
};

type StaffToolbarProps = {
  counts: StaffListResult["meta"]["counts"];
  currentFilter: StaffFilter;
  currentSort: StaffSort;
  currentSearch: string;
};

export function StaffToolbar({
  counts,
  currentFilter,
  currentSort,
  currentSearch,
}: StaffToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [search, setSearch] = useState(currentSearch);

  useEffect(() => {
    setSearch(currentSearch);
  }, [currentSearch]);

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
      startTransition(() => {
        router.push(`/dashboard/staff?${params.toString()}`);
      });
    },
    [router, searchParams, startTransition],
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ q: search.trim() || null });
  };

  const cycleSort = () => {
    const idx = SORT_CYCLE.indexOf(currentSort);
    const next = SORT_CYCLE[(idx + 1) % SORT_CYCLE.length];
    updateParams({ sort: next });
  };

  return (
    <>
      <div className={styles.toolbarRow}>
        <form className={styles.searchWrap} onSubmit={handleSearchSubmit}>
          <Search size={18} color="#9A9A90" strokeWidth={2} />
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Search staff by name or role…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
        <button
          type="button"
          className={styles.sortBtn}
          onClick={cycleSort}
          title={SORT_LABELS[currentSort]}
        >
          <SlidersHorizontal size={16} color="#6B6B62" strokeWidth={2} />
          Sort
        </button>
      </div>

      <div className={styles.filterRow}>
        {FILTERS.map(({ key, label }) => {
          const count = counts[key];
          const active = currentFilter === key;
          return (
            <button
              key={key}
              type="button"
              className={`${styles.filterChip} ${active ? styles.filterChipActive : ""}`}
              onClick={() =>
                updateParams({ filter: key === "all" ? null : key })
              }
            >
              {label} · {count}
            </button>
          );
        })}
      </div>
    </>
  );
}
