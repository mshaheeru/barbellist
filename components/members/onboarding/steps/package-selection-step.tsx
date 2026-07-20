"use client";

import { useMemo } from "react";
import { useGym } from "@/components/gym-provider";
import { recommendPackage } from "@/lib/members/recommend-package";
import type { Package } from "@/lib/types";
import { AssessmentSummary } from "../assessment-summary";
import { PackageCard } from "../package-card";
import styles from "../onboarding.module.css";
import type { OnboardingState } from "../onboarding-wizard";

type PackageSelectionStepProps = {
  state: OnboardingState;
  packages: Package[];
  errors: Record<string, string>;
  onChange: (patch: Partial<OnboardingState>) => void;
};

export function PackageSelectionStep({
  state,
  packages,
  errors,
  onChange,
}: PackageSelectionStepProps) {
  const { currencySymbol } = useGym();
  const firstName = state.name.trim().split(/\s+/)[0] || "member";

  const recommendation = useMemo(
    () =>
      recommendPackage(
        packages,
        state.height_cm,
        state.weight_kg,
        state.fitness_goals,
        state.name,
      ),
    [packages, state.height_cm, state.weight_kg, state.fitness_goals, state.name],
  );

  if (packages.length === 0) {
    return (
      <div className={styles.emptyPackages}>
        No active packages found. Add packages in Settings before onboarding
        members.
      </div>
    );
  }

  return (
    <div className={styles.bodyTwoCol}>
      <AssessmentSummary
        name={state.name}
        photoPreview={state.photo_preview}
        heightCm={state.height_cm}
        weightKg={state.weight_kg}
        fitnessGoals={state.fitness_goals}
      />

      <div>
        <div style={{ marginBottom: 18 }}>
          <h2 className={styles.sectionTitle}>
            Choose a package for {firstName}
          </h2>
          <p className={styles.sectionSubtitle}>
            {recommendation
              ? "We've highlighted the best fit based on the assessment."
              : "Select a membership package for this member."}
          </p>
        </div>

        {errors.package_id ? (
          <p className={styles.errorText} style={{ marginBottom: 12 }}>
            {errors.package_id}
          </p>
        ) : null}

        <div className={styles.packageGrid}>
          {packages.map((pkg) => {
            const isRecommended =
              recommendation?.packageId === pkg.id && recommendation.score > 0;
            return (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                currencySymbol={currencySymbol}
                selected={state.package_id === pkg.id}
                recommended={isRecommended}
                recommendedLabel={
                  isRecommended ? `Recommended for ${firstName}` : undefined
                }
                rationale={
                  isRecommended ? recommendation?.rationale : undefined
                }
                onSelect={() => onChange({ package_id: pkg.id })}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
