"use client";

import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Cell } from "recharts";
import type { LeaderboardEntry } from "@/lib/types";
import { QUADRANT_COLOR, quadrantLabel } from "@/lib/format";

function median(nums: number[]): number {
  if (!nums.length) return 50;
  const s = [...nums].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m]! : (s[m - 1]! + s[m]!) / 2;
}

export function QuadrantChart({ entries }: { entries: LeaderboardEntry[] }) {
  const data = entries.map((e) => ({ x: e.marketPresence, y: e.clientSatisfaction, name: e.name, cis: e.cis, rank: e.rank, quadrant: e.quadrant }));
  const yMid = median(entries.map((e) => e.clientSatisfaction));
  const xMid = 50;

  return (
    <div>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 16, right: 24, bottom: 24, left: 8 }}>
            <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
            <XAxis type="number" dataKey="x" domain={[0, 100]} name="Market Presence" tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} label={{ value: "Market Presence →", position: "insideBottom", offset: -12, fontSize: 12, fill: "var(--color-muted-foreground)" }} />
            <YAxis type="number" dataKey="y" domain={[0, 100]} name="Client Satisfaction" tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} label={{ value: "Client Satisfaction →", angle: -90, position: "insideLeft", fontSize: 12, fill: "var(--color-muted-foreground)" }} />
            <ZAxis range={[120, 120]} />
            <ReferenceLine x={xMid} stroke="var(--color-border)" />
            <ReferenceLine y={yMid} stroke="var(--color-border)" />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0]!.payload as (typeof data)[number];
                return (
                  <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-md">
                    <div className="font-medium">#{p.rank} {p.name}</div>
                    <div className="text-muted-foreground">CIS {p.cis} · {quadrantLabel(p.quadrant)}</div>
                    <div className="text-muted-foreground">Presence {p.x} · Satisfaction {p.y}</div>
                  </div>
                );
              }}
            />
            <Scatter data={data}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.quadrant ? QUADRANT_COLOR[d.quadrant] : "var(--color-muted-foreground)"} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {(["Leaders", "Challengers", "Rising_Stars", "Niche_Players"] as const).map((q) => (
          <span key={q} className="inline-flex items-center gap-1.5">
            <span className="inline-block size-2.5 rounded-full" style={{ background: QUADRANT_COLOR[q] }} /> {quadrantLabel(q)}
          </span>
        ))}
      </div>
    </div>
  );
}
