import {
  generatorParameters,
  Rating,
  State,
  type Card as FsrsCard,
  type FSRSParameters,
  type Grade as FsrsGrade,
} from "ts-fsrs";

import type {
  FsrsSchedulingState,
  FsrsState,
  Grade,
  SchedulerParams,
} from "../content/types";

export const GRADE_TO_RATING: Record<Grade, FsrsGrade> = {
  again: Rating.Again,
  hard: Rating.Hard,
  good: Rating.Good,
  easy: Rating.Easy,
};

const STATE_TO_FSRS: Record<FsrsState, State> = {
  new: State.New,
  learning: State.Learning,
  review: State.Review,
  relearning: State.Relearning,
};

const FSRS_TO_STATE: Record<State, FsrsState> = {
  [State.New]: "new",
  [State.Learning]: "learning",
  [State.Review]: "review",
  [State.Relearning]: "relearning",
};

export function toFsrsParameters(params: SchedulerParams): FSRSParameters {
  return generatorParameters({
    request_retention: params.requestRetention,
    maximum_interval: params.maximumIntervalDays,
    ...(params.weights ? { w: params.weights } : {}),
  });
}

export function toFsrsCard(state: FsrsSchedulingState): FsrsCard {
  return {
    due: new Date(state.due),
    stability: state.stability,
    difficulty: state.difficulty,
    elapsed_days: state.elapsedDays,
    scheduled_days: state.scheduledDays,
    learning_steps: state.learningSteps,
    reps: state.reps,
    lapses: state.lapses,
    state: STATE_TO_FSRS[state.state],
    last_review:
      state.lastReview !== undefined ? new Date(state.lastReview) : undefined,
  };
}

export function fromFsrsCard(card: FsrsCard): FsrsSchedulingState {
  return {
    algorithm: "fsrs",
    due: card.due.getTime(),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsedDays: card.elapsed_days,
    scheduledDays: card.scheduled_days,
    learningSteps: card.learning_steps,
    reps: card.reps,
    lapses: card.lapses,
    state: FSRS_TO_STATE[card.state],
    ...(card.last_review
      ? { lastReview: card.last_review.getTime() }
      : {}),
  };
}
