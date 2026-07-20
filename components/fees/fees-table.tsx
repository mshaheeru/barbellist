"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Bell, CreditCard, ShieldOff } from "lucide-react";
import { Tooltip } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  sendBulkReminders,
  sendFeeReminder,
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
import type { FeeOverviewRow } from "@/lib/types";
import { MemberAvatar } from "@/components/members/member-avatar";
import { RecordPaymentModal } from "@/components/modals/record-payment-modal";
import styles from "./fees.module.css";

const WA_DISABLED_TIP =
  "WhatsApp is not configured. Add WHATSAPP_API_TOKEN and WHATSAPP_PHONE_NUMBER_ID to enable reminders.";

type FeesTableProps = {
  rows: FeeOverviewRow[];
  nextCursor: string | null;
  hasCursor: boolean;
  total: number;
  showing: number;
  whatsappConfigured: boolean;
};

export function FeesTable({
  rows,
  nextCursor,
  hasCursor,
  total,
  showing,
  whatsappConfigured,
}: FeesTableProps) {
  const router = useRouter();
  const { role, currencySymbol } = useGym();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [paymentMemberId, setPaymentMemberId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const canPay = canRecordPayment(role);
  const canRemind = canSendReminder(role);
  const canWaive = canWaiveFee(role);
  const remindDisabled = pending || !whatsappConfigured;

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
    if (!whatsappConfigured) return;
    startTransition(async () => {
      const { error } = await sendFeeReminder(feeDueId);
      if (error) {
        notifications.show({ color: "red", title: "Reminder failed", message: error });
      } else {
        notifications.show({
          color: "green",
          title: "Reminder sent",
          message: "WhatsApp fee reminder was sent successfully.",
        });
        router.refresh();
      }
    });
  };

  const handleWaive = (feeDueId: string) => {
    if (!confirm("Waive this fee due? This cannot be undone.")) return;
    startTransition(async () => {
      const { error } = await waiveFeeDue(feeDueId);
      if (error) {
        notifications.show({ color: "red", title: "Waive failed", message: error });
      } else {
        notifications.show({ color: "green", title: "Fee waived", message: "The fee due has been waived." });
        router.refresh();
      }
    });
  };

  const handleBulkReminders = () => {
    if (!whatsappConfigured) return;
    const ids = [...selected];
    startTransition(async () => {
      const result = await sendBulkReminders({ ids });
      if (result.error) {
        notifications.show({ color: "red", title: "Bulk send failed", message: result.error });
        return;
      }
      notifications.show({
        color: "green",
        title: "Reminders sent",
        message: `${result.sent} sent, ${result.failed} failed, ${result.skipped_no_whatsapp} skipped (no contact).`,
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
  ) => {
    const btn = (
      <button
        type="button"
        className={className}
        disabled={disabled}
        onClick={onClick}
        title={whatsappConfigured ? title : undefined}
      >
        {label}
      </button>
    );

    if (!whatsappConfigured) {
      return (
        <Tooltip label={WA_DISABLED_TIP} withArrow multiline maw={280}>
          <span style={{ display: "inline-flex" }}>{btn}</span>
        </Tooltip>
      );
    }
    return btn;
  };

  return (
    <>
      {selected.size > 0 && canRemind ? (
        <div className={styles.bulkBar}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>
            {selected.size} selected
          </span>
          {remindButton(
            remindDisabled,
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
                    remindDisabled,
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
