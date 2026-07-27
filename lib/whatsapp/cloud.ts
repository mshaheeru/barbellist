import "server-only";
import type { WhatsAppCredentialsSettings } from "@/lib/settings/types";
import { normalizeWhatsAppNumber } from "@/lib/whatsapp/phone";

export { normalizeWhatsAppNumber } from "@/lib/whatsapp/phone";

export type WhatsAppTemplateName =
  | "fee_reminder_before_due"
  | "fee_reminder_overdue"
  | "payment_receipt"
  | "welcome_new_member";

export type SendWhatsAppResult = {
  success: boolean;
  messageId?: string;
  error?: string;
};

const GRAPH_API_VERSION = "v21.0";

export type ResolvedWhatsAppCredentials = {
  configured: boolean;
  token: string | null;
  phoneNumberId: string | null;
};

/** Prefer per-gym settings, then env vars. */
export function resolveWhatsAppCredentials(
  gymWhatsApp?: WhatsAppCredentialsSettings | null,
): ResolvedWhatsAppCredentials {
  const token =
    gymWhatsApp?.api_token?.trim() ||
    process.env.WHATSAPP_API_TOKEN?.trim() ||
    null;
  const phoneNumberId =
    gymWhatsApp?.phone_number_id?.trim() ||
    process.env.WHATSAPP_PHONE_NUMBER_ID?.trim() ||
    null;
  return {
    configured: Boolean(token && phoneNumberId),
    token,
    phoneNumberId,
  };
}

export function isWhatsAppConfigured(
  gymWhatsApp?: WhatsAppCredentialsSettings | null,
): boolean {
  return resolveWhatsAppCredentials(gymWhatsApp).configured;
}

export function buildTemplateMessageBody(
  templateName: WhatsAppTemplateName,
  params: string[],
): string {
  switch (templateName) {
    case "fee_reminder_before_due":
      return `Hi ${params[0]}, your gym membership fee of ${params[1]} is due on ${params[2]}. Please visit the front desk or contact us to renew. Thank you! — ${params[3]}`;
    case "fee_reminder_overdue":
      return `Hi ${params[0]}, your gym membership fee of ${params[1]} is overdue by ${params[2]} days. Kindly clear your dues at the earliest. — ${params[3]}`;
    case "payment_receipt":
      return `Hi ${params[0]}, we've received your payment of ${params[1]} for ${params[2]}. Thank you! Your membership is active until ${params[3]}. — ${params[4]}`;
    case "welcome_new_member":
      return `Welcome to ${params[0]}, ${params[1]}! Your Member ID is ${params[2]}. We're excited to have you. See you at the gym!`;
    default:
      return params.join(" · ");
  }
}

/**
 * Send a WhatsApp Cloud API template message.
 * Template names must match Meta Business Manager approved templates.
 */
export async function sendWhatsAppMessage(
  to: string,
  templateName: WhatsAppTemplateName,
  templateParams: string[],
  gymWhatsApp?: WhatsAppCredentialsSettings | null,
): Promise<SendWhatsAppResult> {
  const creds = resolveWhatsAppCredentials(gymWhatsApp);
  if (!creds.configured || !creds.token || !creds.phoneNumberId) {
    return {
      success: false,
      error:
        "WhatsApp is not configured. Add API credentials in Settings or env.",
    };
  }

  const normalized = normalizeWhatsAppNumber(to);
  if (!normalized) {
    return { success: false, error: "Invalid WhatsApp number" };
  }

  const body = {
    messaging_product: "whatsapp",
    to: normalized,
    type: "template",
    template: {
      name: templateName,
      language: { code: "en" },
      components: [
        {
          type: "body",
          parameters: templateParams.map((text) => ({
            type: "text",
            text: String(text),
          })),
        },
      ],
    },
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${creds.phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${creds.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );

    const json = (await res.json()) as {
      messages?: Array<{ id?: string }>;
      error?: { message?: string; code?: number; error_subcode?: number };
    };

    if (!res.ok) {
      const msg =
        json.error?.message ??
        (res.status === 429
          ? "WhatsApp rate limit exceeded. Try again shortly."
          : `WhatsApp API error (${res.status})`);
      return { success: false, error: msg };
    }

    const messageId = json.messages?.[0]?.id;
    if (!messageId) {
      return { success: false, error: "WhatsApp API returned no message ID" };
    }

    return { success: true, messageId };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Failed to reach WhatsApp API",
    };
  }
}
