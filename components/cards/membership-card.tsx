"use client";

import type { RefObject } from "react";
import { Dumbbell } from "lucide-react";
import { getInitials } from "@/lib/members/format";
import {
  formatCardExpiry,
  formatGymTagline,
  formatMemberSince,
  gymAddressLine,
} from "@/lib/cards/format";
import type { CardMember } from "@/lib/cards/types";
import type { CardTemplateSettings } from "@/lib/settings/types";
import { DEFAULT_CARD_TEMPLATE } from "@/lib/settings/types";
import type { Gym } from "@/lib/types";
import styles from "./cards.module.css";

export type MembershipCardProps = {
  member: CardMember;
  gym: Gym | null;
  qrDataUrl: string | null;
  side?: "front" | "back" | "both";
  frontRef?: RefObject<HTMLDivElement | null>;
  backRef?: RefObject<HTMLDivElement | null>;
  template?: Partial<CardTemplateSettings> | null;
};

function resolveTemplate(
  template?: Partial<CardTemplateSettings> | null,
): CardTemplateSettings {
  return { ...DEFAULT_CARD_TEMPLATE, ...template };
}

function GymLogo({
  gym,
  show,
}: {
  gym: Gym | null;
  show: boolean;
}) {
  if (!show) return null;
  if (gym?.logo_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={gym.logo_url}
        alt=""
        className={styles.gymLogoImg}
        crossOrigin="anonymous"
      />
    );
  }
  return <Dumbbell size={18} color="#C9861B" strokeWidth={2.2} />;
}

export function MembershipCardFront({
  member,
  gym,
  qrDataUrl,
  cardRef,
  template,
}: {
  member: CardMember;
  gym: Gym | null;
  qrDataUrl: string | null;
  cardRef?: RefObject<HTMLDivElement | null>;
  template?: Partial<CardTemplateSettings> | null;
}) {
  const t = resolveTemplate(template);
  const packageName = member.package?.name ?? "Member";
  const badgeColor = member.package?.color || "#C9861B";

  return (
    <div
      ref={cardRef}
      className={`${styles.cardFace} ${styles.cardFront}`}
      style={{ background: t.background_color }}
    >
      <div className={styles.cardOrb} />
      {t.show_package_badge ? (
        <div className={styles.packageBadge} style={{ background: badgeColor }}>
          {packageName}
        </div>
      ) : null}
      <div className={styles.gymBrand}>
        {t.show_gym_logo ? (
          <div className={styles.gymLogo}>
            <GymLogo gym={gym} show />
          </div>
        ) : null}
        <div>
          <div className={styles.gymName}>{gym?.name ?? "Your Gym"}</div>
          <div className={styles.gymTagline}>{formatGymTagline(gym?.city)}</div>
        </div>
      </div>
      <div className={styles.memberRow}>
        {t.show_member_photo ? (
          <div className={styles.avatar} style={{ background: badgeColor }}>
            {member.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={member.photo_url}
                alt=""
                className={styles.avatarImg}
                crossOrigin="anonymous"
              />
            ) : (
              getInitials(member.name)
            )}
          </div>
        ) : null}
        <div className={styles.memberInfo}>
          <h3 className={styles.memberName}>{member.name}</h3>
          <div className={styles.memberCode}>{member.member_code}</div>
          <div className={styles.memberSince}>
            {formatMemberSince(member.membership_start)}
          </div>
        </div>
        {t.show_qr ? (
          <div className={styles.qrWrap}>
            {qrDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrDataUrl} alt="Member QR" className={styles.qrImg} />
            ) : (
              <div className={styles.qrImg} />
            )}
          </div>
        ) : null}
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo/icon.svg"
        alt=""
        className={styles.cardBrandMark}
        width={22}
        height={22}
      />
    </div>
  );
}

export function MembershipCardBack({
  member,
  gym,
  cardRef,
  template,
}: {
  member: CardMember;
  gym: Gym | null;
  cardRef?: RefObject<HTMLDivElement | null>;
  template?: Partial<CardTemplateSettings> | null;
}) {
  const t = resolveTemplate(template);
  const address = gymAddressLine({
    address: gym?.address,
    city: gym?.city,
    email: gym?.email,
  });

  return (
    <div ref={cardRef} className={`${styles.cardFace} ${styles.cardBack}`}>
      <div className={styles.backStripe} />
      <div className={styles.backBody}>
        <div className={styles.backGrid}>
          {t.show_expiry ? (
            <div>
              <div className={styles.backLabel}>VALID THROUGH</div>
              <div className={styles.backValue}>
                {formatCardExpiry(member.membership_end)}
              </div>
            </div>
          ) : (
            <div />
          )}
          <div>
            <div className={styles.backLabel}>HELPLINE</div>
            <div className={styles.backValue}>{gym?.phone ?? "—"}</div>
          </div>
        </div>
        <div className={styles.backFooter}>
          This card remains property of {gym?.name ?? "the gym"}. It is
          non-transferable and must be presented at check-in. Report loss to
          reception immediately.
          {address ? ` ${address}` : ""}
          <div className={styles.backHint}>
            Scan QR code at kiosk for check-in
          </div>
          <div className={styles.watermark}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo/icon.svg" alt="" width={12} height={12} />
            Powered by Barbellist
          </div>
        </div>
      </div>
    </div>
  );
}

export function MembershipCard({
  member,
  gym,
  qrDataUrl,
  side = "both",
  frontRef,
  backRef,
  template,
}: MembershipCardProps) {
  return (
    <>
      {(side === "front" || side === "both") && (
        <MembershipCardFront
          member={member}
          gym={gym}
          qrDataUrl={qrDataUrl}
          cardRef={frontRef}
          template={template}
        />
      )}
      {(side === "back" || side === "both") && (
        <MembershipCardBack
          member={member}
          gym={gym}
          cardRef={backRef}
          template={template}
        />
      )}
    </>
  );
}
