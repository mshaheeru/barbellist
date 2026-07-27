"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Bell, CreditCard, ShieldOff } from "lucide-react";
import { notifications } from "@mantine/notifications";
import {
  prepareBulkReminderDeeplinks,
  prepareFeeReminderDeeplink,
} from "@/app/actions/whatsapp";
import { waiveFeeDue } from "@/app/actions/fees";
import { useGym } from "@/components/gym-provider";
import {
  canRecordPayment,
  canSendReminder,
  canWaiveFee,
} from "@/lib/auth/permissions";
import { FeeDueStatusPill } from "@/lib/fees/fee-due-status-pill";
import {
  formatCurrency,
  formatShortDate,
} from "@/lib/members/format";
import { openWaMeUrl } from "@/lib/whatsapp/deeplink";
import type { FeeOverviewRow } from "@/lib/types";
import { MemberAvatar } from "@/components/members/member-avatar";
import { RecordPaymentModal } from "@/components/modals/record-payment-modal";
import styles from "./fees.module.css";

type FeesTableProps = {
  rows: FeeOverviewRow[];
  nextCursor: string | null;
  hasCursor: boolean;
  total: number;
  showing: number;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function FeesTable({
  rows,
  nextCursor,
  hasCursor,
  total,
  showing,
}: FeesTableProps) {
  const router = useRouter();
  const { role, currencySymbol } = useGym();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [paymentMemberId, setPaymentMemberId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [bulkProgress, setBulkProgress] = useState<string | null>(null);

  const canPay = canRecordPayment(role);
  const canRemind = canSendReminder(role);
  const canWaive = canWaiveFee(role);

  const toggleRow = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === rows.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(rows.map((r) => r.id)));
    }
  };

  const handleReminder = (feeDueId: string) => {
    startTransition(async () => {
      const { data, error } = await prepareFeeReminderDeeplink(feeDueId);
      if (error || !data) {
        notifications.show({
          color: "red",
          title: "Reminder failed",
          message: error ?? "Could not prepare reminder",
        });
        return;
      }
      openWaMeUrl(data.url);
      notifications.show({
        color: "green",
        message: `WhatsApp opened with reminder for ${data.memberName}`,
      });
      router.refresh();
    });
  };

  const handleWaive = (feeDueId: string) => {
    if (!confirm("Waive this fee due? This cannot be undone.")) return;
    startTransition(async () => {
      const { error } = await waiveFeeDue(feeDueId);
      if (error) {
        notifications.show({
          color: "red",
          title: "Waive failed",
          message: error,
        });
      } else {
        notifications.show({
          color: "green",
          title: "Fee waived",
          message: "The fee due has been waived.",
        });
        router.refresh();
      }
    });
  };

  const handleBulkReminders = () => {
    const ids = [...selected];
    startTransition(async () => {
      setBulkProgress("Preparing…");
      const result = await prepareBulkReminderDeeplinks({ ids });
      if (result.error) {
        setBulkProgress(null);
        notifications.show({
          color: "red",
          title: "Bulk send failed",
          message: result.error,
        });
        return;
      }

      const items = result.data;
      for (let i = 0; i < items.length; i++) {
        setBulkProgress(`Sending ${i + 1} of ${items.length}…`);
        openWaMeUrl(items[i]!.url);
        if (i < items.length - 1) await sleep(1000);
      }

      setBulkProgress(null);
      notifications.show({
        color: "green",
        title: "Reminders opened",
        message: `${items.length} WhatsApp chat(s) opened${
          result.skipped_no_whatsapp
            ? `, ${result.skipped_no_whatsapp} skipped (no contact)`
            : ""
        }.`,
      });
      setSelected(new Set());
      router.refresh();
    });
  };

  const remindButton = (
    disabled: boolean,
    onClick: () => void,
    label: ReactNode,
    className: string,
    title: string,
  ) => (
    <button
      type="button"
      className={className}
      disabled={disabled}
      onClick={onClick}
      title={title}
    >
      {label}
    </button>
  );

  return (
    <>
      {selected.size > 0 && canRemind ? (
        <div className={styles.bulkBar}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>
            {bulkProgress ?? `${selected.size} selected`}
          </span>
          {remindButton(
            pending,
            handleBulkReminders,
            <>
              <Bell size={16} strokeWidth={2} />
              Send Reminders to Selected
            </>,
            styles.bulkBtn,
            "Send Reminders to Selected",
          )}
        </div>
      ) : null}

      <div className={styles.tableWrap}>
        <div className={styles.tableHead}>
          {canRemind ? (
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={selected.size === rows.length && rows.length > 0}
              onChange={toggleAll}
              aria-label="Select all"
            />
          ) : (
            <span />
          )}
          <span>Member</span>
          <span>Amount Due</span>
          <span>Paid</span>
          <span>Balance</span>
          <span>Due Date</span>
          <span>Status</span>
          <span>Overdue</span>
          <span>Actions</span>
        </div>

        {rows.map((row) => (
          <div key={row.id} className={styles.tableRow}>
            {canRemind ? (
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={selected.has(row.id)}
                onChange={() => toggleRow(row.id)}
                aria-label={`Select ${row.member_name}`}
              />
            ) : (
              <span />
            )}
            <div className={styles.memberCell}>
              <MemberAvatar name={row.member_name} photoUrl={row.photo_url} />
              <div style={{ minWidth: 0 }}>
                <div className={styles.memberName}>{row.member_name}</div>
                <div className={styles.cellMuted}>
                  {row.member_code}
                  {row.package_name ? ` · ${row.package_name}` : ""}
                </div>
              </div>
            </div>
            <span className={`${styles.num} ${styles.cellMuted}`}>
              {formatCurrency(row.amount_due, currencySymbol)}
            </span>
            <span className={`${styles.num} ${styles.cellMuted}`}>
              {formatCurrency(row.amount_paid, currencySymbol)}
            </span>
            <span className={`${styles.num} ${styles.cellDue}`}>
              {formatCurrency(row.balance, currencySymbol)}
            </span>
            <span className={styles.cellMuted}>
              {formatShortDate(row.due_date)}
            </span>
            <span>
              <FeeDueStatusPill status={row.status} />
            </span>
            <span className={styles.cellMuted}>
              {row.days_overdue != null && row.days_overdue > 0
                ? `${row.days_overdue}d`
                : "—"}
            </span>
            <div className={styles.actionsCell}>
              {canPay && row.balance > 0 ? (
                <button
                  type="button"
                  className={styles.actionIconBtn}
                  title="Record Payment"
                  onClick={() => setPaymentMemberId(row.member_id)}
                >
                  <CreditCard size={15} strokeWidth={2} />
                </button>
              ) : null}
              {canRemind && row.status !== "paid" && row.status !== "waived"
                ? remindButton(
                    pending,
                    () => handleReminder(row.id),
                    <Bell size={15} strokeWidth={2} />,
                    styles.actionIconBtn,
                    "Send Reminder",
                  )
                : null}
              {canWaive &&
              row.status !== "paid" &&
              row.status !== "waived" ? (
                <button
                  type="button"
                  className={`${styles.actionIconBtn} ${styles.actionIconBtnDanger}`}
                  title="Waive"
                  disabled={pending}
                  onClick={() => handleWaive(row.id)}
                >
                  <ShieldOff size={15} strokeWidth={2} />
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.pagination}>
        <span>
          Showing {showing} of {total}
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          {hasCursor ? (
            <button
              type="button"
              className={styles.pageBtn}
              onClick={() => router.back()}
            >
              Previous
            </button>
          ) : null}
          {nextCursor ? (
            <button
              type="button"
              className={styles.pageBtn}
              onClick={() => {
                const params = new URLSearchParams(window.location.search);
                params.set("cursor", nextCursor);
                router.push(`/dashboard/fees?${params.toString()}`);
              }}
            >
              Next
            </button>
          ) : null}
        </div>
      </div>

      {paymentMemberId ? (
        <RecordPaymentModal
          opened={Boolean(paymentMemberId)}
          onClose={() => setPaymentMemberId(null)}
          memberId={paymentMemberId}
        />
      ) : null}
    </>
  );
}
