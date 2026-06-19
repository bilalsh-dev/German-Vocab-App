import { Dexie, type EntityTable } from "dexie";
import type {
  Card,
  Deck,
  ReviewLogEntry,
  Settings,
} from "../content/types";

export class WortboxDatabase extends Dexie {
  decks!: EntityTable<Deck, "id">;
  cards!: EntityTable<Card, "id">;
  reviewLog!: EntityTable<ReviewLogEntry, "id">;
  settings!: EntityTable<Settings, "id">;

  constructor() {
    super("wortbox");
    this.version(1).stores({
      decks: "id, name, updatedAt",
      cards: "id, deckId, topic, scheduling.due, updatedAt",
      reviewLog: "id, cardId, deckId, reviewedAt",
      settings: "id",
    });
  }
}

let database: WortboxDatabase | null = null;

export function getDb(): WortboxDatabase {
  if (!database) {
    database = new WortboxDatabase();
  }
  return database;
}
