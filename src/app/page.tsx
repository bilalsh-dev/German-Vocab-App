import { useTranslations } from "next-intl";

export default function DecksPage() {
  const t = useTranslations("decks");

  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
      <h1 className="text-2xl font-semibold text-copy-primary">{t("title")}</h1>
      <p className="text-sm text-copy-muted">{t("empty")}</p>
    </section>
  );
}
