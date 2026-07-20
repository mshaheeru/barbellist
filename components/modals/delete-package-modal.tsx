"use client";

import { useTransition } from "react";
import { notifications } from "@mantine/notifications";
import { X } from "lucide-react";
import { deletePackage } from "@/app/actions/packages";
import type { Package } from "@/lib/types";
import styles from "./package-modal.module.css";

type DeletePackageModalProps = {
  opened: boolean;
  onClose: () => void;
  package: Package | null;
  onDeleted: (id: string) => void;
};

export function DeletePackageModal({
  opened,
  onClose,
  package: pkg,
  onDeleted,
}: DeletePackageModalProps) {
  const [pending, startTransition] = useTransition();

  if (!opened || !pkg) return null;

  const handleDelete = () => {
    startTransition(async () => {
      const { error } = await deletePackage(pkg.id);
      if (error) {
        notifications.show({ color: "red", message: error });
        return;
      }
      notifications.show({
        color: "green",
        message: `${pkg.name} deleted`,
      });
      onDeleted(pkg.id);
    });
  };

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-package-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !pending) onClose();
      }}
    >
      <div className={styles.deleteModal}>
        <div className={styles.modalHeader}>
          <h2 id="delete-package-title" className={styles.modalTitle}>
            Delete Package
          </h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            disabled={pending}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
        <div className={styles.deleteBody}>
          <p className={styles.deleteText}>
            Delete <strong>{pkg.name}</strong>? Members currently on this
            package won&apos;t be affected, but new members can&apos;t select
            it.
          </p>
          <div className={styles.deleteFooter}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={pending}
            >
              Cancel
            </button>
            <button
              type="button"
              className={styles.deleteConfirmBtn}
              onClick={handleDelete}
              disabled={pending}
            >
              {pending ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
