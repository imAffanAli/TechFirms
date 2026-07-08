import { prisma } from '../db/prisma.js';

/** Append an immutable audit-log entry for any admin/moderation action (docs/12). */
export async function writeAudit(input: {
  actorId?: string | null;
  action: string; // e.g. "claim.approve", "company.merge"
  entityType: string;
  entityId: string;
  metadata?: unknown; // before/after diff
  ipAddress?: string | null;
}): Promise<void> {
  await prisma.auditLog.create({
    data: {
      actorId: input.actorId ?? null,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      metadata: (input.metadata ?? undefined) as object | undefined,
      ipAddress: input.ipAddress ?? null,
    },
  });
}
