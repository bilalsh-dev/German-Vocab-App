import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="border-t border-surface-border bg-surface">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-copy-muted sm:flex-row">
        <span>{t("tagline")}</span>
        <span>{t("meta")}</span>
      </div>
    </footer>
  );
}
