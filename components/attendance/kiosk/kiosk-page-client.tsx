"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Fingerprint,
  QrCode,
  Search,
  Dumbbell,
} from "lucide-react";
import { getLiveGymCounts } from "@/app/actions/attendance";
import { useGym } from "@/components/gym-provider";
import {
  formatLongDateInTimezone,
  formatTimeInTimezone,
  getGymTimezone,
} from "@/lib/attendance/timezone";
import type { CheckInResult } from "@/lib/types";
import {
  KioskErrorScreen,
  type KioskErrorInfo,
} from "./kiosk-error-screen";
import { KioskFingerprintTab } from "./kiosk-fingerprint-tab";
import { KioskManualEntry } from "./kiosk-manual-entry";
import { KioskQrScanner } from "./kiosk-qr-scanner";
import { KioskResultScreen } from "./kiosk-result-screen";
import styles from "./kiosk.module.css";

type KioskTab = "qr" | "manual" | "fingerprint";

export function KioskPageClient() {
  const { gym, gymName } = useGym();
  const timeZone = getGymTimezone(gym?.timezone);

  const [tab, setTab] = useState<KioskTab>("qr");
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [error, setError] = useState<KioskErrorInfo | null>(null);
  const [checkInsToday, setCheckInsToday] = useState(0);
  const [now, setNow] = useState(() => new Date());
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    void getLiveGymCounts().then(({ data }) => {
      if (data) setCheckInsToday(data.checkInsToday);
    });
  }, [result]);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const handleCheckInResult = useCallback((data: CheckInResult) => {
    setError(null);
    setScanning(false);
    setResult(data);
  }, []);

  const handleCheckInError = useCallback((info: KioskErrorInfo) => {
    setResult(null);
    setScanning(false);
    setError(info);
  }, []);

  const handleDismiss = useCallback(() => {
    setResult(null);
    setError(null);
    setScanning(true);
  }, []);

  if (error) {
    return (
      <KioskErrorScreen
        error={error}
        gymName={gymName ?? "Gym"}
        onDismiss={handleDismiss}
      />
    );
  }

  if (result) {
    return (
      <KioskResultScreen
        result={result}
        gymName={gymName ?? "Gym"}
        onDismiss={handleDismiss}
      />
    );
  }

  const displayName = (gymName ?? "GYM").toUpperCase();
  const city = gym?.city?.toUpperCase() ?? "FITNESS";

  return (
    <div className={styles.shell}>
      <div className={styles.logoBlock}>
        <div className={styles.logoIcon}>
          <Dumbbell size={32} color="#C9861B" strokeWidth={2.2} />
        </div>
        <div className={styles.gymName}>{displayName}</div>
        <div className={styles.gymTagline}>Fitness · {city}</div>
      </div>

      <div className={styles.tabBar}>
        <button
          type="button"
          className={`${styles.tab} ${tab === "qr" ? styles.tabActive : ""}`}
          onClick={() => setTab("qr")}
        >
          <QrCode size={18} strokeWidth={2} />
          Scan QR
        </button>
        <button
          type="button"
          className={`${styles.tab} ${tab === "manual" ? styles.tabActive : ""}`}
          onClick={() => setTab("manual")}
        >
          <Search size={18} strokeWidth={2} />
          Manual Entry
        </button>
        <button
          type="button"
          className={`${styles.tab} ${styles.tabDisabled}`}
          disabled
          title="Coming soon"
        >
          <Fingerprint size={18} strokeWidth={2} />
          Fingerprint
        </button>
      </div>

      <div className={styles.main}>
        {tab === "qr" ? (
          <>
            <div className={styles.scanZoneWrap}>
              <div className={styles.glowRing} aria-hidden />
              <div className={styles.outerRing} aria-hidden />
              <div className={styles.scanInner}>
                {scanning ? (
                  <KioskQrScanner
                    onResult={handleCheckInResult}
                    onError={handleCheckInError}
                  />
                ) : (
                  <span className={styles.scanHint}>Hold card to scanner</span>
                )}
              </div>
            </div>
            <div className={styles.instruction}>
              <div className={styles.instructionTitle}>
                Hold card to scanner
              </div>
              <div className={styles.instructionSub}>
                Welcome — check in to start your session
              </div>
            </div>
          </>
        ) : null}

        {tab === "manual" ? (
          <KioskManualEntry
            onResult={handleCheckInResult}
            onError={handleCheckInError}
          />
        ) : null}

        {tab === "fingerprint" ? <KioskFingerprintTab /> : null}
      </div>

      <div className={styles.bottomStrip}>
        <div>
          <div className={styles.stripLabel}>CHECKED IN TODAY</div>
          <div className={`${styles.stripValue} ${styles.num}`}>
            {checkInsToday}
          </div>
        </div>
        <div className={styles.stripCenter}>
          <div className={`${styles.stripClock} ${styles.num}`}>
            {formatTimeInTimezone(now, timeZone)}
          </div>
          <div className={styles.stripDate}>
            {formatLongDateInTimezone(now, timeZone)}
          </div>
        </div>
        <div className={styles.stripRight}>
          <div className={styles.stripLabel}>HELPLINE</div>
          <div
            className={`${styles.num}`}
            style={{ fontSize: 18, fontWeight: 600, marginTop: 4 }}
          >
            {gym?.phone ?? "—"}
          </div>
        </div>
      </div>

      <Link
        href="/dashboard/attendance"
        style={{
          position: "fixed",
          top: 16,
          left: 16,
          color: "rgba(255,255,255,0.6)",
          fontSize: 13,
          textDecoration: "none",
          zIndex: 10,
        }}
      >
        ← Exit kiosk
      </Link>
    </div>
  );
}
