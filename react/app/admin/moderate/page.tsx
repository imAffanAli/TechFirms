"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface Assessment {
  sentiment: { score: number; label: "positive" | "neutral" | "negative" };
  spamRisk: { score: number; reasons: string[] };
  aiPowered: boolean;
}

const SAMPLES = [
  "They rebuilt our platform and delivered two weeks early. Communication was excellent and the engineers were genuinely senior.",
  "Amazing!! Best company ever guaranteed cheap prices click here www.promo.example contact whatsapp",
  "ok",
];

export default function ModeratePage() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    setResult(null);
    const res = await fetch("/api/admin/moderate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text }) });
    setLoading(false);
    if (res.ok) setResult(await res.json());
  }

  const sentimentVariant = result?.sentiment.label === "positive" ? "verified" : result?.sentiment.label === "negative" ? "sponsored" : "neutral";
  const spamHigh = (result?.spamRisk.score ?? 0) >= 50;

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Review moderation</h1>
      <p className="mt-1 text-muted-foreground">
        AI-assisted sentiment + fake/spam detection for customer reviews (docs/11). Uses Claude when <code className="tabular">ANTHROPIC_API_KEY</code> is set, otherwise a deterministic heuristic.
      </p>

      <div className="mt-6 flex flex-wrap gap-2 text-xs">
        <span className="text-muted-foreground">Try a sample:</span>
        {SAMPLES.map((s, i) => (
          <button key={i} onClick={() => setText(s)} className="rounded-full border border-border px-2.5 py-0.5 hover:border-primary hover:text-primary">
            {["Genuine", "Spammy", "Too short"][i]}
          </button>
        ))}
      </div>

      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} placeholder="Paste a customer review to assess…" className="mt-3 w-full rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
      <button onClick={run} disabled={loading || !text.trim()} className="mt-2 inline-flex h-10 items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-brand-800 disabled:opacity-50">
        {loading ? "Analyzing…" : "Analyze"}
      </button>

      {result && (
        <div className="mt-6 space-y-4 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Engine:</span>
            <Badge variant={result.aiPowered ? "ai" : "neutral"}>{result.aiPowered ? "Claude (Haiku)" : "Heuristic fallback"}</Badge>
          </div>
          <div>
            <div className="text-sm font-medium">Sentiment</div>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant={sentimentVariant}>{result.sentiment.label}</Badge>
              <span className="tabular text-sm text-muted-foreground">score {result.sentiment.score}</span>
            </div>
          </div>
          <div>
            <div className="text-sm font-medium">Fake / spam risk</div>
            <div className="mt-1 flex items-center gap-2">
              <span className={`tabular text-lg font-bold ${spamHigh ? "text-danger" : "text-success"}`}>{result.spamRisk.score}/100</span>
              {spamHigh && <Badge variant="sponsored">flag for review</Badge>}
            </div>
            {result.spamRisk.reasons.length > 0 && (
              <ul className="mt-1 list-inside list-disc text-sm text-muted-foreground">
                {result.spamRisk.reasons.map((r) => <li key={r}>{r}</li>)}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
