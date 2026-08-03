import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";

// POST /api/dashboard/companies/[slug]/team/invite → invite a team member (owner only)
export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const body = await req.json().catch(() => ({}));
  const res = await backendFetch(`/api/v1/dashboard/companies/${encodeURIComponent(slug)}/team/invite`, { method: "POST", body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
