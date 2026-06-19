import { describe, expect, it } from "vitest";

import { buildCardFields, getCardDraftErrors } from "../content/card-draft";
import type { PortableCard } from "./format";
import { parseDraftRequest, portableToDraft } from "./ai";

describe("parseDraftRequest", () => {
  it("accepts a valid word request", () => {
    const outcome = parseDraftRequest({
      mode: "word",
      input: "  Haus  ",
      topic: " Familie ",
    });
    expect(outcome).toEqual({
      ok: true,
      request: { mode: "word", input: "Haus", topic: "Familie" },
    });
  });

  it("rejects a non-object body", () => {
    expect(parseDraftRequest(null).ok).toBe(false);
    expect(parseDraftRequest("nope").ok).toBe(false);
  });

  it("rejects an unknown mode", () => {
    const outcome = parseDraftRequest({
      mode: "sentence",
      input: "Haus",
      topic: "Familie",
    });
    expect(outcome.ok).toBe(false);
  });

  it("rejects a missing or blank input", () => {
    expect(parseDraftRequest({ mode: "word", input: "  ", topic: "x" }).ok).toBe(
      false,
    );
    expect(parseDraftRequest({ mode: "word", topic: "x" }).ok).toBe(false);
  });

  it("rejects an overly long input", () => {
    const outcome = parseDraftRequest({
      mode: "topic",
      input: "a".repeat(201),
      topic: "x",
    });
    expect(outcome.ok).toBe(false);
  });

  it("rejects a missing topic", () => {
    expect(parseDraftRequest({ mode: "topic", input: "Kitchen" }).ok).toBe(
      false,
    );
  });
});

describe("portableToDraft", () => {
  const noun: PortableCard = {
    partOfSpeech: "noun",
    english: "house",
    german: "Haus",
    vowelMarks: [{ index: 1, length: "long" }],
    noun: { gender: "neuter", plural: "die Häuser" },
    related: [{ german: "die Wohnung", relation: "related" }],
    examples: [
      { de: "Das Haus ist groß.", en: "The house is big." },
      { de: "Wir kaufen ein Haus.", en: "We are buying a house." },
      { de: "Das Haus hat einen Garten.", en: "The house has a garden." },
    ],
    topic: "Familie",
    tags: ["wohnen"],
  };

  it("maps a portable noun into an editable draft", () => {
    const draft = portableToDraft(noun);
    expect(draft.partOfSpeech).toBe("noun");
    expect(draft.noun).toEqual({ gender: "neuter", plural: "die Häuser" });
    expect(draft.tags).toBe("wohnen");
    expect(draft.vowelMarks).toEqual([{ index: 1, length: "long" }]);
  });

  it("produces a draft that passes the editor's save gate", () => {
    const draft = portableToDraft(noun);
    expect(getCardDraftErrors(draft)).toEqual([]);
  });

  it("round-trips content back through buildCardFields", () => {
    const fields = buildCardFields(portableToDraft(noun), "deck-1");
    expect(fields.german).toBe("Haus");
    expect(fields.noun).toEqual({ gender: "neuter", plural: "die Häuser" });
    expect(fields.examples).toHaveLength(3);
    expect(fields.tags).toEqual(["wohnen"]);
  });

  it("joins adjective lists for the comma-separated inputs", () => {
    const adjective: PortableCard = {
      partOfSpeech: "adjective",
      english: "big",
      german: "groß",
      vowelMarks: [],
      adjective: { opposites: ["klein"], synonyms: ["riesig", "enorm"] },
      related: [],
      examples: [
        { de: "Das Haus ist groß.", en: "The house is big." },
        { de: "Der Hund ist groß.", en: "The dog is big." },
        { de: "Sie hat große Augen.", en: "She has big eyes." },
      ],
      topic: "Adjektive",
      tags: [],
    };
    const draft = portableToDraft(adjective);
    expect(draft.adjective).toEqual({
      opposites: "klein",
      synonyms: "riesig, enorm",
    });
  });
});
