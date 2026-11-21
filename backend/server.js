/**
 * Northgate Dental — Express Server Entry Point
 * SPManchester Private Limited — https://spmanchester.com/
 * MIT Licence — Copyright (c) 2026 SPManchester Private Limited
 */

'use strict';

require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const helmet   = require('helmet');
const path     = require('path');
const rateLimit = require('express-rate-limit');

const { setupDatabase } = require('./database/db');

// ─── INITIALISE DATABASE ─────────────────────────────────────────────────────
setupDatabase();

// ─── ROUTES ──────────────────────────────────────────────────────────────────
const appointmentsRouter = require('./routes/appointments');
const treatmentsRouter   = require('./routes/treatments');
const cliniciansRouter   = require('./routes/clinicians');
const reviewsRouter      = require('./routes/reviews');
const contactRouter      = require('./routes/contact');
const authRouter         = require('./routes/auth');
const adminRouter        = require('./routes/admin');
const newsletterRouter   = require('./routes/newsletter');
const availabilityRouter = require('./routes/availability');

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── GLOBAL MIDDLEWARE ────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false, // configured per-route for API
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

const envOrigins = (process.env.CORS_ALLOWED_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
    if (!origin) return cb(null, true);

    // Allow all local dev hosts (localhost or 127.0.0.1 on ANY port, e.g. 3000, 5500, 8080)
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return cb(null, true);
    }

    // Allow explicitly listed production origins
    if (envOrigins.includes(origin)) {
      return cb(null, true);
    }

    // In development mode, be permissive with local networks
    if (process.env.NODE_ENV !== 'production') {
      return cb(null, true);
    }

    cb(new Error(`Not allowed by CORS: ${origin}`));
  },
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: true,
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ─── SERVE STATIC FRONTEND ───────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '..', 'src')));

// ─── RATE LIMITERS ────────────────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests. Please try again in an hour.' },
});

const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: 'BOOKING_RATE_LIMIT', message: 'Too many appointment requests. Please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10,
  message: { error: 'AUTH_RATE_LIMIT', message: 'Too many login attempts. Please try again in 15 minutes.' },
});

// ─── API ROUTES ───────────────────────────────────────────────────────────────
app.use('/api',                 apiLimiter);
app.use('/api/appointments',    bookingLimiter, appointmentsRouter);
app.use('/api/treatments',      treatmentsRouter);
app.use('/api/clinicians',      cliniciansRouter);
app.use('/api/reviews',         reviewsRouter);
app.use('/api/contact',         contactRouter);
app.use('/api/auth',            authLimiter, authRouter);
app.use('/api/admin',           adminRouter);
app.use('/api/newsletter',      newsletterRouter);
app.use('/api/availability',    availabilityRouter);

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Northgate Dental API',
    version: '1.0.0',
    built_by: 'SPManchester Private Limited — spmanchester.com',
    timestamp: new Date().toISOString(),
  });
});

// ─── ADMIN DASHBOARD ROUTE ────────────────────────────────────────────────────
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'src', 'admin', 'index.html'));
});

// ─── CATCH-ALL → SPA ─────────────────────────────────────────────────────────
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'API endpoint not found.' });
  }
  if (req.path.startsWith('/admin/')) {
    return res.sendFile(path.join(__dirname, '..', 'src', 'admin', 'index.html'));
  }
  res.sendFile(path.join(__dirname, '..', 'src', 'index.html'));
});

// ─── GLOBAL ERROR HANDLER ─────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'PAYLOAD_TOO_LARGE', message: 'Request body too large.' });
  }
  console.error('[Server Error]', err.message);
  res.status(err.status || 500).json({
    error: 'SERVER_ERROR',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred.' : err.message,
  });
});

// ─── START ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║   Northgate Dental — Full-Stack Server         ║');
  console.log('║   SPManchester Private Limited                 ║');
  console.log('║   spmanchester.com                             ║');
  console.log('╠════════════════════════════════════════════════╣');
  console.log(`║   API:      http://localhost:${PORT}/api           ║`);
  console.log(`║   Frontend: http://localhost:${PORT}               ║`);
  console.log(`║   Admin:    http://localhost:${PORT}/admin/         ║`);
  console.log(`║   Health:   http://localhost:${PORT}/api/health     ║`);
  console.log('╚════════════════════════════════════════════════╝\n');
});

module.exports = app;
