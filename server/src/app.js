import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import env from './config/env.js';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middleware/error.js';
import { CLIENT_DIST, UPLOAD_ROOT } from './utils/paths.js';

/** Removes keys that start with "$" or contain "." (blocks NoSQL operator injection). */
function sanitize(value) {
  if (Array.isArray(value)) return value.map(sanitize);
  if (value && typeof value === 'object') {
    for (const key of Object.keys(value)) {
      if (key.startsWith('$') || key.includes('.')) delete value[key];
      else value[key] = sanitize(value[key]);
    }
  }
  return value;
}

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          // OpenStreetMap tiles + uploaded images
          imgSrc: ["'self'", 'data:', 'blob:', 'https://*.tile.openstreetmap.org', 'https://tile.openstreetmap.org', 'https://*.basemaps.cartocdn.com'],
          // OSRM is used to draw driving directions on the map
          connectSrc: ["'self'", 'https://router.project-osrm.org', 'https://nominatim.openstreetmap.org'],
          styleSrc: ["'self'", "'unsafe-inline'"],
          fontSrc: ["'self'", 'data:'],
          scriptSrc: ["'self'"],
          frameSrc: ["'self'", 'https://www.openstreetmap.org', 'https://www.google.com', 'https://maps.google.com'],
          // Don't force https for local / LAN demos over plain http
          upgradeInsecureRequests: null,
        },
      },
    })
  );
  app.use(cors({ origin: env.clientUrl, credentials: true }));
  app.use(compression());
  app.use(express.json({ limit: '200kb' }));
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  if (env.nodeEnv !== 'test') app.use(morgan(env.isProd ? 'combined' : 'dev'));

  app.use((req, res, next) => {
    if (req.body) sanitize(req.body);
    if (req.params) sanitize(req.params);
    next();
  });

  app.use('/uploads', express.static(UPLOAD_ROOT, { maxAge: '7d', fallthrough: false }));
  app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));
  app.use('/api', routes);
  app.use('/api', notFound);

  // In production the Express server also serves the built React app.
  if (fs.existsSync(CLIENT_DIST)) {
    app.use(express.static(CLIENT_DIST, { maxAge: '1h', index: false }));
    app.get(/^\/(?!api|uploads).*/, (req, res) => res.sendFile(path.join(CLIENT_DIST, 'index.html')));
  }

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
