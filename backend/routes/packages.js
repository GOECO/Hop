import { Router } from 'express';
import { db, getNextId, addEvent } from '../data/store.js';

const router = Router();

const ensureShelf = (shelfCode) => {
  if (!db.shelves.has(shelfCode)) {
    db.shelves.set(shelfCode, { code: shelfCode, packages: [] });
  }
  return db.shelves.get(shelfCode);
};

router.get('/shelves', (_req, res) => {
  res.json({ shelves: Array.from(db.shelves.values()) });
});

router.post('/shelves', (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Shelf code is required' });
  }
  const shelf = ensureShelf(code);
  res.status(201).json({ shelf });
});

router.post('/', (req, res) => {
  const { token, residentId, carrier, notes, shelfCode } = req.body;
  if (!token || !residentId || !shelfCode) {
    return res.status(400).json({ error: 'Token, residentId and shelfCode are required' });
  }
  const phone = token.replace('token-', '');
  if (!db.users.has(phone)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const id = getNextId(db.packages);
  const shelf = ensureShelf(shelfCode);
  const packageRecord = {
    id,
    residentId,
    carrier: carrier || 'Tự nhập',
    notes: notes || '',
    shelfCode,
    status: 'stored',
    qrCode: `GOECO-PKG-${id}`,
    createdAt: new Date().toISOString()
  };
  shelf.packages.push(packageRecord.id);
  db.packages.set(id, packageRecord);
  const event = addEvent('package.stored', `Package ${id} stored at ${shelfCode}`, packageRecord);
  res.status(201).json({ package: packageRecord, event });
});

router.patch('/:id/pickup', (req, res) => {
  const { id } = req.params;
  const { token } = req.body;
  const phone = token?.replace('token-', '');
  if (!phone || !db.users.has(phone)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const record = db.packages.get(id);
  if (!record) {
    return res.status(404).json({ error: 'Package not found' });
  }
  record.status = 'picked_up';
  record.pickedUpAt = new Date().toISOString();
  const shelf = db.shelves.get(record.shelfCode);
  if (shelf) {
    shelf.packages = shelf.packages.filter((pkgId) => pkgId !== record.id);
  }
  const event = addEvent('package.picked', `Package ${id} picked up`, record);
  res.json({ package: record, event });
});

router.get('/', (_req, res) => {
  res.json({ packages: Array.from(db.packages.values()) });
});

export default router;
