import {
  CSV_COLUMNS,
  type CsvColumn,
  type ParsedImport,
  type PortableCard,
} from "./format";

const SCALAR_COLUMNS: CsvColumn[] = [
  "partOfSpeech",
  "english",
  "german",
  "topic",
  "notes",
];
const JSON_COLUMNS: CsvColumn[] = [
  "tags",
  "vowelMarks",
  "noun",
  "verb",
  "adjective",
  "related",
  "examples",
];

function escapeCell(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function cellFor(card: PortableCard, column: CsvColumn): string {
  switch (column) {
    case "partOfSpeech":
      return card.partOfSpeech;
    case "english":
      return card.english;
    case "german":
      return card.german;
    case "topic":
      return card.topic;
    case "notes":
      return card.notes ?? "";
    case "tags":
      return card.tags.length > 0 ? JSON.stringify(card.tags) : "";
    case "vowelMarks":
      return card.vowelMarks.length > 0 ? JSON.stringify(card.vowelMarks) : "";
    case "noun":
      return card.noun ? JSON.stringify(card.noun) : "";
    case "verb":
      return card.verb ? JSON.stringify(card.verb) : "";
    case "adjective":
      return card.adjective ? JSON.stringify(card.adjective) : "";
    case "related":
      return card.related.length > 0 ? JSON.stringify(card.related) : "";
    case "examples":
      return card.examples.length > 0 ? JSON.stringify(card.examples) : "";
  }
}

export function serializeCardsToCsv(cards: PortableCard[]): string {
  const header = CSV_COLUMNS.join(",");
  const rows = cards.map((card) =>
    CSV_COLUMNS.map((column) => escapeCell(cellFor(card, column))).join(","),
  );
  return [header, ...rows].join("\r\n");
}

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      field += char;
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }
    if (char === ",") {
      row.push(field);
      field = "";
      i += 1;
      continue;
    }
    if (char === "\r") {
      if (text[i + 1] === "\n") {
        i += 1;
      }
      row.push(field);
      rows.push(row);
      field = "";
      row = [];
      i += 1;
      continue;
    }
    if (char === "\n") {
      row.push(field);
      rows.push(row);
      field = "";
      row = [];
      i += 1;
      continue;
    }
    field += char;
    i += 1;
  }

  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

function parseJsonCell(value: string, fallback: unknown): unknown {
  const trimmed = value.trim();
  if (trimmed === "") {
    return fallback;
  }
  return JSON.parse(trimmed);
}

function rowToRaw(
  headers: string[],
  cells: string[],
): Record<string, unknown> {
  const byColumn = new Map<string, string>();
  headers.forEach((header, index) => {
    byColumn.set(header.trim(), cells[index] ?? "");
  });

  const raw: Record<string, unknown> = {};
  for (const column of SCALAR_COLUMNS) {
    if (byColumn.has(column)) {
      raw[column] = byColumn.get(column) ?? "";
    }
  }
  for (const column of JSON_COLUMNS) {
    if (!byColumn.has(column)) {
      continue;
    }
    const cell = byColumn.get(column) ?? "";
    const fallback = column === "tags" ? [] : undefined;
    raw[column] = parseJsonCell(cell, fallback);
  }
  return raw;
}

export function parseCardsFromCsv(
  text: string,
  deckName: string,
  description?: string,
): ParsedImport {
  const table = parseCsv(text).filter(
    (cells) => !(cells.length === 1 && cells[0].trim() === ""),
  );
  if (table.length === 0) {
    return {
      decks: [{ name: deckName, ...(description ? { description } : {}), rows: [] }],
    };
  }

  const headers = table[0];
  const rows = table.slice(1).map((cells) => {
    try {
      return rowToRaw(headers, cells);
    } catch {
      return { __csvError: "A rich field contains invalid JSON." };
    }
  });

  return {
    decks: [
      {
        name: deckName,
        ...(description ? { description } : {}),
        rows,
      },
    ],
  };
}
