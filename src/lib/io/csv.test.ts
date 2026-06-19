import { describe, expect, it } from "vitest";

import { parseCardsFromCsv, parseCsv, serializeCardsToCsv } from "./csv";
import { validatePortableCard } from "./validation";
import type { PortableCard } from "./format";

const cards: PortableCard[] = [
  {
    partOfSpeech: "noun",
    english: "child",
    german: "das Kind",
    vowelMarks: [{ index: 1, length: "short" }],
    noun: { gender: "neuter", plural: "die Kinder" },
    related: [],
    examples: [
      { de: "Das Kind spielt, lacht und singt.", en: "The child plays, laughs, and sings." },
    ],
    topic: "Familie",
    tags: ["family", "people"],
    notes: "A common A1 word.",
  },
  {
    partOfSpeech: "verb",
    english: "to work",
    german: "arbeiten",
    vowelMarks: [],
    verb: {
      praesens: "arbeitet",
      praeteritum: "arbeitete",
      perfekt: "hat gearbeitet",
      auxiliary: "haben",
    },
    related: [{ german: "die Arbeit", relation: "nominalization" }],
    examples: [],
    topic: "Büro",
    tags: [],
  },
];

describe("csv parsing", () => {
  it("handles quoted fields with commas and escaped quotes", () => {
    const text = 'a,"b,c","he said ""hi"""\r\nd,e,f';
    expect(parseCsv(text)).toEqual([
      ["a", "b,c", 'he said "hi"'],
      ["d", "e", "f"],
    ]);
  });
});

describe("csv import/export", () => {
  it("round-trips core and rich fields through validation", () => {
    const csv = serializeCardsToCsv(cards);
    const parsed = parseCardsFromCsv(csv, "Mixed");
    expect(parsed.decks[0].name).toBe("Mixed");
    expect(parsed.decks[0].rows).toHaveLength(2);

    const first = validatePortableCard(parsed.decks[0].rows[0]);
    expect(first.ok).toBe(true);
    if (first.ok) {
      expect(first.card).toEqual(cards[0]);
    }

    const second = validatePortableCard(parsed.decks[0].rows[1]);
    expect(second.ok).toBe(true);
    if (second.ok) {
      expect(second.card).toEqual(cards[1]);
    }
  });

  it("returns an empty deck for a header-only file", () => {
    const csv = serializeCardsToCsv([]);
    const parsed = parseCardsFromCsv(csv, "Empty");
    expect(parsed.decks[0].rows).toHaveLength(0);
  });
});
