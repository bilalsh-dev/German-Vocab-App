import { scheduleNext } from "./scheduler";
import type { Grade, SchedulerParams, SchedulingState } from "../content/types";

const DAY_MS = 86_400_000;

export interface IntervalPoint {
  step: number;
  dueMs: number;
  intervalDays: number;
}

export function projectIntervalCurve(
  initial: SchedulingState,
  grade: Grade,
  params: SchedulerParams,
  now: number,
  steps: number,
): IntervalPoint[] {
  const points: IntervalPoint[] = [];
  let state = initial;
  let reviewedAt = now;

  for (let step = 1; step <= steps; step += 1) {
    const next = scheduleNext(state, grade, params, reviewedAt);
    points.push({
      step,
      dueMs: next.due,
      intervalDays: Math.max(0, (next.due - reviewedAt) / DAY_MS),
    });
    state = next;
    reviewedAt = next.due;
  }

  return points;
}
