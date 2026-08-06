"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";
import {
  saveSettingsBundle,
  testWhatsAppConnection,
  uploadGymLogo,
} from "@/app/actions/settings";
import type {
  CardTemplateSettings,
  SettingsPageData,
  SettingsStaffRow,
} from "@/lib/settings/types";
import type { GymProfileInput } from "@/lib/validations/settings";
import { CURRENCY_SYMBOL_MAP } from "@/lib/validations/settings";
import type { ReminderScheduleSettings } from "@/lib/whatsapp/schedule";
import { GymProfileSection } from "./gym-profile-section";
import { WhatsAppSection } from "./whatsapp-section";
import { PageHeaderStart } from "@/components/dashboard/page-header-start";
import { RoleGate } from "@/components/auth/role-gate";
import { CardTemplateSection } from "./card-template-section";
import { StaffAccessSection } from "./staff-access-section";
import { BillingSection } from "./billing-section";
import { BranchesSection } from "./branches-section";
import { DangerZoneSection } from "./danger-zone-section";
import { DemoDataSection } from "./demo-data-section";
import styles from "./settings.module.css";

function profileFromGym(data: SettingsPageData): GymProfileInput {
  const currency = (["PKR", "USD", "SAR", "AED", "GBP"].includes(
    data.gym.currency,
  )
    ? data.gym.currency
    : "PKR") as GymProfileInput["currency"];

  return {
    name: data.gym.name,
    address: data.gym.address,
    city: data.gym.city,
    country: data.gym.country || "PK",
    phone: data.gym.phone,
    whatsapp: data.gym.whatsapp,
    email: data.gym.email ?? "",
    timezone: data.gym.timezone || "Asia/Karachi",
    currency,
    currency_symbol:
      data.gym.currency_symbol || CURRENCY_SYMBOL_MAP[currency] || "Rs.",
  };
}

type SettingsPageProps = {
  initial: SettingsPageData;
};

export function SettingsPage({ initial }: SettingsPageProps) {
  const router = useRouter();
  const [profile, setProfile] = useState(() => profileFromGym(initial));
  const [reminders, setReminders] = useState<ReminderScheduleSettings>(
    initial.reminders,
  );
  const [cardTemplate, setCardTemplate] = useState<CardTemplateSettings>(
    initial.cardTemplate,
  );
  const [waToken, setWaToken] = useState(initial.whatsappTokenMasked ?? "");
  const [waPhoneId, setWaPhoneId] = useState(initial.whatsappPhoneNumberId);
  const [logoUrl, setLogoUrl] = useState(initial.gym.logo_url);
  const [staff, setStaff] = useState<SettingsStaffRow[]>(initial.staff);
  const [gym, setGym] = useState(initial.gym);
  const [savedSnapshot, setSavedSnapshot] = useState(() => ({
    profile: profileFromGym(initial),
    reminders: initial.reminders,
    cardTemplate: initial.cardTemplate,
    waToken: initial.whatsappTokenMasked ?? "",
    waPhoneId: initial.whatsappPhoneNumberId,
  }));
  const [pending, startTransition] = useTransition();
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    setStaff(initial.staff);
    setGym(initial.gym);
    setLogoUrl(initial.gym.logo_url);
  }, [initial]);

  const dirty =
    JSON.stringify(profile) !== JSON.stringify(savedSnapshot.profile) ||
    JSON.stringify(reminders) !== JSON.stringify(savedSnapshot.reminders) ||
    JSON.stringify(cardTemplate) !==
      JSON.stringify(savedSnapshot.cardTemplate) ||
    (initial.canEditCredentials &&
      (waToken !== savedSnapshot.waToken ||
        waPhoneId !== savedSnapshot.waPhoneId));

  const whatsappConfigured =
    initial.whatsappConfigured ||
    (Boolean(waPhoneId.trim()) &&
      Boolean(waToken.trim()) &&
      !waToken.startsWith("••••"));

  const handleSave = () => {
    startTransition(async () => {
      const { error } = await saveSettingsBundle({
        profile,
        reminders,
        cardTemplate,
        whatsapp: initial.canEditCredentials
          ? {
              api_token: waToken,
              phone_number_id: waPhoneId,
            }
          : null,
      });

      if (error) {
        toast.error({ message: error });
        return;
      }

      setGym((g) => ({
        ...g,
        ...profile,
        email: profile.email || null,
        logo_url: logoUrl,
      }));
      setSavedSnapshot({
        profile,
        reminders,
        cardTemplate,
        waToken,
        waPhoneId,
      });
      toast.success({ message: "Settings saved" });
      router.refresh();
    });
  };

  const handleLogoUpload = async (file: File) => {
    setUploadingLogo(true);
    const fd = new FormData();
    fd.set("file", file);
    const { data, error } = await uploadGymLogo(fd);
    setUploadingLogo(false);
    if (error || !data) {
      toast.error({ message: error ?? "Upload failed" });
      return;
    }
    setLogoUrl(data.logo_url);
    setGym((g) => ({ ...g, logo_url: data.logo_url }));
    toast.success({ message: "Logo updated" });
  };

  const handleTest = () => {
    setTesting(true);
    startTransition(async () => {
      const { error } = await testWhatsAppConnection();
      setTesting(false);
      if (error) {
        toast.error({ message: error });
        return;
      }
      toast.success({ message: "Test message sent successfully" });
    });
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <PageHeaderStart
          title="Settings"
          titleClassName={styles.pageTitle}
          subtitleClassName={styles.pageSubtitle}
          subtitle="Configure your gym, reminders, cards, and team access"
        />
        <button
          type="button"
          className={styles.saveBtn}
          disabled={!dirty || pending}
          onClick={handleSave}
        >
          {pending ? "Saving…" : "Save Changes"}
        </button>
      </div>

      <div className={styles.sections}>
        <GymProfileSection
          profile={profile}
          slug={initial.gym.slug}
          logoUrl={logoUrl}
          onChange={setProfile}
          onLogoUpload={handleLogoUpload}
          uploadingLogo={uploadingLogo}
        />

        <WhatsAppSection
          configured={whatsappConfigured}
          canEditCredentials={initial.canEditCredentials}
          tokenValue={waToken}
          phoneNumberId={waPhoneId}
          reminders={reminders}
          onTokenChange={setWaToken}
          onPhoneIdChange={setWaPhoneId}
          onRemindersChange={setReminders}
          onTest={handleTest}
          testing={testing}
        />

        <CardTemplateSection
          gym={{ ...gym, logo_url: logoUrl }}
          template={cardTemplate}
          onChange={setCardTemplate}
        />

        <StaffAccessSection
          staff={staff}
          currentUserIsOwner={initial.role === "owner"}
          onStaffChange={setStaff}
        />

        <RoleGate allow="owner">
          <BranchesSection
            branches={initial.branches}
            currentGymId={gym.id}
          />
        </RoleGate>

        <RoleGate allow="owner">
          {initial.canViewBilling && initial.organization ? (
            <BillingSection
              gym={gym}
              organization={initial.organization}
              activeMemberCount={initial.activeMemberCount}
            />
          ) : null}
        </RoleGate>

        <RoleGate allow="owner">
          <DemoDataSection />
        </RoleGate>

        <RoleGate allow="owner">
          {initial.canAccessDangerZone ? (
            <DangerZoneSection gymName={gym.name} />
          ) : null}
        </RoleGate>
      </div>
    </div>
  );
}

export function SettingsSkeleton() {
  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Settings</h1>
          <p className={styles.pageSubtitle}>Loading…</p>
        </div>
      </div>
      <div className={styles.skeleton} />
      <div className={styles.skeleton} />
      <div className={styles.skeleton} />
    </div>
  );
}
