import Link from "next/link";
import { CalendarCheck } from "lucide-react";
import styles from "./attendance.module.css";

export function AttendanceEmptyState() {
  return (
    <div className={styles.emptyState}>
      <CalendarCheck size={40} strokeWidth={1.8} color="#1B5E3C" />
      <div className={styles.emptyTitle} style={{ marginTop: 16 }}>
        No attendance records yet
      </div>
      <p className={styles.emptyText}>
        Open the kiosk to start checking in members, or add members first if
        your gym is just getting started.
      </p>
      <Link href="/dashboard/attendance/kiosk" className={styles.kioskBtn}>
        Open Kiosk
      </Link>
    </div>
  );
}

export function AttendancePageSkeleton() {
  return (
    <>
      <div className={styles.skeleton} style={{ height: 48, marginBottom: 22 }} />
      <div className={styles.skeleton} style={{ height: 88, marginBottom: 22 }} />
      <div className={styles.layoutGrid}>
        <div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.skeleton} />
          ))}
        </div>
        <div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={styles.skeleton}
              style={{ height: 160, marginBottom: 18 }}
            />
          ))}
        </div>
      </div>
    </>
  );
}
