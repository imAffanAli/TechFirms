import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";

// PATCH /api/admin/sponsorship-orders/[id] → approve/reject an order (admin)
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const res = await backendFetch(`/api/v1/admin/sponsorship-orders/${id}`, { method: "PATCH", body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
