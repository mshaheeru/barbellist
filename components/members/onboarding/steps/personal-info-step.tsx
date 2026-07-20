"use client";

import { TextInput, Textarea } from "@mantine/core";
import { PhotoCapture } from "../photo-capture";
import styles from "../onboarding.module.css";
import type { OnboardingState } from "../onboarding-wizard";

type PersonalInfoStepProps = {
  state: OnboardingState;
  errors: Record<string, string>;
  onChange: (patch: Partial<OnboardingState>) => void;
};

export function PersonalInfoStep({
  state,
  errors,
  onChange,
}: PersonalInfoStepProps) {
  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <h2 className={styles.sectionTitle}>Personal Information</h2>
        <p className={styles.sectionSubtitle}>
          Enter the member&apos;s contact details and photo.
        </p>
      </div>

      <div className={styles.card}>
        <div className={styles.photoSection}>
          <PhotoCapture
            photoPreview={state.photo_preview}
            onPreviewChange={(preview) => onChange({ photo_preview: preview })}
            onPhotoUrlChange={(url) => onChange({ photo_url: url })}
          />

          <div className={styles.formGrid} style={{ flex: 1 }}>
            <div className={styles.formGridFull}>
              <TextInput
                label="Full Name"
                required
                value={state.name}
                onChange={(e) => onChange({ name: e.currentTarget.value })}
                error={errors.name}
              />
            </div>
            <TextInput
              label="Phone"
              required
              value={state.phone}
              onChange={(e) => onChange({ phone: e.currentTarget.value })}
              error={errors.phone}
            />
            <TextInput
              label="WhatsApp"
              value={state.whatsapp ?? ""}
              onChange={(e) => onChange({ whatsapp: e.currentTarget.value })}
            />
            <TextInput
              label="Email"
              type="email"
              value={state.email ?? ""}
              onChange={(e) => onChange({ email: e.currentTarget.value })}
              error={errors.email}
            />
            <TextInput
              label="Date of Birth"
              type="date"
              value={state.date_of_birth ?? ""}
              onChange={(e) =>
                onChange({ date_of_birth: e.currentTarget.value || null })
              }
            />
            <div>
              <label
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  marginBottom: 6,
                  display: "block",
                }}
              >
                Gender
              </label>
              <select
                value={state.gender ?? ""}
                onChange={(e) =>
                  onChange({
                    gender:
                      (e.target.value as "male" | "female" | "other") || null,
                  })
                }
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid #EAE4D8",
                  fontSize: 14,
                }}
              >
                <option value="">—</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className={styles.formGridFull}>
              <Textarea
                label="Address"
                value={state.address ?? ""}
                onChange={(e) => onChange({ address: e.currentTarget.value })}
                minRows={2}
              />
            </div>
            <TextInput
              label="Emergency Contact Name"
              value={state.emergency_contact_name ?? ""}
              onChange={(e) =>
                onChange({ emergency_contact_name: e.currentTarget.value })
              }
            />
            <TextInput
              label="Emergency Contact Phone"
              value={state.emergency_contact_phone ?? ""}
              onChange={(e) =>
                onChange({ emergency_contact_phone: e.currentTarget.value })
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
