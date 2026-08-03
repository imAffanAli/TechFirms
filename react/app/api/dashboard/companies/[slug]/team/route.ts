import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";

// GET /api/dashboard/companies/[slug]/team → team members + pending invites
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const res = await backendFetch(`/api/v1/dashboard/companies/${encodeURIComponent(slug)}/team`, { method: "GET" });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
