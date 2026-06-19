"use client";

import { useLocale, useTranslations } from "next-intl";

import { buildDueForecast } from "@/lib/content";

import { BarChart, type BarDatum } from "./bar-chart";

const FORECAST_DAYS = 14;

interface DueForecastProps {
  dueDates: number[];
  now: number;
}

export function DueForecast({ dueDates, now }: DueForecastProps) {
  const t = useTranslations("stats.forecast");
  const locale = useLocale();
  const dayFormatter = new Intl.DateTimeFormat(locale, { day: "numeric" });

  const buckets = buildDueForecast(dueDates, now, FORECAST_DAYS);

  const data: BarDatum[] = buckets.map((bucket) => ({
    key: String(bucket.dayOffset),
    value: bucket.count,
    topLabel: bucket.count > 0 ? String(bucket.count) : undefined,
    bottomLabel: dayFormatter.format(bucket.startMs),
    highlight: bucket.dayOffset === 0,
  }));

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-copy-muted">
        {t("description", { days: FORECAST_DAYS })}
      </p>
      <BarChart data={data} emptyLabel={t("empty")} />
    </div>
  );
}
