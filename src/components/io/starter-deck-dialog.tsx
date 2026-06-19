"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Download } from "lucide-react";

import { fetchStarterDeck, fetchStarterManifest, importParsed } from "@/lib/io";
import type { StarterDeckEntry } from "@/lib/io";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface StarterDeckDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImported: () => void | Promise<void>;
}

type Status = "loading" | "ready" | "error";

export function StarterDeckDialog({
  open,
  onOpenChange,
  onImported,
}: StarterDeckDialogProps) {
  const t = useTranslations("io");
  const tCommon = useTranslations("common");
  const [status, setStatus] = useState<Status>("loading");
  const [entries, setEntries] = useState<StarterDeckEntry[]>([]);
  const [importing, setImporting] = useState<string | null>(null);
  const [imported, setImported] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!open) {
      return;
    }
    let active = true;
    void (async () => {
      try {
        const manifest = await fetchStarterManifest();
        if (active) {
          setEntries(manifest);
          setStatus("ready");
        }
      } catch {
        if (active) {
          setStatus("error");
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [open]);

  async function importStarter(entry: StarterDeckEntry) {
    setImporting(entry.id);
    try {
      const parsed = await fetchStarterDeck(entry.file);
      await importParsed(parsed);
      setImported((current) => new Set(current).add(entry.id));
      await onImported();
    } finally {
      setImporting(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl">
        <DialogHeader>
          <DialogTitle>{t("starterTitle")}</DialogTitle>
          <DialogDescription>{t("starterHint")}</DialogDescription>
        </DialogHeader>

        {status === "loading" ? (
          <p className="text-sm text-copy-muted">{t("starterLoading")}</p>
        ) : status === "error" ? (
          <p className="text-sm text-state-error">{t("starterError")}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-surface-border p-3"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-copy-primary">
                    {entry.name}
                  </span>
                  {entry.description ? (
                    <span className="text-xs text-copy-muted">
                      {entry.description}
                    </span>
                  ) : null}
                  {entry.cardCount !== undefined ? (
                    <span className="text-xs text-copy-muted">
                      {t("cards", { count: entry.cardCount })}
                    </span>
                  ) : null}
                </div>
                <Button
                  variant={imported.has(entry.id) ? "outline" : "default"}
                  size="sm"
                  disabled={importing !== null}
                  onClick={() => importStarter(entry)}
                >
                  {imported.has(entry.id) ? <Check /> : <Download />}
                  {imported.has(entry.id)
                    ? t("starterImported")
                    : t("starterImport")}
                </Button>
              </li>
            ))}
          </ul>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {tCommon("close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
