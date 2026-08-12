"use client";

import { Palette, Upload } from "lucide-react";
import { useRef } from "react";
import {
  DEFAULT_THEME,
  resolveTheme,
  type GymThemeSettings,
} from "@/lib/theme/tokens";
import styles from "./settings.module.css";

type BrandingSectionProps = {
  theme: GymThemeSettings;
  logoUrl: string | null;
  onThemeChange: (next: GymThemeSettings) => void;
  onLogoUpload: (file: File) => void;
  uploadingLogo?: boolean;
};

function ColorField({
  label,
  value,
  fallback,
  onChange,
}: {
  label: string;
  value: string;
  fallback: string;
  onChange: (hex: string) => void;
}) {
  return (
    <div className={styles.colorField}>
      <label className={styles.colorLabel}>{label}</label>
      <div className={styles.colorControls}>
        <input
          type="color"
          className={styles.colorSwatch}
          value={/^#[0-9A-Fa-f]{6}$/.test(value) ? value : fallback}
          onChange={(e) => onChange(e.currentTarget.value.toUpperCase())}
          aria-label={label}
        />
        <input
          type="text"
          className={styles.colorHex}
          value={value}
          maxLength={7}
          spellCheck={false}
          onChange={(e) => {
            const v = e.currentTarget.value.trim();
            if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) {
              onChange(v.toUpperCase());
            }
          }}
          onBlur={() => {
            if (!/^#[0-9A-Fa-f]{6}$/.test(value)) {
              onChange(fallback);
            }
          }}
        />
      </div>
    </div>
  );
}

export function BrandingSection({
  theme,
  logoUrl,
  onThemeChange,
  onLogoUpload,
  uploadingLogo,
}: BrandingSectionProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const primary = theme.primary || DEFAULT_THEME.primary;
  const accent = theme.accent || DEFAULT_THEME.accent;
  const preview = resolveTheme({ primary, accent });

  return (
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <h2 className={styles.sectionTitle}>
          <Palette size={18} className={styles.sectionIcon} strokeWidth={2} />
          Branding
        </h2>
      </div>

      <p className={styles.brandingHint}>
        Your logo replaces Barbellist in the left sidebar. Theme colors apply
        across the dashboard (sidebar, buttons, accents).
      </p>

      <div className={styles.logoRow}>
        <div className={styles.logoPreview}>
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="Gym logo" />
          ) : (
            <span className={styles.logoPlaceholder}>Logo</span>
          )}
        </div>
        <div>
          <button
            type="button"
            className={styles.uploadBtn}
            disabled={uploadingLogo}
            onClick={() => fileRef.current?.click()}
          >
            <Upload size={15} strokeWidth={2.2} />
            {uploadingLogo ? "Uploading…" : "Upload Logo"}
          </button>
          <div className={styles.uploadHint}>
            PNG or JPG, max 2MB. Shows in the left sidebar.
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onLogoUpload(file);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      <div className={styles.brandingColors}>
        <ColorField
          label="Primary"
          value={primary}
          fallback={DEFAULT_THEME.primary}
          onChange={(hex) =>
            onThemeChange({
              primary: hex,
              accent,
            })
          }
        />
        <ColorField
          label="Accent"
          value={accent}
          fallback={DEFAULT_THEME.accent}
          onChange={(hex) =>
            onThemeChange({
              primary,
              accent: hex,
            })
          }
        />
      </div>

      <div className={styles.brandingPreview}>
        <div
          className={styles.brandingPreviewSidebar}
          style={{ background: preview.sidebar }}
        >
          <div
            className={styles.brandingPreviewNav}
            style={{ background: preview.sidebarActive }}
          />
          <div
            className={styles.brandingPreviewMuted}
            style={{ background: preview.sidebarMuted }}
          />
        </div>
        <div className={styles.brandingPreviewBody}>
          <button
            type="button"
            className={styles.brandingPreviewBtn}
            style={{ background: preview.primary }}
            tabIndex={-1}
          >
            Primary button
          </button>
          <span
            className={styles.brandingPreviewAccent}
            style={{ background: preview.accent }}
          />
        </div>
      </div>

      <button
        type="button"
        className={styles.resetThemeBtn}
        onClick={() =>
          onThemeChange({
            primary: DEFAULT_THEME.primary,
            accent: DEFAULT_THEME.accent,
          })
        }
      >
        Reset to Barbellist defaults
      </button>
    </section>
  );
}
