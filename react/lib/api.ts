// Server-side data access for the node/ REST API (docs/16-public-api-spec.md).
// Used from Server Components during SSR/ISR so public pages stay crawlable.
// API_URL (server-only, runtime) wins over NEXT_PUBLIC_API_URL so the server-to-server
// base can differ from the browser one; falls back to localhost:4000.
const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`API ${res.status} for ${path}`);
  return res.json() as Promise<T>;
}
