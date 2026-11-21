/**
 * Routes: Reviews
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

// GET /api/reviews — Public (approved only)
router.get('/', (req, res) => {
  const db = getDb();
  const reviews = db.prepare(`
    SELECT id, reviewer_name, rating, body, treatment, source, created_at
    FROM reviews WHERE is_visible = 1 ORDER BY created_at DESC LIMIT 20
  `).all();
  res.json({ success: true, reviews });
});

// POST /api/reviews — Public: submit a review
router.post('/', [
  body('reviewer_name').trim().notEmpty().isLength({ max: 80 }),
  body('rating').isInt({ min: 1, max: 5 }),
  body('body').trim().notEmpty().isLength({ min: 10, max: 1000 }),
  body('treatment').optional().trim().isLength({ max: 100 }),
  body('reference').optional().trim(),
], validate, (req, res) => {
  const db = getDb();
  const { reviewer_name, rating, body: reviewBody, treatment, reference } = req.body;

  // If reference provided, verify it exists
  let verified = 0;
  if (reference) {
    const appt = db.prepare('SELECT id FROM appointments WHERE reference = ? COLLATE NOCASE').get(reference);
    if (appt) verified = 1;
  }

  db.prepare(`
    INSERT INTO reviews (reviewer_name, rating, body, treatment, verified, is_visible)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(reviewer_name, rating, reviewBody, treatment || null, verified, verified ? 1 : 0);

  res.status(201).json({
    success: true,
    message: verified
      ? 'Thank you! Your verified review has been published.'
      : 'Thank you! Your review has been submitted for approval.',
  });
});

// GET /api/reviews/all — Admin: all reviews
router.get('/all', requireAuth, (req, res) => {
  const db = getDb();
  res.json({ success: true, reviews: db.prepare('SELECT * FROM reviews ORDER BY created_at DESC').all() });
});

// PATCH /api/reviews/:id/approve — Admin
router.patch('/:id/approve', requireAuth, (req, res) => {
  const db = getDb();
  db.prepare('UPDATE reviews SET is_visible = 1 WHERE id = ?').run(req.params.id);
  res.json({ success: true, message: 'Review approved.' });
});

// PATCH /api/reviews/:id/hide — Admin
router.patch('/:id/hide', requireAuth, (req, res) => {
  const db = getDb();
  db.prepare('UPDATE reviews SET is_visible = 0 WHERE id = ?').run(req.params.id);
  res.json({ success: true, message: 'Review hidden.' });
});

// DELETE /api/reviews/:id — Admin
router.delete('/:id', requireAuth, (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM reviews WHERE id = ?').run(req.params.id);
  res.json({ success: true, message: 'Review deleted.' });
});

module.exports = router;
