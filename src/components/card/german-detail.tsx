import { Fragment } from "react";
import { useTranslations } from "next-intl";

import {
  genderColorToken,
  genderEndingHint,
  genderGroupHint,
} from "@/lib/content";
import type {
  AdjectiveData,
  Card,
  ExampleSentence,
  NounData,
  RelatedWord,
  VerbData,
} from "@/lib/content";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { GermanWord } from "./german-word";

export function GermanDetail({ card }: { card: Card }) {
  const gender = genderColorToken(card);

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <GermanWord
        word={card.german}
        vowelMarks={card.vowelMarks}
        className={cn(
          "text-3xl font-semibold",
          gender ? gender.textClass : "text-copy-primary",
        )}
      />

      {card.partOfSpeech === "noun" && card.noun ? (
        <NounBlock card={card} noun={card.noun} />
      ) : null}
      {card.partOfSpeech === "verb" && card.verb ? (
        <VerbBlock verb={card.verb} />
      ) : null}
      {card.partOfSpeech === "adjective" && card.adjective ? (
        <AdjectiveBlock adjective={card.adjective} />
      ) : null}

      {card.related.length > 0 ? <RelatedBlock related={card.related} /> : null}
      {card.examples.length > 0 ? (
        <ExamplesBlock examples={card.examples} />
      ) : null}
    </div>
  );
}

function NounBlock({ card, noun }: { card: Card; noun: NounData }) {
  const t = useTranslations("card");
  const gender = genderColorToken(card);
  const endingHint =
    noun.genderEndingHint ?? genderEndingHint(card.german)?.reason ?? null;
  const groupHint =
    noun.genderGroupHint ?? genderGroupHint(card)?.reason ?? null;
  const hints = [endingHint, groupHint].filter(Boolean);

  return (
    <div className="flex flex-col items-center gap-1">
      <p className="text-base">
        <span className={cn("font-medium", gender?.textClass)}>
          {gender?.article}
        </span>
        {noun.plural ? (
          <span className="text-copy-muted">
            {" · "}
            {t("plural")}: {noun.plural}
          </span>
        ) : null}
      </p>
      {hints.length > 0 ? (
        <p className="text-xs text-copy-muted">{hints.join(" · ")}</p>
      ) : null}
    </div>
  );
}

function VerbBlock({ verb }: { verb: VerbData }) {
  const t = useTranslations("card");
  const rows = [
    { label: t("praesens"), value: verb.praesens },
    { label: t("praeteritum"), value: verb.praeteritum },
    { label: t("perfekt"), value: verb.perfekt, auxiliary: verb.auxiliary },
  ];

  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-left text-sm">
      {rows.map((row) => (
        <Fragment key={row.label}>
          <dt className="text-copy-muted">{row.label}</dt>
          <dd className="text-copy-primary">
            {row.value}
            {row.auxiliary ? (
              <span className="text-copy-muted"> ({row.auxiliary})</span>
            ) : null}
          </dd>
        </Fragment>
      ))}
    </dl>
  );
}

function AdjectiveBlock({ adjective }: { adjective: AdjectiveData }) {
  const t = useTranslations("card");
  const opposites = adjective.opposites ?? [];
  const synonyms = adjective.synonyms ?? [];

  if (opposites.length === 0 && synonyms.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {opposites.length > 0 ? (
        <ChipRow label={t("opposites")} items={opposites} variant="outline" />
      ) : null}
      {synonyms.length > 0 ? (
        <ChipRow label={t("synonyms")} items={synonyms} variant="secondary" />
      ) : null}
    </div>
  );
}

function RelatedBlock({ related }: { related: RelatedWord[] }) {
  const t = useTranslations("card");

  return (
    <div className="flex flex-col items-center gap-1">
      <p className="text-xs text-copy-muted">{t("related")}</p>
      <div className="flex flex-wrap justify-center gap-1">
        {related.map((word) => (
          <Badge key={word.german} variant="secondary">
            {word.german}
            {word.english ? (
              <span className="text-copy-muted"> · {word.english}</span>
            ) : null}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function ExamplesBlock({ examples }: { examples: ExampleSentence[] }) {
  const t = useTranslations("card");

  return (
    <div className="flex w-full flex-col gap-2 text-left">
      <p className="text-xs text-copy-muted">{t("examples")}</p>
      <ul className="flex flex-col gap-3">
        {examples.map((example, index) => (
          <li key={index} className="flex flex-col gap-0.5">
            {example.verbForm ? (
              <span className="text-xs uppercase tracking-wide text-copy-muted">
                {t(example.verbForm)}
              </span>
            ) : null}
            <span className="text-sm text-copy-primary">{example.de}</span>
            <span className="text-sm text-copy-muted">{example.en}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ChipRow({
  label,
  items,
  variant,
}: {
  label: string;
  items: string[];
  variant: "outline" | "secondary";
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <p className="text-xs text-copy-muted">{label}</p>
      <div className="flex flex-wrap justify-center gap-1">
        {items.map((item) => (
          <Badge key={item} variant={variant}>
            {item}
          </Badge>
        ))}
      </div>
    </div>
  );
}
