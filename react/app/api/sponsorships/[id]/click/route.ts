import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";

// POST /api/sponsorships/[id]/click → record a sponsored-placement click (public)
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await backendFetch(`/api/v1/sponsorships/${id}/click`, { method: "POST" });
  return NextResponse.json(await res.json().catch(() => ({})), { status: res.status });
}
