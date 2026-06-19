import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { parseDecksFromJson } from "./json";
import { validatePortableCard } from "./validation";

const STARTER_DIR = join(process.cwd(), "public", "starter-decks");

interface ManifestEntry {
  id: string;
  file: string;
  name: string;
  cardCount?: number;
}

function readJson(file: string): string {
  return readFileSync(join(STARTER_DIR, file), "utf8");
}

const manifest = JSON.parse(readJson("index.json")) as {
  decks: ManifestEntry[];
};

describe("starter-deck content", () => {
  it("has a non-empty manifest", () => {
    expect(manifest.decks.length).toBeGreaterThan(0);
  });

  for (const entry of manifest.decks) {
    describe(entry.name, () => {
      const parsed = parseDecksFromJson(readJson(entry.file));

      it("parses to a single deck", () => {
        expect(parsed.decks).toHaveLength(1);
        expect(parsed.decks[0].name).toBe(entry.name);
      });

      it("matches the manifest card count", () => {
        if (entry.cardCount !== undefined) {
          expect(parsed.decks[0].rows).toHaveLength(entry.cardCount);
        }
      });

      it("contains only model-valid cards", () => {
        const failures = parsed.decks[0].rows
          .map((row, index) => ({ index, outcome: validatePortableCard(row) }))
          .filter(({ outcome }) => !outcome.ok)
          .map(({ index, outcome }) =>
            outcome.ok ? "" : `row ${index}: ${outcome.reasons.join("; ")}`,
          );
        expect(failures).toEqual([]);
      });
    });
  }
});
