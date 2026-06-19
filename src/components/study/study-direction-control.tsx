"use client";

import { useTranslations } from "next-intl";

import type { StudyDirection } from "@/lib/content";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DIRECTIONS: StudyDirection[] = ["english-front", "german-front", "mix"];

interface StudyDirectionControlProps {
  value: StudyDirection;
  onChange: (direction: StudyDirection) => void;
}

export function StudyDirectionControl({
  value,
  onChange,
}: StudyDirectionControlProps) {
  const t = useTranslations("study");

  return (
    <Select
      value={value}
      onValueChange={(next) => onChange(next as StudyDirection)}
    >
      <SelectTrigger size="sm" aria-label={t("direction")}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {DIRECTIONS.map((direction) => (
          <SelectItem key={direction} value={direction}>
            {t(`directions.${direction}`)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
