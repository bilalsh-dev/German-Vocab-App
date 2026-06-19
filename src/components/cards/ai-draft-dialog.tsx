"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";

import { requestAiDrafts } from "@/lib/io";
import type { AiDraftMode } from "@/lib/io";
import type { CardDraft } from "@/lib/content";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AiDraftDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topic: string;
  onDrafted: (drafts: CardDraft[]) => void;
}

export function AiDraftDialog({
  open,
  onOpenChange,
  topic,
  onDrafted,
}: AiDraftDialogProps) {
  const t = useTranslations("cards");
  const tCommon = useTranslations("common");
  const [mode, setMode] = useState<AiDraftMode>("word");
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate() {
    const trimmed = input.trim();
    if (!trimmed || busy) {
      return;
    }
    setBusy(true);
    setError("");
    try {
      const drafts = await requestAiDrafts({ mode, input: trimmed, topic });
      if (drafts.length === 0) {
        setError(t("aiEmpty"));
        return;
      }
      onDrafted(drafts);
    } catch (caught) {
      setError(
        t("aiError", {
          message: caught instanceof Error ? caught.message : String(caught),
        }),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl">
        <DialogHeader>
          <DialogTitle>{t("aiTitle")}</DialogTitle>
          <DialogDescription>{t("aiHint")}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <Tabs
            value={mode}
            onValueChange={(value) => setMode(value as AiDraftMode)}
          >
            <TabsList className="w-full">
              <TabsTrigger value="word" className="flex-1">
                {t("aiModeWord")}
              </TabsTrigger>
              <TabsTrigger value="topic" className="flex-1">
                {t("aiModeTopic")}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <label className="flex flex-col gap-2 text-sm text-copy-primary">
            <span>{mode === "word" ? t("aiWordLabel") : t("aiTopicLabel")}</span>
            <Input
              value={input}
              disabled={busy}
              placeholder={
                mode === "word" ? t("aiWordPlaceholder") : t("aiTopicPlaceholder")
              }
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void handleGenerate();
                }
              }}
            />
          </label>

          {busy ? (
            <p className="text-sm text-copy-muted">{t("aiGenerating")}</p>
          ) : null}
          {error ? <p className="text-sm text-state-error">{error}</p> : null}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={busy}
          >
            {tCommon("cancel")}
          </Button>
          <Button onClick={handleGenerate} disabled={busy || !input.trim()}>
            <Sparkles />
            {t("aiGenerate")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
