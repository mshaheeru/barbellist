"use client";

import Link from "next/link";
import { Monitor } from "lucide-react";
import { useCallback, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeaderStart } from "@/components/dashboard/page-header-start";
import type { AttendanceDateRange } from "@/lib/types";
import styles from "./attendance.module.css";

const DATE_RANGES: { key: AttendanceDateRange; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
];

type AttendancePageHeaderProps = {
  dateLabel: string;
  currentRange: AttendanceDateRange;
};

export function AttendancePageHeader({
  dateLabel,
  currentRange,
}: AttendancePageHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const setRange = useCallback(
    (range: AttendanceDateRange) => {
      const params = new URLSearchParams(searchParams.toString());
      if (range === "today") {
        params.delete("range");
      } else {
        params.set("range", range);
      }
      startTransition(() => {
        router.push(`/dashboard/attendance?${params.toString()}`);
      });
    },
    [router, searchParams, startTransition],
  );

  return (
    <div className={styles.pageHeader}>
      <PageHeaderStart
        title="Attendance"
        titleClassName={styles.pageTitle}
        subtitleClassName={styles.pageSubtitle}
        subtitle={dateLabel}
      />
      <div className={styles.headerActions}>
        <div className={styles.segmented}>
          {DATE_RANGES.map((r) => (
            <button
              key={r.key}
              type="button"
              className={`${styles.segment} ${
                currentRange === r.key ? styles.segmentActive : ""
              }`}
              onClick={() => setRange(r.key)}
            >
              {r.label}
            </button>
          ))}
        </div>
        <Link href="/dashboard/attendance/kiosk" className={styles.kioskBtn}>
          <Monitor size={17} strokeWidth={2.2} />
          Open Kiosk
        </Link>
      </div>
    </div>
  );
}
