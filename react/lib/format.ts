import type { Quadrant } from "./types";

const CUR: Record<string, string> = {
  USD: "$", SAR: "SAR ", AED: "AED ", PKR: "PKR ", QAR: "QAR ", EGP: "EGP ", INR: "₹",
  TRY: "₺", JOD: "JOD ", BHD: "BHD ", KWD: "KWD ", OMR: "OMR ", EUR: "€", GBP: "£",
};
const sym = (c: string) => CUR[c] ?? `${c} `;
const grp = (n: number) => n.toLocaleString("en-US");

export function fmtRate(min: number | null, max: number | null, currency: string): string | null {
  if (min == null && max == null) return null;
  const s = sym(currency);
  if (min != null && max != null) return `${s}${grp(min)}–${grp(max)}/hr`;
  return `${s}${grp((min ?? max)!)}/hr`;
}

export function fmtMoney(v: number | null, currency = "USD"): string | null {
  if (v == null) return null;
  const s = sym(currency);
  if (v >= 1_000_000) return `${s}${(v / 1_000_000).toFixed(v % 1_000_000 === 0 ? 0 : 1)}M`;
  if (v >= 1_000) return `${s}${Math.round(v / 1_000)}k`;
  return `${s}${v}`;
}

export function fmtEmployees(min: number | null, max: number | null): string | null {
  if (min == null && max == null) return null;
  if (min != null && max != null) return `${min}–${max}`;
  return `${min ?? max}+`;
}

export function quadrantLabel(q: Quadrant | null): string {
  return q ? q.replace(/_/g, " ") : "Unranked";
}

export const QUADRANT_COLOR: Record<Quadrant, string> = {
  Leaders: "var(--color-brand-600)",
  Challengers: "var(--color-info)",
  Rising_Stars: "var(--color-violet-600)",
  Niche_Players: "var(--color-muted-foreground)",
};

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}
