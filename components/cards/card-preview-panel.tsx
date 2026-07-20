"use client";

import type { RefObject } from "react";
import { MembershipCard } from "./membership-card";
import { PageHeaderStart } from "@/components/dashboard/page-header-start";
import type { CardMember } from "@/lib/cards/types";
import type { Gym } from "@/lib/types";
import styles from "./cards.module.css";

type CardPreviewPanelProps = {
  member: CardMember | null;
  gym: Gym | null;
  qrDataUrl: string | null;
  frontRef: RefObject<HTMLDivElement | null>;
  backRef: RefObject<HTMLDivElement | null>;
};

export function CardPreviewPanel({
  member,
  gym,
  qrDataUrl,
  frontRef,
  backRef,
}: CardPreviewPanelProps) {
  return (
    <div className={styles.previewPane}>
      <PageHeaderStart
        title="Membership Card"
        titleClassName={styles.pageTitle}
        subtitleClassName={styles.pageSubtitle}
        subtitle="Preview updates as you edit details on the right."
      />
      <div className={styles.previewStage}>
        {member ? (
          <MembershipCard
            member={member}
            gym={gym}
            qrDataUrl={qrDataUrl}
            frontRef={frontRef}
            backRef={backRef}
          />
        ) : (
          <p className={styles.previewEmpty}>
            Select a member on the right to preview their membership card.
          </p>
        )}
      </div>
    </div>
  );
}
