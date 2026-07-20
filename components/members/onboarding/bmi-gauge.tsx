"use client";

import { computeBmi } from "@/lib/members/bmi";
import { bmiCategory } from "@/lib/members/format";
import styles from "./onboarding.module.css";

type BmiGaugeProps = {
  heightCm: number | null;
  weightKg: number | null;
};

/** Map BMI 15–40 to 0–100% on the gauge bar. */
function bmiToPercent(bmi: number): number {
  const min = 15;
  const max = 40;
  return Math.min(100, Math.max(0, ((bmi - min) / (max - min)) * 100));
}

export function BmiGauge({ heightCm, weightKg }: BmiGaugeProps) {
  if (!heightCm || !weightKg) {
    return (
      <div className={styles.bmiGaugeWrap}>
        <p style={{ fontSize: 14, color: "#8a8a80" }}>
          Enter height and weight to see BMI
        </p>
      </div>
    );
  }

  const bmi = computeBmi(heightCm, weightKg);
  const cat = bmiCategory(bmi);
  const markerLeft = bmiToPercent(bmi);

  const labelColor =
    cat.tone === "success"
      ? "#1b5e3c"
      : cat.tone === "danger"
        ? "#c0392b"
        : "#b07a15";

  return (
    <div className={styles.bmiGaugeWrap}>
      <div className={styles.bmiResult}>
        <span className={`${styles.num} ${styles.bmiValue}`}>{bmi}</span>
        <span style={{ fontWeight: 700, fontSize: 14, color: labelColor }}>
          {cat.label}
        </span>
      </div>
      <div className={styles.bmiGauge}>
        <div className={`${styles.bmiZone} ${styles.bmiZoneUnder}`} />
        <div className={`${styles.bmiZone} ${styles.bmiZoneNormal}`} />
        <div className={`${styles.bmiZone} ${styles.bmiZoneOver}`} />
        <div className={`${styles.bmiZone} ${styles.bmiZoneObese}`} />
        <div
          className={styles.bmiMarker}
          style={{ left: `${markerLeft}%` }}
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 11,
          color: "#8a8a80",
        }}
      >
        <span>Underweight</span>
        <span>Normal</span>
        <span>Overweight</span>
        <span>Obese</span>
      </div>
    </div>
  );
}
