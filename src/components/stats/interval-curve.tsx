"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import type { Card, Grade, SchedulerParams } from "@/lib/content";
import { describeInterval, projectIntervalCurve } from "@/lib/scheduler";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { BarChart, type BarDatum } from "./bar-chart";

const PROJECTION_STEPS = 8;
const CURVE_GRADES: Grade[] = ["hard", "good", "easy"];

interface IntervalCurveProps {
  cards: Card[];
  params: SchedulerParams;
  now: number;
}

export function IntervalCurve({ cards, params, now }: IntervalCurveProps) {
  const t = useTranslations("stats.curve");
  const tStudy = useTranslations("study");

  const [cardId, setCardId] = useState(cards[0]?.id ?? "");
  const [grade, setGrade] = useState<Grade>("good");

  const selectedCard = cards.find((card) => card.id === cardId) ?? cards[0];

  const points = useMemo(() => {
    if (!selectedCard) {
      return [];
    }
    return projectIntervalCurve(
      selectedCard.scheduling,
      grade,
      params,
      now,
      PROJECTION_STEPS,
    );
  }, [selectedCard, grade, params, now]);

  if (cards.length === 0 || !selectedCard) {
    return <p className="text-sm text-copy-muted">{t("empty")}</p>;
  }

  const data: BarDatum[] = points.map((point, index) => {
    const reviewedAt = index === 0 ? now : points[index - 1].dueMs;
    const interval = describeInterval(point.dueMs, reviewedAt);
    return {
      key: String(point.step),
      value: point.intervalDays,
      topLabel: tStudy(`interval.${interval.unit}`, { value: interval.value }),
      bottomLabel: String(point.step),
    };
  });

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-copy-muted">
        {t("description", { grade: tStudy(`grades.${grade}`) })}
      </p>

      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-xs text-copy-muted">
          {t("selectCard")}
          <Select value={selectedCard.id} onValueChange={setCardId}>
            <SelectTrigger size="sm" className="min-w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {cards.map((card) => (
                <SelectItem key={card.id} value={card.id}>
                  {card.german} · {card.english}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>

        <label className="flex flex-col gap-1 text-xs text-copy-muted">
          {t("grade")}
          <Select
            value={grade}
            onValueChange={(next) => setGrade(next as Grade)}
          >
            <SelectTrigger size="sm" className="min-w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURVE_GRADES.map((option) => (
                <SelectItem key={option} value={option}>
                  {tStudy(`grades.${option}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
      </div>

      <BarChart data={data} emptyLabel={t("noProjection")} />
    </div>
  );
}
