import { NextResponse } from "next/server";
import { apiBase } from "@/lib/api-base";

const MAX_AGE = 7 * 24 * 60 * 60;

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const res = await fetch(`${apiBase()}/api/v1/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return NextResponse.json(data, { status: res.status });

  const out = NextResponse.json({ user: data.user });
  out.cookies.set("tf_token", data.token, { httpOnly: true, sameSite: "lax", path: "/", maxAge: MAX_AGE });
  return out;
}
