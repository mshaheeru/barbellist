"use client";

import { Switch } from "@mantine/core";
import { Check } from "lucide-react";
import type { Package } from "@/lib/types";
import { formatCurrency } from "@/lib/members/format";
import {
  durationDisplayLabel,
  formatBmiRange,
  parseFeatures,
  GOAL_LABELS,
} from "@/lib/packages/format";
import type { FitnessGoal } from "@/lib/validations/members";
import styles from "./packages.module.css";

type PackageAdminCardProps = {
  pkg: Package;
  currencySymbol: string;
  toggling?: boolean;
  onToggleActive: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function PackageAdminCard({
  pkg,
  currencySymbol,
  toggling = false,
  onToggleActive,
  onEdit,
  onDelete,
}: PackageAdminCardProps) {
  const features = parseFeatures(pkg.features);
  const bmiLabel = formatBmiRange(pkg.bmi_min, pkg.bmi_max);
  const goals = (pkg.recommended_goals ?? []).filter(
    (g): g is FitnessGoal => g in GOAL_LABELS,
  );

  return (
    <article
      className={`${styles.card} ${!pkg.is_active ? styles.cardInactive : ""}`}
    >
      <div
        className={styles.colorStripe}
        style={{ background: pkg.color || "var(--color-primary)" }}
      />
      <div className={styles.cardBody}>
        <div className={styles.cardTop}>
          <h3 className={styles.packageName}>
            {pkg.name}
            {!pkg.is_active ? (
              <span className={styles.inactiveBadge}>Inactive</span>
            ) : null}
          </h3>
          <Switch
            checked={pkg.is_active}
            onChange={onToggleActive}
            disabled={toggling}
            size="sm"
            color="var(--color-primary)"
            aria-label={`Toggle ${pkg.name} active`}
          />
        </div>

        <div className={styles.packagePrice}>
          <span className={styles.packagePriceAmount}>
            {formatCurrency(Number(pkg.price), currencySymbol)}
          </span>
          <span className={styles.packagePricePeriod}>
            {durationDisplayLabel(pkg.duration_days)}
          </span>
        </div>

        {bmiLabel ? <div className={styles.bmiText}>{bmiLabel}</div> : null}

        {goals.length > 0 ? (
          <div className={styles.goalPills}>
            {goals.map((g) => (
              <span key={g} className={styles.goalPill}>
                {GOAL_LABELS[g]}
              </span>
            ))}
          </div>
        ) : null}

        {features.length > 0 ? (
          <div className={styles.featureList}>
            {features.map((f) => (
              <span key={f} className={styles.featureItem}>
                <Check
                  size={15}
                  strokeWidth={2.4}
                  color="var(--color-primary)"
                  style={{ flexShrink: 0, marginTop: 2 }}
                />
                {f}
              </span>
            ))}
          </div>
        ) : (
          <div className={styles.noFeatures}>No features listed</div>
        )}

        <div className={styles.cardActions}>
          <button type="button" className={styles.editBtn} onClick={onEdit}>
            Edit
          </button>
          <button
            type="button"
            className={styles.deleteBtn}
            onClick={onDelete}
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}
