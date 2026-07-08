import { cookies } from "next/headers";
import { apiBase } from "./api-base";

// Server-side fetch to the node/ API that forwards the visitor's session token.
// Use from route handlers that proxy authenticated backend calls.
export async function backendFetch(path: string, init?: RequestInit) {
  const token = (await cookies()).get("tf_token")?.value;
  return fetch(`${apiBase()}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });
}
