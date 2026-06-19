import type { Card, PartOfSpeech } from "./types";

const POS_DATA_KEYS = ["noun", "verb", "adjective"] as const;

type PosDataKey = (typeof POS_DATA_KEYS)[number];

const POS_FOR_KEY: Record<PosDataKey, PartOfSpeech> = {
  noun: "noun",
  verb: "verb",
  adjective: "adjective",
};

export function getCardValidationErrors(
  card: Pick<Card, "partOfSpeech" | "noun" | "verb" | "adjective">,
): string[] {
  const errors: string[] = [];

  for (const key of POS_DATA_KEYS) {
    const expectedPos = POS_FOR_KEY[key];
    const present = card[key] !== undefined;
    const shouldBePresent = card.partOfSpeech === expectedPos;

    if (shouldBePresent && !present) {
      errors.push(`partOfSpeech "${expectedPos}" requires "${key}" data`);
    }
    if (!shouldBePresent && present) {
      errors.push(
        `"${key}" data is only allowed when partOfSpeech is "${expectedPos}"`,
      );
    }
  }

  return errors;
}

export function isValidCard(
  card: Pick<Card, "partOfSpeech" | "noun" | "verb" | "adjective">,
): boolean {
  return getCardValidationErrors(card).length === 0;
}

export function assertValidCard(
  card: Pick<Card, "partOfSpeech" | "noun" | "verb" | "adjective">,
): void {
  const errors = getCardValidationErrors(card);
  if (errors.length > 0) {
    throw new Error(`Invalid card: ${errors.join("; ")}`);
  }
}
