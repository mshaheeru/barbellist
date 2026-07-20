"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { PageHeaderStart } from "@/components/dashboard/page-header-start";
import { formatCurrency } from "@/lib/members/format";
import { AddStaffModal } from "./add-staff-modal";
import styles from "./staff.module.css";

type StaffPageHeaderClientProps = {
  canManage: boolean;
  total: number;
  clockedIn: number;
  monthlyPayroll: number | null;
  currencySymbol: string;
};

export function StaffPageHeaderClient({
  canManage,
  total,
  clockedIn,
  monthlyPayroll,
  currencySymbol,
}: StaffPageHeaderClientProps) {
  const [opened, setOpened] = useState(false);

  const payrollPart =
    monthlyPayroll !== null
      ? ` · ${formatCurrency(monthlyPayroll, currencySymbol)} monthly payroll`
      : "";

  return (
    <>
      <div className={styles.pageHeader}>
        <PageHeaderStart
          title="Staff"
          titleClassName={styles.pageTitle}
          subtitleClassName={styles.pageSubtitle}
          subtitle={`${total} team member${total === 1 ? "" : "s"} · ${clockedIn} clocked in today${payrollPart}`}
        />
        {canManage ? (
          <button
            type="button"
            className={styles.addBtn}
            onClick={() => setOpened(true)}
          >
            <Plus size={17} strokeWidth={2.2} />
            Add Staff Member
          </button>
        ) : null}
      </div>
      <AddStaffModal opened={opened} onClose={() => setOpened(false)} />
    </>
  );
}
