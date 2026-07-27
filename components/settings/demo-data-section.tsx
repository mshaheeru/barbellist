"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Database, X } from "lucide-react";
import { notifications } from "@mantine/notifications";
import { clearDemoData, loadDemoData } from "@/app/actions/seed";
import styles from "./settings.module.css";
import modalStyles from "@/components/modals/package-modal.module.css";

type ConfirmKind = "load" | "clear" | null;

export function DemoDataSection() {
  const router = useRouter();
  const [confirm, setConfirm] = useState<ConfirmKind>(null);
  const [pending, startTransition] = useTransition();

  const handleConfirm = () => {
    if (!confirm) return;
    const kind = confirm;
    startTransition(async () => {
      const { error } =
        kind === "load" ? await loadDemoData() : await clearDemoData();
      if (error) {
        notifications.show({ color: "red", message: error });
        return;
      }
      setConfirm(null);
      if (kind === "load") {
        notifications.show({
          color: "green",
          message: "Demo data loaded successfully",
        });
        router.push("/dashboard");
        router.refresh();
      } else {
        notifications.show({
          color: "green",
          message: "Demo data cleared",
        });
        router.refresh();
      }
    });
  };

  return (
    <>
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>
            <Database size={18} className={styles.sectionIcon} strokeWidth={2} />
            Demo Data
          </h2>
        </div>

        <div className={styles.dangerRow}>
          <div>
            <p className={styles.dangerTitle}>Load Demo Data</p>
            <p className={styles.dangerDesc}>
              Populate this gym with sample packages, staff, members, fees,
              attendance, expenses, and inventory for pitching demos.
            </p>
          </div>
          <button
            type="button"
            className={styles.outlineBtn}
            onClick={() => setConfirm("load")}
            disabled={pending}
          >
            Load Demo Data
          </button>
        </div>

        <div className={styles.dangerRow}>
          <div>
            <p className={styles.dangerTitle}>Clear Demo Data</p>
            <p className={styles.dangerDesc}>
              Remove all records tagged as demo seed. Your real gym data is not
              affected.
            </p>
          </div>
          <button
            type="button"
            className={styles.outlineBtn}
            onClick={() => setConfirm("clear")}
            disabled={pending}
          >
            Clear Demo Data
          </button>
        </div>
      </section>

      {confirm ? (
        <div
          className={modalStyles.overlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="demo-data-confirm-title"
          onClick={(e) => {
            if (e.target === e.currentTarget && !pending) setConfirm(null);
          }}
        >
          <div className={modalStyles.deleteModal}>
            <div className={modalStyles.modalHeader}>
              <h2
                id="demo-data-confirm-title"
                className={modalStyles.modalTitle}
              >
                {confirm === "load" ? "Load Demo Data" : "Clear Demo Data"}
              </h2>
              <button
                type="button"
                className={modalStyles.closeBtn}
                onClick={() => setConfirm(null)}
                disabled={pending}
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
            <div className={modalStyles.deleteBody}>
              <p className={modalStyles.deleteText}>
                {confirm === "load"
                  ? "This will populate your gym with sample data for demo purposes. Existing data will not be affected."
                  : "This will permanently delete all demo-seeded packages, staff, members, and related records. Your other data will not be affected."}
              </p>
              <div className={modalStyles.deleteFooter}>
                <button
                  type="button"
                  className={modalStyles.cancelBtn}
                  onClick={() => setConfirm(null)}
                  disabled={pending}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={
                    confirm === "clear"
                      ? modalStyles.deleteConfirmBtn
                      : modalStyles.saveBtn
                  }
                  onClick={handleConfirm}
                  disabled={pending}
                >
                  {pending
                    ? confirm === "load"
                      ? "Loading…"
                      : "Clearing…"
                    : confirm === "load"
                      ? "Load Demo Data"
                      : "Clear Demo Data"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
