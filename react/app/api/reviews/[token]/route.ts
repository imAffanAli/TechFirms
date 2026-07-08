import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";

// POST /api/reviews/[token] → submit an invited review (public)
export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const body = await req.json().catch(() => ({}));
  const res = await backendFetch(`/api/v1/reviews/invitation/${token}`, { method: "POST", body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
