"use client";

import { useState } from "react";
import { Banknote } from "lucide-react";
import type { StaffProfile } from "@/lib/types";
import {
  formatCurrency,
  formatPaymentMethod,
  formatShortDate,
} from "@/lib/members/format";
import { formatStaffRole } from "@/lib/staff/format";
import { RecordSalaryModal } from "../modals/record-salary-modal";
import styles from "../staff-profile.module.css";

type StaffOverviewTabProps = {
  staff: StaffProfile;
  currencySymbol: string;
  canViewSalary: boolean;
};

function buildStreakDays(attendance: StaffProfile["attendance_30d"]) {
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

export function StaffOverviewTab({
  staff,
  currencySymbol,
  canViewSalary,
}: StaffOverviewTabProps) {
  const [salaryOpen, setSalaryOpen] = useState(false);
  const streakDays = buildStreakDays(staff.attendance_30d);
  const attendedCount = streakDays.filter((d) => d.attended).length;

  return (
    <>
      <div className={styles.twoCol}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Contact Information</div>
          <div className={styles.infoStack}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Phone</span>
              <span className={`${styles.infoValue} ${styles.num}`}>
                {staff.phone ?? "—"}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>WhatsApp</span>
              <span className={`${styles.infoValue} ${styles.num}`}>
                {staff.whatsapp ?? staff.phone ?? "—"}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Email</span>
              <span className={styles.infoValue}>{staff.email ?? "—"}</span>
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardTitle}>Role &amp; Details</div>
          <div className={styles.infoStack}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Role</span>
              <span className={styles.infoValue}>
                {formatStaffRole(staff.role)}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Commission</span>
              <span className={`${styles.infoValue} ${styles.num}`}>
                {canViewSalary && staff.commission_rate !== null
                  ? `${staff.commission_rate}%`
                  : "—"}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Joined</span>
              <span className={styles.infoValue}>
                {formatShortDate(staff.joining_date)}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>App access</span>
              <span className={styles.infoValue}>
                {staff.auth_user_id ? "Yes" : "No"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {canViewSalary ? (
        <div className={styles.salaryCard}>
          <div className={styles.salaryHeader}>
            <div>
              <div className={styles.cardTitle} style={{ marginBottom: 0 }}>
                Monthly Salary
              </div>
              <div className={styles.salaryAmount}>
                {staff.monthly_salary !== null
                  ? formatCurrency(staff.monthly_salary, currencySymbol)
                  : "—"}
                <span className={styles.salaryUnit}>/mo</span>
              </div>
            </div>
            <button
              type="button"
              className={styles.recordSalaryBtn}
              onClick={() => setSalaryOpen(true)}
            >
              <Banknote size={15} strokeWidth={2} />
              Record Salary
            </button>
          </div>
          <div className={styles.salaryPills}>
            <div className={styles.salaryPillGreen}>
              <div className={styles.salaryPillLabel}>Last paid</div>
              <div className={styles.salaryPillValue}>
                {staff.last_paid_at
                  ? `${formatShortDate(staff.last_paid_at)} · ${formatPaymentMethod(staff.last_paid_method)}`
                  : "Not paid yet"}
              </div>
            </div>
            <div className={styles.salaryPillAmber}>
              <div className={styles.salaryPillLabelAmber}>Next due</div>
              <div className={styles.salaryPillValueAmber}>
                {staff.next_due_at
                  ? formatShortDate(staff.next_due_at)
                  : "—"}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className={styles.card}>
        <div className={styles.streakHeader}>
          <div className={styles.cardTitle} style={{ marginBottom: 0 }}>
            Attendance · Last 30 Days
          </div>
          <div className={styles.streakLegend}>
            <span className={styles.legendItem}>
              <span className={`${styles.legendDot} ${styles.attended}`} />
              Present
            </span>
            <span className={styles.legendItem}>
              <span className={`${styles.legendDot} ${styles.missed}`} />
              Off
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
              title={d.date.toDateString()}
            />
          ))}
        </div>
        <div className={styles.streakSummary}>
          Present{" "}
          <span className={styles.streakHighlight}>
            {staff.attendance_days_month} of {staff.working_days}
          </span>{" "}
          working days this month · {attendedCount}/30 days present · Streak{" "}
          {staff.check_in_streak} days
        </div>
      </div>

      {staff.role === "trainer" ? (
        <div className={styles.card}>
          <div className={styles.cardTitle}>Performance Snapshot</div>
          <div className={styles.healthGrid}>
            <div>
              <div className={styles.healthLabel}>PT Sessions</div>
              <div className={styles.healthValue}>—</div>
              <div className={`${styles.healthSub} ${styles.healthSubMuted}`}>
                this month (coming soon)
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <RecordSalaryModal
        opened={salaryOpen}
        onClose={() => setSalaryOpen(false)}
        staff={staff}
        currencySymbol={currencySymbol}
      />
    </>
  );
}
