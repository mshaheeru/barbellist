"use client";

import { AlertTriangle } from "lucide-react";
import styles from "@/components/dashboard/route-states.module.css";

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className={styles.center}>
      <div className={styles.iconCircle}>
        <AlertTriangle size={28} strokeWidth={1.8} />
      </div>
      <h1 className={styles.title}>Something went wrong</h1>
      <p className={styles.message}>
        We hit an unexpected error loading this page. You can try again, or go
        back to the dashboard.
      </p>
      <div className={styles.actions}>
        <button type="button" className={styles.primaryBtn} onClick={reset}>
          Try again
        </button>
        <a href="/dashboard" className={styles.secondaryBtn}>
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}
