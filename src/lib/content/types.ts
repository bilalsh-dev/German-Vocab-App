import type { Locale } from "../../i18n/config";

export type Gender = "masculine" | "feminine" | "neuter";

export type PartOfSpeech =
  | "noun"
  | "verb"
  | "adjective"
  | "adverb"
  | "phrase"
  | "other";

export type VowelLength = "long" | "short";

export interface VowelMark {
  index: number;
  length: VowelLength;
}

export interface ExampleSentence {
  de: string;
  en: string;
  verbForm?: "praesens" | "praeteritum" | "perfekt";
}

export type RelationKind =
  | "nominalization"
  | "derived"
  | "compound"
  | "related";

export interface RelatedWord {
  german: string;
  english?: string;
  relation: RelationKind;
}

export interface NounData {
  gender: Gender;
  plural: string;
  genderEndingHint?: string;
  genderGroupHint?: string;
}

export interface VerbData {
  praesens: string;
  praeteritum: string;
  perfekt: string;
  auxiliary: "haben" | "sein";
}

export interface AdjectiveData {
  opposites?: string[];
  synonyms?: string[];
  comparative?: string;
  superlative?: string;
}

export type Grade = "again" | "hard" | "good" | "easy";

export type SchedulingAlgorithm = "fsrs" | "sm2" | "leitner";

export type FsrsState = "new" | "learning" | "review" | "relearning";

export interface FsrsSchedulingState {
  algorithm: "fsrs";
  due: number;
  stability: number;
  difficulty: number;
  elapsedDays: number;
  scheduledDays: number;
  learningSteps: number;
  reps: number;
  lapses: number;
  state: FsrsState;
  lastReview?: number;
}

export interface Sm2SchedulingState {
  algorithm: "sm2";
  due: number;
  interval: number;
  repetition: number;
  easiness: number;
}

export interface LeitnerSchedulingState {
  algorithm: "leitner";
  due: number;
  box: number;
}

export type SchedulingState =
  | FsrsSchedulingState
  | Sm2SchedulingState
  | LeitnerSchedulingState;

export interface Card {
  id: string;
  deckId: string;
  partOfSpeech: PartOfSpeech;

  english: string;
  german: string;
  vowelMarks: VowelMark[];

  noun?: NounData;
  verb?: VerbData;
  adjective?: AdjectiveData;

  related: RelatedWord[];
  examples: ExampleSentence[];

  topic: string;
  tags: string[];
  notes?: string;

  scheduling: SchedulingState;
  createdAt: number;
  updatedAt: number;
}

export interface Deck {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
}

export interface ReviewLogEntry {
  id: string;
  cardId: string;
  deckId: string;
  grade: Grade;
  reviewedAt: number;
  nextDue: number;
  scheduledDays: number;
}

export type StudyDirection = "english-front" | "german-front" | "mix";

export type PromptSide = "english" | "german";

export interface SchedulerParams {
  algorithm: SchedulingAlgorithm;
  requestRetention: number;
  maximumIntervalDays: number;
  weights?: number[];
}

export interface Settings {
  id: string;
  uiLanguage: Locale;
  studyDirection: StudyDirection;
  scheduler: SchedulerParams;
}
