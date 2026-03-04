const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const tokenRoutes   = require('./routes/token');
const walletRoutes  = require('./routes/wallet');
const alertRoutes   = require('./routes/alert');
const notifyRoutes  = require('./routes/notify');
const analyzeRoutes = require('./routes/analyze');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3902;

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use(morgan('[:date[iso]] :method :url :status :res[content-length] - :response-time ms'));

// Global rate limiter: 100 req/min per IP
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests, please try again in a minute.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});
app.use('/api', limiter);

// ─── Health Check ─────────────────────────────────────────────────────────────

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    service: 'meme-terminal-backend',
    version: '1.0.0',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use('/api/token',   tokenRoutes);
app.use('/api/wallet',  walletRoutes);
app.use('/api/alerts',  alertRoutes);
app.use('/api/notify',  notifyRoutes);
app.use('/api/analyze', analyzeRoutes);

// ─── Error Handling ───────────────────────────────────────────────────────────

app.use(notFoundHandler);
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`🐧 Meme Terminal backend running on port ${PORT}`);
  console.log(`   Health:   http://localhost:${PORT}/api/health`);
  console.log(`   Analyze:  POST http://localhost:${PORT}/api/analyze/token|wallet|market`);
  console.log(`   Notify:   http://localhost:${PORT}/api/notify/status`);
  console.log(`   Env:      ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
