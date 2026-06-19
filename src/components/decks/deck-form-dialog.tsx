"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { createDeck, updateDeck } from "@/lib/db";
import type { Deck } from "@/lib/content";
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

interface DeckFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deck?: Deck;
  onSaved: () => void;
}

export function DeckFormDialog({
  open,
  onOpenChange,
  deck,
  onSaved,
}: DeckFormDialogProps) {
  const t = useTranslations("decks");
  const tCommon = useTranslations("common");
  const [name, setName] = useState(deck?.name ?? "");
  const [description, setDescription] = useState(deck?.description ?? "");
  const [busy, setBusy] = useState(false);

  const isRename = deck !== undefined;
  const canSave = name.trim().length > 0 && !busy;

  async function handleSubmit() {
    if (!canSave) {
      return;
    }
    setBusy(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
      };
      if (isRename) {
        await updateDeck(deck.id, payload);
      } else {
        await createDeck(payload);
      }
      onSaved();
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl">
        <DialogHeader>
          <DialogTitle>
            {isRename ? t("renameTitle") : t("createTitle")}
          </DialogTitle>
        </DialogHeader>

        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            void handleSubmit();
          }}
        >
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-copy-muted">{t("name")}</span>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t("namePlaceholder")}
              autoFocus
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-copy-muted">{t("description")}</span>
            <Textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder={t("descriptionPlaceholder")}
              rows={3}
            />
          </label>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={busy}
            >
              {tCommon("cancel")}
            </Button>
            <Button type="submit" disabled={!canSave}>
              {isRename ? tCommon("save") : tCommon("create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
