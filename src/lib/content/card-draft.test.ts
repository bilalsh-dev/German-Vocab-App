import { describe, expect, it } from "vitest";

import {
  buildCardFields,
  cardToDraft,
  draftToPreviewCard,
  emptyCardDraft,
  getCardDraftErrors,
} from "./card-draft";
import { isValidCard } from "./validation";
import type { Card } from "./types";

function nounDraft() {
  const draft = emptyCardDraft("Familie");
  draft.partOfSpeech = "noun";
  draft.english = "the child";
  draft.german = "Kind";
  draft.noun = { gender: "neuter", plural: "die Kinder" };
  draft.tags = "family, people";
  return draft;
}

describe("getCardDraftErrors", () => {
  it("requires english, german, and topic", () => {
    const errors = getCardDraftErrors(emptyCardDraft(""));
    expect(errors).toContain("englishRequired");
    expect(errors).toContain("germanRequired");
    expect(errors).toContain("topicRequired");
  });

  it("requires gender and plural for a noun", () => {
    const draft = emptyCardDraft("Familie");
    draft.english = "child";
    draft.german = "Kind";
    expect(getCardDraftErrors(draft)).toEqual(
      expect.arrayContaining(["nounGenderRequired", "nounPluralRequired"]),
    );
  });

  it("requires all three forms for a verb", () => {
    const draft = emptyCardDraft("Leben");
    draft.partOfSpeech = "verb";
    draft.english = "to go";
    draft.german = "gehen";
    draft.verb = {
      praesens: "geht",
      praeteritum: "",
      perfekt: "ist gegangen",
      auxiliary: "sein",
    };
    expect(getCardDraftErrors(draft)).toContain("verbFormsRequired");
  });

  it("passes for a complete noun draft", () => {
    expect(getCardDraftErrors(nounDraft())).toEqual([]);
  });
});

describe("buildCardFields", () => {
  it("includes only part-of-speech-matching data and stays valid", () => {
    const fields = buildCardFields(nounDraft(), "deck-1");
    expect(fields.deckId).toBe("deck-1");
    expect(fields.noun).toEqual({ gender: "neuter", plural: "die Kinder" });
    expect(fields.verb).toBeUndefined();
    expect(fields.adjective).toBeUndefined();
    expect(fields.tags).toEqual(["family", "people"]);
    expect(isValidCard(fields)).toBe(true);
  });

  it("drops empty related words and examples", () => {
    const draft = nounDraft();
    draft.related = [
      { german: "das Kind", english: "child", relation: "related" },
      { german: "   ", relation: "related" },
    ];
    draft.examples = [
      { de: "Das Kind spielt.", en: "The child plays." },
      { de: "", en: "" },
    ];
    const fields = buildCardFields(draft, "deck-1");
    expect(fields.related).toHaveLength(1);
    expect(fields.examples).toHaveLength(1);
  });

  it("omits the noun when gender is unset (lenient for preview)", () => {
    const draft = emptyCardDraft("Familie");
    draft.partOfSpeech = "noun";
    draft.german = "Kind";
    expect(buildCardFields(draft, "deck-1").noun).toBeUndefined();
  });
});

describe("cardToDraft", () => {
  it("round-trips a stored card back into editable fields", () => {
    const card: Card = {
      id: "c1",
      deckId: "deck-1",
      partOfSpeech: "adjective",
      english: "fast",
      german: "schnell",
      vowelMarks: [{ index: 1, length: "short" }],
      adjective: { opposites: ["langsam"], synonyms: ["flott", "rasch"] },
      related: [],
      examples: [],
      topic: "Leben",
      tags: ["speed"],
      notes: "common A1 adjective",
      scheduling: draftToPreviewCard(emptyCardDraft(), "x").scheduling,
      createdAt: 1,
      updatedAt: 2,
    };
    const draft = cardToDraft(card);
    expect(draft.adjective.opposites).toBe("langsam");
    expect(draft.adjective.synonyms).toBe("flott, rasch");
    expect(draft.tags).toBe("speed");
    expect(draft.notes).toBe("common A1 adjective");
    expect(draft.vowelMarks).toEqual([{ index: 1, length: "short" }]);
  });
});
