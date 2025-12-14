import express from 'express';

const router = express.Router();

const farms = new Map();
const sensorReadings = [];
const robotCommands = [];

router.post('/farms', (req, res) => {
  const id = `farm-${Date.now()}`;
  const farm = {
    id,
    name: req.body.name,
    location: req.body.location,
    owner: req.body.owner,
    created_at: new Date().toISOString()
  };
  farms.set(id, farm);
  res.json(farm);
});

router.post('/farms/:id/sensors', (req, res) => {
  const { metric, value, unit, plot_id } = req.body;
  if (!metric || value === undefined) {
    return res.status(400).json({ error: 'metric and value are required' });
  }
  sensorReadings.push({
    time: new Date().toISOString(),
    farm_id: req.params.id,
    plot_id: plot_id || null,
    metric,
    value,
    unit: unit || 'N/A'
  });
  res.json({ status: 'stored' });
});

router.get('/farms/:id/sensors', (req, res) => {
  const filtered = sensorReadings.filter((r) => r.farm_id === req.params.id);
  const latest = filtered.slice(-10).reverse();
  res.json({ count: filtered.length, latest });
});

router.post('/ai/decision', (req, res) => {
  const { disease, env_summary } = req.body;
  if (disease?.severity >= 3) {
    return res.json({
      action: 'SPRAY',
      method: 'BIO',
      chemical: 'Bio_Fungicide_A',
      dosage: '15ml/m2',
      time: '05:30'
    });
  }
  if ((env_summary?.soil_moist ?? 0) < 20) {
    return res.json({
      action: 'IRRIGATE',
      method: 'DRIP',
      volume: '8L/m2',
      time: '06:00'
    });
  }
  return res.json({ action: 'MONITOR', notes: 'Ổn định, kiểm tra lại sau 12h' });
});

router.post('/robots/commands', (req, res) => {
  const id = `cmd-${Date.now()}`;
  const command = {
    id,
    status: 'QUEUED',
    issued_at: new Date().toISOString(),
    payload: req.body
  };
  robotCommands.push(command);
  res.json(command);
});

router.get('/robots/commands/:id', (req, res) => {
  const cmd = robotCommands.find((c) => c.id === req.params.id);
  if (!cmd) {
    return res.status(404).json({ error: 'Command not found' });
  }
  res.json(cmd);
});

export default router;
