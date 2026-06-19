"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { locales, type Locale } from "@/i18n/config";
import { setUserLocale } from "@/i18n/locale";
import { setUiLanguage } from "@/lib/db";

export function LocaleSwitcher() {
  const locale = useLocale() as Locale;
  const t = useTranslations("common");
  const [isPending, startTransition] = useTransition();

  const nextLocale = locales[(locales.indexOf(locale) + 1) % locales.length];

  function toggle() {
    startTransition(async () => {
      await setUiLanguage(nextLocale);
      await setUserLocale(nextLocale);
    });
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      disabled={isPending}
      aria-label={t("switchLanguage")}
      className="gap-2 text-copy-muted"
    >
      <Languages className="h-4 w-4" />
      <span className="hidden sm:inline">{locale.toUpperCase()}</span>
    </Button>
  );
}
