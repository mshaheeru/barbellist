import type { FitnessGoal } from "@/lib/validations/members";

export const GOAL_LABELS: Record<FitnessGoal, string> = {
  weight_loss: "Weight Loss",
  muscle_gain: "Muscle Gain",
  general_fitness: "General Fitness",
  endurance: "Endurance",
  flexibility: "Flexibility",
  rehabilitation: "Rehabilitation",
};

export const DURATION_PRESETS = [
  { value: "30", label: "30 days (Monthly)", days: 30 },
  { value: "90", label: "90 days (Quarterly)", days: 90 },
  { value: "180", label: "180 days (6 Months)", days: 180 },
  { value: "365", label: "365 days (Yearly)", days: 365 },
  { value: "custom", label: "Custom", days: null },
] as const;

export function durationDisplayLabel(days: number): string {
  if (days === 30) return "/ month";
  if (days === 90) return "/ 3 months";
  if (days === 180) return "/ 6 months";
  if (days === 365) return "/ year";
  return `/ ${days} days`;
}

export function parseFeatures(features: unknown): string[] {
  if (Array.isArray(features)) {
    return features.filter((f): f is string => typeof f === "string");
  }
  return [];
}

export function formatBmiRange(
  min: number | null | undefined,
  max: number | null | undefined,
): string | null {
  if (min == null && max == null) return null;
  if (min != null && max != null) return `BMI ${min}–${max}`;
  if (min != null) return `BMI ≥ ${min}`;
  return `BMI ≤ ${max}`;
}
