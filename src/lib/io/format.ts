import type { Card } from "../content/types";

export const EXPORT_FORMAT = "wortbox" as const;
export const EXPORT_VERSION = 1 as const;

export type PortableCard = Omit<
  Card,
  "id" | "deckId" | "createdAt" | "updatedAt" | "scheduling"
>;

export interface PortableDeck {
  name: string;
  description?: string;
  cards: PortableCard[];
}

export interface WortboxExport {
  format: typeof EXPORT_FORMAT;
  version: typeof EXPORT_VERSION;
  exportedAt?: number;
  decks: PortableDeck[];
}

export interface RawDeck {
  name: string;
  description?: string;
  rows: unknown[];
}

export interface ParsedImport {
  decks: RawDeck[];
}

export interface RejectedRow {
  row: number;
  reasons: string[];
}

export interface DeckImportReport {
  deckName: string;
  imported: number;
  rejected: RejectedRow[];
}

export interface ImportResult {
  decks: DeckImportReport[];
  totalImported: number;
  totalRejected: number;
}

export const CSV_COLUMNS = [
  "partOfSpeech",
  "english",
  "german",
  "topic",
  "tags",
  "notes",
  "vowelMarks",
  "noun",
  "verb",
  "adjective",
  "related",
  "examples",
] as const;

export type CsvColumn = (typeof CSV_COLUMNS)[number];
