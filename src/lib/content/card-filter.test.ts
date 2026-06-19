import { describe, expect, it } from "vitest";

import { collectTags, collectTopics, filterCards } from "./card-filter";
import { initialSchedulingState } from "./scheduling";
import type { Card } from "./types";

function card(overrides: Partial<Card>): Card {
  return {
    id: crypto.randomUUID(),
    deckId: "deck-1",
    partOfSpeech: "other",
    english: "x",
    german: "x",
    vowelMarks: [],
    related: [],
    examples: [],
    topic: "Familie",
    tags: [],
    scheduling: initialSchedulingState("fsrs", 0),
    createdAt: 0,
    updatedAt: 0,
    ...overrides,
  };
}

const cards: Card[] = [
  card({ topic: "Familie", tags: ["people", "core"] }),
  card({ topic: "Büro", tags: ["work"] }),
  card({ topic: "Familie", tags: ["core"] }),
];

describe("filterCards", () => {
  it("filters by topic", () => {
    expect(filterCards(cards, { topic: "Familie" })).toHaveLength(2);
  });

  it("filters by tag", () => {
    expect(filterCards(cards, { tag: "core" })).toHaveLength(2);
  });

  it("combines topic and tag", () => {
    expect(filterCards(cards, { topic: "Büro", tag: "core" })).toHaveLength(0);
  });

  it("returns all cards with an empty filter", () => {
    expect(filterCards(cards, {})).toHaveLength(3);
  });
});

describe("collectTopics / collectTags", () => {
  it("returns sorted unique topics", () => {
    expect(collectTopics(cards)).toEqual(["Büro", "Familie"]);
  });

  it("returns sorted unique tags", () => {
    expect(collectTags(cards)).toEqual(["core", "people", "work"]);
  });
});
