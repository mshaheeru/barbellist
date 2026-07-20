"use client";

import { Select, TextInput } from "@mantine/core";
import { Plus, Users } from "lucide-react";
import { useState, useTransition } from "react";
import { notifications } from "@mantine/notifications";
import {
  inviteStaffMember,
  removeStaffAccess,
  updateStaffRole,
} from "@/app/actions/settings";
import { getInitials } from "@/lib/members/format";
import type { SettingsStaffRow } from "@/lib/settings/types";
import type { StaffRole } from "@/lib/types";
import styles from "./settings.module.css";

const ROLE_OPTIONS: { value: StaffRole; label: string }[] = [
  { value: "owner", label: "Owner" },
  { value: "manager", label: "Manager" },
  { value: "cashier", label: "Cashier" },
  { value: "trainer", label: "Trainer" },
  { value: "cleaner", label: "Cleaner" },
  { value: "other", label: "Other" },
];

type StaffAccessSectionProps = {
  staff: SettingsStaffRow[];
  currentUserIsOwner: boolean;
  onStaffChange: (next: SettingsStaffRow[]) => void;
};

export function StaffAccessSection({
  staff,
  currentUserIsOwner,
  onStaffChange,
}: StaffAccessSectionProps) {
  const [showInvite, setShowInvite] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<
    "manager" | "cashier" | "trainer" | "cleaner" | "other"
  >("cashier");
  const [pending, startTransition] = useTransition();

  const handleRoleChange = (staffId: string, role: StaffRole) => {
    const prev = staff;
    onStaffChange(staff.map((s) => (s.id === staffId ? { ...s, role } : s)));
    startTransition(async () => {
      const { error } = await updateStaffRole(staffId, role);
      if (error) {
        onStaffChange(prev);
        notifications.show({ color: "red", message: error });
        return;
      }
      notifications.show({ color: "green", message: "Role updated" });
    });
  };

  const handleRemove = (row: SettingsStaffRow) => {
    startTransition(async () => {
      const { error } = await removeStaffAccess(row.id);
      if (error) {
        notifications.show({ color: "red", message: error });
        return;
      }
      onStaffChange(
        staff.map((s) =>
          s.id === row.id
            ? { ...s, auth_user_id: null, has_app_access: false }
            : s,
        ),
      );
      notifications.show({
        color: "green",
        message: `App access removed for ${row.name}`,
      });
    });
  };

  const handleInvite = () => {
    startTransition(async () => {
      const { data, error } = await inviteStaffMember({
        name: inviteName,
        email: inviteEmail,
        role: inviteRole as
          | "manager"
          | "cashier"
          | "trainer"
          | "cleaner"
          | "other",
      });
      if (error || !data) {
        notifications.show({
          color: "red",
          message: error ?? "Invite failed",
        });
        return;
      }
      onStaffChange([
        ...staff,
        {
          id: data.id,
          name: inviteName.trim(),
          email: inviteEmail,
          photo_url: null,
          role: inviteRole,
          status: "active",
          auth_user_id: "pending",
          has_app_access: true,
        },
      ]);
      setInviteName("");
      setInviteEmail("");
      setInviteRole("cashier");
      setShowInvite(false);
      notifications.show({
        color: "green",
        message: "Invite sent",
      });
    });
  };

  return (
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <h2 className={styles.sectionTitle}>
          <Users size={18} className={styles.sectionIcon} strokeWidth={2} />
          Staff & Access
        </h2>
      </div>

      <table className={styles.staffTable}>
        <thead>
          <tr>
            <th>Staff</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {staff.map((row) => (
            <tr key={row.id}>
              <td>
                <div className={styles.staffNameCell}>
                  <div className={styles.staffAvatar}>
                    {row.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={row.photo_url} alt="" />
                    ) : (
                      getInitials(row.name)
                    )}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{row.name}</div>
                    {row.email ? (
                      <div style={{ fontSize: 12, color: "#8a8a80" }}>
                        {row.email}
                      </div>
                    ) : null}
                  </div>
                </div>
              </td>
              <td>
                <Select
                  data={ROLE_OPTIONS.filter(
                    (o) =>
                      o.value !== "owner" ||
                      currentUserIsOwner ||
                      row.role === "owner",
                  )}
                  value={row.role}
                  onChange={(v) => {
                    if (v) handleRoleChange(row.id, v as StaffRole);
                  }}
                  allowDeselect={false}
                  size="xs"
                  w={130}
                  disabled={pending || (row.role === "owner" && !currentUserIsOwner)}
                />
              </td>
              <td>
                <span
                  className={`${styles.statusPill} ${
                    row.status !== "active" ? styles.statusInactive : ""
                  }`}
                >
                  {row.status}
                </span>
              </td>
              <td>
                <button
                  type="button"
                  className={styles.removeAccessBtn}
                  disabled={
                    pending ||
                    !row.has_app_access ||
                    row.role === "owner"
                  }
                  onClick={() => handleRemove(row)}
                >
                  {row.has_app_access ? "Remove Access" : "No access"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        type="button"
        className={styles.inviteToggle}
        onClick={() => setShowInvite((v) => !v)}
      >
        <Plus size={15} strokeWidth={2.4} />
        Invite Staff Member
      </button>

      {showInvite ? (
        <div className={styles.inviteForm}>
          <TextInput
            label="Name"
            value={inviteName}
            onChange={(e) => setInviteName(e.currentTarget.value)}
            placeholder="Full name"
          />
          <TextInput
            label="Email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.currentTarget.value)}
            placeholder="email@example.com"
          />
          <div>
            <Select
              label="Role"
              data={ROLE_OPTIONS.filter((o) => o.value !== "owner")}
              value={inviteRole}
              onChange={(v) =>
                setInviteRole(
                  (v as
                    | "manager"
                    | "cashier"
                    | "trainer"
                    | "cleaner"
                    | "other") || "cashier",
                )
              }
              allowDeselect={false}
              mb={8}
            />
            <button
              type="button"
              className={styles.inviteSendBtn}
              disabled={pending || !inviteName.trim() || !inviteEmail.trim()}
              onClick={handleInvite}
            >
              {pending ? "Sending…" : "Send Invite"}
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
