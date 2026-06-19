import { initialSchedulingState } from "./scheduling";
import type {
  Card,
  Gender,
  PartOfSpeech,
  RelatedWord,
  ExampleSentence,
  VowelMark,
} from "./types";

export type CardFields = Omit<
  Card,
  "id" | "createdAt" | "updatedAt" | "scheduling"
>;

export type DraftErrorKey =
  | "englishRequired"
  | "germanRequired"
  | "topicRequired"
  | "nounGenderRequired"
  | "nounPluralRequired"
  | "verbFormsRequired";

export interface CardDraft {
  partOfSpeech: PartOfSpeech;
  english: string;
  german: string;
  vowelMarks: VowelMark[];
  noun: { gender: Gender | ""; plural: string };
  verb: {
    praesens: string;
    praeteritum: string;
    perfekt: string;
    auxiliary: "haben" | "sein";
  };
  adjective: { opposites: string; synonyms: string };
  related: RelatedWord[];
  examples: ExampleSentence[];
  topic: string;
  tags: string;
  notes: string;
}

export function emptyCardDraft(topic = ""): CardDraft {
  return {
    partOfSpeech: "noun",
    english: "",
    german: "",
    vowelMarks: [],
    noun: { gender: "", plural: "" },
    verb: { praesens: "", praeteritum: "", perfekt: "", auxiliary: "haben" },
    adjective: { opposites: "", synonyms: "" },
    related: [],
    examples: [],
    topic,
    tags: "",
    notes: "",
  };
}

export function cardToDraft(card: Card): CardDraft {
  return {
    partOfSpeech: card.partOfSpeech,
    english: card.english,
    german: card.german,
    vowelMarks: [...card.vowelMarks],
    noun: {
      gender: card.noun?.gender ?? "",
      plural: card.noun?.plural ?? "",
    },
    verb: {
      praesens: card.verb?.praesens ?? "",
      praeteritum: card.verb?.praeteritum ?? "",
      perfekt: card.verb?.perfekt ?? "",
      auxiliary: card.verb?.auxiliary ?? "haben",
    },
    adjective: {
      opposites: (card.adjective?.opposites ?? []).join(", "),
      synonyms: (card.adjective?.synonyms ?? []).join(", "),
    },
    related: card.related.map((word) => ({ ...word })),
    examples: card.examples.map((example) => ({ ...example })),
    topic: card.topic,
    tags: card.tags.join(", "),
    notes: card.notes ?? "",
  };
}

function splitList(value: string): string[] {
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function buildCardFields(draft: CardDraft, deckId: string): CardFields {
  const fields: CardFields = {
    deckId,
    partOfSpeech: draft.partOfSpeech,
    english: draft.english.trim(),
    german: draft.german.trim(),
    vowelMarks: draft.vowelMarks,
    related: draft.related.filter((word) => word.german.trim() !== ""),
    examples: draft.examples.filter(
      (example) => example.de.trim() !== "" || example.en.trim() !== "",
    ),
    topic: draft.topic.trim(),
    tags: splitList(draft.tags),
    notes: draft.notes.trim() || undefined,
  };

  if (draft.partOfSpeech === "noun" && draft.noun.gender) {
    fields.noun = {
      gender: draft.noun.gender,
      plural: draft.noun.plural.trim(),
    };
  }

  if (draft.partOfSpeech === "verb") {
    fields.verb = {
      praesens: draft.verb.praesens.trim(),
      praeteritum: draft.verb.praeteritum.trim(),
      perfekt: draft.verb.perfekt.trim(),
      auxiliary: draft.verb.auxiliary,
    };
  }

  if (draft.partOfSpeech === "adjective") {
    const opposites = splitList(draft.adjective.opposites);
    const synonyms = splitList(draft.adjective.synonyms);
    fields.adjective = {
      ...(opposites.length > 0 ? { opposites } : {}),
      ...(synonyms.length > 0 ? { synonyms } : {}),
    };
  }

  return fields;
}

export function draftToPreviewCard(draft: CardDraft, deckId: string): Card {
  return {
    ...buildCardFields(draft, deckId),
    id: "preview",
    scheduling: initialSchedulingState("fsrs", 0),
    createdAt: 0,
    updatedAt: 0,
  };
}

export function getCardDraftErrors(draft: CardDraft): DraftErrorKey[] {
  const errors: DraftErrorKey[] = [];

  if (!draft.english.trim()) {
    errors.push("englishRequired");
  }
  if (!draft.german.trim()) {
    errors.push("germanRequired");
  }
  if (!draft.topic.trim()) {
    errors.push("topicRequired");
  }

  if (draft.partOfSpeech === "noun") {
    if (!draft.noun.gender) {
      errors.push("nounGenderRequired");
    }
    if (!draft.noun.plural.trim()) {
      errors.push("nounPluralRequired");
    }
  }

  if (draft.partOfSpeech === "verb") {
    if (
      !draft.verb.praesens.trim() ||
      !draft.verb.praeteritum.trim() ||
      !draft.verb.perfekt.trim()
    ) {
      errors.push("verbFormsRequired");
    }
  }

  return errors;
}
