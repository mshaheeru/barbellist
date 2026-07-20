import { getAttendanceFeedPage } from "@/app/actions/attendance";
import { AttendanceLiveFeed } from "./attendance-live-feed";
import styles from "./attendance.module.css";
import type { AttendanceDateRange } from "@/lib/validations/attendance";

function parseRange(raw?: string): AttendanceDateRange {
  if (raw === "week" || raw === "month" || raw === "today") return raw;
  return "today";
}

type AttendanceListProps = {
  range?: string;
};

export async function AttendanceList({ range: rangeRaw }: AttendanceListProps) {
  const dateRange = parseRange(rangeRaw);

  const { data, error } = await getAttendanceFeedPage({
    date_range: dateRange,
    person_filter: "all",
  });

  if (error || !data) {
    return (
      <div className={styles.errorBox}>
        {error ?? "Failed to load attendance. Please try again."}
      </div>
    );
  }

  return <AttendanceLiveFeed initial={data} dateRange={dateRange} />;
}
