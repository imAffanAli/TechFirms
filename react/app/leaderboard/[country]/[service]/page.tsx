import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLeaderboard } from "@/lib/data";
import { LeaderboardView } from "@/components/leaderboard-view";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ country: string; service: string }> }): Promise<Metadata> {
  const { country, service } = await params;
  const lb = await getLeaderboard(country, service);
  if (!lb) return { title: "Leaderboard not found" };
  return { title: lb.title, description: lb.answerBlock };
}

export default async function CountryServiceLeaderboard({ params }: { params: Promise<{ country: string; service: string }> }) {
  const { country, service } = await params;
  const lb = await getLeaderboard(country, service);
  if (!lb) notFound();
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
      <LeaderboardView lb={lb} />
    </main>
  );
}
