import { Clock } from "lucide-react";
import type { MemberProfile } from "@/lib/types";
import {
  bmiCategory,
  daysUntil,
  formatCurrency,
  formatFitnessGoal,
  formatShortDate,
} from "@/lib/members/format";
import styles from "../member-profile.module.css";

type OverviewTabProps = {
  member: MemberProfile;
  currencySymbol: string;
};

function buildStreakDays(attendance: MemberProfile["attendance_30d"]) {
  const attendedDates = new Set(
    attendance.map((a) => new Date(a.check_in_at).toDateString()),
  );
  const days: { date: Date; attended: boolean; isToday: boolean }[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push({
      date: d,
      attended: attendedDates.has(d.toDateString()),
      isToday: i === 0,
    });
  }

  return days;
}

export function OverviewTab({ member, currencySymbol }: OverviewTabProps) {
  const streakDays = buildStreakDays(member.attendance_30d);
  const attendedCount = streakDays.filter((d) => d.attended).length;
  const bmi = bmiCategory(member.bmi);
  const daysToExpiry = daysUntil(member.membership_end);

  return (
    <>
      <div className={styles.twoCol}>
        <div className={styles.card}>
        <div className={styles.cardTitle}>Contact Information</div>
        <div className={styles.infoStack}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Phone</span>
            <span className={`${styles.infoValue} ${styles.num}`}>
              {member.phone ?? "—"}
            </span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>WhatsApp</span>
            <span className={`${styles.infoValue} ${styles.num}`}>
              {member.whatsapp ?? member.phone ?? "—"}
            </span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Email</span>
            <span className={styles.infoValue}>{member.email ?? "—"}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Address</span>
            <span className={styles.infoValue}>{member.address ?? "—"}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Emergency</span>
            <span className={`${styles.infoValue} ${styles.num}`}>
              {member.emergency_contact_phone ?? "—"}
              {member.emergency_contact_name
                ? ` (${member.emergency_contact_name})`
                : ""}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>Current Package</div>
        {member.package ? (
          <>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
              <span className={styles.packageName}>{member.package.name}</span>
              <span className={`${styles.packagePrice} ${styles.num}`}>
                {formatCurrency(member.package.price, currencySymbol)}/mo
              </span>
            </div>
            <div className={styles.packageMeta}>
              Started {formatShortDate(member.membership_start)} · Monthly billing
              {daysToExpiry !== null && daysToExpiry >= 0
                ? ` · Expires in ${daysToExpiry} days`
                : ""}
            </div>
          </>
        ) : (
          <p className={styles.packageMeta}>No package assigned</p>
        )}
        {member.fee_status.kind === "overdue" ? (
          <div className={styles.overdueAlert}>
            <Clock size={18} color="#C0392B" strokeWidth={2} />
            Payment overdue by {member.fee_status.days} days
          </div>
        ) : null}
      </div>
      </div>

      <div className={styles.card}>
        <div className={styles.streakHeader}>
          <div className={styles.cardTitle} style={{ marginBottom: 0 }}>
            Attendance · Last 30 Days
          </div>
          <div className={styles.streakLegend}>
            <span className={styles.legendItem}>
              <span className={`${styles.legendDot} ${styles.attended}`} />
              Attended
            </span>
            <span className={styles.legendItem}>
              <span className={`${styles.legendDot} ${styles.missed}`} />
              Missed
            </span>
          </div>
        </div>
        <div className={styles.streakGrid}>
          {streakDays.map((d) => (
            <div
              key={d.date.toISOString()}
              className={`${styles.streakCell} ${
                d.attended
                  ? d.isToday
                    ? styles.streakCellToday
                    : styles.streakCellAttended
                  : styles.streakCellMissed
              }`}
              title={d.date.toLocaleDateString()}
            />
          ))}
        </div>
        <div className={styles.streakSummary}>
          Current streak{" "}
          <span className={styles.streakHighlight}>
            {member.check_in_streak} days
          </span>
          {" · "}
          {attendedCount} of 30 days attended
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>Health Snapshot</div>
        <div className={styles.healthGrid}>
          <div>
            <div className={styles.healthLabel}>BMI</div>
            <div className={styles.healthValue}>
              {member.bmi?.toFixed(1) ?? "—"}
            </div>
            <div
              className={`${styles.healthSub} ${
                bmi.tone === "success"
                  ? styles.healthSubSuccess
                  : styles.healthSubWarning
              }`}
            >
              {bmi.label}
            </div>
          </div>
          <div>
            <div className={styles.healthLabel}>Weight</div>
            <div className={styles.healthValue}>
              {member.weight_kg ? `${member.weight_kg} kg` : "—"}
            </div>
          </div>
          <div>
            <div className={styles.healthLabel}>Height</div>
            <div className={styles.healthValue}>
              {member.height_cm ? `${member.height_cm} cm` : "—"}
            </div>
            <div className={`${styles.healthSub} ${styles.healthSubMuted}`}>
              {member.membership_start
                ? `Recorded ${formatShortDate(member.membership_start)}`
                : ""}
            </div>
          </div>
          <div>
            <div className={styles.healthLabel}>Goal</div>
            <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.3, marginTop: 3 }}>
              {(member.fitness_goals ?? []).length > 0
                ? member.fitness_goals!.map(formatFitnessGoal).join(", ")
                : "—"}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
