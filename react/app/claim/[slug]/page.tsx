import Link from "next/link";
import { notFound } from "next/navigation";
import { getCompany } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ClaimPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = await getCompany(slug);
  if (!c) notFound();

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-6 py-16 text-center">
      <h1 className="text-2xl font-bold tracking-tight">Claim {c.name}</h1>
      <p className="mt-3 text-muted-foreground">
        Verify ownership via your work-email domain or a DNS TXT record to edit this profile, respond to reviews, and receive leads.
      </p>
      <div className="mt-6 rounded-lg border border-dashed border-border p-5 text-sm text-muted-foreground">
        The claim &amp; verification flow ships in milestone <strong>M5</strong> (see <code className="tabular">docs/19-build-sequence.md</code>). Backend endpoints and DNS/email verification are specified in <code className="tabular">docs/05</code> and <code className="tabular">docs/13</code>.
      </div>
      <p className="mt-6">
        <Link href={`/companies/${c.slug}`} className="text-primary hover:underline">← Back to {c.name}</Link>
      </p>
    </main>
  );
}
