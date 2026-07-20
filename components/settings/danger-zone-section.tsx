"use client";

import { AlertTriangle } from "lucide-react";
import { useState, useTransition } from "react";
import { notifications } from "@mantine/notifications";
import { exportAllData } from "@/app/actions/settings";
import { DeleteGymModal } from "@/components/modals/delete-gym-modal";
import styles from "./settings.module.css";

type DangerZoneSectionProps = {
  gymName: string;
};

export function DangerZoneSection({ gymName }: DangerZoneSectionProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleExport = () => {
    startTransition(async () => {
      const { data, error } = await exportAllData();
      if (error || !data) {
        notifications.show({
          color: "red",
          message: error ?? "Export failed",
        });
        return;
      }

      const binary = atob(data.base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: "application/zip" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = data.filename;
      a.click();
      URL.revokeObjectURL(url);

      notifications.show({
        color: "green",
        message: "Export downloaded",
      });
    });
  };

  return (
    <section className={`${styles.section} ${styles.sectionDanger}`}>
      <div className={styles.sectionHead}>
        <h2 className={`${styles.sectionTitle} ${styles.sectionTitleDanger}`}>
          <AlertTriangle
            size={18}
            className={styles.sectionIconDanger}
            strokeWidth={2}
          />
          Danger Zone
        </h2>
      </div>

      <div className={styles.dangerRow}>
        <div>
          <p className={styles.dangerTitle}>Export All Data</p>
          <p className={styles.dangerDesc}>
            Download all your gym data as CSV files in a ZIP archive.
          </p>
        </div>
        <button
          type="button"
          className={styles.outlineBtn}
          onClick={handleExport}
          disabled={pending}
        >
          {pending ? "Exporting…" : "Export"}
        </button>
      </div>

      <div className={styles.dangerRow}>
        <div>
          <p className={styles.dangerTitle}>Delete Gym</p>
          <p className={styles.dangerDesc}>
            Permanently delete your gym and all associated data. This cannot be
            undone.
          </p>
        </div>
        <button
          type="button"
          className={styles.dangerBtn}
          onClick={() => setDeleteOpen(true)}
        >
          Delete Gym
        </button>
      </div>

      <DeleteGymModal
        opened={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        gymName={gymName}
      />
    </section>
  );
}
