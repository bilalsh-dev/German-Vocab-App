import { getDb } from "./database";
import type { ReviewLogEntry } from "../content/types";

export type ReviewLogInput = Omit<ReviewLogEntry, "id">;

export async function addReviewLogEntry(
  input: ReviewLogInput,
): Promise<ReviewLogEntry> {
  const entry: ReviewLogEntry = { ...input, id: crypto.randomUUID() };
  await getDb().reviewLog.add(entry);
  return entry;
}

export function getReviewLogForCard(
  cardId: string,
): Promise<ReviewLogEntry[]> {
  return getDb().reviewLog.where("cardId").equals(cardId).toArray();
}

export function getReviewLogForDeck(
  deckId: string,
): Promise<ReviewLogEntry[]> {
  return getDb().reviewLog.where("deckId").equals(deckId).toArray();
}

export function getAllReviewLog(): Promise<ReviewLogEntry[]> {
  return getDb().reviewLog.orderBy("reviewedAt").toArray();
}
