import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

// Always load server/.env, no matter from which folder the server is started.
dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '.env'), quiet: true });

// Central place for configuration so the rest of the code never reads process.env directly.
const env = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/marketlink',
  jwtSecret: process.env.JWT_SECRET || 'dev-only-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  currency: process.env.CURRENCY || 'Rs',
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.MAIL_FROM || 'MarketLink <no-reply@marketlink.local>',
  },
};

env.isProd = env.nodeEnv === 'production';

if (env.isProd && env.jwtSecret === 'dev-only-secret-change-me') {
  console.warn('[config] JWT_SECRET is not set. Set a strong secret in production!');
}

export default env;
