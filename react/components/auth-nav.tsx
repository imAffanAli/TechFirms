"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { SessionUser } from "@/lib/types";

export function AuthNav() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((d) => {
        if (active) {
          setUser(d.user ?? null);
          setReady(true);
        }
      })
      .catch(() => active && setReady(true));
    return () => {
      active = false;
    };
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  if (!ready) return <span className="inline-block w-14" />;
  if (!user) {
    return (
      <Link href="/login" className="text-sm font-medium text-primary hover:underline">
        Sign in
      </Link>
    );
  }
  const isAdmin = user.role === "admin" || user.role === "super_admin";
  return (
    <div className="flex items-center gap-3 text-sm">
      {isAdmin && (
        <Link href="/admin" className="font-medium text-primary hover:underline">
          Admin
        </Link>
      )}
      <span className="hidden max-w-32 truncate text-muted-foreground md:inline">{user.email}</span>
      <button onClick={logout} className="text-muted-foreground hover:text-foreground">
        Sign out
      </button>
    </div>
  );
}
