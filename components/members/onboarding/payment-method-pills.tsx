"use client";

import { Check, CreditCard, Landmark, Smartphone } from "lucide-react";
import type { PaymentMethod } from "@/lib/types";
import styles from "./onboarding.module.css";

type OnboardingPaymentMethod = Extract<
  PaymentMethod,
  "cash" | "easypaisa" | "jazzcash" | "bank_transfer"
>;

const METHODS: {
  value: OnboardingPaymentMethod;
  label: string;
  icon: React.ReactNode;
  tint?: "easypaisa" | "jazzcash";
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
    tint: "easypaisa",
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
    tint: "jazzcash",
  },
  {
    value: "bank_transfer",
    label: "Bank Transfer",
    icon: <Landmark size={18} strokeWidth={2} />,
  },
];

type PaymentMethodPillsProps = {
  value: OnboardingPaymentMethod;
  onChange: (method: OnboardingPaymentMethod) => void;
};

export function PaymentMethodPills({ value, onChange }: PaymentMethodPillsProps) {
  return (
    <div className={styles.paymentMethodGrid}>
      {METHODS.map((m) => {
        const selected = value === m.value;
        const pillClass = [
          styles.paymentPill,
          selected ? styles.paymentPillSelected : "",
          selected && m.tint === "easypaisa" ? styles.paymentPillEasypaisa : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <button
            key={m.value}
            type="button"
            className={pillClass}
            onClick={() => onChange(m.value)}
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
  );
}
