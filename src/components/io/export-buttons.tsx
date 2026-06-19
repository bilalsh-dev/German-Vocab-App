"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Download } from "lucide-react";

import {
  downloadTextFile,
  exportDeck,
  serializeCardsToCsv,
  serializeDecksToJson,
  slugifyFilename,
} from "@/lib/io";
import { Button } from "@/components/ui/button";

interface ExportButtonsProps {
  deckId: string;
  deckName: string;
}

export function ExportButtons({ deckId, deckName }: ExportButtonsProps) {
  const t = useTranslations("io");
  const [busy, setBusy] = useState(false);

  async function exportJson() {
    setBusy(true);
    try {
      const deck = await exportDeck(deckId);
      downloadTextFile(
        `${slugifyFilename(deckName)}.json`,
        "application/json",
        serializeDecksToJson([deck], Date.now()),
      );
    } finally {
      setBusy(false);
    }
  }

  async function exportCsv() {
    setBusy(true);
    try {
      const deck = await exportDeck(deckId);
      downloadTextFile(
        `${slugifyFilename(deckName)}.csv`,
        "text/csv",
        serializeCardsToCsv(deck.cards),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button variant="outline" onClick={exportJson} disabled={busy}>
        <Download />
        {t("exportJson")}
      </Button>
      <Button variant="outline" onClick={exportCsv} disabled={busy}>
        <Download />
        {t("exportCsv")}
      </Button>
    </>
  );
}
