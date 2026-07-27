/** Digits-only international number (no +). Returns null if unusable. */
export function normalizeWhatsAppNumber(
  raw: string | null | undefined,
): string | null {
  if (!raw) return null;
  let digits = raw.replace(/\D/g, "");
  if (!digits) return null;

  if (digits.startsWith("0") && digits.length === 11) {
    digits = `92${digits.slice(1)}`;
  }

  if (digits.length < 10 || digits.length > 15) return null;
  return digits;
}
