const express = require('express');
const cors = require('cors');
require('dotenv').config();

const dataRoutes = require('./routes/data');
const paymentsRoutes = require('./routes/payments');

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/data', dataRoutes);
app.use('/api/payments', paymentsRoutes);

const port = Number(process.env.PORT || 5000);
app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});

