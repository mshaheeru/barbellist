"use client";

import { Building2, Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createBranch, updateBranch } from "@/app/actions/settings";
import { selectBranch } from "@/lib/auth/branches";
import { createClient } from "@/lib/supabase/client";
import { useGym } from "@/components/gym-provider";
import type { BranchSummary } from "@/lib/types";
import styles from "./settings.module.css";

type BranchesSectionProps = {
  branches: BranchSummary[];
  currentGymId: string;
};

export function BranchesSection({
  branches: initial,
  currentGymId,
}: BranchesSectionProps) {
  const router = useRouter();
  const { refresh } = useGym();
  const [branches, setBranches] = useState(initial);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCity, setNewCity] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editCity, setEditCity] = useState("");
  const [pending, startTransition] = useTransition();
  const [switchingId, setSwitchingId] = useState<string | null>(null);

  const handleCreate = () => {
    if (!newName.trim()) {
      notifications.show({ color: "red", message: "Branch name is required" });
      return;
    }
    startTransition(async () => {
      const name = newName.trim();
      const city = newCity.trim() || null;
      const { data, error } = await createBranch({
        name,
        city,
        address: null,
        phone: null,
      });
      if (error || !data) {
        notifications.show({
          color: "red",
          message: error ?? "Failed to create branch",
        });
        return;
      }
      notifications.show({ color: "green", message: "Branch created" });
      setNewName("");
      setNewCity("");
      setAdding(false);
      setBranches((prev) => [
        ...prev,
        {
          id: data.id,
          name,
          slug: "",
          city,
          address: null,
        },
      ]);
      router.refresh();
      await refresh();
    });
  };

  const handleRename = (branch: BranchSummary) => {
    if (!editName.trim()) {
      notifications.show({ color: "red", message: "Branch name is required" });
      return;
    }
    startTransition(async () => {
      const { error } = await updateBranch({
        gymId: branch.id,
        name: editName.trim(),
        city: editCity.trim() || null,
        address: branch.address,
      });
      if (error) {
        notifications.show({ color: "red", message: error });
        return;
      }
      setBranches((prev) =>
        prev.map((b) =>
          b.id === branch.id
            ? { ...b, name: editName.trim(), city: editCity.trim() || null }
            : b,
        ),
      );
      setEditingId(null);
      notifications.show({ color: "green", message: "Branch updated" });
      router.refresh();
      await refresh();
    });
  };

  const handleSwitch = (gymId: string) => {
    if (gymId === currentGymId) return;
    setSwitchingId(gymId);
    startTransition(async () => {
      const { error } = await selectBranch(gymId);
      if (error) {
        notifications.show({ color: "red", message: error });
        setSwitchingId(null);
        return;
      }
      const supabase = createClient();
      await supabase.auth.refreshSession();
      await refresh();
      notifications.show({ color: "green", message: "Switched branch" });
      router.push("/dashboard");
      router.refresh();
    });
  };

  return (
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <h2 className={styles.sectionTitle}>
          <Building2 size={18} className={styles.sectionIcon} strokeWidth={2} />
          Branches
        </h2>
        {!adding ? (
          <button
            type="button"
            className={styles.outlineBtn}
            onClick={() => setAdding(true)}
            disabled={pending}
          >
            Add branch
          </button>
        ) : null}
      </div>

      <p className={styles.dangerDesc} style={{ marginBottom: "1rem" }}>
        Each branch has its own members, staff, packages, and operations.
        Billing is shared across your organization.
      </p>

      <div className={styles.billingCard}>
        {branches.map((branch) => {
          const isCurrent = branch.id === currentGymId;
          const isEditing = editingId === branch.id;

          return (
            <div key={branch.id} className={styles.billingRow}>
              <div style={{ flex: 1, minWidth: 0 }}>
                {isEditing ? (
                  <div style={{ display: "grid", gap: 8 }}>
                    <TextInput
                      value={editName}
                      onChange={(e) => setEditName(e.currentTarget.value)}
                      placeholder="Branch name"
                    />
                    <TextInput
                      value={editCity}
                      onChange={(e) => setEditCity(e.currentTarget.value)}
                      placeholder="City (optional)"
                    />
                    <div style={{ display: "flex", gap: 8 }}>
                      <Button
                        size="xs"
                        variant="light"
                        disabled={pending}
                        onClick={() => handleRename(branch)}
                      >
                        Save
                      </Button>
                      <Button
                        size="xs"
                        variant="subtle"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <span className={styles.billingValue}>
                      {branch.name}
                      {isCurrent ? (
                        <span
                          className={styles.planPill}
                          style={{ marginLeft: 8 }}
                        >
                          Current
                        </span>
                      ) : null}
                    </span>
                    {branch.city ? (
                      <div className={styles.billingLabel}>{branch.city}</div>
                    ) : null}
                  </>
                )}
              </div>
              {!isEditing ? (
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  {!isCurrent ? (
                    <button
                      type="button"
                      className={styles.outlineBtn}
                      disabled={pending}
                      onClick={() => handleSwitch(branch.id)}
                    >
                      {switchingId === branch.id ? (
                        <Loader2 size={14} />
                      ) : (
                        "Switch"
                      )}
                    </button>
                  ) : (
                    <span aria-hidden>
                      <Check size={16} />
                    </span>
                  )}
                  <button
                    type="button"
                    className={styles.outlineBtn}
                    onClick={() => {
                      setEditingId(branch.id);
                      setEditName(branch.name);
                      setEditCity(branch.city ?? "");
                    }}
                  >
                    Rename
                  </button>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {adding ? (
        <div className={styles.billingCard} style={{ marginTop: "1rem" }}>
          <TextInput
            label="Branch name"
            value={newName}
            onChange={(e) => setNewName(e.currentTarget.value)}
            placeholder="e.g. DHA Phase 5"
            mb="sm"
          />
          <TextInput
            label="City"
            value={newCity}
            onChange={(e) => setNewCity(e.currentTarget.value)}
            placeholder="Optional"
            mb="sm"
          />
          <div style={{ display: "flex", gap: 8 }}>
            <Button disabled={pending} onClick={handleCreate}>
              {pending ? "Creating…" : "Create branch"}
            </Button>
            <Button
              variant="subtle"
              onClick={() => {
                setAdding(false);
                setNewName("");
                setNewCity("");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
