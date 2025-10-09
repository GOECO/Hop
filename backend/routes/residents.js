import { Router } from 'express';
import { db, addEvent } from '../data/store.js';

const router = Router();

router.post('/verify', (req, res) => {
  const { token, buildingId, unitNumber } = req.body;
  if (!token || !buildingId || !unitNumber) {
    return res.status(400).json({ error: 'Token, buildingId and unitNumber are required' });
  }
  const phone = token.replace('token-', '');
  const user = db.users.get(phone);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const resident = {
    id: `${buildingId}-${unitNumber}`,
    userId: phone,
    buildingId,
    unitNumber,
    status: 'verified',
    verifiedAt: new Date().toISOString()
  };
  db.residents.set(resident.id, resident);
  addEvent('resident.verified', `Resident ${resident.id} verified`);
  res.json({ resident });
});

router.get('/', (req, res) => {
  res.json({ residents: Array.from(db.residents.values()) });
});

export default router;
