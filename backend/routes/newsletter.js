/**
 * Routes: Newsletter
 * SPManchester Private Limited
 */

'use strict';

const express = require('express');
const { body, validationResult } = require('express-validator');
const { getDb } = require('../database/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ error: 'VALIDATION_ERROR', fields: errors.array().reduce((a, e) => { a[e.path] = e.msg; return a; }, {}) });
  next();
}

// POST /api/newsletter/subscribe
router.post('/subscribe', [
  body('email').isEmail().normalizeEmail(),
  body('first_name').optional().trim().isLength({ max: 60 }),
], validate, (req, res) => {
  const db = getDb();
  const { email, first_name } = req.body;
  try {
    db.prepare('INSERT OR IGNORE INTO newsletter_subscribers (email, first_name) VALUES (?, ?)').run(email, first_name || null);
    res.status(201).json({ success: true, message: 'You\'re subscribed! Welcome to the Northgate Dental newsletter.' });
  } catch {
    res.json({ success: true, message: 'You\'re already subscribed.' });
  }
});

// POST /api/newsletter/unsubscribe
router.post('/unsubscribe', [
  body('email').isEmail().normalizeEmail(),
], validate, (req, res) => {
  const db = getDb();
  db.prepare('UPDATE newsletter_subscribers SET is_active = 0, unsubscribed_at = datetime(\'now\') WHERE email = ?').run(req.body.email);
  res.json({ success: true, message: 'You have been unsubscribed.' });
});

// GET /api/newsletter/subscribers — Admin
router.get('/subscribers', requireAuth, (req, res) => {
  const db = getDb();
  const subs = db.prepare('SELECT * FROM newsletter_subscribers WHERE is_active = 1 ORDER BY subscribed_at DESC').all();
  res.json({ success: true, subscribers: subs, total: subs.length });
});

module.exports = router;
