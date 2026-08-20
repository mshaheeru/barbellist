"use client";

import { useCallback, useEffect, useId, useMemo, useRef } from "react";
import {
  startIgnitionAudio,
  stopIgnitionAudio,
} from "@/lib/brand/ignition-audio";
import styles from "./ignition-sequence.module.css";

/** Total cinematic runtime before onComplete (ms). */
export const IGNITION_DURATION_MS = 5000;

type IgnitionSequenceProps = {
  onComplete: () => void;
  onSkip: () => void;
};

const PARTICLE_COUNT = 18;

export function IgnitionSequence({ onComplete, onSkip }: IgnitionSequenceProps) {
  const finished = useRef(false);
  const audioStop = useRef<(() => void) | null>(null);
  const labelId = useId();

  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        id: i,
        left: `${6 + ((i * 37) % 88)}%`,
        top: `${10 + ((i * 53) % 78)}%`,
        delay: `${0.25 + (i % 9) * 0.22}s`,
        duration: `${4.2 + (i % 5) * 0.3}s`,
        size: i % 3 === 0 ? 3 : 2,
      })),
    [],
  );

  const skip = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    audioStop.current?.();
    stopIgnitionAudio();
    onSkip();
  }, [onSkip]);

  useEffect(() => {
    const handle = startIgnitionAudio();
    audioStop.current = handle.stop;
    return () => {
      handle.stop();
      audioStop.current = null;
    };
  }, []);

  useEffect(() => {
    const finish = () => {
      if (finished.current) return;
      finished.current = true;
      audioStop.current?.();
      onComplete();
    };

    const timer = window.setTimeout(finish, IGNITION_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [onComplete]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        skip();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [skip]);

  return (
    <div
      className={styles.stage}
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelId}
      aria-busy="true"
      tabIndex={0}
      onClick={skip}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          skip();
        }
      }}
    >
      <div className={styles.atmosphere} aria-hidden />
      <div className={styles.bloom} aria-hidden />

      <div className={styles.particles} aria-hidden>
        {particles.map((p) => (
          <span
            key={p.id}
            className={styles.particle}
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              animationDelay: p.delay,
              animationDuration: p.duration,
            }}
          />
        ))}
      </div>

      <div className={styles.mark} aria-hidden>
        <span className={`${styles.side} ${styles.sideLeft}`}>Barbe</span>
        <span className={styles.ll}>
          <span className={`${styles.stem} ${styles.stemLeft}`} />
          <span className={`${styles.stem} ${styles.stemRight}`} />
          <span className={styles.barbell}>
            <span className={`${styles.plate} ${styles.plateLeft}`} />
            <span className={styles.bar}>
              <span className={styles.barTrail} />
            </span>
            <span className={`${styles.plate} ${styles.plateRight}`} />
          </span>
        </span>
        <span className={`${styles.side} ${styles.sideRight}`}>ist</span>
        <span className={styles.scan} />
      </div>

      <p id={labelId} className={styles.srOnly}>
        Signing you in
      </p>
      <p className={styles.hint} aria-hidden>
        Click or Esc to skip
      </p>
      <div className={styles.wipe} aria-hidden />
    </div>
  );
}
