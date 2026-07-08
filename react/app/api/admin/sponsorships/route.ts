import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";

// POST /api/admin/sponsorships → create a placement (auth via cookie)
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const res = await backendFetch("/api/v1/admin/sponsorships", { method: "POST", body: JSON.stringify(body) });
  return NextResponse.json(await res.json().catch(() => ({})), { status: res.status });
}
