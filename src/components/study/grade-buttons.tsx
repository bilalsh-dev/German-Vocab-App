"use client";

import { useTranslations } from "next-intl";

import type { Grade } from "@/lib/content";
import type { Interval } from "@/lib/scheduler";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const GRADE_STYLES: Record<Grade, string> = {
  again: "border-state-error/40 text-state-error hover:bg-state-error/10",
  hard: "border-state-warning/40 text-state-warning hover:bg-state-warning/10",
  good: "border-state-success/40 text-state-success hover:bg-state-success/10",
  easy: "border-primary/40 text-primary hover:bg-primary/10",
};

export interface GradePreview {
  grade: Grade;
  interval: Interval;
}

interface GradeButtonsProps {
  previews: GradePreview[];
  onGrade: (grade: Grade) => void;
  disabled?: boolean;
}

export function GradeButtons({
  previews,
  onGrade,
  disabled = false,
}: GradeButtonsProps) {
  const t = useTranslations("study");

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {previews.map(({ grade, interval }, index) => (
        <Button
          key={grade}
          variant="outline"
          disabled={disabled}
          onClick={() => onGrade(grade)}
          className={cn("h-auto flex-col gap-0.5 py-2", GRADE_STYLES[grade])}
        >
          <span className="flex items-center gap-1.5 font-medium">
            <span className="text-xs text-copy-muted">{index + 1}</span>
            {t(`grades.${grade}`)}
          </span>
          <span className="text-xs text-copy-muted">
            {t(`interval.${interval.unit}`, { value: interval.value })}
          </span>
        </Button>
      ))}
    </div>
  );
}
