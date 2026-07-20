import Link from "next/link";
import { Users } from "lucide-react";
import styles from "./members.module.css";

export function MembersEmptyState() {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>
        <Users size={36} strokeWidth={1.8} />
      </div>
      <div className={styles.emptyTitle}>No members yet</div>
      <p className={styles.emptyText}>
        Add your first member to get started tracking memberships, fees, and
        attendance.
      </p>
      <Link href="/dashboard/members/new" className={styles.addBtn}>
        Add your first member
      </Link>
    </div>
  );
}

export function MembersTableSkeleton() {
  return (
    <div className={styles.tableWrap}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className={styles.skeleton} />
      ))}
    </div>
  );
}
