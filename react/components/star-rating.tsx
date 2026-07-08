import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

function StarRow({ color, width, size }: { color: string; width: number; size: number }) {
  return (
    <span className={cn("flex gap-0.5", color)} style={{ width }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} width={size} height={size} fill="currentColor" strokeWidth={0} className="shrink-0" />
      ))}
    </span>
  );
}

/** Accessible star rating. `value` is 0–5. A clipped overlay renders partial stars. */
export function StarRating({ value, size = 16, showValue = true, className }: { value: number; size?: number; showValue?: boolean; className?: string }) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));
  const width = size * 5 + 8; // 5 stars + 4× 2px gaps
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)} aria-label={`${value.toFixed(1)} out of 5 stars`}>
      <span className="relative inline-block" style={{ width, height: size }}>
        <span className="absolute inset-0">
          <StarRow color="text-border" width={width} size={size} />
        </span>
        <span className="absolute inset-0 overflow-hidden" style={{ width: `${pct}%` }}>
          <StarRow color="text-warning" width={width} size={size} />
        </span>
      </span>
      {showValue && <span className="tabular text-sm font-medium">{value.toFixed(1)}</span>}
    </span>
  );
}
