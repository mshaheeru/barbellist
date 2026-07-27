/** Shared calendar helpers — single source for month boundaries / labels. */

export function monthLabel(date = new Date()): string {
  return date.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

/** Local calendar first-of-month as YYYY-MM-DD (not UTC). */
export function firstOfMonthIso(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`;
}

export function startOfMonthIso(date = new Date()): string {
  return firstOfMonthIso(date);
}

export function endOfMonthIso(date = new Date()): string {
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return end.toISOString().slice(0, 10);
}

export function previousMonthRange(date = new Date()): {
  start: string;
  end: string;
} {
  const prev = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  return {
    start: startOfMonthIso(prev),
    end: endOfMonthIso(prev),
  };
}

export function previousMonthStart(date = new Date()): string {
  const prev = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  return startOfMonthIso(prev);
}

export function addMonthsIso(yearMonthDay: string, months: number): string {
  const d = new Date(yearMonthDay + "T00:00:00");
  d.setMonth(d.getMonth() + months);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}
