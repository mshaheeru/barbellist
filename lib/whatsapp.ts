export const WHATSAPP_PHONE = "923367808477";

export const WHATSAPP_MESSAGE =
  "Hello! I'm interested in Barbellist for my gym. Could you please tell me more about pricing and how onboarding works?";

export function getWhatsAppUrl(message: string = WHATSAPP_MESSAGE) {
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}

export function openWhatsApp(message?: string) {
  window.open(getWhatsAppUrl(message), "_blank", "noopener,noreferrer");
}
