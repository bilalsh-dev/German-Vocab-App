import { describe, expect, it } from "vitest";

import { initialSchedulingState } from "../content/scheduling";
import { DEFAULT_SCHEDULER_PARAMS } from "../db/settings";
import type {
  FsrsSchedulingState,
  Grade,
  SchedulingState,
} from "../content/types";
import { describeInterval } from "./interval";
import { previewGrades, scheduleNext } from "./scheduler";

const GRADES: Grade[] = ["again", "hard", "good", "easy"];
const NOW = 1_700_000_000_000;

function reviewCard(): FsrsSchedulingState {
  return {
    algorithm: "fsrs",
    due: NOW,
    stability: 15,
    difficulty: 5,
    elapsedDays: 15,
    scheduledDays: 15,
    learningSteps: 0,
    reps: 4,
    lapses: 0,
    state: "review",
    lastReview: NOW - 15 * 24 * 60 * 60 * 1000,
  };
}

describe("scheduleNext — new card", () => {
  const state = initialSchedulingState("fsrs", NOW);

  it("schedules every grade forward from now", () => {
    for (const grade of GRADES) {
      const next = scheduleNext(state, grade, DEFAULT_SCHEDULER_PARAMS, NOW);
      expect(next.algorithm).toBe("fsrs");
      expect(next.due).toBeGreaterThan(NOW);
    }
  });

  it("orders intervals again <= hard <= good <= easy", () => {
    const due = GRADES.map(
      (grade) => scheduleNext(state, grade, DEFAULT_SCHEDULER_PARAMS, NOW).due,
    );
    expect(due[0]).toBeLessThanOrEqual(due[1]);
    expect(due[1]).toBeLessThanOrEqual(due[2]);
    expect(due[2]).toBeLessThanOrEqual(due[3]);
  });

  it("leaves the New state once graded", () => {
    const next = scheduleNext(
      state,
      "good",
      DEFAULT_SCHEDULER_PARAMS,
      NOW,
    ) as FsrsSchedulingState;
    expect(next.state).not.toBe("new");
    expect(next.reps).toBe(1);
  });
});

describe("scheduleNext — review card", () => {
  it("advances reps and lengthens the interval on good", () => {
    const next = scheduleNext(
      reviewCard(),
      "good",
      DEFAULT_SCHEDULER_PARAMS,
      NOW,
    ) as FsrsSchedulingState;
    expect(next.state).toBe("review");
    expect(next.reps).toBe(5);
    expect(next.scheduledDays).toBeGreaterThan(0);
  });

  it("records a lapse and relearns on again", () => {
    const next = scheduleNext(
      reviewCard(),
      "again",
      DEFAULT_SCHEDULER_PARAMS,
      NOW,
    ) as FsrsSchedulingState;
    expect(next.lapses).toBe(1);
    expect(next.state).toBe("relearning");
  });
});

describe("previewGrades", () => {
  it("matches what scheduleNext applies for each grade", () => {
    const state = reviewCard();
    const previews = previewGrades(state, DEFAULT_SCHEDULER_PARAMS, NOW);
    for (const grade of GRADES) {
      const applied = scheduleNext(state, grade, DEFAULT_SCHEDULER_PARAMS, NOW);
      expect(applied).toEqual(previews[grade]);
    }
  });

  it("respects request retention (lower retention => longer good interval)", () => {
    const state = reviewCard();
    const high = scheduleNext(
      state,
      "good",
      { ...DEFAULT_SCHEDULER_PARAMS, requestRetention: 0.95 },
      NOW,
    );
    const low = scheduleNext(
      state,
      "good",
      { ...DEFAULT_SCHEDULER_PARAMS, requestRetention: 0.8 },
      NOW,
    );
    expect(low.due).toBeGreaterThan(high.due);
  });
});

describe("scheduleNext — unsupported algorithm", () => {
  it("throws for non-fsrs scheduling state", () => {
    const sm2: SchedulingState = initialSchedulingState("sm2", NOW);
    expect(() =>
      scheduleNext(sm2, "good", DEFAULT_SCHEDULER_PARAMS, NOW),
    ).toThrow(/not implemented/);
  });
});

describe("describeInterval", () => {
  it("reports minutes under an hour", () => {
    expect(describeInterval(NOW + 10 * 60_000, NOW)).toEqual({
      unit: "minute",
      value: 10,
    });
  });

  it("reports hours under a day", () => {
    expect(describeInterval(NOW + 5 * 60 * 60_000, NOW)).toEqual({
      unit: "hour",
      value: 5,
    });
  });

  it("reports days under a month", () => {
    expect(describeInterval(NOW + 4 * 24 * 60 * 60_000, NOW)).toEqual({
      unit: "day",
      value: 4,
    });
  });

  it("reports months and years for long spans", () => {
    expect(describeInterval(NOW + 90 * 24 * 60 * 60_000, NOW).unit).toBe(
      "month",
    );
    expect(describeInterval(NOW + 800 * 24 * 60 * 60_000, NOW).unit).toBe(
      "year",
    );
  });

  it("never returns a negative or zero minute value", () => {
    expect(describeInterval(NOW - 5000, NOW)).toEqual({
      unit: "minute",
      value: 1,
    });
  });
});
