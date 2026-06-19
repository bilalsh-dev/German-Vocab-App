"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Sparkles, Upload } from "lucide-react";

import { deleteDeck, getDeckSummaries } from "@/lib/db";
import type { DeckSummary } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { ImportDialog } from "@/components/io/import-dialog";
import { StarterDeckDialog } from "@/components/io/starter-deck-dialog";

import { DeckCard } from "./deck-card";
import { DeckFormDialog } from "./deck-form-dialog";

export function DeckGrid() {
  const t = useTranslations("decks");
  const tCommon = useTranslations("common");
  const tIo = useTranslations("io");
  const [summaries, setSummaries] = useState<DeckSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [renameTarget, setRenameTarget] = useState<DeckSummary | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<DeckSummary | undefined>();
  const [importOpen, setImportOpen] = useState(false);
  const [importKey, setImportKey] = useState(0);
  const [starterOpen, setStarterOpen] = useState(false);
  const [starterKey, setStarterKey] = useState(0);

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

  function openImport() {
    setImportKey((key) => key + 1);
    setImportOpen(true);
  }

  function openStarter() {
    setStarterKey((key) => key + 1);
    setStarterOpen(true);
  }

  return (
    <section className="flex flex-1 flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-copy-primary">
          {t("title")}
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={openStarter}>
            <Sparkles />
            {tIo("starter")}
          </Button>
          <Button variant="outline" onClick={openImport}>
            <Upload />
            {tIo("import")}
          </Button>
          <Button onClick={openCreate}>
            <Plus />
            {t("create")}
          </Button>
        </div>
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

      <ImportDialog
        key={`import-${importKey}`}
        open={importOpen}
        onOpenChange={setImportOpen}
        onImported={reload}
      />

      <StarterDeckDialog
        key={`starter-${starterKey}`}
        open={starterOpen}
        onOpenChange={setStarterOpen}
        onImported={reload}
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
