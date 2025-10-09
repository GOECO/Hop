import { Router } from 'express';
import { db, addEvent } from '../data/store.js';

const router = Router();

router.get('/', (req, res) => {
  const { token } = req.query;
  const phone = token?.replace('token-', '');
  if (!phone || !db.wallet.has(phone)) {
    return res.status(404).json({ error: 'Wallet not found' });
  }
  res.json(db.wallet.get(phone));
});

router.post('/topup', (req, res) => {
  const { token, amount } = req.body;
  const phone = token?.replace('token-', '');
  if (!phone || !db.wallet.has(phone)) {
    return res.status(404).json({ error: 'Wallet not found' });
  }
  const wallet = db.wallet.get(phone);
  wallet.balance += amount;
  const transaction = {
    id: `TX-${Date.now()}`,
    type: 'credit',
    amount,
    description: 'Nạp tiền ví GOECO Pay',
    timestamp: new Date().toISOString()
  };
  wallet.transactions.unshift(transaction);
  const event = addEvent('wallet.topup', `Wallet ${phone} +${amount}`, transaction);
  res.json({ wallet, event });
});

export default router;
