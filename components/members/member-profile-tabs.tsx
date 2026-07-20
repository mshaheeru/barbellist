"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import styles from "./member-profile.module.css";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "attendance", label: "Attendance History" },
  { key: "payments", label: "Payments" },
  { key: "progress", label: "Progress" },
  { key: "notes", label: "Notes" },
] as const;

export type ProfileTab = (typeof TABS)[number]["key"];

type MemberProfileTabsProps = {
  activeTab: ProfileTab;
};

export function MemberProfileTabsNav({ activeTab }: MemberProfileTabsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const hrefFor = (tab: ProfileTab) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "overview") {
      params.delete("tab");
    } else {
      params.set("tab", tab);
    }
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  return (
    <div className={styles.tabs}>
      {TABS.map(({ key, label }) => (
        <Link
          key={key}
          href={hrefFor(key)}
          className={`${styles.tab} ${activeTab === key ? styles.tabActive : ""}`}
        >
          {label}
        </Link>
      ))}
    </div>
  );
}
