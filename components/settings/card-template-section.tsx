"use client";

import { Switch } from "@mantine/core";
import { Check, CreditCard } from "lucide-react";
import { MembershipCard } from "@/components/cards/membership-card";
import type { CardMember } from "@/lib/cards/types";
import type { CardTemplateSettings } from "@/lib/settings/types";
import type { Gym } from "@/lib/types";
import styles from "./settings.module.css";

const CARD_BG_PRESETS = [
  "#123D28",
  "#1B5E3C",
  "#1F1F1F",
  "#1E3A5F",
  "#4A1942",
  "#C9861B",
];

const SAMPLE_QR =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect fill="#fff" width="120" height="120"/><rect fill="#111" x="10" y="10" width="30" height="30"/><rect fill="#111" x="80" y="10" width="30" height="30"/><rect fill="#111" x="10" y="80" width="30" height="30"/><rect fill="#111" x="50" y="50" width="20" height="20"/></svg>`,
  );

function sampleMember(): CardMember {
  return {
    id: "sample",
    name: "Ahmed Khan",
    member_code: "MBR-0042",
    photo_url: null,
    membership_start: "2025-01-15",
    membership_end: "2026-12-31",
    card_qr_token: null,
    card_issued_at: null,
    card_printed: false,
    package_id: null,
    package: {
      id: "sample-pkg",
      name: "Standard",
      color: "#C9861B",
    },
  };
}

type CardTemplateSectionProps = {
  gym: Gym;
  template: CardTemplateSettings;
  onChange: (next: CardTemplateSettings) => void;
};

export function CardTemplateSection({
  gym,
  template,
  onChange,
}: CardTemplateSectionProps) {
  const set = <K extends keyof CardTemplateSettings>(
    key: K,
    value: CardTemplateSettings[K],
  ) => onChange({ ...template, [key]: value });

  return (
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <h2 className={styles.sectionTitle}>
          <CreditCard size={18} className={styles.sectionIcon} strokeWidth={2} />
          Card Design
        </h2>
      </div>

      <div className={styles.cardDesignRow}>
        <div className={styles.cardPreviewWrap}>
          <MembershipCard
            member={sampleMember()}
            gym={gym}
            qrDataUrl={SAMPLE_QR}
            side="front"
            template={template}
          />
        </div>

        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#4a4a42",
              marginBottom: 10,
            }}
          >
            Background color
          </div>
          <div className={styles.swatchRow}>
            {CARD_BG_PRESETS.map((color) => {
              const selected =
                template.background_color.toUpperCase() === color.toUpperCase();
              return (
                <button
                  key={color}
                  type="button"
                  className={`${styles.swatch} ${selected ? styles.swatchSelected : ""}`}
                  style={{ background: color }}
                  onClick={() => set("background_color", color)}
                  aria-label={`Background ${color}`}
                >
                  {selected ? (
                    <Check size={14} color="#fff" strokeWidth={3} />
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className={styles.toggles}>
            {(
              [
                ["show_gym_logo", "Gym Logo"],
                ["show_member_photo", "Member Photo"],
                ["show_qr", "QR Code"],
                ["show_expiry", "Expiry Date"],
                ["show_package_badge", "Package Badge"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className={styles.toggleRow}>
                <span>{label}</span>
                <Switch
                  checked={template[key]}
                  onChange={(e) => set(key, e.currentTarget.checked)}
                  color="#1B5E3C"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
