import {
  Fingerprint,
  QrCode,
  Search,
} from "lucide-react";
import { getInitials } from "@/components/gym-provider";
import { avatarToneFromName } from "@/lib/members/format";
import { formatTime } from "@/lib/members/format";
import type { AttendanceFeedItem } from "@/lib/types";
import styles from "./attendance.module.css";

type AttendanceFeedRowProps = {
  item: AttendanceFeedItem;
  isNew?: boolean;
};

function MethodIcon({ method }: { method: AttendanceFeedItem["check_in_method"] }) {
  if (method === "qr") return <QrCode size={15} strokeWidth={2} />;
  if (method === "fingerprint") return <Fingerprint size={15} strokeWidth={2} />;
  return <Search size={15} strokeWidth={2} />;
}

function getStatusPill(item: AttendanceFeedItem) {
  if (item.person_type === "staff") {
    return { label: "Clocked in", className: styles.pillStaff };
  }

  if (item.fee_status_at_checkin === "overdue") {
    return { label: "Overdue", className: styles.pillRed };
  }
  if (item.fee_status_at_checkin === "due_soon") {
    return { label: "Fee due soon", className: styles.pillAmber };
  }
  return { label: "Checked in", className: styles.pillGreen };
}

export function AttendanceFeedRow({ item, isNew }: AttendanceFeedRowProps) {
  const tone = avatarToneFromName(item.name);
  const avatarClass =
    tone === "green"
      ? styles.avatarGreen
      : tone === "amber"
        ? styles.avatarAmber
        : styles.avatarGrey;

  const rowClass = [
    styles.feedRow,
    item.person_type === "staff" ? styles.feedRowStaff : "",
    item.fee_status_at_checkin === "overdue" ? styles.feedRowOverdue : "",
    isNew ? styles.feedRowNew : "",
  ]
    .filter(Boolean)
    .join(" ");

  const pill = getStatusPill(item);

  return (
    <div className={rowClass}>
      <span className={`${styles.feedTime} ${styles.num}`}>
        {formatTime(item.check_in_at)}
      </span>
      <div className={`${styles.avatar} ${avatarClass}`}>
        {item.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.photo_url}
            alt=""
            className={styles.avatarImg}
          />
        ) : (
          getInitials(item.name)
        )}
      </div>
      <div className={styles.feedMain}>
        <div className={styles.feedNameRow}>
          <span className={styles.feedName}>{item.name}</span>
          {item.staff_role_label ? (
            <span
              className={
                item.staff_role === "cleaner"
                  ? `${styles.roleBadge} ${styles.roleBadgeGrey}`
                  : styles.roleBadge
              }
            >
              {item.staff_role_label}
            </span>
          ) : null}
        </div>
        <div className={styles.feedSub}>{item.subtitle}</div>
      </div>
      <span className={styles.methodTag}>
        <MethodIcon method={item.check_in_method} />
        {item.check_in_method === "qr"
          ? "QR"
          : item.check_in_method === "fingerprint"
            ? "Print"
            : "Manual"}
      </span>
      <span className={`${styles.pill} ${pill.className}`}>{pill.label}</span>
    </div>
  );
}
