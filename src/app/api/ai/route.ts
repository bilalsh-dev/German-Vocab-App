import { NextResponse } from "next/server";

import {
  parseDraftRequest,
  type AiDraftRequest,
  type AiDraftResponse,
} from "@/lib/io/ai";
import { validatePortableCard } from "@/lib/io/validation";
import type { PortableCard } from "@/lib/io/format";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 4096;
const TOOL_NAME = "emit_cards";

const CARD_ITEM_SCHEMA = {
  type: "object",
  properties: {
    partOfSpeech: {
      type: "string",
      enum: ["noun", "verb", "adjective", "adverb", "phrase", "other"],
    },
    english: { type: "string", description: "English prompt (front of the card)" },
    german: {
      type: "string",
      description: "German headword only (the back); never include the article",
    },
    vowelMarks: {
      type: "array",
      description:
        "Pronunciation-length marks indexing into the bare German headword by 0-based character offset",
      items: {
        type: "object",
        properties: {
          index: { type: "integer", minimum: 0 },
          length: { type: "string", enum: ["long", "short"] },
        },
        required: ["index", "length"],
      },
    },
    noun: {
      type: "object",
      description: "Include only when partOfSpeech is noun",
      properties: {
        gender: {
          type: "string",
          enum: ["masculine", "feminine", "neuter"],
        },
        plural: { type: "string", description: 'e.g. "die Kinder"' },
        genderEndingHint: { type: "string" },
        genderGroupHint: { type: "string" },
      },
      required: ["gender", "plural"],
    },
    verb: {
      type: "object",
      description: "Include only when partOfSpeech is verb",
      properties: {
        praesens: { type: "string", description: "present, 3rd person singular" },
        praeteritum: {
          type: "string",
          description: "simple past, 3rd person singular",
        },
        perfekt: {
          type: "string",
          description: 'auxiliary + participle, e.g. "hat gegessen"',
        },
        auxiliary: { type: "string", enum: ["haben", "sein"] },
      },
      required: ["praesens", "praeteritum", "perfekt", "auxiliary"],
    },
    adjective: {
      type: "object",
      description: "Include only when partOfSpeech is adjective",
      properties: {
        opposites: { type: "array", items: { type: "string" } },
        synonyms: { type: "array", items: { type: "string" } },
        comparative: { type: "string" },
        superlative: { type: "string" },
      },
    },
    related: {
      type: "array",
      items: {
        type: "object",
        properties: {
          german: { type: "string" },
          english: { type: "string" },
          relation: {
            type: "string",
            enum: ["nominalization", "derived", "compound", "related"],
          },
        },
        required: ["german", "relation"],
      },
    },
    examples: {
      type: "array",
      description:
        "3-4 natural sentences; for verbs they must collectively use praesens, praeteritum and perfekt",
      items: {
        type: "object",
        properties: {
          de: { type: "string" },
          en: { type: "string" },
          verbForm: {
            type: "string",
            enum: ["praesens", "praeteritum", "perfekt"],
          },
        },
        required: ["de", "en"],
      },
    },
    topic: { type: "string" },
    tags: { type: "array", items: { type: "string" } },
    notes: { type: "string" },
  },
  required: ["partOfSpeech", "english", "german", "topic", "examples"],
} as const;

const DRAFT_TOOL = {
  name: TOOL_NAME,
  description: "Emit fully-structured German A1 vocabulary cards.",
  input_schema: {
    type: "object",
    properties: { cards: { type: "array", items: CARD_ITEM_SCHEMA } },
    required: ["cards"],
  },
} as const;

const SYSTEM_PROMPT = [
  "You draft German A1 vocabulary flashcards shaped to a strict data model. Follow every rule exactly:",
  "- Each card has an English front and a German back. The German field is the headword ONLY, with no article — gender is a separate field.",
  "- vowelMarks annotate pronunciation length on vowels of the bare German headword, indexed by 0-based character offset. Mark clearly long vowels as \"long\" and clearly short vowels as \"short\". Leave diphthongs and uncertain loanword vowels unmarked.",
  "- Nouns: set partOfSpeech \"noun\" and the noun object (gender, plural like \"die Kinder\"). Add genderEndingHint or genderGroupHint when a reliable rule applies (e.g. -ung/-heit/-keit/-schaft/-tion → feminine; -chen/-lein → neuter; days, months, seasons and weather words → masculine).",
  "- Verbs: set partOfSpeech \"verb\" and the verb object (praesens and praeteritum in 3rd person singular, perfekt as auxiliary + participle, auxiliary haben or sein). When a common nominalization exists, list it in related (e.g. arbeiten → die Arbeit).",
  "- Adjectives: set partOfSpeech \"adjective\" and provide opposites and/or synonyms; add comparative/superlative only when irregular.",
  "- Provide 3-4 example sentences (de + en). For verbs the examples must collectively use all three forms; tag each example with its verbForm.",
  "- Include ONLY the part-of-speech object that matches partOfSpeech; never attach noun/verb/adjective data to the wrong type.",
  "- Keep everything at A1 difficulty.",
  "Return results solely through the emit_cards tool.",
].join("\n");

function buildUserPrompt(request: AiDraftRequest): string {
  if (request.mode === "word") {
    return `Draft one German A1 card for the word: "${request.input}". Set the topic field of the card to "${request.topic}".`;
  }
  return `Draft 6 to 8 German A1 cards for the theme: "${request.input}". Set the topic field of every card to "${request.topic}".`;
}

interface ToolUseBlock {
  type: "tool_use";
  name: string;
  input: unknown;
}

interface AnthropicMessage {
  content?: Array<{ type: string } & Partial<ToolUseBlock>>;
}

function extractRawCards(message: AnthropicMessage): unknown[] {
  const block = message.content?.find(
    (entry) => entry.type === "tool_use" && entry.name === TOOL_NAME,
  );
  if (!block || typeof block.input !== "object" || block.input === null) {
    return [];
  }
  const cards = (block.input as { cards?: unknown }).cards;
  return Array.isArray(cards) ? cards : [];
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = parseDraftRequest(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI drafting is not configured on the server." },
      { status: 503 },
    );
  }

  let upstream: Response;
  try {
    upstream = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: SYSTEM_PROMPT,
        tools: [DRAFT_TOOL],
        tool_choice: { type: "tool", name: TOOL_NAME },
        messages: [{ role: "user", content: buildUserPrompt(parsed.request) }],
      }),
    });
  } catch {
    return NextResponse.json(
      { error: "Could not reach the AI provider." },
      { status: 502 },
    );
  }

  if (!upstream.ok) {
    return NextResponse.json(
      { error: "The AI provider returned an error." },
      { status: 502 },
    );
  }

  const message = (await upstream.json()) as AnthropicMessage;

  const cards: PortableCard[] = [];
  let rejected = 0;
  for (const raw of extractRawCards(message)) {
    const outcome = validatePortableCard(raw);
    if (outcome.ok) {
      cards.push(outcome.card);
    } else {
      rejected += 1;
    }
  }

  return NextResponse.json({ cards, rejected } satisfies AiDraftResponse);
}
