import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";

// POST /api/claims → request to claim a company (auth via cookie)
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const res = await backendFetch("/api/v1/claims", { method: "POST", body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
