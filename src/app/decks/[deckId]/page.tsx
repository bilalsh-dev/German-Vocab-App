import { DeckDetail } from "@/components/decks/deck-detail";

export default async function DeckDetailPage({
  params,
}: {
  params: Promise<{ deckId: string }>;
}) {
  const { deckId } = await params;
  return <DeckDetail deckId={deckId} />;
}
