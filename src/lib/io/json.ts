import {
  EXPORT_FORMAT,
  EXPORT_VERSION,
  type ParsedImport,
  type PortableDeck,
  type WortboxExport,
} from "./format";

export function serializeDecksToJson(
  decks: PortableDeck[],
  exportedAt?: number,
): string {
  const payload: WortboxExport = {
    format: EXPORT_FORMAT,
    version: EXPORT_VERSION,
    ...(exportedAt !== undefined ? { exportedAt } : {}),
    decks,
  };
  return JSON.stringify(payload, null, 2);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseDecksFromJson(text: string): ParsedImport {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("File is not valid JSON.");
  }

  if (!isRecord(data)) {
    throw new Error("Expected a JSON object at the top level.");
  }
  if (data.format !== EXPORT_FORMAT) {
    throw new Error(`Unrecognized format. Expected "${EXPORT_FORMAT}".`);
  }
  if (!Array.isArray(data.decks)) {
    throw new Error("Expected a \"decks\" array.");
  }

  const decks = data.decks.map((deck, index) => {
    if (!isRecord(deck)) {
      throw new Error(`decks[${index}] must be an object.`);
    }
    if (typeof deck.name !== "string" || deck.name.trim() === "") {
      throw new Error(`decks[${index}].name is required.`);
    }
    if (!Array.isArray(deck.cards)) {
      throw new Error(`decks[${index}].cards must be an array.`);
    }
    return {
      name: deck.name.trim(),
      ...(typeof deck.description === "string"
        ? { description: deck.description }
        : {}),
      rows: deck.cards as unknown[],
    };
  });

  return { decks };
}
