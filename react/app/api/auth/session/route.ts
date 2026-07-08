import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

// Lightweight session probe for client components (e.g. the header). Reads the
// httpOnly cookie server-side and returns the current user or null.
export async function GET() {
  const user = await getSession();
  return NextResponse.json({ user });
}
