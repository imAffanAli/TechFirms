import { Router } from 'express';
import { z } from 'zod';
import type { QueryStatus } from '@prisma/client';
import { requireRole } from '../../middleware/auth.js';
import { getAdminStats } from '../../services/adminService.js';
import { listQueries, updateQuery } from '../../services/queryService.js';
import { writeAudit } from '../../utils/audit.js';

export const adminRouter = Router();

// All /api/v1/admin/* routes require an admin or super_admin.
adminRouter.use(requireRole('admin', 'super_admin'));

// GET /api/v1/admin/stats
adminRouter.get('/stats', async (_req, res, next) => {
  try {
    res.json(await getAdminStats());
  } catch (e) {
    next(e);
  }
});

const STATUSES = ['New', 'Forwarded', 'Contacted', 'Closed'] as const;

// GET /api/v1/admin/queries?status=New
adminRouter.get('/queries', async (req, res, next) => {
  try {
    const raw = String(req.query.status ?? '');
    const status = (STATUSES as readonly string[]).includes(raw) ? (raw as QueryStatus) : undefined;
    res.json({ items: await listQueries(status) });
  } catch (e) {
    next(e);
  }
});

const patchBody = z.object({ status: z.enum(STATUSES).optional(), adminNotes: z.string().optional() });

// PATCH /api/v1/admin/queries/:id
adminRouter.patch('/queries/:id', async (req, res, next) => {
  try {
    const patch = patchBody.parse(req.body);
    const updated = await updateQuery(req.params.id, patch);
    await writeAudit({ actorId: req.user?.sub ?? null, action: 'query.update', entityType: 'Query', entityId: req.params.id, metadata: patch, ipAddress: req.ip ?? null });
    res.json(updated);
  } catch (e) {
    next(e);
  }
});
