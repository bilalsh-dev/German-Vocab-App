"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import {
  DEFAULT_SCHEDULER_PARAMS,
  getAllCards,
  getDeckSummaries,
  getSettings,
} from "@/lib/db";
import type { DeckSummary } from "@/lib/db";
import type { Card, SchedulerParams } from "@/lib/content";

import { DeckCounts } from "./deck-counts";
import { DueForecast } from "./due-forecast";
import { IntervalCurve } from "./interval-curve";

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-surface-border bg-surface p-5">
      <h2 className="text-lg font-semibold text-copy-primary">{title}</h2>
      {children}
    </section>
  );
}

export function StatsView() {
  const t = useTranslations("stats");
  const [loading, setLoading] = useState(true);
  const [summaries, setSummaries] = useState<DeckSummary[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [params, setParams] = useState<SchedulerParams>(
    DEFAULT_SCHEDULER_PARAMS,
  );
  const [now, setNow] = useState(0);

  useEffect(() => {
    let active = true;
    void (async () => {
      const [deckSummaries, allCards, settings] = await Promise.all([
        getDeckSummaries().catch(() => [] as DeckSummary[]),
        getAllCards().catch(() => [] as Card[]),
        getSettings().catch(() => ({ scheduler: DEFAULT_SCHEDULER_PARAMS })),
      ]);
      if (!active) {
        return;
      }
      setSummaries(deckSummaries);
      setCards(allCards);
      setParams(settings.scheduler);
      setNow(Date.now());
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="flex flex-1 flex-col gap-6">
      <h1 className="text-2xl font-semibold text-copy-primary">{t("title")}</h1>

      {loading ? (
        <p className="text-sm text-copy-muted">{t("loading")}</p>
      ) : cards.length === 0 && summaries.length === 0 ? (
        <p className="text-sm text-copy-muted">{t("empty")}</p>
      ) : (
        <div className="flex flex-col gap-6">
          <Panel title={t("decks.title")}>
            <DeckCounts summaries={summaries} />
          </Panel>

          <Panel title={t("forecast.title")}>
            <DueForecast
              dueDates={cards.map((card) => card.scheduling.due)}
              now={now}
            />
          </Panel>

          <Panel title={t("curve.title")}>
            <IntervalCurve cards={cards} params={params} now={now} />
          </Panel>
        </div>
      )}
    </section>
  );
}
