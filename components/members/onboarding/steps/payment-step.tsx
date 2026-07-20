"use client";

import { Checkbox, NumberInput, Textarea } from "@mantine/core";
import { useMemo } from "react";
import { useGym } from "@/components/gym-provider";
import { formatCurrency } from "@/lib/members/format";
import type { Package } from "@/lib/types";
import { PaymentMethodPills } from "../payment-method-pills";
import styles from "../onboarding.module.css";
import type { OnboardingState } from "../onboarding-wizard";

type PaymentStepProps = {
  state: OnboardingState;
  packages: Package[];
  errors: Record<string, string>;
  onChange: (patch: Partial<OnboardingState>) => void;
};

function durationText(days: number): string {
  if (days === 30) return "Monthly";
  if (days === 90) return "Quarterly";
  if (days === 365) return "Yearly";
  return `${days} days`;
}

export function PaymentStep({
  state,
  packages,
  errors,
  onChange,
}: PaymentStepProps) {
  const { currencySymbol } = useGym();

  const selectedPackage = useMemo(
    () => packages.find((p) => p.id === state.package_id) ?? null,
    [packages, state.package_id],
  );

  const packagePrice = selectedPackage ? Number(selectedPackage.price) : 0;
  const whatsappContact = state.whatsapp || state.phone;

  return (
    <div className={styles.paymentLayout}>
      <div style={{ marginBottom: 22 }}>
        <h2 className={styles.sectionTitle}>Payment</h2>
        <p className={styles.sectionSubtitle}>
          Collect the initial membership payment to complete registration.
        </p>
      </div>

      {selectedPackage ? (
        <div className={styles.summaryPaymentCard}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
            {state.name}
          </div>
          <div style={{ fontSize: 13, color: "#6b6b62", marginBottom: 8 }}>
            {selectedPackage.name} · {durationText(selectedPackage.duration_days)}
          </div>
          <div
            className={styles.num}
            style={{ fontWeight: 700, fontSize: 19, color: "#1B5E3C" }}
          >
            {formatCurrency(packagePrice, currencySymbol)}
          </div>
        </div>
      ) : null}

      <div style={{ fontSize: 13, fontWeight: 600, color: "#4A4A42", marginBottom: 10 }}>
        Payment Method
      </div>
      <PaymentMethodPills
        value={state.payment_method}
        onChange={(method) => onChange({ payment_method: method })}
      />
      {errors.payment_method ? (
        <p className={styles.errorText}>{errors.payment_method}</p>
      ) : null}

      <div className={styles.amountRow}>
        <div className={styles.amountField}>
          <NumberInput
            label="Amount"
            min={1}
            decimalScale={2}
            value={state.amount}
            onChange={(val) =>
              onChange({ amount: typeof val === "number" ? val : 0 })
            }
            disabled={!state.is_partial}
            error={errors.amount}
            prefix={currencySymbol}
          />
        </div>
        <div className={styles.toggleWrap}>
          <button
            type="button"
            className={`${styles.toggleBtn} ${!state.is_partial ? styles.toggleBtnActive : ""}`}
            onClick={() => {
              onChange({
                is_partial: false,
                amount: packagePrice,
              });
            }}
          >
            Full Amount
          </button>
          <button
            type="button"
            className={`${styles.toggleBtn} ${state.is_partial ? styles.toggleBtnActive : ""}`}
            onClick={() => onChange({ is_partial: true })}
          >
            Partial
          </button>
        </div>
      </div>

      <Textarea
        label="Notes (optional)"
        placeholder="Add a note…"
        value={state.notes ?? ""}
        onChange={(e) => onChange({ notes: e.currentTarget.value })}
        minRows={2}
        mb="md"
      />

      {whatsappContact ? (
        <label className={styles.checkboxRow}>
          <Checkbox
            checked={state.send_whatsapp_receipt}
            onChange={(e) =>
              onChange({ send_whatsapp_receipt: e.currentTarget.checked })
            }
            color="green"
          />
          <span>
            Send WhatsApp receipt to{" "}
            <strong>{whatsappContact}</strong>
          </span>
        </label>
      ) : null}
    </div>
  );
}
