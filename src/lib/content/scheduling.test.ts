import { describe, expect, it } from "vitest";

import {
  initialSchedulingState,
  isDueScheduling,
  isNewScheduling,
} from "./scheduling";
import type { SchedulingState } from "./types";

describe("isNewScheduling", () => {
  it("treats a fresh fsrs state as new", () => {
    expect(isNewScheduling(initialSchedulingState("fsrs", 0))).toBe(true);
  });

  it("treats a reviewed fsrs state as not new", () => {
    const state: SchedulingState = {
      ...initialSchedulingState("fsrs", 0),
      algorithm: "fsrs",
      state: "review",
    };
    expect(isNewScheduling(state)).toBe(false);
  });

  it("uses repetition for sm2 and box for leitner", () => {
    expect(isNewScheduling(initialSchedulingState("sm2", 0))).toBe(true);
    expect(isNewScheduling(initialSchedulingState("leitner", 0))).toBe(true);
  });
});

describe("isDueScheduling", () => {
  it("is due when due time is at or before now", () => {
    const state = { ...initialSchedulingState("fsrs", 0), due: 1000 };
    expect(isDueScheduling(state, 1000)).toBe(true);
    expect(isDueScheduling(state, 2000)).toBe(true);
    expect(isDueScheduling(state, 500)).toBe(false);
  });
});
