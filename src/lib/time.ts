/** Timezone helpers built on Intl — no date library needed. */

export type YMD = string; // "2026-09-06"

export function localDate(date: Date, timeZone: string): YMD {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

export function todayIn(timeZone: string): YMD {
  return localDate(new Date(), timeZone);
}

export function addDays(ymd: YMD, days: number): YMD {
  const [y, m, d] = ymd.split("-").map(Number);
  const t = Date.UTC(y, m - 1, d + days);
  return new Date(t).toISOString().slice(0, 10);
}

export function monthKey(ymd: YMD): string {
  return ymd.slice(0, 7); // "2026-09"
}

/** Inclusive [first, last] day of the month containing `ymd`. */
export function monthBounds(ymd: YMD): { start: YMD; end: YMD; days: number } {
  const [y, m] = ymd.split("-").map(Number);
  const start = `${y}-${String(m).padStart(2, "0")}-01`;
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return { start, end: `${start.slice(0, 8)}${String(days).padStart(2, "0")}`, days };
}

export function previousMonthKey(key: string): string {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 2, 1));
  return d.toISOString().slice(0, 7);
}

export function nextMonthKey(key: string): string {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(Date.UTC(y, m, 1));
  return d.toISOString().slice(0, 7);
}

export function boundsForMonthKey(key: string) {
  return monthBounds(`${key}-01`);
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function monthName(key: string): string {
  const m = Number(key.slice(5, 7));
  return MONTHS[m - 1];
}

export function monthLabel(key: string): string {
  return `${monthName(key)} ${key.slice(0, 4)}`;
}

export function dayLabel(ymd: YMD, timeZone: string): string {
  const today = todayIn(timeZone);
  if (ymd === today) return "Today";
  if (ymd === addDays(today, -1)) return "Yesterday";
  const [y, m, d] = ymd.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

export function isValidTimeZone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}
