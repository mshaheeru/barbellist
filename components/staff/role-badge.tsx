import type { StaffRole, StaffStatus } from "@/lib/types";
import { formatStaffRole } from "@/lib/staff/format";
import styles from "./staff.module.css";

const ROLE_CLASS: Record<StaffRole, string> = {
  trainer: styles.roleTrainer,
  cleaner: styles.roleCleaner,
  manager: styles.roleManager,
  cashier: styles.roleCashier,
  owner: styles.roleOwner,
  other: styles.roleOther,
};

export function RoleBadge({ role }: { role: StaffRole }) {
  return (
    <span className={`${styles.roleBadge} ${ROLE_CLASS[role]}`}>
      {formatStaffRole(role)}
    </span>
  );
}

const STATUS_CLASS: Record<StaffStatus, string> = {
  active: styles.statusActive,
  inactive: styles.statusInactive,
  terminated: styles.statusTerminated,
};

export function StaffStatusBadge({ status }: { status: StaffStatus }) {
  const label =
    status === "active"
      ? "Active"
      : status === "inactive"
        ? "Inactive"
        : "Terminated";

  return (
    <span className={`${styles.statusBadge} ${STATUS_CLASS[status]}`}>
      {label}
    </span>
  );
}
