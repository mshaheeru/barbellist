"use client";

import { Check, Star } from "lucide-react";
import type { Package } from "@/lib/types";
import { formatCurrency } from "@/lib/members/format";
import styles from "./onboarding.module.css";

type PackageCardProps = {
  pkg: Package;
  currencySymbol: string;
  selected: boolean;
  recommended: boolean;
  recommendedLabel?: string;
  rationale?: string;
  onSelect: () => void;
};

function parseFeatures(features: unknown): string[] {
  if (Array.isArray(features)) {
    return features.filter((f): f is string => typeof f === "string");
  }
  return [];
}

function durationLabel(days: number): string {
  if (days === 30) return "/mo";
  if (days === 90) return "/3 mo";
  if (days === 365) return "/yr";
  return `/${days}d`;
}

export function PackageCard({
  pkg,
  currencySymbol,
  selected,
  recommended,
  recommendedLabel,
  rationale,
  onSelect,
}: PackageCardProps) {
  const features = parseFeatures(pkg.features);

  const cardClass = [
    styles.packageCard,
    recommended ? styles.packageCardRecommended : "",
    selected ? styles.packageCardSelected : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cardClass} onClick={onSelect} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && onSelect()}>
      {recommended && recommendedLabel ? (
        <div className={styles.recommendedBadge}>
          <Star size={12} fill="#fff" stroke="none" />
          {recommendedLabel}
        </div>
      ) : null}

      <div className={styles.packageName} style={recommended ? { marginTop: 6 } : undefined}>
        {pkg.name}
      </div>

      <div className={styles.packagePrice}>
        <span className={`${styles.num} ${styles.packagePriceAmount}`}>
          {formatCurrency(Number(pkg.price), currencySymbol)}
        </span>
        <span className={styles.packagePricePeriod}>
          {durationLabel(pkg.duration_days)}
        </span>
      </div>

      {recommended && rationale ? (
        <div className={styles.rationaleBox}>{rationale}</div>
      ) : null}

      <div className={styles.featureList}>
        {features.map((f) => (
          <span key={f} className={styles.featureItem}>
            <Check size={15} strokeWidth={2.4} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: 2 }} />
            {f}
          </span>
        ))}
      </div>

      <button
        type="button"
        className={`${styles.selectBtn} ${selected || recommended ? styles.selectBtnPrimary : ""}`}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        {selected ? `Selected — ${pkg.name}` : `Select ${pkg.name}`}
      </button>
    </div>
  );
}
