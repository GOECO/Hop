import { Router } from 'express';
import { db, getNextId, addEvent } from '../data/store.js';

const router = Router();

const estimatePrice = ({ weightKg = 0.5, speed = 'standard', insurance = false }) => {
  let price = 15000 + weightKg * 7000;
  if (speed === 'express') {
    price *= 1.5;
  }
  if (insurance) {
    price += 10000;
  }
  return Math.round(price);
};

router.post('/quote', (req, res) => {
  const { weightKg, speed, insurance } = req.body;
  const amount = estimatePrice({ weightKg, speed, insurance });
  res.json({ amount });
});

router.post('/', (req, res) => {
  const { token, origin, destination, weightKg, speed, insurance, paymentMethod } = req.body;
  const phone = token?.replace('token-', '');
  if (!phone || !db.users.has(phone)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const quote = estimatePrice({ weightKg, speed, insurance });
  const id = getNextId(db.shipments);
  const shipment = {
    id,
    creator: phone,
    origin,
    destination,
    weightKg,
    speed,
    insurance,
    paymentMethod: paymentMethod || 'wallet',
    amount: quote,
    status: 'pending_pickup',
    createdAt: new Date().toISOString()
  };
  if (shipment.paymentMethod === 'wallet') {
    const wallet = db.wallet.get(phone);
    if (wallet.balance < quote) {
      return res.status(400).json({ error: 'Insufficient wallet balance' });
    }
    wallet.balance -= quote;
    wallet.transactions.unshift({
      id: `TX-${Date.now()}`,
      type: 'debit',
      amount: quote,
      description: `Thanh toán đơn gửi ${id}`,
      timestamp: new Date().toISOString()
    });
  }
  db.shipments.set(id, shipment);
  const event = addEvent('shipment.created', `Shipment ${id} created`, shipment);
  res.status(201).json({ shipment, event });
});

router.patch('/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const shipment = db.shipments.get(id);
  if (!shipment) {
    return res.status(404).json({ error: 'Shipment not found' });
  }
  shipment.status = status;
  shipment.updatedAt = new Date().toISOString();
  const event = addEvent('shipment.status', `Shipment ${id} status -> ${status}`, shipment);
  res.json({ shipment, event });
});

router.get('/', (_req, res) => {
  res.json({ shipments: Array.from(db.shipments.values()) });
});

export default router;
