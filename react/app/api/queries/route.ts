import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";

// POST /api/queries → backend lead-gen submission (public)
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const res = await backendFetch("/api/v1/queries", { method: "POST", body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
