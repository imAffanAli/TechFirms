import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";

// POST /api/companies/[slug]/reviews → backend first-party client review (public)
export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const body = await req.json().catch(() => ({}));
  const res = await backendFetch(`/api/v1/companies/${encodeURIComponent(slug)}/reviews`, { method: "POST", body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
