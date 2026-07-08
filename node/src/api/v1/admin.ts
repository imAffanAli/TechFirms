import { Router } from 'express';
import { requireRole } from '../../middleware/auth.js';
import { getAdminStats } from '../../services/adminService.js';

export const adminRouter = Router();

// All /api/v1/admin/* routes require an admin or super_admin. req.user is set by the
// global authenticate middleware.
adminRouter.use(requireRole('admin', 'super_admin'));

// GET /api/v1/admin/stats
adminRouter.get('/stats', async (_req, res, next) => {
  try {
    res.json(await getAdminStats());
  } catch (e) {
    next(e);
  }
});
