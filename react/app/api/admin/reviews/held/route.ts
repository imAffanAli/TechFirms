import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";

// GET /api/admin/reviews/held → reviews held by auto-moderation (admin)
export async function GET() {
  const res = await backendFetch("/api/v1/admin/reviews/held", { method: "GET" });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
