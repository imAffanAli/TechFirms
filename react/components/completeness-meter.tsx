interface CompanyFields {
  tagline: string | null;
  description: string | null;
  website: string | null;
  foundedYear: number | null;
  employeeRangeMin: number | null;
  employeeRangeMax: number | null;
  hourlyRateMin: number | null;
  hourlyRateMax: number | null;
  minProjectSize: number | null;
  reviewCount: number;
}

/** Nudges the owner to complete their profile — most of these fields feed the CIS. */
export function CompletenessMeter({ c }: { c: CompanyFields }) {
  const checks = [
    { label: "Tagline", ok: !!c.tagline },
    { label: "Description", ok: !!c.description && c.description.length > 40 },
    { label: "Website", ok: !!c.website },
    { label: "Founded year", ok: c.foundedYear != null },
    { label: "Team size", ok: c.employeeRangeMin != null || c.employeeRangeMax != null },
    { label: "Hourly rate", ok: c.hourlyRateMin != null || c.hourlyRateMax != null },
    { label: "Min project", ok: c.minProjectSize != null },
    { label: "A review", ok: c.reviewCount > 0 },
  ];
  const done = checks.filter((x) => x.ok).length;
  const pct = Math.round((done / checks.length) * 100);
  const missing = checks.filter((x) => !x.ok);

  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">Profile completeness</span>
        <span className="tabular text-muted-foreground">{pct}%</span>
      </div>
      <div className="mt-1 h-2 rounded-full bg-muted">
        <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${pct}%` }} />
      </div>
      {missing.length > 0 && (
        <p className="mt-2 text-xs text-muted-foreground">Add {missing.map((m) => m.label.toLowerCase()).join(", ")} to strengthen your listing and score.</p>
      )}
    </div>
  );
}
