import { genderColorToken } from "@/lib/content";
import type { Card, PromptSide } from "@/lib/content";
import { cn } from "@/lib/utils";

import { GermanWord } from "./german-word";

interface CardPromptProps {
  card: Card;
  promptSide: PromptSide;
}

export function CardPrompt({ card, promptSide }: CardPromptProps) {
  if (promptSide === "german") {
    const gender = genderColorToken(card);
    return (
      <div className="flex flex-col items-center text-center">
        <GermanWord
          word={card.german}
          vowelMarks={card.vowelMarks}
          className={cn(
            "text-4xl font-semibold",
            gender ? gender.textClass : "text-copy-primary",
          )}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-center">
      <span className="text-4xl font-semibold text-copy-primary">
        {card.english}
      </span>
    </div>
  );
}
