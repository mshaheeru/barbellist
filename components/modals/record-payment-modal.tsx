"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Checkbox, NumberInput, Textarea } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Check, CreditCard, Landmark, Smartphone, X } from "lucide-react";
import {
  getMemberForPayment,
  recordPayment,
} from "@/app/actions/fees";
import { useGym } from "@/components/gym-provider";
import { feeDueMonthLabel } from "@/lib/fees/fee-due-status-pill";
import {
  formatCurrency,
} from "@/lib/members/format";
import type { MemberPaymentContext, PaymentMethod } from "@/lib/types";
import { MemberAvatar } from "@/components/members/member-avatar";
import styles from "./record-payment-modal.module.css";

type OnboardingPaymentMethod = Extract<
  PaymentMethod,
  "cash" | "easypaisa" | "jazzcash" | "bank_transfer"
>;

const METHODS: {
  value: OnboardingPaymentMethod;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "cash",
    label: "Cash",
    icon: <CreditCard size={18} strokeWidth={2} />,
  },
  {
    value: "easypaisa",
    label: "EasyPaisa",
    icon: (
      <span
        style={{
          width: 22,
          height: 22,
          borderRadius: 6,
          background: "#2E9E4B",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Smartphone size={13} color="#fff" strokeWidth={2.4} />
      </span>
    ),
  },
  {
    value: "jazzcash",
    label: "JazzCash",
    icon: (
      <span
        style={{
          width: 22,
          height: 22,
          borderRadius: 6,
          background: "#C0392B",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Smartphone size={13} color="#fff" strokeWidth={2.4} />
      </span>
    ),
  },
  {
    value: "bank_transfer",
    label: "Bank Transfer",
    icon: <Landmark size={18} strokeWidth={2} />,
  },
];

type RecordPaymentModalProps = {
  opened: boolean;
  onClose: () => void;
  memberId: string;
};

export function RecordPaymentModal({
  opened,
  onClose,
  memberId,
}: RecordPaymentModalProps) {
  const router = useRouter();
  const { currencySymbol } = useGym();
  const [member, setMember] = useState<MemberPaymentContext | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] =
    useState<OnboardingPaymentMethod>("cash");
  const [amount, setAmount] = useState(0);
  const [isPartial, setIsPartial] = useState(false);
  const [notes, setNotes] = useState("");
  const [sendReceipt, setSendReceipt] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!opened || !memberId) return;

    setLoading(true);
    setLoadError(null);
    void getMemberForPayment(memberId).then(({ data, error }) => {
      setLoading(false);
      if (error || !data) {
        setLoadError(error ?? "Failed to load member");
        setMember(null);
        return;
      }
      setMember(data);
      setAmount(data.total_balance);
      setIsPartial(false);
      setSendReceipt(Boolean(data.whatsapp || data.phone));
      setNotes("");
      setSubmitError(null);
    });
  }, [opened, memberId]);

  useEffect(() => {
    if (!opened) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [opened, onClose]);

  if (!opened) return null;

  const totalBalance = member?.total_balance ?? 0;
  const whatsappContact = member?.whatsapp || member?.phone;

  const handleSubmit = () => {
    if (!member) return;
    setSubmitError(null);

    startTransition(async () => {
      const { error } = await recordPayment({
        member_id: member.id,
        payment_method: paymentMethod,
        amount,
        is_partial: isPartial,
        notes: notes || null,
        send_whatsapp_receipt: sendReceipt,
      });

      if (error) {
        setSubmitError(error);
        return;
      }

      notifications.show({
        color: "green",
        title: "Payment recorded",
        message: `${formatCurrency(amount, currencySymbol)} received from ${member.name}.`,
      });
      onClose();
      router.refresh();
    });
  };

  return (
    <div className={styles.overlay} role="presentation" onClick={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="record-payment-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h2 id="record-payment-title" className={styles.modalTitle}>
            Record Payment
          </h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <div className={styles.modalBody}>
          {loading ? (
            <div className={styles.loading}>Loading member…</div>
          ) : loadError ? (
            <p className={styles.errorText}>{loadError}</p>
          ) : member ? (
            <>
              <div className={styles.memberCard}>
                <MemberAvatar
                  name={member.name}
                  photoUrl={member.photo_url}
                />
                <div className={styles.memberInfo}>
                  <div className={styles.memberName}>{member.name}</div>
                  <div className={styles.memberSub}>
                    {member.package?.name ?? "No package"} ·{" "}
                    {member.member_code}
                  </div>
                </div>
                {member.fee_status.kind === "overdue" ? (
                  <span className={styles.overdueBadge}>
                    Overdue {member.fee_status.days}d
                  </span>
                ) : null}
              </div>

              <div className={styles.breakdown}>
                {member.outstanding_dues.map((due) => {
                  const balance =
                    Number(due.amount_due) - Number(due.amount_paid ?? 0);
                  return (
                    <div key={due.id} className={styles.breakdownRow}>
                      <span className={styles.breakdownLabel}>
                        {feeDueMonthLabel(
                          due.generated_for_month,
                          due.due_date,
                        )}
                        {balance < Number(due.amount_due) ? " (partial)" : ""}
                      </span>
                      <span className={`${styles.breakdownValue} ${styles.num}`}>
                        {formatCurrency(balance, currencySymbol)}
                      </span>
                    </div>
                  );
                })}
                <div className={styles.divider} />
                <div className={styles.totalRow}>
                  <span className={styles.totalLabel}>Total due</span>
                  <span className={`${styles.totalValue} ${styles.num}`}>
                    {formatCurrency(totalBalance, currencySymbol)}
                  </span>
                </div>
              </div>

              <div className={styles.sectionLabel}>Payment Method</div>
              <div className={styles.paymentMethodGrid}>
                {METHODS.map((m) => {
                  const selected = paymentMethod === m.value;
                  return (
                    <button
                      key={m.value}
                      type="button"
                      className={`${styles.paymentPill} ${selected ? styles.paymentPillSelected : ""}`}
                      onClick={() => setPaymentMethod(m.value)}
                    >
                      {m.icon}
                      {m.label}
                      {selected ? (
                        <Check
                          size={15}
                          strokeWidth={3}
                          color="#1B5E3C"
                          style={{ marginLeft: "auto" }}
                        />
                      ) : null}
                    </button>
                  );
                })}
              </div>

              <div className={styles.amountRow}>
                <div className={styles.amountField}>
                  <NumberInput
                    label="Amount"
                    min={1}
                    decimalScale={2}
                    value={amount}
                    onChange={(val) =>
                      setAmount(typeof val === "number" ? val : 0)
                    }
                    disabled={!isPartial}
                    prefix={currencySymbol}
                  />
                </div>
                <div className={styles.toggleWrap}>
                  <button
                    type="button"
                    className={`${styles.toggleBtn} ${!isPartial ? styles.toggleBtnActive : ""}`}
                    onClick={() => {
                      setIsPartial(false);
                      setAmount(totalBalance);
                    }}
                  >
                    Full
                  </button>
                  <button
                    type="button"
                    className={`${styles.toggleBtn} ${isPartial ? styles.toggleBtnActive : ""}`}
                    onClick={() => setIsPartial(true)}
                  >
                    Partial
                  </button>
                </div>
              </div>

              <Textarea
                placeholder="Add a note (optional)…"
                value={notes}
                onChange={(e) => setNotes(e.currentTarget.value)}
                minRows={2}
                mb="md"
              />

              {whatsappContact ? (
                <label className={styles.checkboxRow}>
                  <Checkbox
                    checked={sendReceipt}
                    onChange={(e) => setSendReceipt(e.currentTarget.checked)}
                    color="green"
                  />
                  <span>
                    Send WhatsApp receipt to{" "}
                    <strong>{whatsappContact}</strong>
                  </span>
                </label>
              ) : null}

              {submitError ? (
                <p className={styles.errorText}>{submitError}</p>
              ) : null}

              <button
                type="button"
                className={styles.submitBtn}
                disabled={pending || totalBalance <= 0 || amount <= 0}
                onClick={handleSubmit}
              >
                <Check size={18} strokeWidth={2.2} />
                Record Payment · {formatCurrency(amount, currencySymbol)}
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
