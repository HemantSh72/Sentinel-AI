'use strict';

const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const morgan       = require('morgan');

const { FRONTEND_URL, NODE_ENV } = require('./config/config');
const queryRoutes                = require('./routes/queryRoutes');
const documentRoutes             = require('./routes/documentRoutes');
const rateLimiter                = require('./middleware/rateLimiter');
const errorHandler               = require('./middleware/errorHandler');
const logger                     = require('./utils/logger');

const app = express();

// Render runs Express behind a reverse proxy and supplies X-Forwarded-For.
// Trust the single platform proxy so express-rate-limit can identify client IPs.
app.set('trust proxy', 1);

// ── Security Headers ────────────────────────────────────────────────────────
app.use(helmet());

// Keep this list explicit: do not allow arbitrary *.vercel.app origins.
const allowedOrigins = new Set([
  FRONTEND_URL,
  'https://sentinel-ai-lake.vercel.app',
  'https://sentinel-ai-hemant-sharmas-projects-9f12f9ac.vercel.app',
  'https://sentinel-ai-git-main-hemant-sharmas-projects-9f12f9ac.vercel.app',
  'https://sentinel-ai-fawn-nine.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean).map((value) => {
  try {
    return new URL(value).origin;
  } catch {
    return value.replace(/\/$/, '');
  }
}));

const corsOptions = {
  origin(origin, callback) {
    // Requests without an Origin header (health checks, curl, server-to-server).
    if (!origin) return callback(null, true);

    if (allowedOrigins.has(origin)) return callback(null, true);

    logger.warn('[CORS] Blocked request from origin', { origin });
    return callback(new Error('Origin is not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: false }));

const httpLogFormat = NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(httpLogFormat, {
  stream: { write: (msg) => logger.http(msg.trim()) },
}));

app.use(rateLimiter);

app.use('/api/v1', queryRoutes);
app.use('/api/v1/documents', documentRoutes);

app.get('/', (req, res) => {
  res.json({
    service: 'Sentinel.AI Backend',
    version: '1.0.0',
    status: 'running',
    docsHint: 'POST /api/v1/query  |  POST /api/v1/query/stream  |  GET /api/v1/health',
  });
});

app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    code: 'NOT_FOUND',
    message: `Route ${req.method} ${req.path} does not exist.`,
  });
});

app.use(errorHandler);

module.exports = app;
