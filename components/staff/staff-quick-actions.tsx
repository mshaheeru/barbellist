"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";
import { Banknote, CircleX, Pencil, Power } from "lucide-react";
import { deactivateStaff } from "@/app/actions/staff";
import type { StaffProfile } from "@/lib/types";
import { RecordSalaryModal } from "./modals/record-salary-modal";
import { EditStaffModal } from "./modals/edit-staff-modal";
import styles from "./staff-profile.module.css";

type StaffQuickActionsProps = {
  staff: StaffProfile;
  currencySymbol: string;
  canManage: boolean;
  canRecordSalary: boolean;
};

export function StaffQuickActions({
  staff,
  currencySymbol,
  canManage,
  canRecordSalary,
}: StaffQuickActionsProps) {
  const router = useRouter();
  const [salaryOpen, setSalaryOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleMarkAbsent = () => {
    notifications.show({
      color: "blue",
      title: "Absence tracking",
      message:
        "Days without a check-in already show as Off on the attendance streak. No separate absence record is needed.",
    });
  };

  const handleDeactivate = () => {
    if (!confirm(`Deactivate ${staff.name}? They will no longer appear as active staff.`)) {
      return;
    }
    startTransition(async () => {
      const { error } = await deactivateStaff(staff.id);
      if (error) {
        notifications.show({ color: "red", message: error });
        return;
      }
      notifications.show({ color: "green", message: "Staff deactivated." });
      router.refresh();
    });
  };

  return (
    <>
      <div className={`${styles.card} ${styles.quickActions}`}>
        <div className={styles.cardTitle}>Quick Actions</div>
        {canRecordSalary ? (
          <button
            type="button"
            className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
            onClick={() => setSalaryOpen(true)}
          >
            <Banknote size={17} strokeWidth={2} />
            Record Salary Payment
          </button>
        ) : null}
        {canManage ? (
          <>
            <button
              type="button"
              className={styles.actionBtn}
              onClick={handleMarkAbsent}
            >
              <CircleX size={17} strokeWidth={2} />
              Mark Absent Today
            </button>
            <button
              type="button"
              className={styles.actionBtn}
              onClick={() => setEditOpen(true)}
            >
              <Pencil size={17} strokeWidth={2} />
              Edit Details
            </button>
            {staff.status === "active" ? (
              <button
                type="button"
                className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                onClick={handleDeactivate}
                disabled={pending}
              >
                <Power size={17} strokeWidth={2} />
                Deactivate
              </button>
            ) : null}
          </>
        ) : null}
      </div>

      {canRecordSalary ? (
        <RecordSalaryModal
          opened={salaryOpen}
          onClose={() => setSalaryOpen(false)}
          staff={staff}
          currencySymbol={currencySymbol}
        />
      ) : null}
      {canManage ? (
        <EditStaffModal
          opened={editOpen}
          onClose={() => setEditOpen(false)}
          staff={staff}
        />
      ) : null}
    </>
  );
}
