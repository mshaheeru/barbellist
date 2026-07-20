"use client";

import dynamic from "next/dynamic";
import { useCallback, useRef } from "react";
import { checkInByQrToken } from "@/app/actions/attendance";
import type { CheckInResult } from "@/lib/types";
import { mapKioskError, type KioskErrorInfo } from "./kiosk-error-screen";

const Scanner = dynamic(
  () => import("@yudiel/react-qr-scanner").then((m) => m.Scanner),
  { ssr: false },
);

type KioskQrScannerProps = {
  onResult: (result: CheckInResult) => void;
  onError: (error: KioskErrorInfo) => void;
};

export function KioskQrScanner({ onResult, onError }: KioskQrScannerProps) {
  const processing = useRef(false);
  const lastToken = useRef<string | null>(null);

  const handleScan = useCallback(
    async (detected: { rawValue: string }[]) => {
      const token = detected[0]?.rawValue?.trim();
      if (!token) return;
      if (processing.current) return;
      // Ignore rapid re-fires of the same code
      if (lastToken.current === token) return;

      processing.current = true;
      lastToken.current = token;

      try {
        const { data, error } = await checkInByQrToken({ token });
        if (error || !data) {
          onError(mapKioskError(error));
          return;
        }
        onResult(data);
      } catch {
        onError(mapKioskError("Something went wrong. Try again."));
      } finally {
        // Keep lock briefly so the same invalid QR can't spam again
        window.setTimeout(() => {
          processing.current = false;
        }, 2500);
        window.setTimeout(() => {
          lastToken.current = null;
        }, 4000);
      }
    },
    [onResult, onError],
  );

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <Scanner
        onScan={handleScan}
        constraints={{ facingMode: "environment" }}
        components={{ finder: false }}
        scanDelay={1500}
        allowMultiple={false}
        styles={{
          container: { width: "100%", height: "100%" },
          video: { borderRadius: "50%", objectFit: "cover" },
        }}
      />
    </div>
  );
}
