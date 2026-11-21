/**
 * Routes: Admin Auth (Login / Logout)
 * SPManchester Private Limited
 */

'use strict';

const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const { getDb } = require('../database/db');
const { signToken, requireAuth } = require('../middleware/auth');

const router = express.Router();

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ error: 'VALIDATION_ERROR', fields: errors.array().reduce((a, e) => { a[e.path] = e.msg; return a; }, {}) });
  }
  next();
}

// POST /api/auth/login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], validate, async (req, res) => {
  const db = getDb();
  const admin = db.prepare('SELECT * FROM admin_users WHERE email = ? AND is_active = 1').get(req.body.email);
  if (!admin) return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' });

  const valid = await bcrypt.compare(req.body.password, admin.password_hash);
  if (!valid) return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' });

  db.prepare('UPDATE admin_users SET last_login = datetime(\'now\') WHERE id = ?').run(admin.id);

  const token = signToken({ id: admin.id, email: admin.email, name: admin.name, role: admin.role });
  res.json({
    success: true,
    token,
    admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
  });
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  res.json({ success: true, admin: req.admin });
});

// POST /api/auth/change-password
router.post('/change-password', requireAuth, [
  body('current_password').notEmpty(),
  body('new_password').isLength({ min: 8 }).withMessage('New password must be at least 8 characters.'),
], validate, async (req, res) => {
  const db = getDb();
  const admin = db.prepare('SELECT * FROM admin_users WHERE id = ?').get(req.admin.id);
  const valid = await bcrypt.compare(req.body.current_password, admin.password_hash);
  if (!valid) return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Current password is incorrect.' });
  const hash = await bcrypt.hash(req.body.new_password, 12);
  db.prepare('UPDATE admin_users SET password_hash = ? WHERE id = ?').run(hash, req.admin.id);
  res.json({ success: true, message: 'Password updated successfully.' });
});

module.exports = router;
