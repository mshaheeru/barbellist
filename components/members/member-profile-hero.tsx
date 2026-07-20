import Link from "next/link";
import { ArrowLeft, Phone, Star } from "lucide-react";
import type { MemberProfile } from "@/lib/types";
import { formatMonthYear } from "@/lib/members/format";
import { MemberAvatar } from "./member-avatar";
import styles from "./member-profile.module.css";

type MemberProfileHeroProps = {
  member: MemberProfile;
};

function whatsappLink(phone: string | null, whatsapp: string | null) {
  const num = (whatsapp ?? phone ?? "").replace(/\D/g, "");
  if (!num) return null;
  return `https://wa.me/${num}`;
}

function telLink(phone: string | null) {
  if (!phone) return null;
  return `tel:${phone.replace(/\s/g, "")}`;
}

export function MemberProfileHero({ member }: MemberProfileHeroProps) {
  const wa = whatsappLink(member.phone, member.whatsapp);
  const tel = telLink(member.phone ?? member.whatsapp);

  const feeOverdue = member.fee_status.kind === "overdue";

  return (
    <>
      <Link href="/dashboard/members" className={styles.breadcrumb}>
        <ArrowLeft size={16} strokeWidth={2} />
        Members / {member.name}
      </Link>

      <div className={styles.hero}>
        <div className={styles.heroLeft}>
          <MemberAvatar
            name={member.name}
            photoUrl={member.photo_url}
            size="profile"
          />
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <h1 className={styles.heroName}>{member.name}</h1>
              {member.package ? (
                <span className={styles.packageRibbon}>
                  <Star size={13} fill="#C9861B" stroke="none" />
                  {member.package.name}
                </span>
              ) : null}
            </div>
            <div className={styles.heroMeta}>
              <span className={styles.num}>{member.member_code}</span>
              {feeOverdue ? (
                <>
                  <span className={styles.heroMetaDot} />
                  <span className={styles.feeOverdue}>
                    <span className={styles.feeOverdueDot} />
                    Fee Overdue · {member.fee_status.days} days
                  </span>
                </>
              ) : member.fee_status.kind === "due_soon" ? (
                <>
                  <span className={styles.heroMetaDot} />
                  <span style={{ color: "#B07A15", fontWeight: 600 }}>
                    {member.fee_status.label}
                  </span>
                </>
              ) : null}
              <span className={styles.heroMetaDot} />
              <span>Member since {formatMonthYear(member.joined_at)}</span>
            </div>
          </div>
        </div>

        <div className={styles.heroActions}>
          {wa ? (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.whatsappBtn}
            >
              WhatsApp
            </a>
          ) : null}
          {tel ? (
            <a href={tel} className={styles.callBtn} aria-label="Call member">
              <Phone size={18} strokeWidth={2} />
            </a>
          ) : null}
        </div>
      </div>
    </>
  );
}
