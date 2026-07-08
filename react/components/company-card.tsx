import Link from "next/link";
import { MapPin } from "lucide-react";
import type { CompanyCard as Card } from "@/lib/types";
import { fmtRate, fmtEmployees, fmtMoney, quadrantLabel } from "@/lib/format";
import { LogoAvatar } from "@/components/logo-avatar";
import { ScoreBadge } from "@/components/score-badge";
import { StarRating } from "@/components/star-rating";
import { Badge } from "@/components/ui/badge";

export function CompanyCard({ c }: { c: Card }) {
  const rate = fmtRate(c.hourlyRateMin, c.hourlyRateMax, c.rateCurrency);
  const emp = fmtEmployees(c.employeeRangeMin, c.employeeRangeMax);
  const minProj = fmtMoney(c.minProjectSize, c.rateCurrency);
  const location = [c.hqCity?.name, c.hqCountry?.name].filter(Boolean).join(", ");

  return (
    <div className="flex flex-col rounded-lg border border-border bg-card p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start gap-4">
        <LogoAvatar name={c.name} logoUrl={c.logoUrl} size={48} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Link href={`/companies/${c.slug}`} className="truncate font-semibold hover:text-primary">
              {c.name}
            </Link>
            {c.verified && <Badge variant="verified">Verified</Badge>}
          </div>
          {c.tagline && <p className="mt-0.5 truncate text-sm text-muted-foreground">{c.tagline}</p>}
        </div>
        <ScoreBadge cis={c.cis} size={52} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
        {c.rating != null && (
          <span className="flex items-center gap-1.5">
            <StarRating value={c.rating} size={14} />
            <span>({c.reviewCount})</span>
          </span>
        )}
        {c.quadrant && <Badge variant="brand">{quadrantLabel(c.quadrant)}</Badge>}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {c.services.slice(0, 3).map((s) => (
          <Badge key={s.slug} variant="outline">{s.name}</Badge>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-3 text-sm">
        <div>
          <div className="text-muted-foreground">Rate</div>
          <div className="tabular font-medium">{rate ?? "—"}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Min project</div>
          <div className="tabular font-medium">{minProj ?? "—"}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Team</div>
          <div className="tabular font-medium">{emp ?? "—"}</div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="flex items-center gap-1 text-sm text-muted-foreground">
          {location && (
            <>
              <MapPin size={14} /> {location}
            </>
          )}
        </span>
        <Link href={`/companies/${c.slug}`} className="text-sm font-medium text-primary hover:underline">
          View profile →
        </Link>
      </div>
    </div>
  );
}
