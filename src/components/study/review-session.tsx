"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";

import {
  addReviewLogEntry,
  DEFAULT_SCHEDULER_PARAMS,
  defaultSettings,
  getDeck,
  getDueCards,
  getSettings,
  setStudyDirection,
  updateCard,
} from "@/lib/db";
import type {
  Card,
  Deck,
  Grade,
  PromptSide,
  SchedulerParams,
  StudyDirection,
} from "@/lib/content";
import {
  describeInterval,
  previewGrades,
  scheduleNext,
} from "@/lib/scheduler";
import { CardPrompt } from "@/components/card/card-prompt";
import { CardReveal } from "@/components/card/card-reveal";
import { Button } from "@/components/ui/button";
import { Card as CardSurface, CardContent } from "@/components/ui/card";

import { GradeButtons, type GradePreview } from "./grade-buttons";
import { SessionSummary } from "./session-summary";
import { StudyDirectionControl } from "./study-direction-control";

const GRADES: Grade[] = ["again", "hard", "good", "easy"];

const KEY_TO_GRADE: Record<string, Grade> = {
  Digit1: "again",
  Digit2: "hard",
  Digit3: "good",
  Digit4: "easy",
};

interface ReviewSessionProps {
  deckId: string;
}

export function ReviewSession({ deckId }: ReviewSessionProps) {
  const t = useTranslations("study");
  const [loading, setLoading] = useState(true);
  const [deck, setDeck] = useState<Deck | undefined>();
  const [params, setParams] = useState<SchedulerParams>(
    DEFAULT_SCHEDULER_PARAMS,
  );
  const [direction, setDirection] =
    useState<StudyDirection>("english-front");
  const [queue, setQueue] = useState<Card[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [now, setNow] = useState(0);
  const [mixCoin, setMixCoin] = useState(0);
  const [stats, setStats] = useState({ reviewed: 0, lapses: 0 });

  useEffect(() => {
    let active = true;
    void (async () => {
      const [foundDeck, due, settings] = await Promise.all([
        getDeck(deckId).catch(() => undefined),
        getDueCards(deckId).catch(() => [] as Card[]),
        getSettings().catch(() => defaultSettings()),
      ]);
      if (!active) {
        return;
      }
      setDeck(foundDeck);
      setParams(settings.scheduler);
      setDirection(settings.studyDirection);
      setQueue(due);
      setNow(Date.now());
      setMixCoin(Math.random());
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [deckId]);

  const current = queue[0];

  const promptSide = useMemo<PromptSide>(() => {
    if (!current || direction === "english-front") {
      return "english";
    }
    if (direction === "german-front") {
      return "german";
    }
    return mixCoin < 0.5 ? "english" : "german";
  }, [current, direction, mixCoin]);

  const previews = useMemo<GradePreview[] | null>(() => {
    if (!current || now === 0) {
      return null;
    }
    const outcomes = previewGrades(current.scheduling, params, now);
    return GRADES.map((grade) => ({
      grade,
      interval: describeInterval(outcomes[grade].due, now),
    }));
  }, [current, params, now]);

  const handleGrade = useCallback(
    async (grade: Grade) => {
      const card = queue[0];
      if (!card || now === 0) {
        return;
      }
      const next = scheduleNext(card.scheduling, grade, params, now);
      await updateCard(card.id, { scheduling: next }).catch(() => undefined);
      await addReviewLogEntry({
        cardId: card.id,
        deckId,
        grade,
        reviewedAt: now,
        nextDue: next.due,
        scheduledDays: next.algorithm === "fsrs" ? next.scheduledDays : 0,
      }).catch(() => undefined);
      setStats((prev) => ({
        reviewed: prev.reviewed + 1,
        lapses: prev.lapses + (grade === "again" ? 1 : 0),
      }));
      setQueue((prev) => {
        const [head, ...rest] = prev;
        if (!head) {
          return prev;
        }
        return grade === "again"
          ? [...rest, { ...head, scheduling: next }]
          : rest;
      });
      setRevealed(false);
      setNow(Date.now());
      setMixCoin(Math.random());
    },
    [queue, params, deckId, now],
  );

  const handleDirectionChange = useCallback((next: StudyDirection) => {
    setDirection(next);
    if (next === "mix") {
      setMixCoin(Math.random());
    }
    void setStudyDirection(next).catch(() => undefined);
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (loading || !current) {
        return;
      }
      if (event.code === "Space") {
        event.preventDefault();
        setRevealed(true);
        return;
      }
      if (!revealed) {
        return;
      }
      const grade = KEY_TO_GRADE[event.code];
      if (grade) {
        event.preventDefault();
        void handleGrade(grade);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [loading, current, revealed, handleGrade]);

  if (loading) {
    return <p className="text-sm text-copy-muted">{t("loading")}</p>;
  }

  if (!deck) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-sm text-copy-muted">{t("notFound")}</p>
        <Button asChild variant="outline">
          <Link href="/">
            <ArrowLeft />
            {t("backToDecks")}
          </Link>
        </Button>
      </div>
    );
  }

  if (!current) {
    if (stats.reviewed > 0) {
      return <SessionSummary deckId={deckId} stats={stats} />;
    }
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <p className="text-sm text-copy-muted">{t("noneDue")}</p>
        <Button asChild variant="outline">
          <Link href={`/decks/${deckId}`}>
            <ArrowLeft />
            {t("backToDeck")}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <section className="flex flex-1 flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/decks/${deckId}`}
          className="flex w-fit items-center gap-1 text-sm text-copy-muted transition-colors hover:text-copy-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          {deck.name}
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-sm text-copy-muted">
            {t("remaining", { count: queue.length })}
          </span>
          <StudyDirectionControl
            value={direction}
            onChange={handleDirectionChange}
          />
        </div>
      </div>

      <CardSurface className="flex-1">
        <CardContent className="flex min-h-64 flex-col items-center justify-center gap-6 py-10">
          <CardPrompt card={current} promptSide={promptSide} />
          {revealed ? (
            <>
              <div className="w-full border-t border-border" />
              <CardReveal card={current} promptSide={promptSide} />
            </>
          ) : null}
        </CardContent>
      </CardSurface>

      {revealed && previews ? (
        <GradeButtons previews={previews} onGrade={handleGrade} />
      ) : (
        <div className="flex flex-col items-center gap-2">
          <Button size="lg" onClick={() => setRevealed(true)}>
            {t("reveal")}
          </Button>
          <span className="text-xs text-copy-muted">{t("flipHint")}</span>
        </div>
      )}
    </section>
  );
}
