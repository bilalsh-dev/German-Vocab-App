"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, X } from "lucide-react";

import { createCard, updateCard } from "@/lib/db";
import {
  buildCardFields,
  cardToDraft,
  draftToPreviewCard,
  emptyCardDraft,
  genderEndingHint,
  genderGroupHint,
  getCardDraftErrors,
} from "@/lib/content";
import type {
  Card,
  CardDraft,
  Gender,
  PartOfSpeech,
  RelationKind,
} from "@/lib/content";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CardReveal } from "@/components/card/card-reveal";

import { VowelMarkField } from "./vowel-mark-field";

const POS_OPTIONS: PartOfSpeech[] = [
  "noun",
  "verb",
  "adjective",
  "adverb",
  "phrase",
  "other",
];
const GENDER_OPTIONS: Gender[] = ["masculine", "feminine", "neuter"];
const RELATION_OPTIONS: RelationKind[] = [
  "nominalization",
  "derived",
  "compound",
  "related",
];
const VERB_FORM_OPTIONS = ["praesens", "praeteritum", "perfekt"] as const;

interface CardEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deckId: string;
  defaultTopic: string;
  card?: Card;
  onSaved: () => void;
}

export function CardEditorDialog({
  open,
  onOpenChange,
  deckId,
  defaultTopic,
  card,
  onSaved,
}: CardEditorDialogProps) {
  const t = useTranslations("cards");
  const tf = useTranslations("cards.fields");
  const tCommon = useTranslations("common");
  const [draft, setDraft] = useState<CardDraft>(() =>
    card ? cardToDraft(card) : emptyCardDraft(defaultTopic),
  );
  const [busy, setBusy] = useState(false);

  const previewCard = useMemo(
    () => draftToPreviewCard(draft, deckId),
    [draft, deckId],
  );
  const errors = useMemo(() => getCardDraftErrors(draft), [draft]);
  const canSave = errors.length === 0 && !busy;

  function patch(changes: Partial<CardDraft>) {
    setDraft((current) => ({ ...current, ...changes }));
  }

  async function handleSave() {
    if (!canSave) {
      return;
    }
    setBusy(true);
    try {
      const fields = buildCardFields(draft, deckId);
      if (card) {
        await updateCard(card.id, fields);
      } else {
        await createCard(fields);
      }
      onSaved();
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  }

  const endingHint =
    draft.partOfSpeech === "noun" && draft.german.trim()
      ? genderEndingHint(draft.german)
      : null;
  const groupHint =
    draft.partOfSpeech === "noun" && draft.german.trim()
      ? genderGroupHint(previewCard)
      : null;
  const genderHints = [endingHint?.reason, groupHint?.reason].filter(Boolean);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] gap-0 overflow-hidden rounded-3xl p-0 sm:max-w-4xl">
        <DialogHeader className="border-b border-surface-border px-6 py-4">
          <DialogTitle>{card ? t("editTitle") : t("addTitle")}</DialogTitle>
        </DialogHeader>

        <div className="grid max-h-[70vh] grid-cols-1 overflow-hidden md:grid-cols-[1.4fr_1fr]">
          <div className="flex flex-col gap-5 overflow-y-auto px-6 py-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label={tf("english")}>
                <Input
                  value={draft.english}
                  onChange={(event) => patch({ english: event.target.value })}
                />
              </Field>
              <Field label={tf("german")}>
                <Input
                  value={draft.german}
                  onChange={(event) => patch({ german: event.target.value })}
                />
              </Field>
            </div>

            <Field label={tf("partOfSpeech")}>
              <Select
                value={draft.partOfSpeech}
                onValueChange={(value) =>
                  patch({ partOfSpeech: value as PartOfSpeech })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {POS_OPTIONS.map((pos) => (
                    <SelectItem key={pos} value={pos}>
                      {t(`pos.${pos}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label={tf("vowelMarks")} hint={tf("vowelMarksHint")}>
              <VowelMarkField
                word={draft.german}
                vowelMarks={draft.vowelMarks}
                onChange={(vowelMarks) => patch({ vowelMarks })}
              />
            </Field>

            {draft.partOfSpeech === "noun" ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label={tf("gender")} hint={genderHints.join(" · ")}>
                  <Select
                    value={draft.noun.gender || undefined}
                    onValueChange={(value) =>
                      patch({
                        noun: { ...draft.noun, gender: value as Gender },
                      })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GENDER_OPTIONS.map((gender) => (
                        <SelectItem key={gender} value={gender}>
                          {t(`genders.${gender}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label={tf("plural")}>
                  <Input
                    value={draft.noun.plural}
                    onChange={(event) =>
                      patch({
                        noun: { ...draft.noun, plural: event.target.value },
                      })
                    }
                  />
                </Field>
              </div>
            ) : null}

            {draft.partOfSpeech === "verb" ? (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {VERB_FORM_OPTIONS.map((form) => (
                    <Field key={form} label={t(`verbForms.${form}`)}>
                      <Input
                        value={draft.verb[form]}
                        onChange={(event) =>
                          patch({
                            verb: { ...draft.verb, [form]: event.target.value },
                          })
                        }
                      />
                    </Field>
                  ))}
                </div>
                <Field label={tf("auxiliary")}>
                  <Select
                    value={draft.verb.auxiliary}
                    onValueChange={(value) =>
                      patch({
                        verb: {
                          ...draft.verb,
                          auxiliary: value as "haben" | "sein",
                        },
                      })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="haben">{t("auxiliaries.haben")}</SelectItem>
                      <SelectItem value="sein">{t("auxiliaries.sein")}</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            ) : null}

            {draft.partOfSpeech === "adjective" ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label={tf("opposites")} hint={tf("listHint")}>
                  <Input
                    value={draft.adjective.opposites}
                    onChange={(event) =>
                      patch({
                        adjective: {
                          ...draft.adjective,
                          opposites: event.target.value,
                        },
                      })
                    }
                  />
                </Field>
                <Field label={tf("synonyms")} hint={tf("listHint")}>
                  <Input
                    value={draft.adjective.synonyms}
                    onChange={(event) =>
                      patch({
                        adjective: {
                          ...draft.adjective,
                          synonyms: event.target.value,
                        },
                      })
                    }
                  />
                </Field>
              </div>
            ) : null}

            <RelatedEditor draft={draft} patch={patch} />
            <ExamplesEditor draft={draft} patch={patch} />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label={tf("topic")}>
                <Input
                  value={draft.topic}
                  onChange={(event) => patch({ topic: event.target.value })}
                />
              </Field>
              <Field label={tf("tags")} hint={tf("tagsHint")}>
                <Input
                  value={draft.tags}
                  onChange={(event) => patch({ tags: event.target.value })}
                />
              </Field>
            </div>

            <Field label={tf("notes")}>
              <Textarea
                value={draft.notes}
                onChange={(event) => patch({ notes: event.target.value })}
                rows={2}
              />
            </Field>
          </div>

          <div className="flex flex-col gap-3 overflow-y-auto border-t border-surface-border bg-surface px-6 py-5 md:border-t-0 md:border-l">
            <p className="text-xs uppercase tracking-wide text-copy-muted">
              {t("preview")}
            </p>
            <div className="flex flex-1 items-center justify-center rounded-2xl border border-surface-border bg-base p-4">
              <CardReveal card={previewCard} promptSide="english" />
            </div>
          </div>
        </div>

        <DialogFooter className="items-center border-t border-surface-border px-6 py-4 sm:justify-between">
          <p className="text-xs text-state-error">
            {errors.length > 0 ? t(`errors.${errors[0]}`) : ""}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={busy}
            >
              {tCommon("cancel")}
            </Button>
            <Button onClick={handleSave} disabled={!canSave}>
              {card ? tCommon("save") : tCommon("create")}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm text-copy-muted">{label}</span>
      {children}
      {hint ? <span className="text-xs text-copy-muted">{hint}</span> : null}
    </div>
  );
}

interface SubEditorProps {
  draft: CardDraft;
  patch: (changes: Partial<CardDraft>) => void;
}

function RelatedEditor({ draft, patch }: SubEditorProps) {
  const t = useTranslations("cards");
  const tf = useTranslations("cards.fields");

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm text-copy-muted">{tf("related")}</span>
      {draft.related.map((word, index) => (
        <div key={index} className="flex flex-wrap items-center gap-2">
          <Input
            className="min-w-32 flex-1"
            placeholder={tf("relatedGerman")}
            value={word.german}
            onChange={(event) =>
              patch({
                related: draft.related.map((entry, i) =>
                  i === index ? { ...entry, german: event.target.value } : entry,
                ),
              })
            }
          />
          <Input
            className="min-w-32 flex-1"
            placeholder={tf("relatedEnglish")}
            value={word.english ?? ""}
            onChange={(event) =>
              patch({
                related: draft.related.map((entry, i) =>
                  i === index
                    ? { ...entry, english: event.target.value }
                    : entry,
                ),
              })
            }
          />
          <Select
            value={word.relation}
            onValueChange={(value) =>
              patch({
                related: draft.related.map((entry, i) =>
                  i === index
                    ? { ...entry, relation: value as RelationKind }
                    : entry,
                ),
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RELATION_OPTIONS.map((relation) => (
                <SelectItem key={relation} value={relation}>
                  {t(`relations.${relation}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t("fields.related")}
            onClick={() =>
              patch({ related: draft.related.filter((_, i) => i !== index) })
            }
          >
            <X />
          </Button>
        </div>
      ))}
      <Button
        variant="outline"
        size="sm"
        className="self-start"
        onClick={() =>
          patch({
            related: [
              ...draft.related,
              { german: "", english: "", relation: "related" },
            ],
          })
        }
      >
        <Plus />
        {tf("addRelated")}
      </Button>
    </div>
  );
}

function ExamplesEditor({ draft, patch }: SubEditorProps) {
  const t = useTranslations("cards");
  const tf = useTranslations("cards.fields");

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm text-copy-muted">{tf("examples")}</span>
      {draft.examples.map((example, index) => (
        <div
          key={index}
          className="flex flex-col gap-2 rounded-xl border border-surface-border p-3"
        >
          <div className="flex items-center gap-2">
            <Input
              className="flex-1"
              placeholder={tf("exampleGerman")}
              value={example.de}
              onChange={(event) =>
                patch({
                  examples: draft.examples.map((entry, i) =>
                    i === index ? { ...entry, de: event.target.value } : entry,
                  ),
                })
              }
            />
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={tf("examples")}
              onClick={() =>
                patch({
                  examples: draft.examples.filter((_, i) => i !== index),
                })
              }
            >
              <X />
            </Button>
          </div>
          <Input
            placeholder={tf("exampleEnglish")}
            value={example.en}
            onChange={(event) =>
              patch({
                examples: draft.examples.map((entry, i) =>
                  i === index ? { ...entry, en: event.target.value } : entry,
                ),
              })
            }
          />
          {draft.partOfSpeech === "verb" ? (
            <Select
              value={example.verbForm ?? "none"}
              onValueChange={(value) =>
                patch({
                  examples: draft.examples.map((entry, i) =>
                    i === index
                      ? {
                          ...entry,
                          verbForm:
                            value === "none"
                              ? undefined
                              : (value as "praesens" | "praeteritum" | "perfekt"),
                        }
                      : entry,
                  ),
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t("verbForms.none")}</SelectItem>
                {VERB_FORM_OPTIONS.map((form) => (
                  <SelectItem key={form} value={form}>
                    {t(`verbForms.${form}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}
        </div>
      ))}
      <Button
        variant="outline"
        size="sm"
        className="self-start"
        onClick={() =>
          patch({
            examples: [...draft.examples, { de: "", en: "" }],
          })
        }
      >
        <Plus />
        {tf("addExample")}
      </Button>
    </div>
  );
}
