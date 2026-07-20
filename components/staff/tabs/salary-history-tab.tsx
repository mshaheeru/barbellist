"use client";

import { useState } from "react";
import { Banknote } from "lucide-react";
import type { StaffProfile } from "@/lib/types";
import {
  formatCurrency,
  formatMonthYear,
  formatPaymentMethod,
  formatShortDate,
} from "@/lib/members/format";
import { RecordSalaryModal } from "../modals/record-salary-modal";
import styles from "../staff-profile.module.css";

type SalaryHistoryTabProps = {
  staff: StaffProfile;
  currencySymbol: string;
};

export function SalaryHistoryTab({
  staff,
  currencySymbol,
}: SalaryHistoryTabProps) {
  const [opened, setOpened] = useState(false);
  const rows = staff.salary_history;

  return (
    <>
      <div className={styles.card}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 15,
          }}
        >
          <div className={styles.cardTitle} style={{ marginBottom: 0 }}>
            Salary History
          </div>
          <button
            type="button"
            className={styles.recordSalaryBtn}
            onClick={() => setOpened(true)}
          >
            <Banknote size={15} strokeWidth={2} />
            Record Salary Payment
          </button>
        </div>

        {rows.length === 0 ? (
          <p style={{ color: "#8A8A80", fontSize: 14 }}>
            No salary payments recorded yet.
          </p>
        ) : (
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Month</th>
                <th>Amount</th>
                <th>Payment Method</th>
                <th>Paid On</th>
                <th>Recorded By</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{formatMonthYear(row.salary_month ?? row.expense_date)}</td>
                  <td className={styles.num}>
                    {formatCurrency(Number(row.amount), currencySymbol)}
                  </td>
                  <td>{formatPaymentMethod(row.payment_method)}</td>
                  <td>{formatShortDate(row.expense_date)}</td>
                  <td>{row.recorded_by_name ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <RecordSalaryModal
        opened={opened}
        onClose={() => setOpened(false)}
        staff={staff}
        currencySymbol={currencySymbol}
      />
    </>
  );
}
