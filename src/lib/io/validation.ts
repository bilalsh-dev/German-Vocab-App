import { getCardValidationErrors } from "../content/validation";
import type {
  AdjectiveData,
  ExampleSentence,
  Gender,
  NounData,
  PartOfSpeech,
  RelatedWord,
  RelationKind,
  VerbData,
  VowelMark,
} from "../content/types";
import type { PortableCard } from "./format";

const PARTS_OF_SPEECH: readonly PartOfSpeech[] = [
  "noun",
  "verb",
  "adjective",
  "adverb",
  "phrase",
  "other",
];
const GENDERS: readonly Gender[] = ["masculine", "feminine", "neuter"];
const AUXILIARIES = ["haben", "sein"] as const;
const RELATIONS: readonly RelationKind[] = [
  "nominalization",
  "derived",
  "compound",
  "related",
];
const VERB_FORMS = ["praesens", "praeteritum", "perfekt"] as const;
const VOWEL_LENGTHS = ["long", "short"] as const;

export interface ValidationOk {
  ok: true;
  card: PortableCard;
}

export interface ValidationErr {
  ok: false;
  reasons: string[];
}

export type ValidationOutcome = ValidationOk | ValidationErr;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "";
}

function validateVowelMarks(value: unknown, reasons: string[]): VowelMark[] {
  if (value === undefined) {
    return [];
  }
  if (!Array.isArray(value)) {
    reasons.push("vowelMarks must be an array");
    return [];
  }
  const marks: VowelMark[] = [];
  value.forEach((entry, index) => {
    if (!isRecord(entry)) {
      reasons.push(`vowelMarks[${index}] must be an object`);
      return;
    }
    const markIndex = entry.index;
    const length = entry.length;
    if (typeof markIndex !== "number" || !Number.isInteger(markIndex) || markIndex < 0) {
      reasons.push(`vowelMarks[${index}].index must be a non-negative integer`);
      return;
    }
    if (length !== "long" && length !== "short") {
      reasons.push(
        `vowelMarks[${index}].length must be one of ${VOWEL_LENGTHS.join(", ")}`,
      );
      return;
    }
    marks.push({ index: markIndex, length });
  });
  return marks;
}

function validateStringArray(
  value: unknown,
  field: string,
  reasons: string[],
): string[] {
  if (value === undefined) {
    return [];
  }
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    reasons.push(`${field} must be an array of strings`);
    return [];
  }
  return value as string[];
}

function validateNoun(value: unknown, reasons: string[]): NounData | undefined {
  if (!isRecord(value)) {
    reasons.push("noun data must be an object");
    return undefined;
  }
  if (!GENDERS.includes(value.gender as Gender)) {
    reasons.push(`noun.gender must be one of ${GENDERS.join(", ")}`);
    return undefined;
  }
  if (typeof value.plural !== "string") {
    reasons.push("noun.plural must be a string");
    return undefined;
  }
  const noun: NounData = {
    gender: value.gender as Gender,
    plural: value.plural,
  };
  if (typeof value.genderEndingHint === "string") {
    noun.genderEndingHint = value.genderEndingHint;
  }
  if (typeof value.genderGroupHint === "string") {
    noun.genderGroupHint = value.genderGroupHint;
  }
  return noun;
}

function validateVerb(value: unknown, reasons: string[]): VerbData | undefined {
  if (!isRecord(value)) {
    reasons.push("verb data must be an object");
    return undefined;
  }
  const local: string[] = [];
  for (const form of VERB_FORMS) {
    if (!isNonEmptyString(value[form])) {
      local.push(`verb.${form} is required`);
    }
  }
  if (!AUXILIARIES.includes(value.auxiliary as (typeof AUXILIARIES)[number])) {
    local.push(`verb.auxiliary must be one of ${AUXILIARIES.join(", ")}`);
  }
  if (local.length > 0) {
    reasons.push(...local);
    return undefined;
  }
  return {
    praesens: value.praesens as string,
    praeteritum: value.praeteritum as string,
    perfekt: value.perfekt as string,
    auxiliary: value.auxiliary as "haben" | "sein",
  };
}

function validateAdjective(
  value: unknown,
  reasons: string[],
): AdjectiveData | undefined {
  if (!isRecord(value)) {
    reasons.push("adjective data must be an object");
    return undefined;
  }
  const adjective: AdjectiveData = {};
  const opposites = validateStringArray(
    value.opposites,
    "adjective.opposites",
    reasons,
  );
  const synonyms = validateStringArray(
    value.synonyms,
    "adjective.synonyms",
    reasons,
  );
  if (opposites.length > 0) {
    adjective.opposites = opposites;
  }
  if (synonyms.length > 0) {
    adjective.synonyms = synonyms;
  }
  if (typeof value.comparative === "string") {
    adjective.comparative = value.comparative;
  }
  if (typeof value.superlative === "string") {
    adjective.superlative = value.superlative;
  }
  return adjective;
}

function validateRelated(value: unknown, reasons: string[]): RelatedWord[] {
  if (value === undefined) {
    return [];
  }
  if (!Array.isArray(value)) {
    reasons.push("related must be an array");
    return [];
  }
  const related: RelatedWord[] = [];
  value.forEach((entry, index) => {
    if (!isRecord(entry)) {
      reasons.push(`related[${index}] must be an object`);
      return;
    }
    if (!isNonEmptyString(entry.german)) {
      reasons.push(`related[${index}].german is required`);
      return;
    }
    if (!RELATIONS.includes(entry.relation as RelationKind)) {
      reasons.push(
        `related[${index}].relation must be one of ${RELATIONS.join(", ")}`,
      );
      return;
    }
    const word: RelatedWord = {
      german: entry.german,
      relation: entry.relation as RelationKind,
    };
    if (typeof entry.english === "string") {
      word.english = entry.english;
    }
    related.push(word);
  });
  return related;
}

function validateExamples(value: unknown, reasons: string[]): ExampleSentence[] {
  if (value === undefined) {
    return [];
  }
  if (!Array.isArray(value)) {
    reasons.push("examples must be an array");
    return [];
  }
  const examples: ExampleSentence[] = [];
  value.forEach((entry, index) => {
    if (!isRecord(entry)) {
      reasons.push(`examples[${index}] must be an object`);
      return;
    }
    if (typeof entry.de !== "string" || typeof entry.en !== "string") {
      reasons.push(`examples[${index}] must have string "de" and "en"`);
      return;
    }
    const example: ExampleSentence = { de: entry.de, en: entry.en };
    if (
      entry.verbForm !== undefined &&
      !VERB_FORMS.includes(entry.verbForm as (typeof VERB_FORMS)[number])
    ) {
      reasons.push(
        `examples[${index}].verbForm must be one of ${VERB_FORMS.join(", ")}`,
      );
      return;
    }
    if (typeof entry.verbForm === "string") {
      example.verbForm = entry.verbForm as ExampleSentence["verbForm"];
    }
    examples.push(example);
  });
  return examples;
}

export function validatePortableCard(input: unknown): ValidationOutcome {
  const reasons: string[] = [];

  if (!isRecord(input)) {
    return { ok: false, reasons: ["row is not an object"] };
  }

  const partOfSpeech = input.partOfSpeech;
  if (!PARTS_OF_SPEECH.includes(partOfSpeech as PartOfSpeech)) {
    reasons.push(`partOfSpeech must be one of ${PARTS_OF_SPEECH.join(", ")}`);
  }
  if (!isNonEmptyString(input.english)) {
    reasons.push("english is required");
  }
  if (!isNonEmptyString(input.german)) {
    reasons.push("german is required");
  }
  if (!isNonEmptyString(input.topic)) {
    reasons.push("topic is required");
  }

  const vowelMarks = validateVowelMarks(input.vowelMarks, reasons);
  const tags = validateStringArray(input.tags, "tags", reasons);
  const related = validateRelated(input.related, reasons);
  const examples = validateExamples(input.examples, reasons);

  const pos = partOfSpeech as PartOfSpeech;
  let noun: NounData | undefined;
  let verb: VerbData | undefined;
  let adjective: AdjectiveData | undefined;

  if (input.noun !== undefined) {
    noun = validateNoun(input.noun, reasons);
  }
  if (input.verb !== undefined) {
    verb = validateVerb(input.verb, reasons);
  }
  if (input.adjective !== undefined) {
    adjective = validateAdjective(input.adjective, reasons);
  }

  if (input.notes !== undefined && typeof input.notes !== "string") {
    reasons.push("notes must be a string");
  }

  if (reasons.length > 0) {
    return { ok: false, reasons };
  }

  const card: PortableCard = {
    partOfSpeech: pos,
    english: (input.english as string).trim(),
    german: (input.german as string).trim(),
    vowelMarks,
    related,
    examples,
    topic: (input.topic as string).trim(),
    tags,
  };
  if (noun) {
    card.noun = noun;
  }
  if (verb) {
    card.verb = verb;
  }
  if (adjective) {
    card.adjective = adjective;
  }
  const notes = typeof input.notes === "string" ? input.notes.trim() : "";
  if (notes) {
    card.notes = notes;
  }

  const posErrors = getCardValidationErrors(card);
  if (posErrors.length > 0) {
    return { ok: false, reasons: posErrors };
  }

  return { ok: true, card };
}
