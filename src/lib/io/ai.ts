import type { CardDraft } from "../content/card-draft";
import type { PortableCard } from "./format";

export type AiDraftMode = "word" | "topic";

export interface AiDraftRequest {
  mode: AiDraftMode;
  input: string;
  topic: string;
}

export interface AiDraftResponse {
  cards: PortableCard[];
  rejected: number;
}

const AI_MODES: readonly AiDraftMode[] = ["word", "topic"];
const MAX_INPUT_LENGTH = 200;

export type ParseRequestOutcome =
  | { ok: true; request: AiDraftRequest }
  | { ok: false; error: string };

export function parseDraftRequest(input: unknown): ParseRequestOutcome {
  if (typeof input !== "object" || input === null) {
    return { ok: false, error: "Request body must be an object" };
  }
  const body = input as Record<string, unknown>;

  if (!AI_MODES.includes(body.mode as AiDraftMode)) {
    return { ok: false, error: `mode must be one of ${AI_MODES.join(", ")}` };
  }
  if (typeof body.input !== "string" || body.input.trim() === "") {
    return { ok: false, error: "input is required" };
  }
  if (body.input.length > MAX_INPUT_LENGTH) {
    return { ok: false, error: "input is too long" };
  }
  if (typeof body.topic !== "string" || body.topic.trim() === "") {
    return { ok: false, error: "topic is required" };
  }

  return {
    ok: true,
    request: {
      mode: body.mode as AiDraftMode,
      input: body.input.trim(),
      topic: body.topic.trim(),
    },
  };
}

export function portableToDraft(card: PortableCard): CardDraft {
  return {
    partOfSpeech: card.partOfSpeech,
    english: card.english,
    german: card.german,
    vowelMarks: card.vowelMarks.map((mark) => ({ ...mark })),
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

export async function requestAiDrafts(
  request: AiDraftRequest,
): Promise<CardDraft[]> {
  const response = await fetch("/api/ai", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(request),
  });

  const payload = (await response.json().catch(() => null)) as
    | (Partial<AiDraftResponse> & { error?: string })
    | null;

  if (!response.ok) {
    const message =
      payload && typeof payload.error === "string"
        ? payload.error
        : `Request failed (${response.status})`;
    throw new Error(message);
  }

  const cards = Array.isArray(payload?.cards) ? payload.cards : [];
  return cards.map(portableToDraft);
}
