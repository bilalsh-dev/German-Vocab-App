export type IntervalUnit = "minute" | "hour" | "day" | "month" | "year";

export interface Interval {
  unit: IntervalUnit;
  value: number;
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function describeInterval(dueMs: number, now: number): Interval {
  const span = Math.max(0, dueMs - now);

  if (span < HOUR) {
    return { unit: "minute", value: Math.max(1, Math.round(span / MINUTE)) };
  }
  if (span < DAY) {
    return { unit: "hour", value: Math.round(span / HOUR) };
  }

  const days = span / DAY;
  if (days < 30) {
    return { unit: "day", value: Math.max(1, Math.round(days)) };
  }
  if (days < 365) {
    return { unit: "month", value: Math.round(days / 30) };
  }
  return { unit: "year", value: Math.round(days / 365) };
}
