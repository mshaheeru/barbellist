const DEFAULT_TIMEZONE = "Asia/Karachi";

export function getGymTimezone(timezone?: string | null) {
  return timezone?.trim() || DEFAULT_TIMEZONE;
}

export function getDatePartsInTimeZone(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value ?? 0);

  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
  };
}

/** UTC instant for midnight at the start of `date`'s calendar day in `timeZone`. */
export function getStartOfDayIso(
  timeZone: string,
  date: Date,
): string {
  const { year, month, day } = getDatePartsInTimeZone(date, timeZone);

  for (let h = -36; h <= 36; h++) {
    const candidate = new Date(Date.UTC(year, month - 1, day, h, 0, 0, 0));
    const parts = getDatePartsInTimeZone(candidate, timeZone);
    if (
      parts.year === year &&
      parts.month === month &&
      parts.day === day &&
      parts.hour === 0
    ) {
      return candidate.toISOString();
    }
  }

  return new Date(Date.UTC(year, month - 1, day)).toISOString();
}

export function getTodayStartIso(timeZone: string, now = new Date()) {
  return getStartOfDayIso(timeZone, now);
}

export function getDateRangeBounds(
  range: "today" | "week" | "month",
  timeZone: string,
  now = new Date(),
): { start: string; end: string } {
  const todayStart = new Date(getTodayStartIso(timeZone, now));
  let start = todayStart;

  if (range === "week") {
    const parts = getDatePartsInTimeZone(now, timeZone);
    const weekday = new Date(
      Date.UTC(parts.year, parts.month - 1, parts.day, 12, 0, 0),
    ).getUTCDay();
    start = new Date(todayStart);
    start.setUTCDate(start.getUTCDate() - weekday);
  } else if (range === "month") {
    const parts = getDatePartsInTimeZone(now, timeZone);
    start = new Date(
      getStartOfDayIso(
        timeZone,
        new Date(Date.UTC(parts.year, parts.month - 1, 1, 12, 0, 0)),
      ),
    );
  }

  return {
    start: start.toISOString(),
    end: new Date(now.getTime() + 60_000).toISOString(),
  };
}

export function formatLongDateInTimezone(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatTimeInTimezone(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function formatHourLabel(hour: number) {
  if (hour === 0) return "12a";
  if (hour < 12) return `${hour}a`;
  if (hour === 12) return "12p";
  return `${hour - 12}p`;
}

export function getHourInTimezone(iso: string, timeZone: string) {
  return getDatePartsInTimeZone(new Date(iso), timeZone).hour;
}

export function isLateCheckIn(
  iso: string,
  timeZone: string,
  hourThreshold = 9,
) {
  const { hour } = getDatePartsInTimeZone(new Date(iso), timeZone);
  return hour >= hourThreshold;
}

export function formatPeakHourRange(hour: number) {
  const start = formatHourLabel(hour);
  const end = formatHourLabel((hour + 1) % 24);
  return `${start}–${end}`;
}
