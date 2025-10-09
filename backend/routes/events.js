import { Router } from 'express';
import { db } from '../data/store.js';

const router = Router();

router.get('/', (_req, res) => {
  res.json({ events: db.events });
});

export default router;
