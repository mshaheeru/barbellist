import { normalizeWhatsAppNumber } from "@/lib/whatsapp/phone";

export const WHATSAPP_MESSAGE_TEMPLATES = {
  OVERDUE:
    "Hi {name}, your gym membership fee of {currency}{amount} is overdue by {days} days. Kindly visit the front desk or contact us to clear your dues. Thank you! — {gym_name}",
  DUE_SOON:
    "Hi {name}, your gym membership fee of {currency}{amount} is due on {date}. Please visit the front desk to renew. Thank you! — {gym_name}",
  RECEIPT:
    "Hi {name}, we've received your payment of {currency}{amount} for {period}. Thank you! Your membership is active until {expiry}. — {gym_name}",
} as const;

export type WhatsAppMessageTemplateKey = keyof typeof WHATSAPP_MESSAGE_TEMPLATES;

export type TemplateVars = Record<string, string | number>;

export function fillTemplate(
  template: string,
  vars: TemplateVars,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = vars[key];
    return value == null ? "" : String(value);
  });
}

/** Build https://wa.me/{digits}?text=… or null if number is unusable. */
export function buildWaMeUrl(
  rawPhone: string | null | undefined,
  message: string,
): string | null {
  const digits = normalizeWhatsAppNumber(rawPhone);
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function openWaMeUrl(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}
