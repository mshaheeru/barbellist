import type { ReminderScheduleSettings } from "@/lib/whatsapp/schedule";
import { DEFAULT_REMINDER_SCHEDULE } from "@/lib/whatsapp/schedule";
import type { Gym, Organization, StaffRole, SubscriptionPlan } from "@/lib/types";

export type CardTemplateSettings = {
  background_color: string;
  show_gym_logo: boolean;
  show_member_photo: boolean;
  show_qr: boolean;
  show_expiry: boolean;
  show_package_badge: boolean;
};

export type WhatsAppCredentialsSettings = {
  api_token?: string;
  phone_number_id?: string;
};

export const DEFAULT_CARD_TEMPLATE: CardTemplateSettings = {
  background_color: "#123D28",
  show_gym_logo: true,
  show_member_photo: true,
  show_qr: true,
  show_expiry: true,
  show_package_badge: true,
};

export type SettingsStaffRow = {
  id: string;
  name: string;
  email: string | null;
  photo_url: string | null;
  role: StaffRole;
  status: string;
  auth_user_id: string | null;
  has_app_access: boolean;
};

export type SettingsPageData = {
  gym: Gym;
  organization: Organization | null;
  branches: Array<{
    id: string;
    name: string;
    slug: string;
    city: string | null;
    address: string | null;
  }>;
  reminders: ReminderScheduleSettings;
  cardTemplate: CardTemplateSettings;
  whatsappConfigured: boolean;
  whatsappHasToken: boolean;
  whatsappPhoneNumberId: string;
  whatsappTokenMasked: string | null;
  staff: SettingsStaffRow[];
  activeMemberCount: number;
  role: StaffRole;
  canEditCredentials: boolean;
  canViewBilling: boolean;
  canAccessDangerZone: boolean;
};

export type BillingPlanInfo = {
  plan: SubscriptionPlan;
  planLabel: string;
  status: string;
  ratePerMember: number;
  monthlyCost: number;
  currencySymbol: string;
};

export { DEFAULT_REMINDER_SCHEDULE };

export function parseCardTemplate(raw: unknown): CardTemplateSettings {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ...DEFAULT_CARD_TEMPLATE };
  }
  const o = raw as Record<string, unknown>;
  return {
    background_color:
      typeof o.background_color === "string"
        ? o.background_color
        : DEFAULT_CARD_TEMPLATE.background_color,
    show_gym_logo:
      typeof o.show_gym_logo === "boolean"
        ? o.show_gym_logo
        : DEFAULT_CARD_TEMPLATE.show_gym_logo,
    show_member_photo:
      typeof o.show_member_photo === "boolean"
        ? o.show_member_photo
        : DEFAULT_CARD_TEMPLATE.show_member_photo,
    show_qr:
      typeof o.show_qr === "boolean" ? o.show_qr : DEFAULT_CARD_TEMPLATE.show_qr,
    show_expiry:
      typeof o.show_expiry === "boolean"
        ? o.show_expiry
        : DEFAULT_CARD_TEMPLATE.show_expiry,
    show_package_badge:
      typeof o.show_package_badge === "boolean"
        ? o.show_package_badge
        : DEFAULT_CARD_TEMPLATE.show_package_badge,
  };
}

export function parseWhatsAppCredentials(
  raw: unknown,
): WhatsAppCredentialsSettings {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const o = raw as Record<string, unknown>;
  return {
    api_token: typeof o.api_token === "string" ? o.api_token : undefined,
    phone_number_id:
      typeof o.phone_number_id === "string" ? o.phone_number_id : undefined,
  };
}

export function maskToken(token: string | undefined | null): string | null {
  if (!token || token.length < 8) return token ? "••••••••" : null;
  return `••••••••${token.slice(-4)}`;
}
