import type { Package } from "@/lib/types";
import { computeBmi } from "./bmi";
import { bmiCategory, formatFitnessGoal } from "./format";

export type PackageRecommendation = {
  packageId: string;
  score: number;
  rationale: string;
};

function bmiInRange(
  bmi: number,
  bmiMin: number | null,
  bmiMax: number | null,
): boolean {
  if (bmiMin !== null && bmi < bmiMin) return false;
  if (bmiMax !== null && bmi > bmiMax) return false;
  if (bmiMin === null && bmiMax === null) return false;
  return true;
}

function hasRecommendationConfig(packages: Package[]): boolean {
  return packages.some(
    (p) =>
      p.bmi_min !== null ||
      p.bmi_max !== null ||
      (p.recommended_goals && p.recommended_goals.length > 0),
  );
}

function scorePackage(
  pkg: Package,
  bmi: number | null,
  fitnessGoals: string[],
): number {
  let score = 0;

  if (bmi !== null && bmiInRange(bmi, pkg.bmi_min, pkg.bmi_max)) {
    score += 2;
  }

  if (pkg.recommended_goals && fitnessGoals.length > 0) {
    const overlap = fitnessGoals.filter((g) =>
      pkg.recommended_goals!.includes(g),
    );
    score += overlap.length;
  }

  return score;
}

function buildRationale(
  pkg: Package,
  bmi: number | null,
  fitnessGoals: string[],
  memberFirstName: string,
): string {
  const parts: string[] = [];

  if (bmi !== null) {
    const cat = bmiCategory(bmi);
    const goalLabels = fitnessGoals.map(formatFitnessGoal).join(" and ");
    if (goalLabels) {
      parts.push(
        `Based on ${memberFirstName}'s BMI (${bmi}) and ${goalLabels.toLowerCase()} goal`,
      );
    } else {
      parts.push(`Based on ${memberFirstName}'s BMI (${bmi}) — ${cat.label}`);
    }
  } else if (fitnessGoals.length > 0) {
    const goalLabels = fitnessGoals.map(formatFitnessGoal).join(", ");
    parts.push(`Matched to ${memberFirstName}'s goals: ${goalLabels}`);
  }

  if (pkg.description) {
    parts.push(pkg.description);
  } else {
    parts.push(`${pkg.name} offers the best fit for this member's profile.`);
  }

  return parts.join(" — ");
}

export function recommendPackage(
  packages: Package[],
  heightCm: number | null,
  weightKg: number | null,
  fitnessGoals: string[],
  memberName: string,
): PackageRecommendation | null {
  if (!hasRecommendationConfig(packages)) return null;

  const bmi =
    heightCm && weightKg ? computeBmi(heightCm, weightKg) : null;
  const firstName = memberName.trim().split(/\s+/)[0] ?? memberName;

  let best: PackageRecommendation | null = null;

  for (const pkg of packages) {
    const score = scorePackage(pkg, bmi, fitnessGoals);
    if (score <= 0) continue;

    if (!best || score > best.score) {
      best = {
        packageId: pkg.id,
        score,
        rationale: buildRationale(pkg, bmi, fitnessGoals, firstName),
      };
    }
  }

  return best;
}
