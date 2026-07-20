"use client";

import { Modal, TextInput, Textarea } from "@mantine/core";
import { useState, useTransition } from "react";
import { notifications } from "@mantine/notifications";
import { updateMember } from "@/app/actions/members";
import type { MemberProfile } from "@/lib/types";
import styles from "../member-profile.module.css";

type EditMemberModalProps = {
  opened: boolean;
  onClose: () => void;
  member: MemberProfile;
};

export function EditMemberModal({
  opened,
  onClose,
  member,
}: EditMemberModalProps) {
  const [pending, startTransition] = useTransition();
  const [gender, setGender] = useState<string | null>(member.gender);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const { error } = await updateMember(member.id, {
        name: String(fd.get("name")),
        phone: String(fd.get("phone")),
        whatsapp: String(fd.get("whatsapp") || "") || null,
        email: String(fd.get("email") || "") || null,
        address: String(fd.get("address") || "") || null,
        emergency_contact_name:
          String(fd.get("emergency_contact_name") || "") || null,
        emergency_contact_phone:
          String(fd.get("emergency_contact_phone") || "") || null,
        gender: (gender as "male" | "female" | "other") || null,
      });
      if (error) {
        notifications.show({ color: "red", message: error });
        return;
      }
      notifications.show({ color: "green", message: "Member updated." });
      onClose();
    });
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Edit Member" centered radius="md" size="lg">
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <TextInput label="Name" name="name" defaultValue={member.name} required />
        <TextInput label="Phone" name="phone" defaultValue={member.phone ?? ""} required />
        <TextInput label="WhatsApp" name="whatsapp" defaultValue={member.whatsapp ?? ""} />
        <TextInput label="Email" name="email" type="email" defaultValue={member.email ?? ""} />
        <Textarea label="Address" name="address" defaultValue={member.address ?? ""} minRows={2} />
        <TextInput
          label="Emergency contact name"
          name="emergency_contact_name"
          defaultValue={member.emergency_contact_name ?? ""}
        />
        <TextInput
          label="Emergency contact phone"
          name="emergency_contact_phone"
          defaultValue={member.emergency_contact_phone ?? ""}
        />
        <label style={{ fontSize: 14, fontWeight: 500 }}>Gender</label>
        <select
          value={gender ?? ""}
          onChange={(e) => setGender(e.target.value || null)}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #EAE4D8",
            fontSize: 14,
          }}
        >
          <option value="">—</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
        <button
          type="submit"
          className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
          disabled={pending}
        >
          {pending ? "Saving…" : "Save Changes"}
        </button>
      </form>
    </Modal>
  );
}
