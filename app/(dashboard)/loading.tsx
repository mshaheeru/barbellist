import styles from "@/components/dashboard/route-states.module.css";

export default function DashboardLoading() {
  return (
    <div className={styles.wrap} aria-busy="true" aria-label="Loading">
      <div className={styles.skelTop}>
        <div className={`${styles.skelTitle} ${styles.pulse}`} />
        <div className={`${styles.skelSub} ${styles.pulse}`} />
      </div>
      <div className={styles.skelKpiGrid}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`${styles.skelKpi} ${styles.pulse}`} />
        ))}
      </div>
      <div className={styles.skelPanel}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={`${styles.skelRow} ${styles.pulse}`} />
        ))}
      </div>
    </div>
  );
}
