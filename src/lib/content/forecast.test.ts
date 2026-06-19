import { describe, expect, it } from "vitest";

import { buildDueForecast, startOfDay } from "./forecast";

const DAY_MS = 86_400_000;

describe("buildDueForecast", () => {
  const now = startOfDay(Date.now()) + 9 * 60 * 60 * 1000;
  const today = startOfDay(now);

  it("returns one bucket per requested day, all empty for no cards", () => {
    const buckets = buildDueForecast([], now, 14);
    expect(buckets).toHaveLength(14);
    expect(buckets.every((bucket) => bucket.count === 0)).toBe(true);
    expect(buckets[0].startMs).toBe(today);
  });

  it("counts overdue cards in today's bucket", () => {
    const buckets = buildDueForecast([now - 5 * DAY_MS, today - DAY_MS], now, 14);
    expect(buckets[0].count).toBe(2);
  });

  it("places cards in the bucket matching their due day", () => {
    const buckets = buildDueForecast(
      [today, today + DAY_MS, today + 5 * DAY_MS, today + 5 * DAY_MS],
      now,
      14,
    );
    expect(buckets[0].count).toBe(1);
    expect(buckets[1].count).toBe(1);
    expect(buckets[5].count).toBe(2);
  });

  it("drops cards due beyond the window", () => {
    const buckets = buildDueForecast([today + 20 * DAY_MS], now, 14);
    expect(buckets.reduce((sum, bucket) => sum + bucket.count, 0)).toBe(0);
  });
});
