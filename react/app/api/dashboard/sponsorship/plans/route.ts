import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";

// GET /api/dashboard/sponsorship/plans → sponsorship tier + duration catalog
export async function GET() {
  const res = await backendFetch("/api/v1/dashboard/sponsorship/plans", { method: "GET" });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
