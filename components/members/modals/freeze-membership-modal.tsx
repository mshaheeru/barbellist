"use client";

import { Modal, TextInput, Textarea } from "@mantine/core";
import { useTransition } from "react";
import { notifications } from "@mantine/notifications";
import { freezeMember, unfreezeMember } from "@/app/actions/members";
import type { MemberProfile } from "@/lib/types";
import styles from "../member-profile.module.css";

type FreezeMembershipModalProps = {
  opened: boolean;
  onClose: () => void;
  member: MemberProfile;
};

export function FreezeMembershipModal({
  opened,
  onClose,
  member,
}: FreezeMembershipModalProps) {
  const [pending, startTransition] = useTransition();
  const isFrozen = member.status === "frozen";

  const handleUnfreeze = () => {
    startTransition(async () => {
      const { error } = await unfreezeMember(member.id);
      if (error) {
        notifications.show({ color: "red", message: error });
        return;
      }
      notifications.show({ color: "green", message: "Membership unfrozen." });
      onClose();
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const { error } = await freezeMember(member.id, {
        freeze_start: String(fd.get("freeze_start")),
        freeze_end: String(fd.get("freeze_end")),
        reason: String(fd.get("reason")),
      });
      if (error) {
        notifications.show({ color: "red", message: error });
        return;
      }
      notifications.show({ color: "green", message: "Membership frozen." });
      onClose();
    });
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isFrozen ? "Manage Freeze" : "Freeze Membership"}
      centered
      radius="md"
    >
      {isFrozen ? (
        <>
          <p style={{ fontSize: 14, color: "#4A4A42", marginBottom: 16 }}>
            {member.name} is currently frozen
            {member.freeze_reason ? `: ${member.freeze_reason}` : "."}
          </p>
          <button
            type="button"
            className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
            onClick={handleUnfreeze}
            disabled={pending}
          >
            {pending ? "Unfreezing…" : "Unfreeze Membership"}
          </button>
        </>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <TextInput
            label="Freeze start"
            name="freeze_start"
            type="date"
            defaultValue={today}
            required
          />
          <TextInput
            label="Freeze end"
            name="freeze_end"
            type="date"
            required
          />
          <Textarea
            label="Reason"
            name="reason"
            placeholder="e.g. Travel, injury recovery"
            required
            minRows={2}
          />
          <button
            type="submit"
            className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
            disabled={pending}
          >
            {pending ? "Saving…" : "Freeze Membership"}
          </button>
        </form>
      )}
    </Modal>
  );
}
