import { NextResponse } from "next/server";

export async function POST() {
  const out = NextResponse.json({ ok: true });
  out.cookies.set("tf_token", "", { httpOnly: true, path: "/", maxAge: 0 });
  return out;
}
