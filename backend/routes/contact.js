/**
 * Routes: Contact Form
 * SPManchester Private Limited
 */

'use strict';

const express = require('express');
const { body, validationResult } = require('express-validator');
const { getDb } = require('../database/db');
const { sendContactConfirmation } = require('../utils/email');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ error: 'VALIDATION_ERROR', fields: errors.array().reduce((a, e) => { a[e.path] = e.msg; return a; }, {}) });
  next();
}

// POST /api/contact
router.post('/', [
  body('name').trim().notEmpty().isLength({ max: 100 }),
  body('email').isEmail().normalizeEmail(),
  body('phone').optional().trim().isLength({ max: 20 }),
  body('subject').trim().notEmpty().isLength({ max: 200 }),
  body('message').trim().notEmpty().isLength({ min: 10, max: 2000 }),
], validate, async (req, res) => {
  const db = getDb();
  const { name, email, phone, subject, message } = req.body;
  db.prepare('INSERT INTO contact_messages (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)')
    .run(name, email, phone || null, subject, message);
  sendContactConfirmation({ to: email, name, subject }).catch(e => console.error('[Contact Email]', e.message));
  res.status(201).json({ success: true, message: 'Your message has been received. We will respond within one business day.' });
});

// GET /api/contact — Admin
router.get('/', requireAuth, (req, res) => {
  const db = getDb();
  const msgs = db.prepare('SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 100').all();
  res.json({ success: true, messages: msgs });
});

// PATCH /api/contact/:id/read — Admin
router.patch('/:id/read', requireAuth, (req, res) => {
  const db = getDb();
  db.prepare('UPDATE contact_messages SET is_read = 1 WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
