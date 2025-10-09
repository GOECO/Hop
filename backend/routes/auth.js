import { Router } from 'express';
import { db } from '../data/store.js';
import { addEvent } from '../data/store.js';

const router = Router();

router.post('/request-otp', (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required' });
  }
  const code = String(Math.floor(100000 + Math.random() * 900000));
  db.otps.set(phone, { code, expiresAt: Date.now() + 5 * 60 * 1000 });
  addEvent('otp.request', `OTP requested for ${phone}`);
  res.json({ message: 'OTP generated', code });
});

router.post('/verify-otp', (req, res) => {
  const { phone, code, name } = req.body;
  if (!phone || !code) {
    return res.status(400).json({ error: 'Phone and code are required' });
  }
  const record = db.otps.get(phone);
  if (!record || record.code !== code || record.expiresAt < Date.now()) {
    return res.status(401).json({ error: 'Invalid or expired OTP' });
  }
  const user = db.users.get(phone) || {
    id: phone,
    phone,
    name: name || 'Người dùng GOECO'
  };
  db.users.set(phone, user);
  db.wallet.set(phone, db.wallet.get(phone) || { balance: 0, transactions: [] });
  db.otps.delete(phone);
  addEvent('auth.login', `User ${phone} signed in`);
  res.json({ token: `token-${phone}`, user });
});

export default router;
