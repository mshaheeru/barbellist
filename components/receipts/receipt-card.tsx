"use client";

import type { RefObject } from "react";
import { Dumbbell } from "lucide-react";
import {
  formatCurrency,
  formatPaymentMethod,
  formatReceiptNumber,
  formatReceiptPeriod,
  formatShortDate,
} from "@/lib/members/format";
import type { Gym, PaymentMethod } from "@/lib/types";
import styles from "./receipt-card.module.css";

export type ReceiptPayment = {
  id: string;
  amount: number;
  payment_method: PaymentMethod | null;
  paid_at: string;
  covers_from: string | null;
  covers_to: string | null;
};

export type ReceiptCardProps = {
  cardRef?: RefObject<HTMLDivElement | null>;
  gym: Pick<Gym, "name" | "logo_url" | "phone" | "whatsapp" | "email"> | null;
  memberName: string;
  memberCode: string;
  currencySymbol: string;
  payment: ReceiptPayment;
  packageName: string | null;
};

function GymLogo({
  gym,
}: {
  gym: Pick<Gym, "name" | "logo_url"> | null;
}) {
  if (gym?.logo_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={gym.logo_url}
        alt=""
        className={styles.logoImg}
        crossOrigin="anonymous"
      />
    );
  }
  return <Dumbbell size={24} color="var(--color-accent)" strokeWidth={2.2} />;
}

function gymContactLine(
  gym: Pick<Gym, "phone" | "whatsapp" | "email"> | null,
): string | null {
  if (!gym) return null;
  const parts = [gym.phone || gym.whatsapp, gym.email].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : null;
}

export function ReceiptCard({
  cardRef,
  gym,
  memberName,
  memberCode,
  currencySymbol,
  payment,
  packageName,
}: ReceiptCardProps) {
  const receiptNo = formatReceiptNumber(payment.id);
  const period = formatReceiptPeriod(payment.covers_from, payment.covers_to);
  const contact = gymContactLine(gym);

  return (
    <div ref={cardRef} className={styles.card}>
      <div className={styles.header}>
        <div className={styles.logoWrap}>
          <GymLogo gym={gym} />
        </div>
        <div>
          <div className={styles.gymName}>{gym?.name ?? "Your Gym"}</div>
          <div className={styles.gymLabel}>Membership</div>
        </div>
      </div>

      <div className={styles.body}>
        <h2 className={styles.title}>Payment Receipt</h2>
        <div className={styles.receiptNumber}>{receiptNo}</div>
        <div className={styles.amberLine} />

        <div className={styles.memberBlock}>
          <p className={styles.memberName}>{memberName}</p>
          <div className={styles.memberCode}>{memberCode}</div>
        </div>

        <div className={styles.details}>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Date</span>
            <span className={styles.detailValue}>
              {formatShortDate(payment.paid_at)}
            </span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Amount</span>
            <span
              className={`${styles.detailValue} ${styles.detailValueAmount}`}
            >
              {formatCurrency(Number(payment.amount), currencySymbol)}
            </span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Method</span>
            <span className={styles.detailValue}>
              {formatPaymentMethod(payment.payment_method)}
            </span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Period</span>
            <span className={styles.detailValue}>{period}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Package</span>
            <span className={styles.detailValue}>
              {packageName ?? "—"}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <p className={styles.thanks}>Thank you for being a member!</p>
        {contact ? <p className={styles.contact}>{contact}</p> : null}
      </div>
    </div>
  );
}
