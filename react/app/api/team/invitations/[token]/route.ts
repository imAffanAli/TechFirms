import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";

// GET /api/team/invitations/[token] → invitation details (public)
export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const res = await backendFetch(`/api/v1/team/invitations/${encodeURIComponent(token)}`, { method: "GET" });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
