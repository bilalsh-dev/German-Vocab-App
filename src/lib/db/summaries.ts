import { getDb } from "./database";
import { isDueScheduling, isNewScheduling } from "../content/scheduling";
import type { Deck } from "../content/types";

export interface DeckCardCounts {
  total: number;
  due: number;
  new: number;
}

export interface DeckSummary extends Deck {
  counts: DeckCardCounts;
}

export async function getDeckSummaries(
  now: number = Date.now(),
): Promise<DeckSummary[]> {
  const db = getDb();
  const [decks, cards] = await Promise.all([
    db.decks.orderBy("name").toArray(),
    db.cards.toArray(),
  ]);

  const countsByDeck = new Map<string, DeckCardCounts>();
  for (const deck of decks) {
    countsByDeck.set(deck.id, { total: 0, due: 0, new: 0 });
  }

  for (const card of cards) {
    const counts = countsByDeck.get(card.deckId);
    if (!counts) {
      continue;
    }
    counts.total += 1;
    if (isDueScheduling(card.scheduling, now)) {
      counts.due += 1;
    }
    if (isNewScheduling(card.scheduling)) {
      counts.new += 1;
    }
  }

  return decks.map((deck) => ({
    ...deck,
    counts: countsByDeck.get(deck.id) ?? { total: 0, due: 0, new: 0 },
  }));
}
