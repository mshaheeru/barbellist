"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Dumbbell, XCircle } from "lucide-react";
import styles from "./kiosk.module.css";

export type KioskErrorInfo = {
  title: string;
  message: string;
};

type KioskErrorScreenProps = {
  error: KioskErrorInfo;
  gymName: string;
  onDismiss: () => void;
};

const DISMISS_SECONDS = 4;

/** Map server/action errors to kiosk-friendly copy. */
export function mapKioskError(raw: string | null | undefined): KioskErrorInfo {
  const msg = (raw ?? "").toLowerCase();

  if (msg.includes("another gym")) {
    return {
      title: "Wrong gym",
      message: "This card belongs to another gym. Please see reception.",
    };
  }
  if (msg.includes("replaced") || msg.includes("latest card")) {
    return {
      title: "Outdated card",
      message: "This QR code has been replaced. Use the latest membership card.",
    };
  }
  if (msg.includes("not found")) {
    return {
      title: "Member not found",
      message: "No matching member for this card. Please see reception.",
    };
  }
  if (msg.includes("not active") || msg.includes("frozen")) {
    return {
      title: "Membership inactive",
      message: "This membership is not active. Please see reception.",
    };
  }
  if (msg.includes("permission")) {
    return {
      title: "Not allowed",
      message: "You don’t have permission to check in members.",
    };
  }
  if (
    msg.includes("invalid") ||
    msg.includes("expired") ||
    msg.includes("qr") ||
    !raw
  ) {
    return {
      title: "Invalid QR code",
      message:
        "This is not a valid Barbellist membership card. Please try again or see reception.",
    };
  }

  return {
    title: "Check-in failed",
    message: raw ?? "Something went wrong. Please try again.",
  };
}

export function KioskErrorScreen({
  error,
  gymName,
  onDismiss,
}: KioskErrorScreenProps) {
  const [secondsLeft, setSecondsLeft] = useState(DISMISS_SECONDS);
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;
  const dismissedRef = useRef(false);

  useEffect(() => {
    dismissedRef.current = false;
    setSecondsLeft(DISMISS_SECONDS);

    const start = Date.now();
    const interval = window.setInterval(() => {
      const remaining = Math.max(0, DISMISS_SECONDS - (Date.now() - start) / 1000);
      setSecondsLeft(Math.ceil(remaining));
      if (remaining <= 0 && !dismissedRef.current) {
        dismissedRef.current = true;
        onDismissRef.current();
      }
    }, 100);

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
  }, [error.title, error.message]);

  return (
    <div className={`${styles.resultShell} ${styles.resultShellWarning}`}>
      <div className={styles.resultBrand}>
        <div className={styles.resultBrandIcon}>
          <Dumbbell size={19} color="#fff" strokeWidth={2.2} />
        </div>
        <span className={styles.resultBrandName}>{gymName.toUpperCase()}</span>
      </div>

      <div className={styles.photoRingWrap}>
        <div className={styles.photoCircle} style={{ fontSize: 0 }}>
          <XCircle size={120} color="#fff" strokeWidth={1.6} />
        </div>
        <div className={styles.statusBadge}>
          <AlertTriangle size={32} color="#C0392B" strokeWidth={3} />
        </div>
      </div>

      <div className={styles.welcomeTitle}>{error.title}</div>
      <div className={styles.receptionMsg} style={{ fontSize: "clamp(20px, 3vw, 28px)" }}>
        Please see reception
      </div>
      <div className={styles.overduePill}>
        <AlertTriangle size={26} strokeWidth={2.4} />
        {error.message}
      </div>
      <p className={styles.receptionSub}>
        Ask front desk for help if this keeps happening.
      </p>

      <div className={styles.dismissHint}>
        <span className={styles.spinnerDot} aria-hidden />
        Closing in {secondsLeft} second{secondsLeft === 1 ? "" : "s"}…
      </div>
    </div>
  );
}
