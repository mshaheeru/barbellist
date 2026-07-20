"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Wallet } from "lucide-react";
import { Tooltip } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { sendPaymentReceipt } from "@/app/actions/whatsapp";
import { useGym } from "@/components/gym-provider";
import { canRecordPayment, canSendReminder } from "@/lib/auth/permissions";
import {
  formatCurrency,
  formatPaymentMethod,
  formatShortDate,
} from "@/lib/members/format";
import type { MemberProfile } from "@/lib/types";
import { RecordPaymentModal } from "@/components/modals/record-payment-modal";
import styles from "../member-profile.module.css";

const WA_DISABLED_TIP =
  "WhatsApp is not configured. Add WHATSAPP_API_TOKEN and WHATSAPP_PHONE_NUMBER_ID to enable receipts.";

type PaymentsTabProps = {
  member: MemberProfile;
  currencySymbol: string;
  whatsappConfigured: boolean;
};

export function PaymentsTab({
  member,
  currencySymbol,
  whatsappConfigured,
}: PaymentsTabProps) {
  const router = useRouter();
  const { role } = useGym();
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const canPay = canRecordPayment(role);
  const canReceipt = canSendReminder(role);

  const handleSendReceipt = (paymentId: string) => {
    if (!whatsappConfigured) return;
    startTransition(async () => {
      const { error } = await sendPaymentReceipt(paymentId);
      if (error) {
        notifications.show({
          color: "red",
          title: "Receipt failed",
          message: error,
        });
      } else {
        notifications.show({
          color: "green",
          title: "Receipt sent",
          message: "WhatsApp payment receipt was sent successfully.",
        });
        router.refresh();
      }
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
              return (
                <div key={due.id} className={styles.infoRow}>
                  <span className={styles.infoLabel}>
                    Due {formatShortDate(due.due_date)} ({due.status})
                  </span>
                  <span className={`${styles.infoValue} ${styles.num}`}>
                    {formatCurrency(balance, currencySymbol)}
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
          <p style={{ color: "#8A8A80", fontSize: 14 }}>No payments recorded yet.</p>
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
                {canReceipt ? <th>Actions</th> : null}
              </tr>
            </thead>
            <tbody>
              {member.recent_payments.map((p) => {
                const alreadySent = p.receipt_sent;
                const disabled =
                  pending || !whatsappConfigured || alreadySent;
                let tip = "Send Receipt";
                if (!whatsappConfigured) tip = WA_DISABLED_TIP;
                else if (alreadySent) tip = "Receipt already sent";

                const btn = (
                  <button
                    type="button"
                    className={styles.receiptBtn}
                    disabled={disabled}
                    onClick={() => handleSendReceipt(p.id)}
                  >
                    <MessageCircle size={14} strokeWidth={2} />
                    {alreadySent ? "Sent" : "Send Receipt"}
                  </button>
                );

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
                    {canReceipt ? (
                      <td>
                        {!whatsappConfigured || alreadySent ? (
                          <Tooltip
                            label={tip}
                            withArrow
                            multiline
                            maw={280}
                          >
                            <span style={{ display: "inline-flex" }}>
                              {btn}
                            </span>
                          </Tooltip>
                        ) : (
                          btn
                        )}
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
    </>
  );
}
