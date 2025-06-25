const { Pool } = require('pg');
const logger = require('../utils/logger');

// PostgreSQL connection configuration
const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'mahkeme_randevu',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  max: process.env.DB_POOL_MAX || 20,
  idleTimeoutMillis: process.env.DB_IDLE_TIMEOUT || 30000,
  connectionTimeoutMillis: process.env.DB_CONNECTION_TIMEOUT || 2000,
  // SSL configuration for production
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false,
    ca: process.env.DB_SSL_CA,
    cert: process.env.DB_SSL_CERT,
    key: process.env.DB_SSL_KEY
  } : false
};

const pool = new Pool(poolConfig);

// Log pool errors
pool.on('error', (err, client) => {
  logger.error('Beklenmeyen veritabanı hatası', { error: err.message });
});

// Test database connection
pool.on('connect', () => {
  logger.info('PostgreSQL veritabanına bağlanıldı');
});

// Database query wrapper with error handling
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug('Sorgu çalıştırıldı', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    logger.error('Veritabanı sorgu hatası', { error: error.message, text });
    throw error;
  }
};

// Transaction helper
const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Transaction hatası', { error: error.message });
    throw error;
  } finally {
    client.release();
  }
};

// Initialize database schema
const initializeDatabase = async () => {
  try {
    // Create extensions
    await query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    await query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
    
    // Create enum types
    await query(`
      DO $$ BEGIN
        CREATE TYPE user_role AS ENUM ('vatandas', 'avukat', 'hakim', 'personel', 'admin');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    
    await query(`
      DO $$ BEGIN
        CREATE TYPE appointment_status AS ENUM ('beklemede', 'onaylandi', 'iptal', 'tamamlandi');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    
    logger.info('Veritabanı başarıyla başlatıldı');
  } catch (error) {
    logger.error('Veritabanı başlatma hatası', { error: error.message });
    throw error;
  }
};

module.exports = {
  pool,
  query,
  transaction,
  initializeDatabase
};