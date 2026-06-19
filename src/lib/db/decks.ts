import { getDb } from "./database";
import type { Deck } from "../content/types";

export type DeckInput = Pick<Deck, "name" | "description">;

export async function createDeck(input: DeckInput): Promise<Deck> {
  const now = Date.now();
  const deck: Deck = {
    id: crypto.randomUUID(),
    name: input.name,
    description: input.description,
    createdAt: now,
    updatedAt: now,
  };
  await getDb().decks.add(deck);
  return deck;
}

export function getDeck(id: string): Promise<Deck | undefined> {
  return getDb().decks.get(id);
}

export function getAllDecks(): Promise<Deck[]> {
  return getDb().decks.orderBy("name").toArray();
}

export async function updateDeck(
  id: string,
  patch: Partial<DeckInput>,
): Promise<Deck | undefined> {
  const db = getDb();
  const existing = await db.decks.get(id);
  if (!existing) {
    return undefined;
  }
  const next: Deck = { ...existing, ...patch, id, updatedAt: Date.now() };
  await db.decks.put(next);
  return next;
}

export async function deleteDeck(id: string): Promise<void> {
  const db = getDb();
  await db.transaction("rw", db.decks, db.cards, db.reviewLog, async () => {
    await db.cards.where("deckId").equals(id).delete();
    await db.reviewLog.where("deckId").equals(id).delete();
    await db.decks.delete(id);
  });
}
