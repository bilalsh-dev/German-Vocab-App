import { ReviewSession } from "@/components/study/review-session";

export default async function StudySessionPage({
  params,
}: {
  params: Promise<{ deckId: string }>;
}) {
  const { deckId } = await params;
  return <ReviewSession deckId={deckId} />;
}
