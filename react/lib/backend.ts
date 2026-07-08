import { cookies } from "next/headers";

// Server-side fetch to the node/ API that forwards the visitor's session token.
// Use from route handlers that proxy authenticated backend calls.
const API = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function backendFetch(path: string, init?: RequestInit) {
  const token = (await cookies()).get("tf_token")?.value;
  return fetch(`${API}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });
}
