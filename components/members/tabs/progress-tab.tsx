import type { MemberProfile } from "@/lib/types";
import { bmiCategory, formatFitnessGoal } from "@/lib/members/format";
import styles from "../member-profile.module.css";

type ProgressTabProps = {
  member: MemberProfile;
};

export function ProgressTab({ member }: ProgressTabProps) {
  const bmi = bmiCategory(member.bmi);

  return (
    <>
      <div className={styles.card}>
        <div className={styles.cardTitle}>Current Measurements</div>
        <div className={styles.healthGrid}>
          <div>
            <div className={styles.healthLabel}>BMI</div>
            <div className={styles.healthValue}>
              {member.bmi?.toFixed(1) ?? "—"}
            </div>
            <div
              className={`${styles.healthSub} ${
                bmi.tone === "success"
                  ? styles.healthSubSuccess
                  : styles.healthSubWarning
              }`}
            >
              {bmi.label}
            </div>
          </div>
          <div>
            <div className={styles.healthLabel}>Weight</div>
            <div className={styles.healthValue}>
              {member.weight_kg ? `${member.weight_kg} kg` : "—"}
            </div>
          </div>
          <div>
            <div className={styles.healthLabel}>Height</div>
            <div className={styles.healthValue}>
              {member.height_cm ? `${member.height_cm} cm` : "—"}
            </div>
          </div>
          <div>
            <div className={styles.healthLabel}>Goals</div>
            <div style={{ fontSize: 14, fontWeight: 700, marginTop: 4 }}>
              {(member.fitness_goals ?? []).length > 0
                ? member.fitness_goals!.map(formatFitnessGoal).join(", ")
                : "—"}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>Weight / BMI Over Time</div>
        <div className={styles.progressPlaceholder}>
          Track progress over time after multiple assessments. Chart will appear
          here once additional measurements are recorded.
        </div>
      </div>
    </>
  );
}
