import { describe, expect, it } from "vitest";
import {
  genderColorToken,
  genderEndingHint,
  genderGroupHint,
} from "./gender";
import type { Card, Gender, PartOfSpeech } from "./types";

function makeCard(overrides: Partial<Card> = {}): Card {
  return {
    id: "c1",
    deckId: "d1",
    partOfSpeech: "noun" as PartOfSpeech,
    english: "child",
    german: "das Kind",
    vowelMarks: [],
    related: [],
    examples: [],
    topic: "Familie",
    tags: [],
    scheduling: {
      algorithm: "fsrs",
      due: 0,
      stability: 0,
      difficulty: 0,
      elapsedDays: 0,
      scheduledDays: 0,
      reps: 0,
      lapses: 0,
      state: "new",
    },
    createdAt: 0,
    updatedAt: 0,
    ...overrides,
  };
}

function nounCard(gender: Gender, german: string): Card {
  return makeCard({
    partOfSpeech: "noun",
    german,
    noun: { gender, plural: "" },
  });
}

describe("genderColorToken", () => {
  it("maps each gender to its article and token", () => {
    expect(genderColorToken(nounCard("masculine", "der Mann"))).toEqual({
      gender: "masculine",
      article: "der",
      cssVariable: "--gender-masc",
      textClass: "text-gender-masc",
    });
    expect(genderColorToken(nounCard("feminine", "die Frau"))?.article).toBe(
      "die",
    );
    expect(genderColorToken(nounCard("neuter", "das Kind"))?.article).toBe(
      "das",
    );
  });

  it("returns null for non-nouns", () => {
    expect(
      genderColorToken(makeCard({ partOfSpeech: "verb", noun: undefined })),
    ).toBeNull();
  });

  it("returns null for a noun missing noun data", () => {
    expect(
      genderColorToken(makeCard({ partOfSpeech: "noun", noun: undefined })),
    ).toBeNull();
  });
});

describe("genderEndingHint", () => {
  it("detects feminine endings and strips the article", () => {
    expect(genderEndingHint("die Freiheit")?.gender).toBe("feminine");
    expect(genderEndingHint("Zeitung")?.gender).toBe("feminine");
    expect(genderEndingHint("die Information")?.gender).toBe("feminine");
  });

  it("detects neuter endings", () => {
    expect(genderEndingHint("das Mädchen")?.gender).toBe("neuter");
    expect(genderEndingHint("Dokument")?.gender).toBe("neuter");
  });

  it("detects masculine endings", () => {
    expect(genderEndingHint("der Lehrer")?.gender).toBe("masculine");
    expect(genderEndingHint("der Lehrling")?.gender).toBe("masculine");
  });

  it("prefers the longer, more specific suffix", () => {
    expect(genderEndingHint("die Freiheit")?.reason).toBe("-heit → feminine");
  });

  it("returns null when no rule matches", () => {
    expect(genderEndingHint("das Auto")).toBeNull();
  });
});

describe("genderGroupHint", () => {
  it("flags days, months, seasons, and weather as masculine", () => {
    expect(genderGroupHint(nounCard("masculine", "der Montag"))?.reason).toBe(
      "days of the week are masculine",
    );
    expect(genderGroupHint(nounCard("masculine", "Dezember"))?.gender).toBe(
      "masculine",
    );
    expect(genderGroupHint(nounCard("masculine", "der Sommer"))?.gender).toBe(
      "masculine",
    );
    expect(genderGroupHint(nounCard("masculine", "der Regen"))?.gender).toBe(
      "masculine",
    );
  });

  it("returns null for words outside the known groups", () => {
    expect(genderGroupHint(nounCard("neuter", "das Kind"))).toBeNull();
  });
});
