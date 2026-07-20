"use client";

import { MemberAvatar } from "@/components/members/member-avatar";
import { computeBmi } from "@/lib/members/bmi";
import { bmiCategory, formatFitnessGoal } from "@/lib/members/format";
import styles from "./onboarding.module.css";

type AssessmentSummaryProps = {
  name: string;
  photoPreview: string | null;
  heightCm: number | null;
  weightKg: number | null;
  fitnessGoals: string[];
};

export function AssessmentSummary({
  name,
  photoPreview,
  heightCm,
  weightKg,
  fitnessGoals,
}: AssessmentSummaryProps) {
  const bmi =
    heightCm && weightKg ? computeBmi(heightCm, weightKg) : null;
  const cat = bmi !== null ? bmiCategory(bmi) : null;

  const pillClass =
    cat?.tone === "success"
      ? styles.bmiPillSuccess
      : cat?.tone === "danger"
        ? styles.bmiPillDanger
        : styles.bmiPill;

  return (
    <div className={styles.card}>
      <div className={styles.summaryHeader}>
        <MemberAvatar
          name={name || "New Member"}
          photoUrl={photoPreview}
          size="list"
        />
        <div>
          <div className={styles.summaryName}>{name || "New Member"}</div>
          <div className={styles.summaryMeta}>New member</div>
        </div>
      </div>

      <div className={styles.summaryLabel}>Assessment Summary</div>

      <div className={styles.summaryRow}>
        <span style={{ color: "#6b6b62" }}>BMI</span>
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className={`${styles.num} ${styles.bmiValue}`} style={{ fontSize: 15 }}>
            {bmi !== null ? bmi : "—"}
          </span>
          {cat && cat.label !== "—" ? (
            <span className={`${styles.bmiPill} ${pillClass}`}>{cat.label}</span>
          ) : null}
        </span>
      </div>

      {fitnessGoals.length > 0 ? (
        <>
          <div className={styles.summaryDivider} />
          <div>
            <div style={{ fontSize: 13.5, color: "#6b6b62", marginBottom: 8 }}>
              Fitness Goals
            </div>
            <div className={styles.goalChips}>
              {fitnessGoals.map((g) => (
                <span key={g} className={styles.goalChip}>
                  {formatFitnessGoal(g)}
                </span>
              ))}
            </div>
          </div>
        </>
      ) : null}

      {heightCm ? (
        <>
          <div className={styles.summaryDivider} />
          <div className={styles.summaryRow}>
            <span style={{ color: "#6b6b62" }}>Height</span>
            <span className={styles.num} style={{ fontWeight: 600 }}>
              {heightCm} cm
            </span>
          </div>
        </>
      ) : null}

      {weightKg ? (
        <>
          <div className={styles.summaryDivider} />
          <div className={styles.summaryRow}>
            <span style={{ color: "#6b6b62" }}>Weight</span>
            <span className={styles.num} style={{ fontWeight: 600 }}>
              {weightKg} kg
            </span>
          </div>
        </>
      ) : null}
    </div>
  );
}
