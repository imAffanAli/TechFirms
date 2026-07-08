import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";

// PATCH /api/dashboard/companies/[slug] → edit an owned company (auth via cookie)
export async function PATCH(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const body = await req.json().catch(() => ({}));
  const res = await backendFetch(`/api/v1/dashboard/companies/${slug}`, { method: "PATCH", body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
