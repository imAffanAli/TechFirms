import { api } from "./api";
import type { SessionUser } from "./types";

/** Current signed-in user (via the backend /auth/me, forwarding the session cookie), or null. */
export async function getSession(): Promise<SessionUser | null> {
  try {
    const r = await api<{ user: SessionUser }>("/api/v1/auth/me");
    return r.user;
  } catch {
    return null;
  }
}

export function isAdmin(user: SessionUser | null): boolean {
  return user?.role === "admin" || user?.role === "super_admin";
}
