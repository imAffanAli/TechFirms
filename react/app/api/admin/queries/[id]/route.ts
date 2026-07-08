import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";

// PATCH /api/admin/queries/[id] → forward status/notes update to the backend (auth via cookie)
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const res = await backendFetch(`/api/v1/admin/queries/${id}`, { method: "PATCH", body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
