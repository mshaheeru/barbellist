import type { AttendanceFeedItem } from "@/lib/types";
import { AttendanceFeedRow } from "./attendance-feed-row";
import styles from "./attendance.module.css";

type AttendanceFeedListProps = {
  items: AttendanceFeedItem[];
  newItemIds?: Set<string>;
};

export function AttendanceFeedList({
  items,
  newItemIds,
}: AttendanceFeedListProps) {
  return (
    <>
      {items.map((item) => (
        <AttendanceFeedRow
          key={item.id}
          item={item}
          isNew={newItemIds?.has(item.id)}
        />
      ))}
    </>
  );
}

export function AttendanceFeedPanel({
  items,
  personFilter,
  onPersonFilterChange,
  newItemIds,
}: {
  items: AttendanceFeedItem[];
  personFilter: "all" | "member" | "staff";
  onPersonFilterChange: (filter: "all" | "member" | "staff") => void;
  newItemIds?: Set<string>;
}) {
  const filters: { key: "all" | "member" | "staff"; label: string }[] = [
    { key: "member", label: "Members" },
    { key: "staff", label: "Staff" },
    { key: "all", label: "All" },
  ];

  return (
    <div className={styles.feedPanel}>
      <div className={styles.feedHeader}>
        <div className={styles.segmented}>
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              className={`${styles.segment} ${styles.segmentSmall} ${
                personFilter === f.key ? styles.segmentActive : ""
              }`}
              onClick={() => onPersonFilterChange(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <span className={styles.feedMeta}>Newest first</span>
      </div>
      {items.length === 0 ? (
        <div className={styles.emptyState} style={{ border: "none", boxShadow: "none" }}>
          <div className={styles.emptyTitle}>No check-ins yet</div>
          <p className={styles.emptyText}>
            Check-ins from the kiosk or manual entry will appear here in real time.
          </p>
        </div>
      ) : (
        <AttendanceFeedList items={items} newItemIds={newItemIds} />
      )}
    </div>
  );
}
