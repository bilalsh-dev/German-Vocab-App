import type { Card, Gender } from "./types";

export interface GenderPresentation {
  gender: Gender;
  article: "der" | "die" | "das";
  cssVariable: string;
  textClass: string;
}

export interface GenderHint {
  gender: Gender;
  reason: string;
}

const GENDER_PRESENTATION: Record<Gender, GenderPresentation> = {
  masculine: {
    gender: "masculine",
    article: "der",
    cssVariable: "--gender-masc",
    textClass: "text-gender-masc",
  },
  feminine: {
    gender: "feminine",
    article: "die",
    cssVariable: "--gender-fem",
    textClass: "text-gender-fem",
  },
  neuter: {
    gender: "neuter",
    article: "das",
    cssVariable: "--gender-neuter",
    textClass: "text-gender-neuter",
  },
};

export function genderColorToken(card: Card): GenderPresentation | null {
  if (card.partOfSpeech !== "noun" || !card.noun) {
    return null;
  }
  return GENDER_PRESENTATION[card.noun.gender];
}

function normalizeHeadword(german: string): string {
  return german
    .trim()
    .replace(/^(der|die|das)\s+/i, "")
    .toLowerCase();
}

interface SuffixRule {
  suffix: string;
  gender: Gender;
}

const ENDING_RULES: SuffixRule[] = [
  { suffix: "heit", gender: "feminine" },
  { suffix: "keit", gender: "feminine" },
  { suffix: "schaft", gender: "feminine" },
  { suffix: "ung", gender: "feminine" },
  { suffix: "tion", gender: "feminine" },
  { suffix: "sion", gender: "feminine" },
  { suffix: "ität", gender: "feminine" },
  { suffix: "ie", gender: "feminine" },
  { suffix: "ik", gender: "feminine" },
  { suffix: "ur", gender: "feminine" },
  { suffix: "enz", gender: "feminine" },
  { suffix: "anz", gender: "feminine" },
  { suffix: "chen", gender: "neuter" },
  { suffix: "lein", gender: "neuter" },
  { suffix: "ment", gender: "neuter" },
  { suffix: "tum", gender: "neuter" },
  { suffix: "um", gender: "neuter" },
  { suffix: "ling", gender: "masculine" },
  { suffix: "ismus", gender: "masculine" },
  { suffix: "ant", gender: "masculine" },
  { suffix: "or", gender: "masculine" },
  { suffix: "er", gender: "masculine" },
];

const SORTED_ENDING_RULES = [...ENDING_RULES].sort(
  (a, b) => b.suffix.length - a.suffix.length,
);

export function genderEndingHint(german: string): GenderHint | null {
  const word = normalizeHeadword(german);
  for (const rule of SORTED_ENDING_RULES) {
    if (word.endsWith(rule.suffix)) {
      return {
        gender: rule.gender,
        reason: `-${rule.suffix} → ${rule.gender}`,
      };
    }
  }
  return null;
}

interface GroupRule {
  reason: string;
  gender: Gender;
  members: ReadonlySet<string>;
}

const lower = (words: string[]): ReadonlySet<string> =>
  new Set(words.map((word) => word.toLowerCase()));

const GROUP_RULES: GroupRule[] = [
  {
    reason: "days of the week are masculine",
    gender: "masculine",
    members: lower([
      "Montag",
      "Dienstag",
      "Mittwoch",
      "Donnerstag",
      "Freitag",
      "Samstag",
      "Sonnabend",
      "Sonntag",
    ]),
  },
  {
    reason: "months are masculine",
    gender: "masculine",
    members: lower([
      "Januar",
      "Februar",
      "März",
      "April",
      "Mai",
      "Juni",
      "Juli",
      "August",
      "September",
      "Oktober",
      "November",
      "Dezember",
    ]),
  },
  {
    reason: "seasons are masculine",
    gender: "masculine",
    members: lower(["Frühling", "Sommer", "Herbst", "Winter"]),
  },
  {
    reason: "weather words are masculine",
    gender: "masculine",
    members: lower([
      "Regen",
      "Schnee",
      "Wind",
      "Nebel",
      "Sturm",
      "Hagel",
      "Frost",
      "Donner",
      "Blitz",
    ]),
  },
];

export function genderGroupHint(card: Card): GenderHint | null {
  const word = normalizeHeadword(card.german);
  for (const rule of GROUP_RULES) {
    if (rule.members.has(word)) {
      return { gender: rule.gender, reason: rule.reason };
    }
  }
  return null;
}
