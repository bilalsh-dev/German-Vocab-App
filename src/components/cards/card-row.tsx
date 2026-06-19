"use client";

import { useTranslations } from "next-intl";
import { Pencil, Trash2 } from "lucide-react";

import { genderColorToken } from "@/lib/content";
import type { Card } from "@/lib/content";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GermanWord } from "@/components/card/german-word";

interface CardRowProps {
  card: Card;
  onEdit: (card: Card) => void;
  onDelete: (card: Card) => void;
}

export function CardRow({ card, onEdit, onDelete }: CardRowProps) {
  const t = useTranslations("cards");
  const tCommon = useTranslations("common");
  const gender = genderColorToken(card);

  return (
    <li className="flex items-center gap-4 rounded-2xl border border-surface-border bg-surface px-4 py-3">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-baseline gap-2">
          <GermanWord
            word={card.german}
            vowelMarks={card.vowelMarks}
            className={cn(
              "truncate text-base font-semibold",
              gender ? gender.textClass : "text-copy-primary",
            )}
          />
          <span className="truncate text-sm text-copy-muted">
            {card.english}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="outline">{t(`pos.${card.partOfSpeech}`)}</Badge>
          {card.topic ? <Badge variant="secondary">{card.topic}</Badge> : null}
          {card.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex shrink-0 gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={tCommon("edit")}
          onClick={() => onEdit(card)}
        >
          <Pencil />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={tCommon("delete")}
          onClick={() => onDelete(card)}
        >
          <Trash2 />
        </Button>
      </div>
    </li>
  );
}
