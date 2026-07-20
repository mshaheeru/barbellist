export function formatMemberSince(iso: string | null | undefined): string {
  if (!iso) return "—";
  const formatted = new Intl.DateTimeFormat("en-GB", {
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
  return `MEMBER SINCE ${formatted.toUpperCase()}`;
}

export function formatCardExpiry(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatCardIssued(iso: string | null | undefined): string {
  return formatCardExpiry(iso);
}

export function formatGymTagline(city: string | null | undefined): string {
  const place = city?.trim() || "GYM";
  return `FITNESS · ${place.toUpperCase()}`;
}

export function gymAddressLine(parts: {
  address?: string | null;
  city?: string | null;
  email?: string | null;
}): string {
  return [parts.address, parts.city, parts.email].filter(Boolean).join(" · ");
}
