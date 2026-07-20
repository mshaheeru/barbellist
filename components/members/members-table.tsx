"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MemberListItem } from "@/lib/types";
import { formatLastCheckIn, formatShortDate } from "@/lib/members/format";
import { FeeStatusBadge } from "./fee-status-badge";
import { MemberAvatar } from "./member-avatar";
import styles from "./members.module.css";

type MembersTableProps = {
  members: MemberListItem[];
};

export function MembersTable({ members }: MembersTableProps) {
  const router = useRouter();

  return (
    <div className={styles.tableWrap}>
      <div className={styles.tableHead}>
        <span>Member</span>
        <span>Member ID</span>
        <span>Package</span>
        <span>Fee Status</span>
        <span>Last Check-in</span>
        <span>Join Date</span>
        <span />
      </div>
      {members.map((member) => (
        <Link
          key={member.id}
          href={`/dashboard/members/${member.id}`}
          className={styles.tableRow}
        >
          <div className={styles.memberCell}>
            <MemberAvatar name={member.name} photoUrl={member.photo_url} />
            <span className={styles.memberName}>{member.name}</span>
          </div>
          <span className={`${styles.cellMuted} ${styles.num}`}>
            {member.member_code}
          </span>
          <span className={styles.cellMuted}>
            {member.package_name ?? "—"}
          </span>
          <span>
            <FeeStatusBadge status={member.fee_status} />
          </span>
          <span className={styles.cellMuted}>
            {formatLastCheckIn(member.last_check_in)}
          </span>
          <span className={styles.cellMuted}>
            {formatShortDate(member.joined_at)}
          </span>
          <button
            type="button"
            className={styles.actionsBtn}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              router.push(`/dashboard/members/${member.id}`);
            }}
            aria-label="View member"
          >
            ⋯
          </button>
        </Link>
      ))}
    </div>
  );
}
