import { createCard, createDeck } from "../db";
import {
  type DeckImportReport,
  type ImportResult,
  type ParsedImport,
  type PortableCard,
  type RejectedRow,
} from "./format";
import { validatePortableCard } from "./validation";

export async function importParsed(parsed: ParsedImport): Promise<ImportResult> {
  const reports: DeckImportReport[] = [];

  for (const rawDeck of parsed.decks) {
    const rejected: RejectedRow[] = [];
    const validCards: PortableCard[] = [];

    rawDeck.rows.forEach((row, index) => {
      const outcome = validatePortableCard(row);
      if (outcome.ok) {
        validCards.push(outcome.card);
      } else {
        rejected.push({ row: index, reasons: outcome.reasons });
      }
    });

    let imported = 0;
    if (validCards.length > 0) {
      const deck = await createDeck({
        name: rawDeck.name,
        description: rawDeck.description,
      });
      for (const card of validCards) {
        await createCard({ ...card, deckId: deck.id });
        imported += 1;
      }
    }

    reports.push({ deckName: rawDeck.name, imported, rejected });
  }

  return {
    decks: reports,
    totalImported: reports.reduce((sum, report) => sum + report.imported, 0),
    totalRejected: reports.reduce(
      (sum, report) => sum + report.rejected.length,
      0,
    ),
  };
}
