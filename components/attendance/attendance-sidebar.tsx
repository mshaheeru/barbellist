import type { AttendanceSidebarStats } from "@/lib/types";
import styles from "./attendance.module.css";

type AttendanceSidebarProps = {
  stats: AttendanceSidebarStats;
};

export function AttendanceSidebar({ stats }: AttendanceSidebarProps) {
  const peakHour =
    stats.hourlyTraffic.reduce(
      (best, b) => (b.count > best.count ? b : best),
      stats.hourlyTraffic[0] ?? { hour: 0, count: 0 },
    )?.hour ?? -1;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarCard}>
        <div className={styles.sidebarTitle}>Today&apos;s Stats</div>
        <div className={styles.statStack}>
          <div className={styles.statRow}>
            <span className={styles.statLabel}>Total check-ins</span>
            <span className={`${styles.statValue} ${styles.num}`}>
              {stats.totalCheckIns}
            </span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statRow}>
            <span className={styles.statLabel}>Currently inside</span>
            <span
              className={`${styles.statValue} ${styles.statValueGreen} ${styles.num}`}
            >
              {stats.currentlyInside}
            </span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statRow}>
            <span className={styles.statLabel}>No-shows (booked)</span>
            <span
              className={`${styles.statValue} ${styles.statValueAmber} ${styles.num}`}
            >
              {stats.noShowsBooked}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.sidebarCard}>
        <div className={styles.sidebarTitleRow}>
          <span className={styles.staffDot} aria-hidden />
          Staff Attendance
        </div>
        <div className={styles.statStack}>
          <div className={styles.statRow}>
            <span className={styles.statLabel}>Clocked in</span>
            <span
              className={`${styles.statValue} ${styles.statValueGreen} ${styles.num}`}
            >
              {stats.staffClockedIn}
              <span
                style={{
                  fontSize: 14,
                  color: "#8a8a80",
                  fontWeight: 600,
                }}
              >
                {" "}
                / {stats.staffTotal}
              </span>
            </span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statRow}>
            <span className={styles.statLabel}>Late arrivals</span>
            <span
              className={`${styles.statValue} ${styles.statValueAmber} ${styles.num}`}
            >
              {stats.lateArrivals}
            </span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statRow}>
            <span className={styles.statLabel}>On leave today</span>
            <span
              className={`${styles.statValue} ${styles.statValueMuted} ${styles.num}`}
            >
              {stats.onLeaveToday}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.sidebarCard}>
        <div className={styles.sidebarTitle}>Hourly Traffic</div>
        <div className={styles.sidebarSub}>Check-ins by hour</div>
        <div className={styles.hourChart}>
          {stats.hourlyTraffic.map((bucket) => {
            let barClass = styles.hourBar;
            if (bucket.hour === peakHour && bucket.count > 0) {
              barClass = `${styles.hourBar} ${styles.hourBarPeak}`;
            } else if (bucket.count > 0 && bucket.hour >= 18) {
              barClass = `${styles.hourBar} ${styles.hourBarAmber}`;
            }
            return (
              <div
                key={bucket.hour}
                className={barClass}
                style={{ height: `${Math.max(bucket.heightPct, 8)}%` }}
                title={`${bucket.label}: ${bucket.count}`}
              />
            );
          })}
        </div>
        <div className={styles.hourLabels}>
          <span>6a</span>
          <span>9a</span>
          <span>12p</span>
          <span>3p</span>
          <span>6p</span>
          <span>9p</span>
        </div>
      </div>
    </aside>
  );
}
