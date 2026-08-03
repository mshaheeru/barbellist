import { Logo } from "@/components/brand/logo";
import styles from "@/components/dashboard/route-states.module.css";

export default function DashboardLoading() {
  return (
    <div className={styles.wrap} aria-busy="true" aria-label="Loading">
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "48px 0 24px",
        }}
      >
        <div className={styles.pulse}>
          <Logo variant="icon" height={48} href={null} />
        </div>
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
