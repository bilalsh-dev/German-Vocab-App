import { getAllDecks, getCardsByDeck, getDeck } from "../db";
import type { Card } from "../content/types";
import type { PortableCard, PortableDeck } from "./format";

export function cardToPortable(card: Card): PortableCard {
  const portable: PortableCard = {
    partOfSpeech: card.partOfSpeech,
    english: card.english,
    german: card.german,
    vowelMarks: card.vowelMarks.map((mark) => ({ ...mark })),
    related: card.related.map((word) => ({ ...word })),
    examples: card.examples.map((example) => ({ ...example })),
    topic: card.topic,
    tags: [...card.tags],
  };
  if (card.noun) {
    portable.noun = { ...card.noun };
  }
  if (card.verb) {
    portable.verb = { ...card.verb };
  }
  if (card.adjective) {
    portable.adjective = { ...card.adjective };
  }
  if (card.notes) {
    portable.notes = card.notes;
  }
  return portable;
}

export async function exportDeck(deckId: string): Promise<PortableDeck> {
  const deck = await getDeck(deckId);
  if (!deck) {
    throw new Error("Deck not found.");
  }
  const cards = await getCardsByDeck(deckId);
  return {
    name: deck.name,
    ...(deck.description ? { description: deck.description } : {}),
    cards: cards.map(cardToPortable),
  };
}

export async function exportAllDecks(): Promise<PortableDeck[]> {
  const decks = await getAllDecks();
  return Promise.all(decks.map((deck) => exportDeck(deck.id)));
}
