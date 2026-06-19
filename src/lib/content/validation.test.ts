import { describe, expect, it } from "vitest";
import {
  assertValidCard,
  getCardValidationErrors,
  isValidCard,
} from "./validation";
import type { AdjectiveData, NounData, VerbData } from "./types";

const noun: NounData = { gender: "neuter", plural: "die Kinder" };
const verb: VerbData = {
  praesens: "geht",
  praeteritum: "ging",
  perfekt: "ist gegangen",
  auxiliary: "sein",
};
const adjective: AdjectiveData = { opposites: ["klein"] };

describe("getCardValidationErrors", () => {
  it("accepts matching part-of-speech data", () => {
    expect(isValidCard({ partOfSpeech: "noun", noun })).toBe(true);
    expect(isValidCard({ partOfSpeech: "verb", verb })).toBe(true);
    expect(isValidCard({ partOfSpeech: "adjective", adjective })).toBe(true);
    expect(isValidCard({ partOfSpeech: "adverb" })).toBe(true);
    expect(isValidCard({ partOfSpeech: "phrase" })).toBe(true);
  });

  it("flags missing required data", () => {
    expect(getCardValidationErrors({ partOfSpeech: "noun" })).toContain(
      'partOfSpeech "noun" requires "noun" data',
    );
  });

  it("flags data that does not match the part of speech", () => {
    expect(
      getCardValidationErrors({ partOfSpeech: "verb", noun }),
    ).toContain('"noun" data is only allowed when partOfSpeech is "noun"');
  });

  it("flags pos-specific data on a non-pos card", () => {
    expect(
      getCardValidationErrors({ partOfSpeech: "adverb", adjective }).length,
    ).toBeGreaterThan(0);
  });
});

describe("assertValidCard", () => {
  it("throws on an invalid card", () => {
    expect(() => assertValidCard({ partOfSpeech: "noun" })).toThrow(
      /Invalid card/,
    );
  });

  it("does not throw on a valid card", () => {
    expect(() =>
      assertValidCard({ partOfSpeech: "verb", verb }),
    ).not.toThrow();
  });
});
