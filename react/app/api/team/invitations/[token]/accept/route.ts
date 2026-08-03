import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";

// POST /api/team/invitations/[token]/accept → accept an invitation (requires sign-in)
export async function POST(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const res = await backendFetch(`/api/v1/team/invitations/${encodeURIComponent(token)}/accept`, { method: "POST", body: JSON.stringify({}) });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
