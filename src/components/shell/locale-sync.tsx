"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import { getStoredSettings, setUiLanguage } from "@/lib/db";
import { setUserLocale } from "@/i18n/locale";
import { isLocale, type Locale } from "@/i18n/config";

export function LocaleSync() {
  const locale = useLocale() as Locale;

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const stored = await getStoredSettings();
      if (cancelled) {
        return;
      }
      if (!stored) {
        await setUiLanguage(locale);
        return;
      }
      if (isLocale(stored.uiLanguage) && stored.uiLanguage !== locale) {
        await setUserLocale(stored.uiLanguage);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [locale]);

  return null;
}
