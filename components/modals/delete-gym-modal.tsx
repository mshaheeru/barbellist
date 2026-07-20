"use client";

import { useState, useTransition } from "react";
import { X } from "lucide-react";
import { TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { deleteGym } from "@/app/actions/settings";
import styles from "./package-modal.module.css";

type DeleteGymModalProps = {
  opened: boolean;
  onClose: () => void;
  gymName: string;
};

export function DeleteGymModal({
  opened,
  onClose,
  gymName,
}: DeleteGymModalProps) {
  const [confirm, setConfirm] = useState("");
  const [pending, startTransition] = useTransition();

  if (!opened) return null;

  const matched = confirm.trim() === gymName.trim();

  const handleDelete = () => {
    if (!matched) return;
    startTransition(async () => {
      const { error } = await deleteGym(confirm);
      if (error) {
        notifications.show({ color: "red", message: error });
      }
      // On success, server redirects to /
    });
  };

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-gym-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !pending) onClose();
      }}
    >
      <div className={styles.deleteModal}>
        <div className={styles.modalHeader}>
          <h2 id="delete-gym-title" className={styles.modalTitle}>
            Delete Gym
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
            This will permanently delete <strong>{gymName}</strong> and all
            members, payments, attendance, and staff data. Type the gym name to
            confirm.
          </p>
          <TextInput
            label="Gym name"
            value={confirm}
            onChange={(e) => setConfirm(e.currentTarget.value)}
            placeholder={gymName}
            mb="md"
          />
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
              disabled={pending || !matched}
            >
              {pending ? "Deleting…" : "Delete Gym"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
