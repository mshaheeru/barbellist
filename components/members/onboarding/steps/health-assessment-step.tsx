"use client";

import { NumberInput } from "@mantine/core";
import { BmiGauge } from "../bmi-gauge";
import styles from "../onboarding.module.css";
import type { OnboardingState } from "../onboarding-wizard";
import { FITNESS_GOAL_OPTIONS } from "../onboarding-wizard";

type HealthAssessmentStepProps = {
  state: OnboardingState;
  errors: Record<string, string>;
  onChange: (patch: Partial<OnboardingState>) => void;
};

export function HealthAssessmentStep({
  state,
  errors,
  onChange,
}: HealthAssessmentStepProps) {
  function toggleGoal(goal: string) {
    const current = state.fitness_goals;
    if (current.includes(goal)) {
      onChange({ fitness_goals: current.filter((g) => g !== goal) });
    } else {
      onChange({ fitness_goals: [...current, goal] });
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <h2 className={styles.sectionTitle}>Health Assessment</h2>
        <p className={styles.sectionSubtitle}>
          Record height, weight, and fitness goals for package recommendations.
        </p>
      </div>

      <div className={styles.card}>
        <div className={styles.formGrid}>
          <NumberInput
            label="Height (cm)"
            required
            min={1}
            decimalScale={1}
            value={state.height_cm ?? ""}
            onChange={(val) =>
              onChange({
                height_cm: typeof val === "number" ? val : null,
              })
            }
            error={errors.height_cm}
          />
          <NumberInput
            label="Weight (kg)"
            required
            min={1}
            decimalScale={1}
            value={state.weight_kg ?? ""}
            onChange={(val) =>
              onChange({
                weight_kg: typeof val === "number" ? val : null,
              })
            }
            error={errors.weight_kg}
          />
        </div>

        <BmiGauge heightCm={state.height_cm} weightKg={state.weight_kg} />

        <div style={{ marginTop: 24 }}>
          <div className={styles.cardTitle}>Fitness Goals</div>
          <div className={styles.goalsGrid}>
            {FITNESS_GOAL_OPTIONS.map((goal) => {
              const checked = state.fitness_goals.includes(goal.value);
              return (
                <label
                  key={goal.value}
                  className={`${styles.goalCheckbox} ${checked ? styles.goalCheckboxChecked : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleGoal(goal.value)}
                    style={{ accentColor: "var(--color-primary)" }}
                  />
                  {goal.label}
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
