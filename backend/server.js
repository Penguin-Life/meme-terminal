/**
 * Meme Terminal — Backend API Server
 * Aggregates DexScreener, Pump.fun, GeckoTerminal data for the trading terminal.
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const compression = require('compression');

const tokenRoutes   = require('./routes/token');
const walletRoutes  = require('./routes/wallet');
const alertRoutes   = require('./routes/alert');
const notifyRoutes  = require('./routes/notify');
const analyzeRoutes = require('./routes/analyze');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const {
  searchLimiter,
  analysisLimiter,
  alertsLimiter,
  notifyLimiter,
  globalLimiter
} = require('./middleware/rateLimiter');
const cache = require('./services/cache');
const logger = require('./utils/logger');
// Ensure data directory exists on startup (R24)
const { ensureDataDir } = require('./utils/dataStore');

const app = express();
const PORT = process.env.PORT || 3902;
const NODE_ENV = process.env.NODE_ENV || 'development';
const DEMO_MODE = process.env.DEMO_MODE === 'true';

// ─── Startup: Ensure data directory exists ────────────────────────────────────
ensureDataDir();

// ─── Unhandled Error Safety Net ───────────────────────────────────────────────
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`, { stack: err.stack });
  // Don't exit — keep server running
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled Rejection at: ${promise}`, {
    reason: reason instanceof Error ? reason.message : String(reason)
  });
  // Don't exit — keep server running
});

// ─── Security Headers ─────────────────────────────────────────────────────────

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'none'; script-src 'none'; connect-src 'self'"
  );
  res.setHeader('Referrer-Policy', 'no-referrer');
  next();
});

// ─── CORS ─────────────────────────────────────────────────────────────────────

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (server-to-server, curl, etc.)
    if (!origin || NODE_ENV === 'development') return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin "${origin}" not allowed`));
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Compression (gzip) for all responses
app.use(compression());

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Request logger (to console + file)
app.use(morgan('[:date[iso]] :method :url :status :res[content-length] - :response-time ms'));

// ─── Global rate limiter ──────────────────────────────────────────────────────
app.use('/api', globalLimiter);

// ─── Health Check ─────────────────────────────────────────────────────────────

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      service: 'meme-terminal-backend',
      version: '1.0.0',
      status: 'healthy',
      uptime: Math.round(process.uptime()),
      environment: NODE_ENV,
      demoMode: DEMO_MODE
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  });
});

// ─── Dashboard Status ─────────────────────────────────────────────────────────

app.get('/api/status', (req, res) => {
  const { readJson } = require('./utils/dataStore');
  const path = require('path');

  let alertsCount = 0;
  let watchlistCount = 0;
  try {
    const alerts = readJson(path.join(__dirname, 'data/alerts.json'), []);
    const activeAlerts = Array.isArray(alerts) ? alerts.filter(a => a.enabled) : [];
    alertsCount = activeAlerts.length;
  } catch (e) { /* ignore */ }

  try {
    const watchlist = readJson(path.join(__dirname, 'data/watchlist.json'), []);
    watchlistCount = Array.isArray(watchlist) ? watchlist.length : 0;
  } catch (e) { /* ignore */ }

  const cacheStats = cache.stats();

  res.json({
    success: true,
    data: {
      service: 'meme-terminal-backend',
      version: '1.0.0',
      status: 'healthy',
      uptime: Math.round(process.uptime()),
      uptimeHuman: formatUptime(process.uptime()),
      environment: NODE_ENV,
      demoMode: DEMO_MODE,
      activeAlerts: alertsCount,
      watchlistCount,
      cache: {
        size: cacheStats.size,
        hitRate: cacheStats.hitRate,
        hits: cacheStats.hits,
        misses: cacheStats.misses
      },
      dataSources: ['dexscreener', 'geckoterminal', 'pumpfun', 'solana-rpc']
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  });
});

/**
 * Format process uptime (seconds) into a human-readable string.
 * @param {number} seconds - Uptime in seconds
 * @returns {string} e.g. "2d 3h 15m" or "45m 22s"
 */
function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

// ─── Cache Stats ──────────────────────────────────────────────────────────────

app.get('/api/cache/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      cache: cache.stats()
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  });
});

// ─── Routes (with tiered rate limiting) ──────────────────────────────────────

app.use('/api/token',   searchLimiter,   tokenRoutes);
app.use('/api/wallet',  searchLimiter,   walletRoutes);
app.use('/api/alerts',  alertsLimiter,   alertRoutes);
app.use('/api/notify',  notifyLimiter,   notifyRoutes);
app.use('/api/analyze', analysisLimiter, analyzeRoutes);

// ─── Production: Serve Frontend Static Files ──────────────────────────────────

if (process.env.NODE_ENV === 'production') {
  const publicDir = path.join(__dirname, 'public');
  app.use(express.static(publicDir));
  // SPA fallback: serve index.html for all non-API routes
  // Must call next() for /api routes so 404 handler can respond properly
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(publicDir, 'index.html'));
  });
}

// ─── Error Handling ───────────────────────────────────────────────────────────

app.use(notFoundHandler);
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────────────────────

const BANNER = `
╔═══════════════════════════════════════════════╗
║  🐧  Meme Terminal Backend  v1.0.0            ║
║      AI-Powered Memecoin Trading Terminal     ║
╠═══════════════════════════════════════════════╣
║  Data: DexScreener · Pump.fun · GeckoTerminal ║
╚═══════════════════════════════════════════════╝`;

app.listen(PORT, () => {
  console.log(BANNER);
  logger.info(`Server started on port ${PORT}`, { env: NODE_ENV, demoMode: DEMO_MODE });
  console.log(`\n  🌐  http://localhost:${PORT}/api/health`);
  console.log(`  📊  http://localhost:${PORT}/api/status`);
  console.log(`  📈  http://localhost:${PORT}/api/cache/stats`);
  console.log(`  🔥  http://localhost:${PORT}/api/token/trending`);
  console.log(`  📡  Environment: ${NODE_ENV}`);
  if (DEMO_MODE) {
    console.log(`  🎭  DEMO MODE: ON — all endpoints return mock data`);
  }
  console.log('');
});

module.exports = app;
