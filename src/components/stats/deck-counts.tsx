"use client";

import { useTranslations } from "next-intl";

import type { DeckSummary } from "@/lib/db";

interface DeckCountsProps {
  summaries: DeckSummary[];
}

export function DeckCounts({ summaries }: DeckCountsProps) {
  const t = useTranslations("stats.decks");

  if (summaries.length === 0) {
    return <p className="text-sm text-copy-muted">{t("empty")}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-surface-border text-left text-xs text-copy-muted">
            <th className="py-2 pr-4 font-medium">{t("deck")}</th>
            <th className="py-2 pr-4 text-right font-medium">{t("due")}</th>
            <th className="py-2 pr-4 text-right font-medium">{t("new")}</th>
            <th className="py-2 text-right font-medium">{t("total")}</th>
          </tr>
        </thead>
        <tbody>
          {summaries.map((summary) => (
            <tr
              key={summary.id}
              className="border-b border-surface-border last:border-0"
            >
              <td className="py-2 pr-4 text-copy-primary">{summary.name}</td>
              <td className="py-2 pr-4 text-right font-semibold tabular-nums text-accent">
                {summary.counts.due}
              </td>
              <td className="py-2 pr-4 text-right tabular-nums text-copy-primary">
                {summary.counts.new}
              </td>
              <td className="py-2 text-right tabular-nums text-copy-primary">
                {summary.counts.total}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
