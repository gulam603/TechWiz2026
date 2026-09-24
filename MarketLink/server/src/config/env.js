import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

// Always load server/.env, no matter from which folder the server is started.
dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '.env'), quiet: true });

// Pickup slots, cut-off times and "today" are calculated in the markets' local time zone.
// Hosting servers usually run in UTC, so the zone is set explicitly (TZ in .env).
process.env.TZ = process.env.TZ || 'Asia/Karachi';

// E-mail (Nodemailer). SMTP_SERVICE=gmail is a shortcut for smtp.gmail.com; port 465 uses SSL,
// 587 uses STARTTLS (SMTP_SECURE can override). Gmail needs an App Password, not the normal password.
// Gmail shows app passwords in groups of four ("abcd efgh ijkl mnop"); the spaces are not part of it
const appPassword = (pass) => (/^[a-z]{4}( [a-z]{4}){3}$/i.test(pass.trim()) ? pass.replace(/\s+/g, '') : pass);

function smtpConfig() {
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = (process.env.SMTP_USER || '').trim();
  const secure = process.env.SMTP_SECURE ? ['true', '1', 'yes'].includes(process.env.SMTP_SECURE.toLowerCase()) : port === 465;
  return {
    host: (process.env.SMTP_HOST || '').trim(),
    service: (process.env.SMTP_SERVICE || '').trim(),
    port,
    secure,
    user,
    pass: appPassword(process.env.SMTP_PASS || ''),
    from: process.env.MAIL_FROM || (user.includes('@') ? `MarketLink <${user}>` : 'MarketLink <no-reply@marketlink.local>'),
  };
}

// Central place for configuration so the rest of the code never reads process.env directly.
const env = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/marketlink',
  jwtSecret: process.env.JWT_SECRET || 'dev-only-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  currency: process.env.CURRENCY || 'Rs',
  // Address of the website, used for the buttons in e-mails (e.g. https://marketlink.onrender.com)
  appUrl: (process.env.APP_URL || `http://localhost:${Number(process.env.PORT) || 5000}`).replace(/\/+$/, ''),
  smtp: smtpConfig(),
  // Optional: "Write with AI" product descriptions by Claude (a built-in writer is used without a key)
  anthropic: {
    apiKey: (process.env.ANTHROPIC_API_KEY || '').trim(),
    model: (process.env.ANTHROPIC_MODEL || 'claude-opus-5-5').trim(),
  },
};

env.isProd = env.nodeEnv === 'production';

if (env.isProd && env.jwtSecret === 'dev-only-secret-change-me') {
  console.warn('[config] JWT_SECRET is not set. Set a strong secret in production!');
}

export default env;
