"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
  Clock,
  Dumbbell,
  Info,
  Star,
} from "lucide-react";
import { getInitials } from "@/components/gym-provider";
import { formatCurrency } from "@/lib/members/format";
import type { CheckInResult } from "@/lib/types";
import styles from "./kiosk.module.css";

type KioskResultScreenProps = {
  result: CheckInResult;
  gymName: string;
  onDismiss: () => void;
};

const DISMISS_SECONDS = 4;
const RING_CIRCUMFERENCE = 892;

type ResultCopy = {
  tone: "success" | "warning" | "info";
  title: string;
  alreadyBadge: string | null;
  packageVisible: boolean;
  primaryPill: string;
  footer: string;
};

function getResultCopy(result: CheckInResult): ResultCopy {
  const firstName = result.name.split(" ")[0];
  const already = result.already_checked_in;
  const fee = result.fee_snapshot;
  const overdueLabel = `Fee overdue: ${formatCurrency(result.overdue_amount)}${
    result.overdue_days !== null ? ` · ${result.overdue_days} days` : ""
  }`;
  const statsLine = `Check-in #${result.month_check_ins} this month · Streak: ${result.streak} days 🔥`;

  if (already && fee === "overdue") {
    return {
      tone: "warning",
      title: result.name,
      alreadyBadge: "Already checked in today",
      packageVisible: false,
      primaryPill: overdueLabel,
      footer:
        "You’re already in the gym. Please see reception to clear overdue fees.",
    };
  }

  if (already) {
    return {
      tone: "info",
      title: `You're already in, ${firstName}!`,
      alreadyBadge: "Already checked in today",
      packageVisible: true,
      primaryPill:
        fee === "due_soon"
          ? "Already checked in · Fee due soon"
          : "Already checked in — enjoy your workout",
      footer: statsLine,
    };
  }

  if (fee === "overdue") {
    return {
      tone: "warning",
      title: result.name,
      alreadyBadge: null,
      packageVisible: false,
      primaryPill: overdueLabel,
      footer:
        "Please see reception. Front desk can record a payment now — Cash, EasyPaisa, JazzCash & Bank Transfer accepted.",
    };
  }

  if (fee === "due_soon") {
    return {
      tone: "success",
      title: `Welcome back, ${firstName}!`,
      alreadyBadge: null,
      packageVisible: true,
      primaryPill: "Checked in · Fee due soon",
      footer: statsLine,
    };
  }

  return {
    tone: "success",
    title: `Welcome back, ${firstName}!`,
    alreadyBadge: null,
    packageVisible: true,
    primaryPill: "All Clear — Fee Paid",
    footer: statsLine,
  };
}

export function KioskResultScreen({
  result,
  gymName,
  onDismiss,
}: KioskResultScreenProps) {
  const copy = getResultCopy(result);
  const isWarning = copy.tone === "warning";
  const isInfo = copy.tone === "info";
  const [secondsLeft, setSecondsLeft] = useState(DISMISS_SECONDS);
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;
  const dismissedRef = useRef(false);

  useEffect(() => {
    dismissedRef.current = false;
    setSecondsLeft(DISMISS_SECONDS);

    const start = Date.now();

    const tick = () => {
      const elapsed = (Date.now() - start) / 1000;
      const remaining = Math.max(0, DISMISS_SECONDS - elapsed);
      setSecondsLeft(Math.ceil(remaining));

      if (remaining <= 0 && !dismissedRef.current) {
        dismissedRef.current = true;
        onDismissRef.current();
      }
    };

    const interval = window.setInterval(tick, 100);
    const timeout = window.setTimeout(() => {
      window.clearInterval(interval);
      if (!dismissedRef.current) {
        dismissedRef.current = true;
        setSecondsLeft(0);
        onDismissRef.current();
      }
    }, DISMISS_SECONDS * 1000);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [result.attendance_id, result.already_checked_in]);

  const progress = 1 - secondsLeft / DISMISS_SECONDS;
  const dashOffset = RING_CIRCUMFERENCE * progress;

  const shellClass = isWarning
    ? `${styles.resultShell} ${styles.resultShellWarning}`
    : isInfo
      ? `${styles.resultShell} ${styles.resultShellInfo}`
      : `${styles.resultShell} ${styles.resultShellSuccess}`;

  return (
    <div className={shellClass}>
      <div className={styles.resultBrand}>
        <div className={styles.resultBrandIcon}>
          <Dumbbell size={19} color="#C9861B" strokeWidth={2.2} />
        </div>
        <span className={styles.resultBrandName}>{gymName.toUpperCase()}</span>
      </div>

      <div className={styles.photoRingWrap}>
        {!isWarning ? (
          <svg
            className={styles.countdownRing}
            viewBox="0 0 300 300"
            aria-hidden
          >
            <circle
              cx="150"
              cy="150"
              r="142"
              fill="none"
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="6"
            />
            <circle
              cx="150"
              cy="150"
              r="142"
              fill="none"
              stroke="#C9861B"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
            />
          </svg>
        ) : null}
        <div className={styles.photoCircle}>
          {result.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={result.photo_url} alt="" />
          ) : (
            getInitials(result.name)
          )}
        </div>
        <div className={styles.statusBadge}>
          {isWarning ? (
            <AlertTriangle size={32} color="#C0392B" strokeWidth={3} />
          ) : isInfo ? (
            <Info size={32} color="#1B5E3C" strokeWidth={2.8} />
          ) : (
            <Check size={34} color="#1B8A4B" strokeWidth={3.2} />
          )}
        </div>
      </div>

      <div className={styles.welcomeTitle}>{copy.title}</div>

      {copy.alreadyBadge ? (
        <div className={styles.alreadyBadge}>
          <Clock size={16} strokeWidth={2.4} />
          {copy.alreadyBadge}
        </div>
      ) : null}

      {copy.packageVisible && result.package_name ? (
        <div className={styles.packageBadge}>
          <Star size={16} fill="#C9861B" color="#C9861B" />
          {result.package_name} Member
        </div>
      ) : null}

      {isWarning ? (
        <>
          {!copy.alreadyBadge ? (
            <div className={styles.receptionMsg}>Please see reception</div>
          ) : null}
          <div className={styles.overduePill}>
            <AlertTriangle size={26} strokeWidth={2.4} />
            {copy.primaryPill}
          </div>
          <p className={styles.receptionSub}>{copy.footer}</p>
        </>
      ) : (
        <>
          <div className={styles.clearPill}>
            {isInfo ? (
              <Info size={22} strokeWidth={2.6} />
            ) : (
              <Check size={24} strokeWidth={3} />
            )}
            {copy.primaryPill}
          </div>
          <div className={styles.streakLine}>{copy.footer}</div>
        </>
      )}

      <div className={styles.dismissHint}>
        <span className={styles.spinnerDot} aria-hidden />
        Closing in {secondsLeft} second{secondsLeft === 1 ? "" : "s"}…
      </div>
    </div>
  );
}
