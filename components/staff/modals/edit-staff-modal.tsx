"use client";

import { useState, useTransition } from "react";
import { Modal, TextInput, NumberInput, Select } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { updateStaff } from "@/app/actions/staff";
import { useGym } from "@/components/gym-provider";
import type { StaffProfile, StaffRole } from "@/lib/types";

type EditStaffModalProps = {
  opened: boolean;
  onClose: () => void;
  staff: StaffProfile;
};

const ROLE_OPTIONS = [
  { value: "trainer", label: "Trainer" },
  { value: "cashier", label: "Front Desk / Cashier" },
  { value: "cleaner", label: "Cleaner" },
  { value: "manager", label: "Manager" },
  { value: "other", label: "Other" },
  { value: "owner", label: "Owner" },
];

export function EditStaffModal({
  opened,
  onClose,
  staff,
}: EditStaffModalProps) {
  const router = useRouter();
  const { role: actorRole } = useGym();
  const [pending, startTransition] = useTransition();
  const [role, setRole] = useState<string | null>(staff.role);
  const [salary, setSalary] = useState<number | string>(
    staff.monthly_salary ?? 0,
  );
  const [commission, setCommission] = useState<number | string>(
    staff.commission_rate ?? 0,
  );

  const roleOptions =
    actorRole === "owner"
      ? ROLE_OPTIONS
      : ROLE_OPTIONS.filter((r) => r.value !== "owner");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      const payload: Parameters<typeof updateStaff>[1] = {
        name: String(fd.get("name")),
        phone: String(fd.get("phone") || "") || null,
        whatsapp: String(fd.get("whatsapp") || "") || null,
        email: String(fd.get("email") || "") || null,
        role: (role as StaffRole) || staff.role,
        joining_date: String(fd.get("joining_date") || "") || null,
      };

      if (actorRole === "owner") {
        payload.monthly_salary = Number(salary) || 0;
        payload.commission_rate = Number(commission) || 0;
      }

      const { error } = await updateStaff(staff.id, payload);
      if (error) {
        notifications.show({ color: "red", message: error });
        return;
      }
      notifications.show({ color: "green", message: "Staff updated." });
      onClose();
      router.refresh();
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Edit Staff"
      centered
      radius="md"
      size="lg"
    >
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 14 }}
      >
        <TextInput
          label="Name"
          name="name"
          defaultValue={staff.name}
          required
        />
        <Select
          label="Role"
          data={roleOptions}
          value={role}
          onChange={setRole}
        />
        <TextInput
          label="Phone"
          name="phone"
          defaultValue={staff.phone ?? ""}
        />
        <TextInput
          label="WhatsApp"
          name="whatsapp"
          defaultValue={staff.whatsapp ?? ""}
        />
        <TextInput
          label="Email"
          name="email"
          type="email"
          defaultValue={staff.email ?? ""}
        />
        {actorRole === "owner" ? (
          <>
            <NumberInput
              label="Monthly Salary"
              value={salary}
              onChange={setSalary}
              min={0}
              thousandSeparator=","
            />
            <NumberInput
              label="Commission Rate (%)"
              value={commission}
              onChange={setCommission}
              min={0}
              max={100}
            />
          </>
        ) : null}
        <TextInput
          label="Joining Date"
          name="joining_date"
          type="date"
          defaultValue={staff.joining_date?.slice(0, 10) ?? ""}
        />
        <button
          type="submit"
          disabled={pending}
          style={{
            background: "#1B5E3C",
            color: "#fff",
            border: "none",
            borderRadius: 11,
            padding: "12px 18px",
            fontWeight: 600,
            fontSize: 14,
            cursor: pending ? "wait" : "pointer",
          }}
        >
          {pending ? "Saving…" : "Save Changes"}
        </button>
      </form>
    </Modal>
  );
}
