import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";

// GET /api/dashboard/companies/[slug]/sponsorship/orders → this company's sponsorship orders
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const res = await backendFetch(`/api/v1/dashboard/companies/${encodeURIComponent(slug)}/sponsorship/orders`, { method: "GET" });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
