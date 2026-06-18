import { useTranslations } from "next-intl";

export default function StudyPage() {
  const t = useTranslations("study");

  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
      <h1 className="text-2xl font-semibold text-copy-primary">{t("title")}</h1>
      <p className="text-sm text-copy-muted">{t("pickDeck")}</p>
    </section>
  );
}
