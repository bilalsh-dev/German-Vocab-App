const DAY_MS = 86_400_000;

export interface ForecastBucket {
  dayOffset: number;
  startMs: number;
  count: number;
}

export function startOfDay(ms: number): number {
  const date = new Date(ms);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export function buildDueForecast(
  dueDates: number[],
  now: number,
  days: number,
): ForecastBucket[] {
  const today = startOfDay(now);
  const buckets: ForecastBucket[] = Array.from({ length: days }, (_, index) => ({
    dayOffset: index,
    startMs: today + index * DAY_MS,
    count: 0,
  }));

  for (const due of dueDates) {
    const rawOffset = Math.round((startOfDay(due) - today) / DAY_MS);
    const offset = Math.max(0, rawOffset);
    if (offset < days) {
      buckets[offset].count += 1;
    }
  }

  return buckets;
}
