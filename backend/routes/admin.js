/**
 * Routes: Admin Dashboard Stats & Management
 * SPManchester Private Limited
 */

'use strict';

const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const { getDb } = require('../database/db');
const { requireAuth, requireSuperAdmin } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// GET /api/admin/stats — Dashboard summary
router.get('/stats', (req, res) => {
  const db = getDb();
  const today = new Date().toISOString().slice(0, 10);

  const byTreatment = db.prepare(`
    SELECT t.name AS treatment_name, COUNT(*) AS count
    FROM appointments a
    LEFT JOIN treatments t ON t.id = a.treatment_id
    GROUP BY a.treatment_id ORDER BY count DESC LIMIT 6
  `).all();

  const byStatus = db.prepare(`
    SELECT status, COUNT(*) AS count
    FROM appointments
    GROUP BY status
  `).all();

  const stats = {
    appointments: {
      total:       db.prepare('SELECT COUNT(*) AS n FROM appointments').get().n,
      requested:   db.prepare('SELECT COUNT(*) AS n FROM appointments WHERE status = \'requested\'').get().n,
      confirmed:   db.prepare('SELECT COUNT(*) AS n FROM appointments WHERE status = \'confirmed\'').get().n,
      today:       db.prepare('SELECT COUNT(*) AS n FROM appointments WHERE preferred_date = ?').get(today).n,
      this_week:   db.prepare('SELECT COUNT(*) AS n FROM appointments WHERE preferred_date >= date(\'now\',\'-7 days\')').get().n,
      byTreatment,
      byStatus,
    },
    reviews: {
      total:      db.prepare('SELECT COUNT(*) AS n FROM reviews').get().n,
      pending:    db.prepare('SELECT COUNT(*) AS n FROM reviews WHERE is_visible = 0').get().n,
      avg_rating: db.prepare('SELECT ROUND(AVG(rating),1) AS avg FROM reviews WHERE is_visible = 1').get().avg || 0,
    },
    messages: {
      total:      db.prepare('SELECT COUNT(*) AS n FROM contact_messages').get().n,
      unread:     db.prepare('SELECT COUNT(*) AS n FROM contact_messages WHERE is_read = 0').get().n,
    },
    contacts: {
      total:      db.prepare('SELECT COUNT(*) AS n FROM contact_messages').get().n,
      unread:     db.prepare('SELECT COUNT(*) AS n FROM contact_messages WHERE is_read = 0').get().n,
    },
    newsletter: {
      active:     db.prepare('SELECT COUNT(*) AS n FROM newsletter_subscribers WHERE is_active = 1').get().n,
      subscribers: db.prepare('SELECT COUNT(*) AS n FROM newsletter_subscribers WHERE is_active = 1').get().n,
    },
    recent_appointments: db.prepare(`
      SELECT a.reference, a.guest_name AS patient_name, a.guest_name, a.status, a.preferred_date, a.preferred_time,
             t.name AS treatment_name, t.name AS treatment
      FROM appointments a
      LEFT JOIN treatments t ON t.id = a.treatment_id
      ORDER BY a.created_at DESC LIMIT 10
    `).all(),
    appointments_by_treatment: byTreatment,
  };

  res.json({ success: true, stats });
});

// GET /api/admin/patients — Patient list
router.get('/patients', (req, res) => {
  const db = getDb();
  const patients = db.prepare('SELECT id, first_name, last_name, email, phone, is_new_patient, created_at FROM patients ORDER BY created_at DESC LIMIT 100').all();
  res.json({ success: true, patients });
});

// GET /api/admin/users — Admin users (super only)
router.get('/users', requireSuperAdmin, (req, res) => {
  const db = getDb();
  const users = db.prepare('SELECT id, email, name, role, last_login, is_active, created_at FROM admin_users ORDER BY created_at').all();
  res.json({ success: true, users });
});

// POST /api/admin/users — Create admin user (super only)
router.post('/users', requireSuperAdmin, [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('name').trim().notEmpty(),
  body('role').isIn(['admin','staff']),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ error: 'VALIDATION_ERROR', fields: errors.array().reduce((a, e) => { a[e.path] = e.msg; return a; }, {}) });
  const db = getDb();
  const hash = await bcrypt.hash(req.body.password, 12);
  try {
    db.prepare('INSERT INTO admin_users (email, password_hash, name, role) VALUES (?, ?, ?, ?)').run(req.body.email, hash, req.body.name, req.body.role);
    res.status(201).json({ success: true, message: 'Admin user created.' });
  } catch {
    res.status(409).json({ error: 'CONFLICT', message: 'Email already in use.' });
  }
});

module.exports = router;
