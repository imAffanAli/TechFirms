import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";

// GET /api/admin/sponsorship-orders → sponsorship orders (admin)
export async function GET(req: Request) {
  const status = new URL(req.url).searchParams.get("status");
  const qs = status ? `?status=${encodeURIComponent(status)}` : "";
  const res = await backendFetch(`/api/v1/admin/sponsorship-orders${qs}`, { method: "GET" });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
