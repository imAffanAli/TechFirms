import type { CountryItem, ServiceItem } from "@/lib/types";

const selectCls =
  "h-10 rounded-md border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

/** Server-rendered filter form. Submitting navigates to /companies with query params (no client JS). */
export function DirectoryFilters({
  services,
  countries,
  current,
  action = "/companies",
}: {
  services: ServiceItem[];
  countries: CountryItem[];
  current: { q?: string; service?: string; country?: string; sort?: string };
  action?: string;
}) {
  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input
        name="q"
        defaultValue={current.q ?? ""}
        placeholder="Search…"
        className="h-10 min-w-40 flex-1 rounded-md border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <select name="service" defaultValue={current.service ?? ""} className={selectCls} aria-label="Service">
        <option value="">All services</option>
        {services.map((s) => (
          <option key={s.slug} value={s.slug}>{s.name}</option>
        ))}
      </select>
      <select name="country" defaultValue={current.country ?? ""} className={selectCls} aria-label="Country">
        <option value="">All countries</option>
        {countries.map((c) => (
          <option key={c.slug} value={c.slug}>{c.name}</option>
        ))}
      </select>
      <select name="sort" defaultValue={current.sort ?? "cis"} className={selectCls} aria-label="Sort by">
        <option value="cis">Top score</option>
        <option value="rating">Highest rated</option>
        <option value="reviews">Most reviews</option>
        <option value="name">Name (A–Z)</option>
      </select>
      <button type="submit" className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-brand-800">
        Apply
      </button>
    </form>
  );
}
