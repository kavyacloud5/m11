const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required');
}

const needsSsl =
  /sslmode=require/i.test(connectionString) ||
  process.env.PGSSLMODE === 'require' ||
  process.env.NODE_ENV === 'production';

const pool = new Pool({
  connectionString,
  ...(needsSsl ? { ssl: { rejectUnauthorized: false } } : {}),
});

module.exports = pool;

