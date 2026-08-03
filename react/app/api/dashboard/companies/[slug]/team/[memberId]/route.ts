import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";

// PATCH → change a member's role; DELETE → remove a member (owner only)
export async function PATCH(req: Request, { params }: { params: Promise<{ slug: string; memberId: string }> }) {
  const { slug, memberId } = await params;
  const body = await req.json().catch(() => ({}));
  const res = await backendFetch(`/api/v1/dashboard/companies/${encodeURIComponent(slug)}/team/${memberId}`, { method: "PATCH", body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ slug: string; memberId: string }> }) {
  const { slug, memberId } = await params;
  const res = await backendFetch(`/api/v1/dashboard/companies/${encodeURIComponent(slug)}/team/${memberId}`, { method: "DELETE" });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
