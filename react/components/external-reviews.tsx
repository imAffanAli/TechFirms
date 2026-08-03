import { ExternalLink } from "lucide-react";

const q = (s: string) => encodeURIComponent(s);

/**
 * Deep links to a company on external review platforms. We never copy their review content —
 * these credit the source and send the reader there. Aggregate ratings we DO show (e.g. Google)
 * come from official APIs with attribution elsewhere on the page.
 */
export function ExternalReviews({ name, domain, googleUrl }: { name: string; domain?: string | null; googleUrl?: string | null }) {
  const links = [
    googleUrl ? { label: "Google", href: googleUrl } : { label: "Google", href: `https://www.google.com/search?q=${q(`${name} reviews`)}` },
    { label: "Glassdoor", href: `https://www.glassdoor.com/Search/results.htm?keyword=${q(name)}` },
    { label: "Clutch", href: `https://clutch.co/search?q=${q(name)}` },
    { label: "G2", href: `https://www.g2.com/search?query=${q(name)}` },
    { label: "Trustpilot", href: `https://www.trustpilot.com/search?query=${q(domain || name)}` },
  ];

  return (
    <section className="scroll-mt-20">
      <h2 className="text-xl font-semibold">Reviews on other platforms</h2>
      <p className="mt-1 text-sm text-muted-foreground">See what people say about {name} elsewhere — these open the source site directly.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {links.map((l) => (
          <a
            key={l.label}
            href={l.href}
            target="_blank"
            rel="nofollow noopener"
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted"
          >
            {l.label} <ExternalLink size={13} className="text-muted-foreground" />
          </a>
        ))}
      </div>
    </section>
  );
}
