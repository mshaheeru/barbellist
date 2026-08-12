"use client";

import { TextInput, Select } from "@mantine/core";
import { Building2 } from "lucide-react";
import type { GymProfileInput } from "@/lib/validations/settings";
import { CURRENCY_SYMBOL_MAP } from "@/lib/validations/settings";
import styles from "./settings.module.css";

const COUNTRIES = [
  { value: "PK", label: "Pakistan" },
  { value: "AE", label: "United Arab Emirates" },
  { value: "SA", label: "Saudi Arabia" },
  { value: "GB", label: "United Kingdom" },
  { value: "US", label: "United States" },
  { value: "IN", label: "India" },
];

const TIMEZONES = [
  { value: "Asia/Karachi", label: "Asia/Karachi (PKT)" },
  { value: "Asia/Dubai", label: "Asia/Dubai (GST)" },
  { value: "Asia/Riyadh", label: "Asia/Riyadh (AST)" },
  { value: "Europe/London", label: "Europe/London (GMT/BST)" },
  { value: "America/New_York", label: "America/New_York (ET)" },
  { value: "UTC", label: "UTC" },
];

const CURRENCIES = [
  { value: "PKR", label: "PKR" },
  { value: "USD", label: "USD" },
  { value: "SAR", label: "SAR" },
  { value: "AED", label: "AED" },
  { value: "GBP", label: "GBP" },
];

type GymProfileSectionProps = {
  profile: GymProfileInput;
  slug: string;
  onChange: (next: GymProfileInput) => void;
};

export function GymProfileSection({
  profile,
  slug,
  onChange,
}: GymProfileSectionProps) {
  const set = <K extends keyof GymProfileInput>(
    key: K,
    value: GymProfileInput[K],
  ) => {
    onChange({ ...profile, [key]: value });
  };

  return (
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <h2 className={styles.sectionTitle}>
          <Building2 size={18} className={styles.sectionIcon} strokeWidth={2} />
          Gym Profile
        </h2>
      </div>

      <div className={styles.grid2}>
        <TextInput
          label="Gym Name"
          required
          value={profile.name}
          onChange={(e) => set("name", e.currentTarget.value)}
        />
        <div>
          <TextInput
            label="Slug"
            value={slug}
            readOnly
            disabled
            styles={{ input: { background: "#f2eee3", color: "#8a8a80" } }}
          />
          <div className={styles.slugHint}>barbellist.com/gym/{slug}</div>
        </div>
        <TextInput
          className={styles.fieldFull}
          label="Address"
          value={profile.address ?? ""}
          onChange={(e) => set("address", e.currentTarget.value)}
        />
        <TextInput
          label="City"
          value={profile.city ?? ""}
          onChange={(e) => set("city", e.currentTarget.value)}
        />
        <Select
          label="Country"
          data={COUNTRIES}
          value={profile.country}
          onChange={(v) => set("country", v || "PK")}
          allowDeselect={false}
        />
        <TextInput
          label="Phone"
          placeholder="+92…"
          value={profile.phone ?? ""}
          onChange={(e) => set("phone", e.currentTarget.value)}
        />
        <TextInput
          label="WhatsApp"
          value={profile.whatsapp ?? ""}
          onChange={(e) => set("whatsapp", e.currentTarget.value)}
        />
        <TextInput
          label="Email"
          value={profile.email ?? ""}
          onChange={(e) => set("email", e.currentTarget.value)}
        />
        <Select
          label="Timezone"
          data={TIMEZONES}
          value={profile.timezone}
          onChange={(v) => set("timezone", v || "Asia/Karachi")}
          allowDeselect={false}
          searchable
        />
        <Select
          label="Currency"
          data={CURRENCIES}
          value={profile.currency}
          onChange={(v) => {
            const currency = (v || "PKR") as GymProfileInput["currency"];
            onChange({
              ...profile,
              currency,
              currency_symbol: CURRENCY_SYMBOL_MAP[currency] ?? "Rs.",
            });
          }}
          allowDeselect={false}
        />
        <TextInput
          label="Currency Symbol"
          value={profile.currency_symbol}
          onChange={(e) => set("currency_symbol", e.currentTarget.value)}
        />
      </div>
    </section>
  );
}
