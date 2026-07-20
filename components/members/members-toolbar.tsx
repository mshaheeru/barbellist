"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import type { MemberFilter, MemberSort } from "@/lib/validations/members";
import type { MembersListResult } from "@/lib/types";
import styles from "./members.module.css";

const FILTERS: { key: MemberFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "overdue", label: "Overdue" },
  { key: "due_soon", label: "Due Soon" },
  { key: "frozen", label: "Frozen" },
  { key: "new", label: "New" },
];

const SORT_CYCLE: MemberSort[] = [
  "joined_desc",
  "joined_asc",
  "name_asc",
  "name_desc",
];

const SORT_LABELS: Record<MemberSort, string> = {
  joined_desc: "Newest first",
  joined_asc: "Oldest first",
  name_asc: "Name A–Z",
  name_desc: "Name Z–A",
};

type MembersToolbarProps = {
  counts: MembersListResult["meta"]["counts"];
  currentFilter: MemberFilter;
  currentSort: MemberSort;
  currentSearch: string;
};

export function MembersToolbar({
  counts,
  currentFilter,
  currentSort,
  currentSearch,
}: MembersToolbarProps) {
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
      params.delete("cursor");
      startTransition(() => {
        router.push(`/dashboard/members?${params.toString()}`);
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
            placeholder="Search by name, member ID or phone…"
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
              onClick={() => updateParams({ filter: key === "all" ? null : key })}
            >
              {label} · {count}
            </button>
          );
        })}
      </div>
    </>
  );
}
