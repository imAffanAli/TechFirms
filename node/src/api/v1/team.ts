import { Router } from 'express';
import { getInvitation, acceptInvitation } from '../../services/teamService.js';

export const teamRouter = Router();

// GET /api/v1/team/invitations/:token  (public — powers the accept page)
teamRouter.get('/invitations/:token', async (req, res, next) => {
  try {
    const inv = await getInvitation(req.params.token);
    if (!inv) {
      res.status(404).json({ error: { code: 'not_found', message: 'Invalid invitation link' } });
      return;
    }
    res.json(inv);
  } catch (e) {
    next(e);
  }
});

// POST /api/v1/team/invitations/:token/accept  (requires a signed-in user)
teamRouter.post('/invitations/:token/accept', async (req, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: { code: 'unauthorized', message: 'Sign in to accept this invitation' } });
      return;
    }
    res.json(await acceptInvitation(req.user.sub, req.params.token));
  } catch (e) {
    next(e);
  }
});
