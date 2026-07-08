import type { Metadata } from "next";
import { api } from "@/lib/api";
import { ReviewForm } from "@/components/review-form";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Leave a verified review" };

interface Inv { company: { slug: string; name: string }; clientName: string | null; used: boolean; expired: boolean }

async function getInvitation(token: string): Promise<Inv | null> {
  try {
    return await api<Inv>(`/api/v1/reviews/invitation/${token}`);
  } catch {
    return null;
  }
}

export default async function ReviewPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const inv = await getInvitation(token);

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-6 py-14">
      {!inv ? (
        <p className="rounded-lg border border-border bg-card p-6 text-muted-foreground">This review link is invalid.</p>
      ) : inv.used ? (
        <p className="rounded-lg border border-border bg-card p-6 text-muted-foreground">This review link has already been used. Thank you!</p>
      ) : inv.expired ? (
        <p className="rounded-lg border border-border bg-card p-6 text-muted-foreground">This review link has expired. Please ask for a new one.</p>
      ) : (
        <>
          <h1 className="text-2xl font-bold tracking-tight">Review {inv.company.name}</h1>
          <p className="mt-2 text-muted-foreground">{inv.clientName ? `Hi ${inv.clientName} — ` : ""}your review will be published as a verified review on {inv.company.name}&apos;s profile.</p>
          <div className="mt-6"><ReviewForm token={token} /></div>
        </>
      )}
    </main>
  );
}
