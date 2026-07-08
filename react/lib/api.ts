import { cookies } from "next/headers";

// Server-side data access for the node/ REST API (docs/16-public-api-spec.md).
// Used from Server Components / route handlers during SSR/ISR so public pages stay crawlable.
// API_URL (server-only, runtime) wins over NEXT_PUBLIC_API_URL; falls back to localhost:4000.
const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

// Forward the visitor's session token (set by our /api/auth/* route handlers on this origin)
// to the backend as a Bearer token so authenticated endpoints work through SSR.
async function authHeader(): Promise<Record<string, string>> {
  try {
    const store = await cookies();
    const token = store.get("tf_token")?.value;
    return token ? { authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "content-type": "application/json", ...(await authHeader()), ...(init?.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`API ${res.status} for ${path}`);
  return res.json() as Promise<T>;
}
