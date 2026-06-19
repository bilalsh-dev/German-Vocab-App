import { getDb } from "./database";
import { getSettings } from "./settings";
import { assertValidCard } from "../content/validation";
import { initialSchedulingState } from "../content/scheduling";
import type { Card, SchedulingState } from "../content/types";

export type CardInput = Omit<
  Card,
  "id" | "createdAt" | "updatedAt" | "scheduling"
> & {
  scheduling?: SchedulingState;
};

export async function createCard(input: CardInput): Promise<Card> {
  assertValidCard(input);
  const now = Date.now();
  const scheduling =
    input.scheduling ??
    initialSchedulingState((await getSettings()).scheduler.algorithm, now);
  const card: Card = {
    ...input,
    id: crypto.randomUUID(),
    scheduling,
    createdAt: now,
    updatedAt: now,
  };
  await getDb().cards.add(card);
  return card;
}

export function getCard(id: string): Promise<Card | undefined> {
  return getDb().cards.get(id);
}

export function getCardsByDeck(deckId: string): Promise<Card[]> {
  return getDb().cards.where("deckId").equals(deckId).toArray();
}

export function getCardsByTopic(topic: string): Promise<Card[]> {
  return getDb().cards.where("topic").equals(topic).toArray();
}

export function getDueCards(
  deckId: string,
  now: number = Date.now(),
): Promise<Card[]> {
  return getDb()
    .cards.where("deckId")
    .equals(deckId)
    .filter((card) => card.scheduling.due <= now)
    .toArray();
}

export async function updateCard(
  id: string,
  patch: Partial<Omit<Card, "id" | "createdAt">>,
): Promise<Card | undefined> {
  const db = getDb();
  const existing = await db.cards.get(id);
  if (!existing) {
    return undefined;
  }
  const next: Card = { ...existing, ...patch, id, updatedAt: Date.now() };
  assertValidCard(next);
  await db.cards.put(next);
  return next;
}

export function deleteCard(id: string): Promise<void> {
  return getDb().cards.delete(id);
}
