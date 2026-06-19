"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export interface SessionStats {
  reviewed: number;
  lapses: number;
}

interface SessionSummaryProps {
  deckId: string;
  stats: SessionStats;
}

export function SessionSummary({ deckId, stats }: SessionSummaryProps) {
  const t = useTranslations("study");

  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <CheckCircle2 className="size-12 text-state-success" />
      <h1 className="text-2xl font-semibold text-copy-primary">
        {t("summaryTitle")}
      </h1>
      <div className="flex flex-col gap-1 text-sm text-copy-muted">
        <span>{t("summaryReviewed", { count: stats.reviewed })}</span>
        <span>{t("summaryLapses", { count: stats.lapses })}</span>
      </div>
      <Button asChild variant="outline">
        <Link href={`/decks/${deckId}`}>
          <ArrowLeft />
          {t("backToDeck")}
        </Link>
      </Button>
    </section>
  );
}
