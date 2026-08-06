"use client";

import { Receipt } from "lucide-react";
import { formatMoney, profileFromCountry } from "@/lib/currency";
import type { Gym, Organization, SubscriptionPlan } from "@/lib/types";
import styles from "./settings.module.css";

const PLAN_LABELS: Record<SubscriptionPlan, string> = {
  early_bird: "Early Bird",
  standard: "Standard",
  pro: "Pro",
};

type BillingSectionProps = {
  gym: Gym;
  organization: Organization;
  activeMemberCount: number;
};

export function BillingSection({
  gym,
  organization,
  activeMemberCount,
}: BillingSectionProps) {
  const profile = profileFromCountry(gym.country);
  const isEarly =
    organization.subscription_plan === "early_bird" ||
    organization.subscription_status === "trial";
  const rate = isEarly ? profile.earlyRate : profile.standardRate;
  const monthlyCost = Math.max(
    activeMemberCount * rate,
    isEarly ? profile.earlyMin : profile.standardMin,
  );

  const trialEnds = organization.trial_ends_at
    ? new Date(organization.trial_ends_at)
    : null;
  const daysLeft =
    trialEnds != null
      ? Math.ceil(
          (trialEnds.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
        )
      : null;

  return (
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <h2 className={styles.sectionTitle}>
          <Receipt size={18} className={styles.sectionIcon} strokeWidth={2} />
          Billing
        </h2>
      </div>

      <p className={styles.dangerDesc} style={{ marginBottom: "1rem" }}>
        Plan for {organization.name} — shared across all branches.
      </p>

      <div className={styles.billingCard}>
        <div className={styles.billingRow}>
          <span className={styles.billingLabel}>Current plan</span>
          <span className={styles.planPill}>
            {PLAN_LABELS[organization.subscription_plan] ??
              organization.subscription_plan}
          </span>
        </div>
        <div className={styles.billingRow}>
          <span className={styles.billingLabel}>Status</span>
          <span
            className={
              organization.subscription_status === "trial"
                ? styles.statusTrial
                : styles.statusActive
            }
          >
            {organization.subscription_status === "trial" ? "Trial" : "Active"}
          </span>
        </div>
        <div className={styles.billingRow}>
          <span className={styles.billingLabel}>Active members (this branch)</span>
          <span className={styles.billingValue}>
            {activeMemberCount} active members
          </span>
        </div>
        <div className={styles.billingRow}>
          <span className={styles.billingLabel}>Estimate for this branch</span>
          <span className={styles.billingValue}>
            {formatMoney(monthlyCost, profile)}
          </span>
        </div>
        {trialEnds && daysLeft != null && daysLeft > 0 ? (
          <div className={styles.billingRow}>
            <span className={styles.billingLabel}>Trial ends</span>
            <span className={styles.billingValue}>
              {trialEnds.toLocaleDateString()} ({daysLeft} day
              {daysLeft === 1 ? "" : "s"} left)
            </span>
          </div>
        ) : null}
      </div>

      <a
        className={styles.supportLink}
        href="mailto:hello@barbellist.com?subject=Change%20Barbellist%20plan"
      >
        Contact support to change plan
      </a>
    </section>
  );
}
