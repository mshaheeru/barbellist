"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import styles from "./staff-profile.module.css";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "attendance", label: "Attendance" },
  { key: "salary", label: "Salary History" },
  { key: "notes", label: "Notes" },
] as const;

export type StaffProfileTab = (typeof TABS)[number]["key"];

type StaffProfileTabsProps = {
  activeTab: StaffProfileTab;
  showSalary: boolean;
};

export function StaffProfileTabsNav({
  activeTab,
  showSalary,
}: StaffProfileTabsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tabs = showSalary
    ? TABS
    : TABS.filter((t) => t.key !== "salary");

  const hrefFor = (tab: StaffProfileTab) => {
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
      {tabs.map(({ key, label }) => (
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
