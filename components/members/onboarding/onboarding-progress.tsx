"use client";

import { Check } from "lucide-react";
import styles from "./onboarding.module.css";

const STEPS = [
  { key: 1, label: "Personal Info" },
  { key: 2, label: "Health Assessment" },
  { key: 3, label: "Package" },
  { key: 4, label: "Payment" },
] as const;

type OnboardingProgressProps = {
  currentStep: number;
  /** Inline compact stepper for the top bar (no labels). */
  compact?: boolean;
};

export function OnboardingProgress({
  currentStep,
  compact = false,
}: OnboardingProgressProps) {
  return (
    <div
      className={compact ? styles.progressInline : styles.progressWrap}
      aria-label={`Step ${currentStep} of ${STEPS.length}`}
    >
      {STEPS.map((step, index) => {
        const isDone = currentStep > step.key;
        const isActive = currentStep === step.key;

        return (
          <div key={step.key} style={{ display: "contents" }}>
            {index > 0 ? (
              <div
                className={`${compact ? styles.stepConnectorCompact : styles.stepConnector} ${
                  isDone || isActive
                    ? styles.stepConnectorDone
                    : styles.stepConnectorPending
                }`}
              />
            ) : null}
            <div className={styles.progressStep}>
              <div
                className={`${compact ? styles.stepCircleCompact : styles.stepCircle} ${
                  isDone
                    ? styles.stepCircleDone
                    : isActive
                      ? styles.stepCircleActive
                      : styles.stepCirclePending
                } ${isActive && !isDone ? styles.num : ""}`}
                title={step.label}
              >
                {isDone ? (
                  <Check size={compact ? 12 : 16} strokeWidth={3} />
                ) : (
                  step.key
                )}
              </div>
              {!compact ? (
                <span
                  className={`${styles.progressLabel} ${
                    isDone
                      ? styles.progressLabelDone
                      : isActive
                        ? styles.progressLabelActive
                        : ""
                  }`}
                >
                  {step.label}
                </span>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function getStepLabel(step: number): string {
  return STEPS.find((s) => s.key === step)?.label ?? "";
}
