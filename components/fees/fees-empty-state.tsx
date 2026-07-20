import { Wallet } from "lucide-react";
import styles from "./fees.module.css";

export function FeesEmptyState() {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>
        <Wallet size={36} strokeWidth={1.8} />
      </div>
      <div className={styles.emptyTitle}>No fee records found</div>
      <p className={styles.emptyText}>
        Adjust your filters or generate monthly dues for active members to see
        fee records here.
      </p>
    </div>
  );
}

export function FeesTableSkeleton() {
  return (
    <div className={styles.tableWrap}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className={styles.skeleton} />
      ))}
    </div>
  );
}
