"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bell, Receipt, Wallet } from "lucide-react";
import { Tooltip } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { prepareFeeReminderDeeplink } from "@/app/actions/whatsapp";
import { useGym } from "@/components/gym-provider";
import { ReceiptPreviewModal } from "@/components/receipts/receipt-preview-modal";
import { canRecordPayment, canSendReminder } from "@/lib/auth/permissions";
import {
  formatCurrency,
  formatPaymentMethod,
  formatShortDate,
} from "@/lib/members/format";
import { openWaMeUrl } from "@/lib/whatsapp/deeplink";
import type { MemberProfile, PaymentWithStaff } from "@/lib/types";
import { RecordPaymentModal } from "@/components/modals/record-payment-modal";
import styles from "../member-profile.module.css";

type PaymentsTabProps = {
  member: MemberProfile;
  currencySymbol: string;
};

export function PaymentsTab({ member, currencySymbol }: PaymentsTabProps) {
  const router = useRouter();
  const { role } = useGym();
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [receiptPayment, setReceiptPayment] = useState<PaymentWithStaff | null>(
    null,
  );
  const [pending, startTransition] = useTransition();
  const canPay = canRecordPayment(role);
  const canReceipt = canSendReminder(role);
  const showActions = member.recent_payments.length > 0;

  const handleSendReminder = (feeDueId: string) => {
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

  return (
    <>
      {member.outstanding_dues.length > 0 ? (
        <div className={styles.card}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 15,
            }}
          >
            <div className={styles.cardTitle}>Outstanding Dues</div>
            {canPay ? (
              <button
                type="button"
                className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
                style={{ padding: "10px 16px", fontSize: 13, width: "auto" }}
                onClick={() => setPaymentOpen(true)}
              >
                <Wallet size={16} strokeWidth={2} />
                Record Payment
              </button>
            ) : null}
          </div>
          <div className={styles.infoStack}>
            {member.outstanding_dues.map((due) => {
              const balance =
                Number(due.amount_due) - Number(due.amount_paid ?? 0);
              const showRemind =
                canReceipt &&
                (due.status === "overdue" ||
                  due.status === "pending" ||
                  due.status === "partial");
              return (
                <div key={due.id} className={styles.infoRow}>
                  <span className={styles.infoLabel}>
                    Due {formatShortDate(due.due_date)} ({due.status})
                  </span>
                  <span
                    className={`${styles.infoValue} ${styles.num}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    {formatCurrency(balance, currencySymbol)}
                    {showRemind ? (
                      <button
                        type="button"
                        className={styles.receiptBtn}
                        disabled={pending}
                        onClick={() => handleSendReminder(due.id)}
                        title="Send Reminder"
                      >
                        <Bell size={14} strokeWidth={2} />
                        Send Reminder
                      </button>
                    ) : null}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : canPay ? (
        <div className={styles.card} style={{ marginBottom: 18 }}>
          <div className={styles.cardTitle}>Outstanding Dues</div>
          <p style={{ color: "#8A8A80", fontSize: 14, marginBottom: 14 }}>
            No outstanding balance.
          </p>
          <button
            type="button"
            className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
            onClick={() => setPaymentOpen(true)}
          >
            <Wallet size={17} strokeWidth={2} />
            Record Payment
          </button>
        </div>
      ) : null}

      <div className={styles.card}>
        <div className={styles.cardTitle}>Payment History</div>
        {member.recent_payments.length === 0 ? (
          <p style={{ color: "#8A8A80", fontSize: 14 }}>
            No payments recorded yet.
          </p>
        ) : (
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Type</th>
                <th>Period</th>
                <th>Recorded By</th>
                {showActions ? <th>Actions</th> : null}
              </tr>
            </thead>
            <tbody>
              {member.recent_payments.map((p) => {
                const tip = p.receipt_generated
                  ? "Receipt downloaded"
                  : "View / download receipt";

                return (
                  <tr key={p.id}>
                    <td>{formatShortDate(p.paid_at)}</td>
                    <td className={styles.num}>
                      {formatCurrency(Number(p.amount), currencySymbol)}
                    </td>
                    <td>{formatPaymentMethod(p.payment_method)}</td>
                    <td style={{ textTransform: "capitalize" }}>
                      {p.payment_type.replace("_", " ")}
                    </td>
                    <td>
                      {p.covers_from && p.covers_to
                        ? `${formatShortDate(p.covers_from)} – ${formatShortDate(p.covers_to)}`
                        : "—"}
                    </td>
                    <td>{p.recorded_by_name ?? "—"}</td>
                    {showActions ? (
                      <td>
                        <Tooltip label={tip} withArrow>
                          <button
                            type="button"
                            className={styles.receiptBtn}
                            onClick={() => setReceiptPayment(p)}
                            aria-label={tip}
                          >
                            <Receipt size={14} strokeWidth={2} />
                            Receipt
                          </button>
                        </Tooltip>
                      </td>
                    ) : null}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {canPay ? (
        <RecordPaymentModal
          opened={paymentOpen}
          onClose={() => setPaymentOpen(false)}
          memberId={member.id}
        />
      ) : null}

      {receiptPayment ? (
        <ReceiptPreviewModal
          opened
          onClose={() => setReceiptPayment(null)}
          payment={{
            id: receiptPayment.id,
            amount: Number(receiptPayment.amount),
            payment_method: receiptPayment.payment_method,
            paid_at: receiptPayment.paid_at,
            covers_from: receiptPayment.covers_from,
            covers_to: receiptPayment.covers_to,
          }}
          memberName={member.name}
          memberCode={member.member_code}
          memberWhatsapp={member.whatsapp}
          memberPhone={member.phone}
          packageName={member.package?.name ?? null}
          currencySymbol={currencySymbol}
        />
      ) : null}
    </>
  );
}
