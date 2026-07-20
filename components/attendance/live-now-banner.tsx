import type { LiveGymCounts } from "@/lib/types";
import styles from "./attendance.module.css";

type LiveNowBannerProps = {
  counts: LiveGymCounts;
};

export function LiveNowBanner({ counts }: LiveNowBannerProps) {
  return (
    <div className={styles.liveBanner}>
      <span className={styles.liveDot} aria-hidden />
      <div style={{ flex: 1 }}>
        <div className={styles.liveLabel}>LIVE NOW</div>
        <div className={styles.liveHeadline}>
          Currently in gym:{" "}
          <span className={styles.num}>{counts.membersInGym}</span> members ·{" "}
          <span className={styles.num}>{counts.staffInGym}</span> staff
        </div>
      </div>
      <div className={styles.liveStats}>
        <div>
          <div className={`${styles.liveStatValue} ${styles.num}`}>
            {counts.checkInsToday}
          </div>
          <div className={styles.liveStatLabel}>check-ins today</div>
        </div>
        <div>
          <div className={`${styles.liveStatValue} ${styles.num}`}>
            {counts.peakHourLabel}
          </div>
          <div className={styles.liveStatLabel}>busiest so far</div>
        </div>
      </div>
    </div>
  );
}
