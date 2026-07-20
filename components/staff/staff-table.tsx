"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { StaffListItem } from "@/lib/types";
import {
  formatCurrency,
  formatLastCheckIn,
} from "@/lib/members/format";
import { formatStaffRoleSubtitle } from "@/lib/staff/format";
import { MemberAvatar } from "@/components/members/member-avatar";
import { RoleBadge, StaffStatusBadge } from "./role-badge";
import styles from "./staff.module.css";

type StaffTableProps = {
  staff: StaffListItem[];
  currencySymbol: string;
  canViewSalary: boolean;
  monthLabel: string;
};

export function StaffTable({
  staff,
  currencySymbol,
  canViewSalary,
  monthLabel,
}: StaffTableProps) {
  const router = useRouter();

  return (
    <div className={styles.tableWrap}>
      <div className={styles.tableHead}>
        <span>Staff Member</span>
        <span>Role</span>
        <span>Monthly Salary</span>
        <span>Attendance · {monthLabel}</span>
        <span>Last Check-in</span>
        <span>Status</span>
        <span />
      </div>
      {staff.map((row) => {
        const pct =
          row.working_days > 0
            ? Math.min(100, Math.round((row.attendance_days / row.working_days) * 100))
            : 0;

        return (
          <Link
            key={row.id}
            href={`/dashboard/staff/${row.id}`}
            className={styles.tableRow}
          >
            <div className={styles.staffCell}>
              <MemberAvatar name={row.name} photoUrl={row.photo_url} />
              <div>
                <div className={styles.staffName}>{row.name}</div>
                <div className={styles.staffSubtitle}>
                  {formatStaffRoleSubtitle(row.role)}
                </div>
              </div>
            </div>
            <span>
              <RoleBadge role={row.role} />
            </span>
            <span
              className={`${styles.num} ${
                row.monthly_salary === null
                  ? styles.cellMutedSalary
                  : styles.cellStrong
              }`}
            >
              {canViewSalary
                ? row.monthly_salary === null
                  ? "Rs. 0 · —"
                  : formatCurrency(row.monthly_salary, currencySymbol)
                : "—"}
            </span>
            <div className={styles.attendanceCell}>
              {row.role === "owner" ? (
                <span className={styles.cellMuted}>Not tracked</span>
              ) : (
                <>
                  <div className={`${styles.num} ${styles.cellStrong}`}>
                    {row.attendance_days}/{row.working_days} days
                  </div>
                  <div className={styles.progressTrack}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </>
              )}
            </div>
            <span className={styles.cellMuted}>
              {formatLastCheckIn(row.last_check_in)}
            </span>
            <span>
              <StaffStatusBadge status={row.status} />
            </span>
            <button
              type="button"
              className={styles.actionsBtn}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                router.push(`/dashboard/staff/${row.id}`);
              }}
              aria-label="View staff"
            >
              ⋯
            </button>
          </Link>
        );
      })}
    </div>
  );
}
