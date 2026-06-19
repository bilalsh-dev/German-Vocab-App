"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Pencil, Trash2 } from "lucide-react";

import type { DeckSummary } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface DeckCardProps {
  summary: DeckSummary;
  onRename: (summary: DeckSummary) => void;
  onDelete: (summary: DeckSummary) => void;
}

export function DeckCard({ summary, onRename, onDelete }: DeckCardProps) {
  const t = useTranslations("decks");
  const tCommon = useTranslations("common");

  return (
    <Card className="flex flex-col gap-0 overflow-hidden rounded-2xl p-0">
      <Link
        href={`/decks/${summary.id}`}
        className="flex flex-1 flex-col gap-3 p-5 transition-colors hover:bg-surface-raised"
      >
        <h2 className="text-lg font-semibold text-copy-primary">
          {summary.name}
        </h2>
        {summary.description ? (
          <p className="line-clamp-2 text-sm text-copy-muted">
            {summary.description}
          </p>
        ) : null}
        <dl className="mt-auto flex gap-4 text-sm">
          <Count label={t("due")} value={summary.counts.due} accent />
          <Count label={t("new")} value={summary.counts.new} />
          <Count label={t("total")} value={summary.counts.total} />
        </dl>
      </Link>

      <div className="flex justify-end gap-1 border-t border-surface-border px-3 py-2">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={t("rename")}
          onClick={() => onRename(summary)}
        >
          <Pencil />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={tCommon("delete")}
          onClick={() => onDelete(summary)}
        >
          <Trash2 />
        </Button>
      </div>
    </Card>
  );
}

function Count({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <dt className="text-xs text-copy-muted">{label}</dt>
      <dd
        className={
          accent
            ? "text-base font-semibold text-accent"
            : "text-base font-semibold text-copy-primary"
        }
      >
        {value}
      </dd>
    </div>
  );
}
