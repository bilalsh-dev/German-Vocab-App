"use client";

import type { VowelLength, VowelMark } from "@/lib/content";
import { cn } from "@/lib/utils";

const VOWELS = new Set("aeiouäöüyAEIOUÄÖÜY".split(""));

const NEXT_LENGTH: Record<"none" | VowelLength, "none" | VowelLength> = {
  none: "long",
  long: "short",
  short: "none",
};

interface VowelMarkFieldProps {
  word: string;
  vowelMarks: VowelMark[];
  onChange: (marks: VowelMark[]) => void;
}

export function VowelMarkField({
  word,
  vowelMarks,
  onChange,
}: VowelMarkFieldProps) {
  const characters = Array.from(word);
  const lengthByIndex = new Map(
    vowelMarks.map((mark) => [mark.index, mark.length] as const),
  );

  function cycle(index: number) {
    const current = lengthByIndex.get(index) ?? "none";
    const next = NEXT_LENGTH[current];
    const without = vowelMarks.filter((mark) => mark.index !== index);
    onChange(
      next === "none" ? without : [...without, { index, length: next }],
    );
  }

  if (characters.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-end gap-0.5 rounded-xl border border-surface-border bg-base px-3 py-2 text-2xl">
      {characters.map((character, index) => {
        const isVowel = VOWELS.has(character);
        const length = lengthByIndex.get(index);
        if (!isVowel) {
          return (
            <span key={index} className="text-copy-primary">
              {character}
            </span>
          );
        }
        return (
          <button
            key={index}
            type="button"
            onClick={() => cycle(index)}
            className={cn(
              "rounded-md px-0.5 text-copy-primary transition-colors hover:bg-surface-raised",
              length === "long" && "vowel-long",
              length === "short" && "vowel-short",
            )}
          >
            {character}
          </button>
        );
      })}
    </div>
  );
}
