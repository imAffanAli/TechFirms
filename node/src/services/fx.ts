// Approximate static USD→currency rates for DISPLAY of locally-quoted rates.
// Indicative (mid-2026); refresh from a real FX source in production.
export const FX: Record<string, number> = {
  USD: 1,
  SAR: 3.75,
  AED: 3.67,
  PKR: 278,
  QAR: 3.64,
  EGP: 49,
  INR: 83,
  TRY: 33,
  JOD: 0.71,
  BHD: 0.38,
  KWD: 0.31,
  OMR: 0.385,
  EUR: 0.92,
  GBP: 0.78,
};

/** Convert a USD amount to `currency`, rounded to a tidy figure for display. */
export function toCurrency(usd: number, currency: string): number {
  const v = usd * (FX[currency] ?? 1);
  if (v >= 100_000) return Math.round(v / 1000) * 1000;
  if (v >= 1_000) return Math.round(v / 100) * 100;
  return Math.round(v);
}
