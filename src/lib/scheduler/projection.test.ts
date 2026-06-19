import { describe, expect, it } from "vitest";

import { initialSchedulingState } from "../content/scheduling";
import type { SchedulerParams } from "../content/types";
import { projectIntervalCurve } from "./projection";

const params: SchedulerParams = {
  algorithm: "fsrs",
  requestRetention: 0.9,
  maximumIntervalDays: 36500,
};

describe("projectIntervalCurve", () => {
  it("returns one point per requested step", () => {
    const curve = projectIntervalCurve(
      initialSchedulingState("fsrs", 0),
      "good",
      params,
      0,
      8,
    );
    expect(curve).toHaveLength(8);
    expect(curve.map((point) => point.step)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it("produces strictly increasing due dates for successive good grades", () => {
    const curve = projectIntervalCurve(
      initialSchedulingState("fsrs", 0),
      "good",
      params,
      0,
      8,
    );
    for (let i = 1; i < curve.length; i += 1) {
      expect(curve[i].dueMs).toBeGreaterThan(curve[i - 1].dueMs);
    }
    expect(curve.at(-1)!.intervalDays).toBeGreaterThan(curve[0].intervalDays);
  });

  it("spaces easy grades at least as far as good grades", () => {
    const initial = initialSchedulingState("fsrs", 0);
    const good = projectIntervalCurve(initial, "good", params, 0, 5);
    const easy = projectIntervalCurve(initial, "easy", params, 0, 5);
    expect(easy.at(-1)!.dueMs).toBeGreaterThanOrEqual(good.at(-1)!.dueMs);
  });

  it("throws for an unsupported algorithm", () => {
    expect(() =>
      projectIntervalCurve(
        initialSchedulingState("sm2", 0),
        "good",
        params,
        0,
        3,
      ),
    ).toThrow();
  });
});
