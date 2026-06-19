"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";

import { deleteDeck, getDeckSummaries } from "@/lib/db";
import type { DeckSummary } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/common/confirm-dialog";

import { DeckCard } from "./deck-card";
import { DeckFormDialog } from "./deck-form-dialog";

export function DeckGrid() {
  const t = useTranslations("decks");
  const tCommon = useTranslations("common");
  const [summaries, setSummaries] = useState<DeckSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [renameTarget, setRenameTarget] = useState<DeckSummary | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<DeckSummary | undefined>();

  const reload = useCallback(async () => {
    try {
      setSummaries(await getDeckSummaries());
    } catch {
      setSummaries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    void (async () => {
      const data = await getDeckSummaries().catch(() => []);
      if (active) {
        setSummaries(data);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  function openCreate() {
    setRenameTarget(undefined);
    setFormKey((key) => key + 1);
    setFormOpen(true);
  }

  function openRename(summary: DeckSummary) {
    setRenameTarget(summary);
    setFormKey((key) => key + 1);
    setFormOpen(true);
  }

  return (
    <section className="flex flex-1 flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-copy-primary">
          {t("title")}
        </h1>
        <Button onClick={openCreate}>
          <Plus />
          {t("create")}
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-copy-muted">{t("loading")}</p>
      ) : summaries.length === 0 ? (
        <p className="text-sm text-copy-muted">{t("empty")}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {summaries.map((summary) => (
            <DeckCard
              key={summary.id}
              summary={summary}
              onRename={openRename}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <DeckFormDialog
        key={formKey}
        open={formOpen}
        onOpenChange={setFormOpen}
        deck={renameTarget}
        onSaved={reload}
      />

      <ConfirmDialog
        open={deleteTarget !== undefined}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(undefined);
          }
        }}
        title={t("deleteTitle")}
        description={t("deleteConfirm", { name: deleteTarget?.name ?? "" })}
        confirmLabel={tCommon("delete")}
        onConfirm={async () => {
          if (deleteTarget) {
            await deleteDeck(deleteTarget.id);
            await reload();
          }
        }}
      />
    </section>
  );
}
