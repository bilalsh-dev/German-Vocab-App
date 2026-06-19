import { Fragment } from "react";

import type { VowelLength, VowelMark } from "@/lib/content";

interface GermanWordProps {
  word: string;
  vowelMarks?: VowelMark[];
  className?: string;
}

const MARK_CLASS: Record<VowelLength, string> = {
  long: "vowel-long",
  short: "vowel-short",
};

export function GermanWord({ word, vowelMarks = [], className }: GermanWordProps) {
  const characters = Array.from(word);
  const markByIndex = new Map(vowelMarks.map((mark) => [mark.index, mark.length]));

  return (
    <span className={className}>
      {characters.map((character, index) => {
        const length = markByIndex.get(index);
        return length ? (
          <span key={index} className={MARK_CLASS[length]}>
            {character}
          </span>
        ) : (
          <Fragment key={index}>{character}</Fragment>
        );
      })}
    </span>
  );
}
