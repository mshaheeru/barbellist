"use client";

import { Modal } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { notifications } from "@mantine/notifications";
import { deleteMember } from "@/app/actions/members";
import type { MemberProfile } from "@/lib/types";
import styles from "../member-profile.module.css";

type DeleteMemberModalProps = {
  opened: boolean;
  onClose: () => void;
  member: MemberProfile;
};

export function DeleteMemberModal({
  opened,
  onClose,
  member,
}: DeleteMemberModalProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const { error } = await deleteMember(member.id);
      if (error) {
        notifications.show({ color: "red", message: error });
        return;
      }
      notifications.show({
        color: "green",
        message: `${member.name} has been removed.`,
      });
      router.push("/dashboard/members");
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Delete Member"
      centered
      radius="md"
    >
      <p style={{ fontSize: 14, color: "#4A4A42", marginBottom: 20 }}>
        Are you sure you want to remove <strong>{member.name}</strong>? This
        will cancel their membership. This action can be reversed by an admin
        in the database.
      </p>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button type="button" className={styles.actionBtn} onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
          onClick={handleDelete}
          disabled={pending}
        >
          {pending ? "Deleting…" : "Delete Member"}
        </button>
      </div>
    </Modal>
  );
}
