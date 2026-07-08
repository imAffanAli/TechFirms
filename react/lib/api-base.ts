// Resolves the backend base URL. Accepts a full URL or a bare host (Render's
// `fromService host` gives a hostname with no protocol) and normalizes to https.
export function apiBase(): string {
  const raw = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  return /^https?:\/\//.test(raw) ? raw : `https://${raw}`;
}
