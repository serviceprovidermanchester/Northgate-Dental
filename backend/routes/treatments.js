/**
 * Routes: Treatments
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

// GET /api/treatments — Public
router.get('/', (req, res) => {
  const db = getDb();
  const { category } = req.query;
  let sql = 'SELECT * FROM treatments WHERE is_active = 1';
  const params = [];
  if (category) { sql += ' AND category = ?'; params.push(category); }
  sql += ' ORDER BY sort_order ASC';
  res.json({ success: true, treatments: db.prepare(sql).all(...params) });
});

// GET /api/treatments/:slug — Public
router.get('/:slug', (req, res) => {
  const db = getDb();
  const t = db.prepare('SELECT * FROM treatments WHERE slug = ? AND is_active = 1').get(req.params.slug);
  if (!t) return res.status(404).json({ error: 'NOT_FOUND' });
  res.json({ success: true, treatment: t });
});

// PATCH /api/treatments/:id — Admin: update fee
router.patch('/:id', requireAuth, [
  body('price_from').optional().isFloat({ min: 0 }),
  body('price_to').optional().isFloat({ min: 0 }),
  body('description').optional().trim().isLength({ min: 10 }),
], validate, (req, res) => {
  const db = getDb();
  const { price_from, price_to, description, details } = req.body;
  const t = db.prepare('SELECT id FROM treatments WHERE id = ?').get(req.params.id);
  if (!t) return res.status(404).json({ error: 'NOT_FOUND' });
  if (price_from !== undefined) db.prepare('UPDATE treatments SET price_from = ?, updated_at = datetime(\'now\') WHERE id = ?').run(price_from, req.params.id);
  if (price_to !== undefined)   db.prepare('UPDATE treatments SET price_to = ?, updated_at = datetime(\'now\') WHERE id = ?').run(price_to, req.params.id);
  if (description)              db.prepare('UPDATE treatments SET description = ?, updated_at = datetime(\'now\') WHERE id = ?').run(description, req.params.id);
  if (details)                  db.prepare('UPDATE treatments SET details = ?, updated_at = datetime(\'now\') WHERE id = ?').run(details, req.params.id);
  res.json({ success: true, message: 'Treatment updated.' });
});

module.exports = router;
