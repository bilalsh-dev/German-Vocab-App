import { parseDecksFromJson } from "./json";
import type { ParsedImport } from "./format";

const MANIFEST_URL = "/starter-decks/index.json";

export interface StarterDeckEntry {
  id: string;
  file: string;
  name: string;
  description?: string;
  cardCount?: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStarterEntry(value: unknown): value is StarterDeckEntry {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.file === "string" &&
    typeof value.name === "string"
  );
}

export async function fetchStarterManifest(): Promise<StarterDeckEntry[]> {
  const response = await fetch(MANIFEST_URL, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Could not load the starter-deck manifest.");
  }
  const data: unknown = await response.json();
  if (!isRecord(data) || !Array.isArray(data.decks)) {
    throw new Error("Malformed starter-deck manifest.");
  }
  return data.decks.filter(isStarterEntry);
}

export async function fetchStarterDeck(file: string): Promise<ParsedImport> {
  const response = await fetch(`/starter-decks/${file}`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Could not load starter deck "${file}".`);
  }
  return parseDecksFromJson(await response.text());
}
