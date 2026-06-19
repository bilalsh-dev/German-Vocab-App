import { describe, expect, it } from "vitest";

import { parseDecksFromJson, serializeDecksToJson } from "./json";
import type { PortableDeck } from "./format";

const deck: PortableDeck = {
  name: "Familie",
  description: "Family words",
  cards: [
    {
      partOfSpeech: "noun",
      english: "father",
      german: "der Vater",
      vowelMarks: [{ index: 1, length: "long" }],
      noun: { gender: "masculine", plural: "die Väter" },
      related: [{ german: "die Eltern", relation: "related" }],
      examples: [{ de: "Mein Vater arbeitet.", en: "My father works." }],
      topic: "Familie",
      tags: ["family"],
    },
  ],
};

describe("json import/export", () => {
  it("round-trips a deck without data loss", () => {
    const json = serializeDecksToJson([deck]);
    const parsed = parseDecksFromJson(json);
    expect(parsed.decks).toHaveLength(1);
    expect(parsed.decks[0].name).toBe("Familie");
    expect(parsed.decks[0].description).toBe("Family words");
    expect(parsed.decks[0].rows[0]).toEqual(deck.cards[0]);
  });

  it("throws on invalid JSON", () => {
    expect(() => parseDecksFromJson("{not json")).toThrow();
  });

  it("throws on an unrecognized format", () => {
    expect(() =>
      parseDecksFromJson(JSON.stringify({ format: "other", decks: [] })),
    ).toThrow();
  });

  it("throws when decks is not an array", () => {
    expect(() =>
      parseDecksFromJson(JSON.stringify({ format: "wortbox", decks: {} })),
    ).toThrow();
  });
});
