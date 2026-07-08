import { Router } from 'express';
import { getLeaderboard } from '../../services/leaderboardService.js';

export const leaderboardRouter = Router();

// GET /api/v1/leaderboard/:country
leaderboardRouter.get('/:country', async (req, res, next) => {
  try {
    const data = await getLeaderboard(req.params.country);
    if (!data) {
      res.status(404).json({ error: { code: 'not_found', message: 'Country not found' } });
      return;
    }
    res.json(data);
  } catch (e) {
    next(e);
  }
});

// GET /api/v1/leaderboard/:country/:service
leaderboardRouter.get('/:country/:service', async (req, res, next) => {
  try {
    const data = await getLeaderboard(req.params.country, req.params.service);
    if (!data) {
      res.status(404).json({ error: { code: 'not_found', message: 'Country or service not found' } });
      return;
    }
    res.json(data);
  } catch (e) {
    next(e);
  }
});
