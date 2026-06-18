export default async function StudySessionPage({
  params,
}: {
  params: Promise<{ deckId: string }>;
}) {
  const { deckId } = await params;

  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
      <h1 className="text-2xl font-semibold text-copy-primary">Study</h1>
      <p className="text-sm text-copy-muted">
        Review session for deck {deckId}.
      </p>
    </section>
  );
}
