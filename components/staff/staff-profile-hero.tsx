import Link from "next/link";
import { ArrowLeft, Award, Phone } from "lucide-react";
import type { StaffProfile } from "@/lib/types";
import {
  formatLastCheckIn,
  formatMonthYear,
} from "@/lib/members/format";
import { formatStaffRole } from "@/lib/staff/format";
import { MemberAvatar } from "@/components/members/member-avatar";
import styles from "./staff-profile.module.css";

type StaffProfileHeroProps = {
  staff: StaffProfile;
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

export function StaffProfileHero({ staff }: StaffProfileHeroProps) {
  const wa = whatsappLink(staff.phone, staff.whatsapp);
  const tel = telLink(staff.phone ?? staff.whatsapp);
  const isActive = staff.status === "active";

  return (
    <>
      <Link href="/dashboard/staff" className={styles.breadcrumb}>
        <ArrowLeft size={16} strokeWidth={2} />
        Staff / {staff.name}
      </Link>

      <div className={styles.hero}>
        <div className={styles.heroLeft}>
          <MemberAvatar
            name={staff.name}
            photoUrl={staff.photo_url}
            size="profile"
          />
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <h1 className={styles.heroName}>{staff.name}</h1>
              <span className={styles.roleRibbon}>
                <Award size={13} strokeWidth={2.4} />
                {formatStaffRole(staff.role)}
              </span>
            </div>
            <div className={styles.heroMeta}>
              {isActive ? (
                <span className={styles.statusActiveMeta}>
                  <span className={styles.statusActiveDot} />
                  Active
                  {staff.last_check_in
                    ? ` · Clocked in ${formatLastCheckIn(staff.last_check_in).replace(/^Today /, "")}`
                    : ""}
                </span>
              ) : (
                <span style={{ fontWeight: 600, color: "#7A7A70" }}>
                  {staff.status === "inactive" ? "Inactive" : "Terminated"}
                </span>
              )}
              <span className={styles.heroMetaDot} />
              <span>Joined {formatMonthYear(staff.joining_date)}</span>
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
            <a href={tel} className={styles.callBtn} aria-label="Call staff">
              <Phone size={18} strokeWidth={2} />
            </a>
          ) : null}
        </div>
      </div>
    </>
  );
}
