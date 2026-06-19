import type { Card, PromptSide } from "@/lib/content";

import { GermanDetail } from "./german-detail";

interface CardRevealProps {
  card: Card;
  promptSide: PromptSide;
}

export function CardReveal({ card, promptSide }: CardRevealProps) {
  return (
    <div className="flex flex-col items-center gap-6">
      {promptSide === "german" ? (
        <span className="text-2xl font-semibold text-copy-primary">
          {card.english}
        </span>
      ) : null}
      <GermanDetail card={card} />
    </div>
  );
}
