import Link from "next/link";
import { notFound } from "next/navigation";
import { getCompany } from "@/lib/data";
import { ClaimForm } from "@/components/claim-form";

export const dynamic = "force-dynamic";

export default async function ClaimPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = await getCompany(slug);
  if (!c) notFound();

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-6 py-16">
      <h1 className="text-2xl font-bold tracking-tight">Claim {c.name}</h1>
      <p className="mt-3 text-muted-foreground">
        Verify ownership to edit this profile, respond to reviews, receive leads, and invite clients to leave verified reviews.
      </p>

      {c.listingStatus !== "unclaimed" ? (
        <p className="mt-6 rounded-lg border border-border bg-card p-5 text-sm text-muted-foreground">
          This company has already been claimed. If you believe this is an error, contact support.
        </p>
      ) : (
        <div className="mt-6">
          <ClaimForm slug={c.slug} companyName={c.name} />
        </div>
      )}

      <p className="mt-8 text-sm">
        <Link href={`/companies/${c.slug}`} className="text-primary hover:underline">← Back to {c.name}</Link>
      </p>
    </main>
  );
}
