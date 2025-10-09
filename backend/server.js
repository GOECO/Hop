import express from 'express';
import morgan from 'morgan';
import cors from 'cors';

import authRouter from './routes/auth.js';
import residentRouter from './routes/residents.js';
import packageRouter from './routes/packages.js';
import shipmentRouter from './routes/shipments.js';
import walletRouter from './routes/wallet.js';
import eventRouter from './routes/events.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth', authRouter);
app.use('/api/residents', residentRouter);
app.use('/api/packages', packageRouter);
app.use('/api/shipments', shipmentRouter);
app.use('/api/wallet', walletRouter);
app.use('/api/events', eventRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`GOECO backend listening on port ${PORT}`);
});
