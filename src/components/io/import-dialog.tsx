"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { importParsed, parseCardsFromCsv, parseDecksFromJson } from "@/lib/io";
import type { ImportResult } from "@/lib/io";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImported: () => void | Promise<void>;
}

type Status = "idle" | "working" | "done" | "error";

function deckNameFromFile(name: string): string {
  return name.replace(/\.[^.]+$/, "").trim() || "Imported";
}

export function ImportDialog({
  open,
  onOpenChange,
  onImported,
}: ImportDialogProps) {
  const t = useTranslations("io");
  const tCommon = useTranslations("common");
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState("");

  async function handleFile(file: File) {
    setStatus("working");
    setError("");
    setResult(null);
    try {
      const text = await file.text();
      const parsed = file.name.toLowerCase().endsWith(".csv")
        ? parseCardsFromCsv(text, deckNameFromFile(file.name))
        : parseDecksFromJson(text);
      const imported = await importParsed(parsed);
      setResult(imported);
      setStatus("done");
      await onImported();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
      setStatus("error");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl">
        <DialogHeader>
          <DialogTitle>{t("importTitle")}</DialogTitle>
          <DialogDescription>{t("importHint")}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-2 text-sm text-copy-primary">
            <span>{t("chooseFile")}</span>
            <input
              type="file"
              accept=".json,.csv,application/json,text/csv"
              disabled={status === "working"}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  void handleFile(file);
                }
              }}
              className="text-sm text-copy-muted file:mr-3 file:rounded-xl file:border file:border-surface-border file:bg-surface file:px-3 file:py-1.5 file:text-copy-primary"
            />
          </label>

          {status === "working" ? (
            <p className="text-sm text-copy-muted">{t("importing")}</p>
          ) : null}

          {status === "error" ? (
            <p className="text-sm text-state-error">
              {t("error", { message: error })}
            </p>
          ) : null}

          {status === "done" && result ? (
            <div className="flex flex-col gap-2 text-sm">
              <p className="text-copy-primary">
                {t("importedTotal", { count: result.totalImported })}
              </p>
              {result.totalRejected > 0 ? (
                <div className="flex flex-col gap-1">
                  <p className="text-state-warning">
                    {t("rejected", { count: result.totalRejected })}
                  </p>
                  <ScrollArea className="max-h-40 rounded-xl border border-surface-border">
                    <ul className="flex flex-col gap-1 p-3">
                      {result.decks.flatMap((deck) =>
                        deck.rejected.map((row) => (
                          <li
                            key={`${deck.deckName}-${row.row}`}
                            className="text-xs text-copy-muted"
                          >
                            {t("rejectedRow", {
                              row: row.row + 1,
                              reasons: row.reasons.join(", "),
                            })}
                          </li>
                        )),
                      )}
                    </ul>
                  </ScrollArea>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {status === "done" ? tCommon("close") : tCommon("cancel")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
