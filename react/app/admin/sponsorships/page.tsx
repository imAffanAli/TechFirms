import Link from "next/link";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { SponsorshipCreator } from "@/components/sponsorship-creator";
import { SponsorshipToggle } from "@/components/sponsorship-toggle";

export const dynamic = "force-dynamic";

interface Sponsorship {
  id: string;
  company: { slug: string; name: string };
  tier: string;
  serviceCategory: string | null;
  slotRank: number | null;
  priceAmount: number | null;
  priceCurrency: string;
  active: boolean;
  startsAt: string;
  endsAt: string | null;
  impressions: number;
  clicks: number;
}

export default async function AdminSponsorships() {
  let items: Sponsorship[] = [];
  try {
    items = (await api<{ items: Sponsorship[] }>("/api/v1/admin/sponsorships")).items;
  } catch {
    items = [];
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Sponsorships</h1>
      <p className="mt-1 text-muted-foreground">
        Admin override so sales can attach a placement to any company. Sponsored slots appear labeled atop the directory; badges show on cards. Placements never affect the CIS or organic ranking.
      </p>

      <div className="mt-6"><SponsorshipCreator /></div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left text-muted-foreground">
              <th className="px-4 py-2 font-medium">Company</th>
              <th className="px-4 py-2 font-medium">Tier</th>
              <th className="px-4 py-2 font-medium">Scope</th>
              <th className="px-4 py-2 font-medium">Price</th>
              <th className="px-4 py-2 font-medium">Impr.</th>
              <th className="px-4 py-2 font-medium">Clicks</th>
              <th className="px-4 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan={7} className="px-4 py-6 text-muted-foreground">No sponsorships yet. Create one above.</td></tr>}
            {items.map((s) => (
              <tr key={s.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3"><Link href={`/companies/${s.company.slug}`} className="font-medium hover:text-primary">{s.company.name}</Link></td>
                <td className="px-4 py-3"><Badge variant={s.tier === "sponsored" ? "sponsored" : "brand"}>{s.tier.replace(/_/g, "-")}</Badge></td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{s.serviceCategory ? s.serviceCategory.replace(/_/g, " ") : "any service"}{s.slotRank ? ` · slot ${s.slotRank}` : ""}</td>
                <td className="tabular px-4 py-3">{s.priceAmount != null ? `${s.priceCurrency} ${s.priceAmount}/mo` : "—"}</td>
                <td className="tabular px-4 py-3">{s.impressions}</td>
                <td className="tabular px-4 py-3">{s.clicks}</td>
                <td className="px-4 py-3"><div className="flex items-center gap-2">{s.active ? <Badge variant="verified">active</Badge> : <Badge variant="neutral">inactive</Badge>}<SponsorshipToggle id={s.id} active={s.active} /></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
