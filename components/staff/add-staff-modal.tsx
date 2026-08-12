"use client";

import { useState, useTransition } from "react";
import {
  Modal,
  TextInput,
  NumberInput,
  Select,
  Switch,
  PasswordInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { createStaff } from "@/app/actions/staff";
import { useGym } from "@/components/gym-provider";
import type { StaffRole } from "@/lib/types";

type AddStaffModalProps = {
  opened: boolean;
  onClose: () => void;
};

const ROLE_OPTIONS = [
  { value: "trainer", label: "Trainer" },
  { value: "cashier", label: "Front Desk / Cashier" },
  { value: "cleaner", label: "Cleaner" },
  { value: "manager", label: "Manager" },
  { value: "other", label: "Other" },
];

export function AddStaffModal({ opened, onClose }: AddStaffModalProps) {
  const router = useRouter();
  const { supabase, gymId, role: actorRole } = useGym();
  const [pending, startTransition] = useTransition();
  const [role, setRole] = useState<string | null>("trainer");
  const [giveAccess, setGiveAccess] = useState(false);
  const [salary, setSalary] = useState<number | string>(0);
  const [commission, setCommission] = useState<number | string>(0);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const roleOptions =
    actorRole === "owner"
      ? [...ROLE_OPTIONS, { value: "owner", label: "Owner" }]
      : ROLE_OPTIONS;

  const reset = () => {
    setRole("trainer");
    setGiveAccess(false);
    setSalary(0);
    setCommission(0);
    setPhotoUrl(null);
  };

  const handlePhoto = async (file: File | null) => {
    if (!file || !gymId) return;
    setUploading(true);
    try {
      const id = crypto.randomUUID();
      const path = `${gymId}/${id}.webp`;
      const { error } = await supabase.storage
        .from("staff-photos")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (error) throw error;
      const {
        data: { publicUrl },
      } = supabase.storage.from("staff-photos").getPublicUrl(path);
      setPhotoUrl(publicUrl);
    } catch (e) {
      notifications.show({
        color: "red",
        message: e instanceof Error ? e.message : "Photo upload failed",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      const { data, error } = await createStaff({
        name: String(fd.get("name") ?? ""),
        role: (role as StaffRole) || "trainer",
        phone: String(fd.get("phone") || "") || null,
        whatsapp: String(fd.get("whatsapp") || "") || null,
        email: String(fd.get("email") || "") || null,
        monthly_salary: Number(salary) || 0,
        commission_rate: Number(commission) || 0,
        joining_date: String(fd.get("joining_date") || "") || null,
        photo_url: photoUrl,
        give_app_access: giveAccess,
        password: giveAccess ? String(fd.get("password") || "") : null,
      });

      if (error) {
        notifications.show({ color: "red", message: error });
        return;
      }

      notifications.show({ color: "green", message: "Staff member added." });
      reset();
      onClose();
      if (data?.id) {
        router.push(`/dashboard/staff/${data.id}`);
        router.refresh();
      } else {
        router.refresh();
      }
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Add Staff Member"
      centered
      radius="md"
      size="lg"
    >
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 14 }}
      >
        <TextInput label="Name" name="name" required />
        <Select
          label="Role"
          data={roleOptions}
          value={role}
          onChange={setRole}
          required
        />
        <TextInput label="Phone" name="phone" />
        <TextInput label="WhatsApp" name="whatsapp" />
        <TextInput label="Email" name="email" type="email" />
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
        <TextInput
          label="Joining Date"
          name="joining_date"
          type="date"
          defaultValue={new Date().toISOString().slice(0, 10)}
        />
        <div>
          <label style={{ fontSize: 14, fontWeight: 500 }}>Photo</label>
          <input
            type="file"
            accept="image/*"
            style={{ display: "block", marginTop: 6, fontSize: 13 }}
            onChange={(e) => void handlePhoto(e.target.files?.[0] ?? null)}
            disabled={uploading}
          />
          {photoUrl ? (
            <span style={{ fontSize: 12, color: "#2E7D4F" }}>Photo ready</span>
          ) : null}
        </div>
        <Switch
          label="Give app access"
          checked={giveAccess}
          onChange={(e) => setGiveAccess(e.currentTarget.checked)}
        />
        {giveAccess ? (
          <PasswordInput
            label="Temporary password"
            name="password"
            required
            description="Minimum 6 characters. Staff can change it after first login."
          />
        ) : null}
        <button
          type="submit"
          disabled={pending || uploading}
          style={{
            marginTop: 8,
            background: "var(--color-primary)",
            color: "#fff",
            border: "none",
            borderRadius: 11,
            padding: "12px 18px",
            fontWeight: 600,
            fontSize: 14,
            cursor: pending ? "wait" : "pointer",
          }}
        >
          {pending ? "Saving…" : "Add Staff Member"}
        </button>
      </form>
    </Modal>
  );
}
