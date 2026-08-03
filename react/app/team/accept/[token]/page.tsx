import Link from "next/link";
import { api } from "@/lib/api";
import { getSession } from "@/lib/session";
import { AcceptInviteButton } from "@/components/accept-invite-button";

export const dynamic = "force-dynamic";

interface Invitation {
  company: { slug: string; name: string };
  role: string;
  email: string;
  expired: boolean;
}

export default async function AcceptInvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const [user, inv] = await Promise.all([
    getSession(),
    api<Invitation>(`/api/v1/team/invitations/${token}`).catch(() => null),
  ]);

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-6 py-16">
      {!inv ? (
        <p className="rounded-lg border border-border bg-card p-6 text-center text-muted-foreground">This invitation link is invalid.</p>
      ) : inv.expired ? (
        <p className="rounded-lg border border-border bg-card p-6 text-center text-muted-foreground">This invitation has expired — ask the owner to send a new one.</p>
      ) : (
        <div className="rounded-xl border border-border bg-card p-6 text-center">
          <h1 className="text-xl font-bold tracking-tight">Join {inv.company.name}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You&apos;ve been invited as a <span className="font-medium capitalize">{inv.role}</span> to help manage {inv.company.name} on TechFirms.
          </p>
          {user ? (
            <div className="mt-5 flex flex-col items-center">
              <AcceptInviteButton token={token} />
            </div>
          ) : (
            <div className="mt-5">
              <p className="text-sm text-muted-foreground">Sign in or create an account to accept.</p>
              <div className="mt-3 flex justify-center gap-3">
                <Link href={`/login?next=/team/accept/${token}`} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-brand-800">Sign in</Link>
                <Link href={`/register?next=/team/accept/${token}`} className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted">Register</Link>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
