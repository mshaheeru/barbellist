"use client";

import Link from "next/link";
import { Bell, Menu, Plus } from "lucide-react";
import { useGym } from "@/components/gym-provider";
import { useOpenMobileMenu } from "@/components/mobile-menu-context";
import styles from "./top-bar.module.css";

type DashboardTopBarProps = {
  title?: string;
  subtitle?: string;
  showAddMember?: boolean;
};

function formatToday() {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

function firstName(name: string | null) {
  if (!name) return "there";
  return name.trim().split(/\s+/)[0] ?? "there";
}

export function DashboardTopBar({
  title,
  subtitle,
  showAddMember = false,
}: DashboardTopBarProps) {
  const { staffName, gymName } = useGym();
  const openMobileMenu = useOpenMobileMenu();
  const greeting = title ?? `Assalam-o-Alaikum, ${firstName(staffName)}`;
  const sub =
    subtitle ??
    `${formatToday()} · Here's how ${gymName ?? "your gym"} is doing today.`;

  return (
    <div className={styles.bar}>
      <div className={styles.left}>
        <button
          type="button"
          onClick={openMobileMenu}
          className={styles.menuBtn}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className={styles.greeting}>{greeting}</h1>
          <p className={styles.subtitle}>{sub}</p>
        </div>
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.bellBtn} aria-label="Notifications">
          <Bell size={19} strokeWidth={1.9} />
          <span className={styles.bellDot} />
        </button>

        {showAddMember ? (
          <Link href="/dashboard/members/new" className={styles.addBtn}>
            <Plus size={17} strokeWidth={2.2} />
            Add Member
          </Link>
        ) : null}
      </div>
    </div>
  );
}
