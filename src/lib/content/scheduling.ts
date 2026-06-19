import type { SchedulingAlgorithm, SchedulingState } from "./types";

export function initialSchedulingState(
  algorithm: SchedulingAlgorithm,
  now: number,
): SchedulingState {
  switch (algorithm) {
    case "fsrs":
      return {
        algorithm: "fsrs",
        due: now,
        stability: 0,
        difficulty: 0,
        elapsedDays: 0,
        scheduledDays: 0,
        reps: 0,
        lapses: 0,
        state: "new",
      };
    case "sm2":
      return {
        algorithm: "sm2",
        due: now,
        interval: 0,
        repetition: 0,
        easiness: 2.5,
      };
    case "leitner":
      return {
        algorithm: "leitner",
        due: now,
        box: 0,
      };
  }
}
