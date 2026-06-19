"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowLeft, GraduationCap, Pencil, Trash2 } from "lucide-react";

import { deleteDeck, getDeck } from "@/lib/db";
import type { Deck } from "@/lib/content";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { CardList } from "@/components/cards/card-list";
import { ExportButtons } from "@/components/io/export-buttons";

import { DeckFormDialog } from "./deck-form-dialog";

interface DeckDetailProps {
  deckId: string;
}

export function DeckDetail({ deckId }: DeckDetailProps) {
  const t = useTranslations("decks");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [deck, setDeck] = useState<Deck | undefined>();
  const [loading, setLoading] = useState(true);
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const reload = useCallback(async () => {
    try {
      setDeck(await getDeck(deckId));
    } catch {
      setDeck(undefined);
    } finally {
      setLoading(false);
    }
  }, [deckId]);

  useEffect(() => {
    let active = true;
    void (async () => {
      const found = await getDeck(deckId).catch(() => undefined);
      if (active) {
        setDeck(found);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [deckId]);

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
            {tCommon("back")}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Link
          href="/"
          className="flex w-fit items-center gap-1 text-sm text-copy-muted transition-colors hover:text-copy-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("title")}
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold text-copy-primary">
              {deck.name}
            </h1>
            {deck.description ? (
              <p className="text-sm text-copy-muted">{deck.description}</p>
            ) : null}
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link href={`/study/${deck.id}`}>
                <GraduationCap />
                {t("study")}
              </Link>
            </Button>
            <ExportButtons deckId={deck.id} deckName={deck.name} />
            <Button variant="outline" onClick={() => setRenameOpen(true)}>
              <Pencil />
              {t("rename")}
            </Button>
            <Button variant="outline" onClick={() => setDeleteOpen(true)}>
              <Trash2 />
              {t("delete")}
            </Button>
          </div>
        </div>
      </div>

      <CardList deckId={deck.id} deckName={deck.name} />

      <DeckFormDialog
        key={deck.updatedAt}
        open={renameOpen}
        onOpenChange={setRenameOpen}
        deck={deck}
        onSaved={reload}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={t("deleteTitle")}
        description={t("deleteConfirm", { name: deck.name })}
        confirmLabel={tCommon("delete")}
        onConfirm={async () => {
          await deleteDeck(deck.id);
          router.push("/");
        }}
      />
    </div>
  );
}
