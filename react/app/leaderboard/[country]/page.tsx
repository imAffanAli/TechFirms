import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLeaderboard } from "@/lib/data";
import { LeaderboardView } from "@/components/leaderboard-view";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ country: string }> }): Promise<Metadata> {
  const { country } = await params;
  const lb = await getLeaderboard(country);
  if (!lb) return { title: "Leaderboard not found" };
  return { title: lb.title, description: lb.answerBlock };
}

export default async function CountryLeaderboard({ params }: { params: Promise<{ country: string }> }) {
  const { country } = await params;
  const lb = await getLeaderboard(country);
  if (!lb) notFound();
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
      <LeaderboardView lb={lb} />
    </main>
  );
}
