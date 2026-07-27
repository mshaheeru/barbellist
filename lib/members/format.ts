export function getInitials(name: string | null | undefined) {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function formatCurrency(amount: number, symbol = "Rs.") {
  const formatted = formatAmountOnly(amount);
  return `${symbol} ${formatted}`;
}

/** Numeric amount without currency symbol (WhatsApp templates, etc.). */
export function formatAmountOnly(amount: number): string {
  return new Intl.NumberFormat("en-PK", {
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatShortDate(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatMonthYear(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

/** Period covered for receipts, e.g. "July 2026" or "Jul 2026 – Aug 2026". */
export function formatReceiptPeriod(
  coversFrom: string | null | undefined,
  coversTo: string | null | undefined,
) {
  if (!coversFrom && !coversTo) return "Membership";

  const from = coversFrom ? new Date(coversFrom) : null;
  const to = coversTo ? new Date(coversTo) : null;

  if (from && to) {
    const sameMonth =
      from.getUTCFullYear() === to.getUTCFullYear() &&
      from.getUTCMonth() === to.getUTCMonth();
    if (sameMonth) {
      return new Intl.DateTimeFormat("en-GB", {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }).format(from);
    }
    return `${formatMonthYear(coversFrom)} – ${formatMonthYear(coversTo)}`;
  }

  return formatMonthYear(coversFrom ?? coversTo);
}

export function formatReceiptNumber(paymentId: string) {
  const short = paymentId.replace(/-/g, "").slice(0, 8).toUpperCase();
  return `RCP-${short}`;
}

export function formatTime(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(iso));
}

export function formatLastCheckIn(iso: string | null) {
  if (!iso) return "—";

  const date = new Date(iso);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const checkDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round(
    (today.getTime() - checkDay.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays === 0) {
    return `Today ${formatTime(iso)}`;
  }
  if (diffDays === 1) {
    return "Yesterday";
  }
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
  }).format(date);
}

export function formatPaymentMethod(method: string | null) {
  if (!method) return "—";
  const labels: Record<string, string> = {
    cash: "Cash",
    easypaisa: "EasyPaisa",
    jazzcash: "JazzCash",
    bank_transfer: "Bank Transfer",
    card: "Card",
    other: "Other",
  };
  return labels[method] ?? method;
}

export function formatCheckInMethod(method: string) {
  const labels: Record<string, string> = {
    qr: "QR",
    fingerprint: "Fingerprint",
    manual: "Manual",
  };
  return labels[method] ?? method;
}

export function bmiCategory(bmi: number | null): {
  label: string;
  tone: "success" | "warning" | "danger";
} {
  if (bmi === null) return { label: "—", tone: "warning" };
  if (bmi < 18.5) return { label: "Underweight", tone: "warning" };
  if (bmi < 25) return { label: "Normal", tone: "success" };
  if (bmi < 30) return { label: "Overweight", tone: "warning" };
  return { label: "Obese", tone: "danger" };
}

export function formatFitnessGoal(goal: string) {
  return goal
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function avatarToneFromName(name: string): "green" | "amber" | "grey" {
  const sum = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const mod = sum % 3;
  if (mod === 0) return "green";
  if (mod === 1) return "amber";
  return "grey";
}

export function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(iso);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}
