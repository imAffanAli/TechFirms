import type { Metadata } from "next";
import { getServices, getCountries } from "@/lib/data";
import { QuoteForm } from "@/components/quote-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Get matched with technology companies",
  description: "Tell us about your project and we'll match you with the best-fit technology companies, ranked by the Company Intelligence Score.",
};

export default async function GetQuotePage() {
  const [services, countries] = await Promise.all([getServices(), getCountries()]);
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Get matched with the right firms</h1>
      <p className="mt-2 text-muted-foreground">
        Tell us about your project. We&apos;ll match you with up to five best-fit companies — ranked by the Company Intelligence Score — and forward your brief. Sponsored placements never affect matching.
      </p>
      <div className="mt-8">
        <QuoteForm mode="matched" services={services} countries={countries} />
      </div>
    </main>
  );
}
