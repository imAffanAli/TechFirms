"use client";

import { useState } from "react";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Company logo sourced from its domain — tries Clearbit, then a Google favicon, and finally
 * falls back to a brand-tinted initials tile if neither resolves.
 */
export function LogoAvatar({
  name,
  domain,
  logoUrl,
  size = 48,
  className,
}: {
  name: string;
  domain?: string | null;
  logoUrl?: string | null;
  size?: number;
  className?: string;
}) {
  const sources = [
    logoUrl,
    domain ? `https://logo.clearbit.com/${domain}` : null,
    domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : null,
  ].filter(Boolean) as string[];

  const [idx, setIdx] = useState(0);

  if (idx < sources.length) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={sources[idx]}
        alt={`${name} logo`}
        width={size}
        height={size}
        onError={() => setIdx((i) => i + 1)}
        className={cn("shrink-0 rounded-lg bg-white object-contain p-0.5 ring-1 ring-border", className)}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center rounded-lg bg-brand-50 font-semibold text-brand-700 dark:bg-brand-950 dark:text-brand-300", className)}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
