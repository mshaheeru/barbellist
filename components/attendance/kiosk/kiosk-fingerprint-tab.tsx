import { Fingerprint } from "lucide-react";
import styles from "./kiosk.module.css";

export function KioskFingerprintTab() {
  return (
    <div className={styles.fingerprintPanel}>
      <Fingerprint size={80} strokeWidth={1.4} color="#C9861B" />
      <div className={styles.fingerprintTitle} style={{ marginTop: 24 }}>
        Fingerprint check-in
      </div>
      <p style={{ fontSize: 17, maxWidth: 400, margin: "0 auto" }}>
        Coming soon — connect a fingerprint scanner at your front desk to enable
        one-touch staff and member check-in.
      </p>
    </div>
  );
}
