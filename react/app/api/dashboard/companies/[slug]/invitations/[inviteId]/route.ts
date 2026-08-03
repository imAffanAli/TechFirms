import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";

// DELETE /api/dashboard/companies/[slug]/invitations/[inviteId] → revoke a pending team invite
export async function DELETE(_req: Request, { params }: { params: Promise<{ slug: string; inviteId: string }> }) {
  const { slug, inviteId } = await params;
  const res = await backendFetch(`/api/v1/dashboard/companies/${encodeURIComponent(slug)}/invitations/${inviteId}`, { method: "DELETE" });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
