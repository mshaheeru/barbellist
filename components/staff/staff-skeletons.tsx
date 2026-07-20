import styles from "./staff.module.css";
import profileStyles from "./staff-profile.module.css";

export function StaffTableSkeleton() {
  return (
    <div className={styles.skeletonWrap} aria-busy="true" aria-label="Loading staff">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className={styles.skeleton} />
      ))}
    </div>
  );
}

export function StaffPageHeaderSkeleton() {
  return (
    <div className={styles.pageHeader}>
      <div>
        <h1 className={styles.pageTitle}>Staff</h1>
        <p className={styles.pageSubtitle}>Loading staff…</p>
      </div>
    </div>
  );
}

export function StaffProfileSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading staff profile">
      <div
        className={styles.skeleton}
        style={{ height: 160, borderRadius: 16, marginBottom: 18 }}
      />
      <div
        className={styles.skeleton}
        style={{ height: 44, width: 320, marginBottom: 22 }}
      />
      <div className={profileStyles.contentGrid}>
        <div className={styles.skeletonWrap}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={styles.skeleton} />
          ))}
        </div>
        <div className={styles.skeletonWrap}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={styles.skeleton} />
          ))}
        </div>
      </div>
    </div>
  );
}
