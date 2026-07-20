"use client";

import { NumberInput, PasswordInput, Switch, TextInput } from "@mantine/core";
import { MessageCircle } from "lucide-react";
import type { ReminderScheduleSettings } from "@/lib/whatsapp/schedule";
import styles from "./settings.module.css";

type WhatsAppSectionProps = {
  configured: boolean;
  canEditCredentials: boolean;
  tokenValue: string;
  phoneNumberId: string;
  reminders: ReminderScheduleSettings;
  onTokenChange: (v: string) => void;
  onPhoneIdChange: (v: string) => void;
  onRemindersChange: (next: ReminderScheduleSettings) => void;
  onTest: () => void;
  testing?: boolean;
};

export function WhatsAppSection({
  configured,
  canEditCredentials,
  tokenValue,
  phoneNumberId,
  reminders,
  onTokenChange,
  onPhoneIdChange,
  onRemindersChange,
  onTest,
  testing,
}: WhatsAppSectionProps) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <h2 className={styles.sectionTitle}>
          <MessageCircle
            size={18}
            className={styles.sectionIcon}
            strokeWidth={2}
          />
          WhatsApp Reminders
        </h2>
      </div>

      {!configured ? (
        <div className={styles.warningBanner}>
          WhatsApp reminders are not configured. Add your API credentials below
          to enable automated fee reminders.
        </div>
      ) : null}

      {canEditCredentials ? (
        <div className={styles.grid2} style={{ marginBottom: 12 }}>
          <PasswordInput
            label="WhatsApp API Token"
            value={tokenValue}
            onChange={(e) => onTokenChange(e.currentTarget.value)}
            placeholder="Enter API token"
          />
          <TextInput
            label="WhatsApp Phone Number ID"
            value={phoneNumberId}
            onChange={(e) => onPhoneIdChange(e.currentTarget.value)}
            placeholder="Phone number ID"
          />
        </div>
      ) : (
        <p
          style={{
            fontSize: 13.5,
            color: "#7a7a70",
            marginBottom: 12,
          }}
        >
          API credentials are managed by the gym owner.
          {configured
            ? " WhatsApp is currently configured."
            : " WhatsApp is not configured yet."}
        </p>
      )}

      <button
        type="button"
        className={styles.testBtn}
        onClick={onTest}
        disabled={testing || !configured}
      >
        {testing ? "Sending…" : "Test Connection"}
      </button>

      <div className={styles.innerCard}>
        <div className={styles.innerCardTitle}>Reminder schedule</div>

        <div className={styles.scheduleRow}>
          <span className={styles.scheduleLabel}>
            Send reminder days before due date
          </span>
          <NumberInput
            className={styles.scheduleInput}
            min={0}
            max={30}
            value={reminders.days_before_due}
            onChange={(v) =>
              onRemindersChange({
                ...reminders,
                days_before_due: typeof v === "number" ? v : 3,
              })
            }
          />
        </div>

        <div className={styles.scheduleRow}>
          <span className={styles.scheduleLabel}>
            Send reminder on due date
          </span>
          <Switch
            checked={reminders.on_due_date}
            onChange={(e) =>
              onRemindersChange({
                ...reminders,
                on_due_date: e.currentTarget.checked,
              })
            }
            color="#1B5E3C"
          />
        </div>

        <div className={styles.scheduleRow}>
          <span className={styles.scheduleLabel}>
            Send overdue reminder every days
          </span>
          <NumberInput
            className={styles.scheduleInput}
            min={1}
            max={30}
            value={reminders.overdue_every_days}
            onChange={(v) =>
              onRemindersChange({
                ...reminders,
                overdue_every_days: typeof v === "number" ? v : 3,
              })
            }
          />
        </div>

        <div className={styles.scheduleRow}>
          <span className={styles.scheduleLabel}>
            Maximum reminders per overdue fee
          </span>
          <NumberInput
            className={styles.scheduleInput}
            min={1}
            max={20}
            value={reminders.max_per_due}
            onChange={(v) =>
              onRemindersChange({
                ...reminders,
                max_per_due: typeof v === "number" ? v : 5,
              })
            }
          />
        </div>
      </div>
    </section>
  );
}
