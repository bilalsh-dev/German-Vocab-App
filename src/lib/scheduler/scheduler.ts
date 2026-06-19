import { fsrs, Rating } from "ts-fsrs";

import type {
  FsrsSchedulingState,
  Grade,
  SchedulerParams,
  SchedulingState,
} from "../content/types";
import {
  fromFsrsCard,
  GRADE_TO_RATING,
  toFsrsCard,
  toFsrsParameters,
} from "./conversions";

export type GradeOutcomes = Record<Grade, FsrsSchedulingState>;

function assertFsrs(state: SchedulingState): asserts state is FsrsSchedulingState {
  if (state.algorithm !== "fsrs") {
    throw new Error(
      `Scheduler not implemented for algorithm "${state.algorithm}"`,
    );
  }
}

export function previewGrades(
  state: SchedulingState,
  params: SchedulerParams,
  now: number,
): GradeOutcomes {
  assertFsrs(state);
  const record = fsrs(toFsrsParameters(params)).repeat(
    toFsrsCard(state),
    new Date(now),
  );
  return {
    again: fromFsrsCard(record[Rating.Again].card),
    hard: fromFsrsCard(record[Rating.Hard].card),
    good: fromFsrsCard(record[Rating.Good].card),
    easy: fromFsrsCard(record[Rating.Easy].card),
  };
}

export function scheduleNext(
  state: SchedulingState,
  grade: Grade,
  params: SchedulerParams,
  now: number,
): SchedulingState {
  return previewGrades(state, params, now)[grade];
}

export { GRADE_TO_RATING };
