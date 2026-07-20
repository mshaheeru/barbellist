import type { MemberProfile } from "@/lib/types";
import {
  formatCheckInMethod,
  formatShortDate,
  formatTime,
} from "@/lib/members/format";
import styles from "../member-profile.module.css";

type AttendanceTabProps = {
  member: MemberProfile;
};

function getMonthDays(year: number, month: number) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startPad = first.getDay();
  const days: (number | null)[] = [];

  for (let i = 0; i < startPad; i++) days.push(null);
  for (let d = 1; d <= last.getDate(); d++) days.push(d);

  return days;
}

export function AttendanceTab({ member }: AttendanceTabProps) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthLabel = new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
  }).format(now);

  const checkInDays = new Set(
    member.attendance_month.map((a) => new Date(a.check_in_at).getDate()),
  );

  const calendarDays = getMonthDays(year, month);
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const recent = member.attendance_month.slice(0, 20);

  return (
    <>
      <div className={styles.card}>
        <div className={styles.cardTitle}>
          {monthLabel} · {member.attendance_month.length} check-ins · Streak{" "}
          {member.check_in_streak} days
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 4,
            marginBottom: 8,
            fontSize: 11,
            color: "#8A8A80",
            fontWeight: 600,
          }}
        >
          {weekDays.map((d) => (
            <div key={d} style={{ textAlign: "center" }}>
              {d}
            </div>
          ))}
        </div>
        <div className={styles.calendarGrid}>
          {calendarDays.map((day, i) =>
            day === null ? (
              <div key={`pad-${i}`} />
            ) : (
              <div
                key={day}
                className={`${styles.calendarDay} ${
                  checkInDays.has(day) ? styles.calendarDayHasCheckin : ""
                }`}
              >
                {day}
              </div>
            ),
          )}
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>Recent Check-ins</div>
        {recent.length === 0 ? (
          <p style={{ color: "#8A8A80", fontSize: 14 }}>No check-ins this month.</p>
        ) : (
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Method</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((a) => (
                <tr key={a.id}>
                  <td>{formatShortDate(a.check_in_at)}</td>
                  <td className={styles.num}>{formatTime(a.check_in_at)}</td>
                  <td>
                    <span className={styles.methodBadge}>
                      {formatCheckInMethod(a.check_in_method)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
