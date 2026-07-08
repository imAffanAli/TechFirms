import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";

// PATCH /api/admin/sponsorships/[id] → toggle active (auth via cookie)
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const res = await backendFetch(`/api/v1/admin/sponsorships/${id}`, { method: "PATCH", body: JSON.stringify(body) });
  return NextResponse.json(await res.json().catch(() => ({})), { status: res.status });
}
