import type { Card } from "./types";

export interface CardFilter {
  topic?: string;
  tag?: string;
}

export function filterCards(cards: Card[], filter: CardFilter): Card[] {
  return cards.filter((card) => {
    if (filter.topic && card.topic !== filter.topic) {
      return false;
    }
    if (filter.tag && !card.tags.includes(filter.tag)) {
      return false;
    }
    return true;
  });
}

export function collectTopics(cards: Card[]): string[] {
  const topics = new Set(
    cards.map((card) => card.topic.trim()).filter(Boolean),
  );
  return Array.from(topics).sort((a, b) => a.localeCompare(b));
}

export function collectTags(cards: Card[]): string[] {
  const tags = new Set(
    cards.flatMap((card) => card.tags).map((tag) => tag.trim()).filter(Boolean),
  );
  return Array.from(tags).sort((a, b) => a.localeCompare(b));
}
