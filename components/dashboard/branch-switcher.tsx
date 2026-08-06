"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Check, Building2 } from "lucide-react";
import { Menu } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useGym } from "@/components/gym-provider";
import { selectBranch } from "@/lib/auth/branches";
import { createClient } from "@/lib/supabase/client";
import styles from "./branch-switcher.module.css";

export function BranchSwitcher() {
  const router = useRouter();
  const { role, branches, gymId, gymName, refresh } = useGym();
  const [pending, startTransition] = useTransition();
  const [opened, setOpened] = useState(false);

  if (role !== "owner" || branches.length < 2) {
    return null;
  }

  const switchTo = (id: string) => {
    if (id === gymId || pending) return;
    startTransition(async () => {
      const { error } = await selectBranch(id);
      if (error) {
        notifications.show({ color: "red", message: error });
        return;
      }
      const supabase = createClient();
      await supabase.auth.refreshSession();
      await refresh();
      setOpened(false);
      notifications.show({ color: "green", message: "Switched branch" });
      router.refresh();
    });
  };

  return (
    <Menu
      opened={opened}
      onChange={setOpened}
      position="bottom-start"
      withinPortal
    >
      <Menu.Target>
        <button
          type="button"
          className={styles.trigger}
          disabled={pending}
          aria-label="Switch branch"
        >
          <Building2 size={15} strokeWidth={2} />
          <span className={styles.label}>{gymName ?? "Branch"}</span>
          <ChevronDown size={14} strokeWidth={2} />
        </button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>Branches</Menu.Label>
        {branches.map((branch) => (
          <Menu.Item
            key={branch.id}
            onClick={() => switchTo(branch.id)}
            rightSection={
              branch.id === gymId ? <Check size={14} /> : undefined
            }
            disabled={pending}
          >
            {branch.name}
            {branch.city ? (
              <span className={styles.meta}> · {branch.city}</span>
            ) : null}
          </Menu.Item>
        ))}
        <Menu.Divider />
        <Menu.Item onClick={() => router.push("/dashboard/settings")}>
          Manage branches…
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
