"use client";

import { CompanyCard } from "@/components/company-card";
import type { SponsoredCard } from "@/lib/types";

export function SponsoredStrip({ items }: { items: SponsoredCard[] }) {
  if (items.length === 0) return null;
  const track = (id: string) => {
    try {
      fetch(`/api/sponsorships/${id}/click`, { method: "POST", keepalive: true });
    } catch {
      /* best-effort */
    }
  };
  return (
    <section className="mt-6">
      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="rounded bg-warning/15 px-2 py-0.5 font-medium uppercase tracking-wide text-warning">Sponsored</span>
        <span>Paid placements — labeled, and never factored into the Company Intelligence Score or organic ranking.</span>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((c) => (
          <div key={c.sponsorshipId} onClick={() => track(c.sponsorshipId)} className="rounded-lg ring-1 ring-warning/40">
            <CompanyCard c={c} />
          </div>
        ))}
      </div>
    </section>
  );
}
