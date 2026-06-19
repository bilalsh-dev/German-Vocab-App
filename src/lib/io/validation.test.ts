import { describe, expect, it } from "vitest";

import { validatePortableCard } from "./validation";

const validNoun = {
  partOfSpeech: "noun",
  english: "child",
  german: "das Kind",
  vowelMarks: [{ index: 1, length: "short" }],
  noun: { gender: "neuter", plural: "die Kinder" },
  related: [],
  examples: [{ de: "Das Kind spielt.", en: "The child plays." }],
  topic: "Familie",
  tags: ["family"],
};

const validVerb = {
  partOfSpeech: "verb",
  english: "to work",
  german: "arbeiten",
  verb: {
    praesens: "arbeitet",
    praeteritum: "arbeitete",
    perfekt: "hat gearbeitet",
    auxiliary: "haben",
  },
  examples: [],
  topic: "Büro",
};

describe("validatePortableCard", () => {
  it("accepts a well-formed noun card", () => {
    const outcome = validatePortableCard(validNoun);
    expect(outcome.ok).toBe(true);
    if (outcome.ok) {
      expect(outcome.card.noun?.gender).toBe("neuter");
      expect(outcome.card.tags).toEqual(["family"]);
    }
  });

  it("accepts a well-formed verb card with no examples or tags", () => {
    const outcome = validatePortableCard(validVerb);
    expect(outcome.ok).toBe(true);
    if (outcome.ok) {
      expect(outcome.card.verb?.auxiliary).toBe("haben");
      expect(outcome.card.tags).toEqual([]);
    }
  });

  it("rejects a non-object row", () => {
    const outcome = validatePortableCard("nope");
    expect(outcome.ok).toBe(false);
  });

  it("rejects a noun missing gender", () => {
    const outcome = validatePortableCard({
      ...validNoun,
      noun: { plural: "die Kinder" },
    });
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) {
      expect(outcome.reasons.join(" ")).toContain("noun.gender");
    }
  });

  it("rejects a verb missing a form", () => {
    const outcome = validatePortableCard({
      ...validVerb,
      verb: { praesens: "arbeitet", auxiliary: "haben" },
    });
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) {
      expect(outcome.reasons.join(" ")).toContain("praeteritum");
    }
  });

  it("rejects part-of-speech data on the wrong part of speech", () => {
    const outcome = validatePortableCard({
      ...validVerb,
      noun: { gender: "neuter", plural: "x" },
    });
    expect(outcome.ok).toBe(false);
  });

  it("rejects an invalid vowel mark", () => {
    const outcome = validatePortableCard({
      ...validNoun,
      vowelMarks: [{ index: -1, length: "long" }],
    });
    expect(outcome.ok).toBe(false);
  });

  it("rejects an unknown part of speech", () => {
    const outcome = validatePortableCard({ ...validNoun, partOfSpeech: "x" });
    expect(outcome.ok).toBe(false);
  });
});
