import { cn } from "@/lib/utils";

/**
 * Company Intelligence Score badge. Violet is the reserved AI accent (_canon.md §2):
 * a teal→violet ring signals "AI-computed". `size` = diameter in px.
 */
export function ScoreBadge({ cis, size = 56, className }: { cis: number | null; size?: number; className?: string }) {
  if (cis == null) {
    return (
      <span className={cn("inline-flex items-center justify-center rounded-full border border-dashed border-border text-xs text-muted-foreground", className)} style={{ width: size, height: size }}>
        —
      </span>
    );
  }
  return (
    <span
      className={cn("relative inline-flex shrink-0 items-center justify-center rounded-full", className)}
      style={{ width: size, height: size, background: "linear-gradient(135deg, var(--color-brand-500), var(--color-violet-600))" }}
      title={`Company Intelligence Score: ${cis}/100`}
    >
      <span className="flex flex-col items-center justify-center rounded-full bg-card" style={{ width: size - 6, height: size - 6 }}>
        <span className="tabular font-semibold leading-none" style={{ fontSize: size * 0.34 }}>{cis}</span>
        <span className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">CIS</span>
      </span>
    </span>
  );
}
