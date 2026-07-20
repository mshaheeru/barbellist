import Link from "next/link";
import { FileQuestion } from "lucide-react";
import styles from "@/components/dashboard/route-states.module.css";

export default function DashboardNotFound() {
  return (
    <div className={styles.center}>
      <div className={`${styles.iconCircle} ${styles.iconCircleMuted}`}>
        <FileQuestion size={28} strokeWidth={1.8} />
      </div>
      <h1 className={styles.title}>Page not found</h1>
      <p className={styles.message}>
        This page does not exist or you do not have access to it.
      </p>
      <div className={styles.actions}>
        <Link href="/dashboard" className={styles.primaryBtn}>
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
