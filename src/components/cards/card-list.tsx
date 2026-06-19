"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Sparkles } from "lucide-react";

import { deleteCard, getCardsByDeck } from "@/lib/db";
import { collectTags, collectTopics, filterCards } from "@/lib/content";
import type { Card, CardDraft } from "@/lib/content";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/common/confirm-dialog";

import { CardRow } from "./card-row";
import { CardEditorDialog } from "./card-editor-dialog";
import { AiDraftDialog } from "./ai-draft-dialog";

const ALL = "__all__";

interface CardListProps {
  deckId: string;
  deckName: string;
}

export function CardList({ deckId, deckName }: CardListProps) {
  const t = useTranslations("cards");
  const tCommon = useTranslations("common");
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [topic, setTopic] = useState<string>(ALL);
  const [tag, setTag] = useState<string>(ALL);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorKey, setEditorKey] = useState(0);
  const [editTarget, setEditTarget] = useState<Card | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Card | undefined>();
  const [aiOpen, setAiOpen] = useState(false);
  const [aiQueue, setAiQueue] = useState<CardDraft[]>([]);
  const [aiPos, setAiPos] = useState(0);

  const reload = useCallback(async () => {
    try {
      setCards(await getCardsByDeck(deckId));
    } catch {
      setCards([]);
    } finally {
      setLoading(false);
    }
  }, [deckId]);

  useEffect(() => {
    let active = true;
    void (async () => {
      const data = await getCardsByDeck(deckId).catch(() => []);
      if (active) {
        setCards(data);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [deckId]);

  const topics = useMemo(() => collectTopics(cards), [cards]);
  const tags = useMemo(() => collectTags(cards), [cards]);
  const filtered = useMemo(
    () =>
      filterCards(cards, {
        topic: topic === ALL ? undefined : topic,
        tag: tag === ALL ? undefined : tag,
      }),
    [cards, topic, tag],
  );

  function openCreate() {
    setAiQueue([]);
    setAiPos(0);
    setEditTarget(undefined);
    setEditorKey((key) => key + 1);
    setEditorOpen(true);
  }

  function openEdit(card: Card) {
    setAiQueue([]);
    setAiPos(0);
    setEditTarget(card);
    setEditorKey((key) => key + 1);
    setEditorOpen(true);
  }

  function handleDrafted(drafts: CardDraft[]) {
    setAiOpen(false);
    setEditTarget(undefined);
    setAiQueue(drafts);
    setAiPos(0);
    setEditorKey((key) => key + 1);
    setEditorOpen(true);
  }

  function handleEditorOpenChange(open: boolean) {
    if (open) {
      setEditorOpen(true);
      return;
    }
    if (aiQueue.length > 0 && aiPos + 1 < aiQueue.length) {
      setAiPos((pos) => pos + 1);
      setEditorKey((key) => key + 1);
      return;
    }
    setAiQueue([]);
    setAiPos(0);
    setEditorOpen(false);
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-copy-primary">
          {t("title")}
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          {topics.length > 0 ? (
            <Select value={topic} onValueChange={setTopic}>
              <SelectTrigger size="sm" aria-label={t("filterTopic")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>{t("allTopics")}</SelectItem>
                {topics.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}
          {tags.length > 0 ? (
            <Select value={tag} onValueChange={setTag}>
              <SelectTrigger size="sm" aria-label={t("filterTag")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>{t("allTags")}</SelectItem>
                {tags.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}
          <Button variant="outline" onClick={() => setAiOpen(true)}>
            <Sparkles />
            {t("ai")}
          </Button>
          <Button onClick={openCreate}>
            <Plus />
            {t("add")}
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-copy-muted">{t("loading")}</p>
      ) : cards.length === 0 ? (
        <p className="text-sm text-copy-muted">{t("empty")}</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-copy-muted">{t("noMatches")}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.map((card) => (
            <CardRow
              key={card.id}
              card={card}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
            />
          ))}
        </ul>
      )}

      <CardEditorDialog
        key={editorKey}
        open={editorOpen}
        onOpenChange={handleEditorOpenChange}
        deckId={deckId}
        defaultTopic={deckName}
        card={editTarget}
        initialDraft={aiQueue.length > 0 ? aiQueue[aiPos] : undefined}
        subtitle={
          aiQueue.length > 0
            ? t("aiReview", { index: aiPos + 1, total: aiQueue.length })
            : undefined
        }
        onSaved={reload}
      />

      <AiDraftDialog
        open={aiOpen}
        onOpenChange={setAiOpen}
        topic={deckName}
        onDrafted={handleDrafted}
      />

      <ConfirmDialog
        open={deleteTarget !== undefined}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(undefined);
          }
        }}
        title={t("deleteTitle")}
        description={t("deleteConfirm", { word: deleteTarget?.german ?? "" })}
        confirmLabel={tCommon("delete")}
        onConfirm={async () => {
          if (deleteTarget) {
            await deleteCard(deleteTarget.id);
            await reload();
          }
        }}
      />
    </section>
  );
}
