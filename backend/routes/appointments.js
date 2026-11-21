/**
 * Routes: Appointments
 * SPManchester Private Limited — https://spmanchester.com/
 */

'use strict';

const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const { getDb }    = require('../database/db');
const { uniqueRefCode } = require('../utils/refCode');
const { sendAppointmentConfirmation, sendAdminNewBooking } = require('../utils/email');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// ─── Validation rules ─────────────────────────────────────────────────────────
const bookingValidation = [
  body('name').trim().notEmpty().withMessage('Full name is required.').isLength({ max: 100 }),
  body('phone').trim().notEmpty().withMessage('Phone number is required.')
    .matches(/^[\d\s\+\-\(\)]{7,20}$/).withMessage('Please enter a valid phone number.'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Please enter a valid email address.'),
  body('treatment_id').isInt({ min: 1 }).withMessage('Please select a treatment.'),
  body('clinician_id').optional().isInt({ min: 1 }),
  body('date').notEmpty().isISO8601().withMessage('Please select a valid date.')
    .custom(val => {
      if (new Date(val) < new Date().setHours(0,0,0,0)) throw new Error('Date must be today or in the future.');
      return true;
    }),
  body('time').notEmpty().withMessage('Please select a preferred time.'),
  body('notes').optional().trim().isLength({ max: 500 }),
];

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: 'VALIDATION_ERROR',
      fields: errors.array().reduce((acc, e) => { acc[e.path] = e.msg; return acc; }, {}),
    });
  }
  next();
}

// ─── POST /api/appointments — Create booking request ──────────────────────────
router.post('/', bookingValidation, validate, async (req, res) => {
  const db = getDb();
  const { name, phone, email, treatment_id, clinician_id, date, time, notes } = req.body;

  // Check treatment exists
  const treatment = db.prepare('SELECT * FROM treatments WHERE id = ? AND is_active = 1').get(treatment_id);
  if (!treatment) return res.status(404).json({ error: 'NOT_FOUND', message: 'Treatment not found.' });

  // Get clinician name for confirmation
  let clinician = { name: 'First available' };
  if (clinician_id) {
    clinician = db.prepare('SELECT * FROM clinicians WHERE id = ? AND is_active = 1').get(clinician_id) || clinician;
  }

  const reference = uniqueRefCode(db, 'NGD');

  db.prepare(`
    INSERT INTO appointments
      (reference, guest_name, guest_phone, guest_email, treatment_id, clinician_id,
       preferred_date, preferred_time, notes, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'requested')
  `).run(reference, name, phone, email || null, treatment_id, clinician_id || null, date, time, notes || null);

  // Send confirmation email (non-blocking)
  if (email) {
    sendAppointmentConfirmation({
      to: email, name, reference,
      treatment: treatment.name,
      clinician: clinician_id ? `Dr ${clinician.name}` : 'First available',
      date, time,
    }).catch(err => console.error('[Email Error]', err.message));
  }

  // Notify admin (non-blocking)
  sendAdminNewBooking({
    reference, name, phone,
    treatment: treatment.name, date, time,
  }).catch(err => console.error('[Admin Email Error]', err.message));

  res.status(201).json({
    success: true,
    reference,
    status: 'requested',
    message: 'Your appointment request has been received.',
    patient_name: name,
    treatment: treatment.name,
    clinician: clinician_id ? `Dr ${clinician.name}` : 'First available',
    date,
    time,
  });
});

// ─── GET /api/appointments/lookup?ref=NGD-XXXXX — Patient lookup ──────────────
router.get('/lookup', [
  query('ref').notEmpty().withMessage('Booking reference is required.'),
], validate, (req, res) => {
  const db = getDb();
  const appt = db.prepare(`
    SELECT a.reference, a.guest_name, a.status, a.preferred_date, a.preferred_time,
           a.confirmed_date, a.confirmed_time, t.name AS treatment, c.name AS clinician
    FROM appointments a
    LEFT JOIN treatments t ON t.id = a.treatment_id
    LEFT JOIN clinicians c ON c.id = a.clinician_id
    WHERE a.reference = ? COLLATE NOCASE
  `).get(req.query.ref);

  if (!appt) return res.status(404).json({ error: 'NOT_FOUND', message: 'No booking found with that reference.' });
  res.json({ success: true, appointment: appt });
});

// ─── GET /api/appointments — Admin: list all ──────────────────────────────────
router.get('/', requireAuth, (req, res) => {
  const db = getDb();
  const { status, date, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  let where = 'WHERE 1=1';
  const params = [];
  if (status) { where += ' AND a.status = ?'; params.push(status); }
  if (date)   { where += ' AND a.preferred_date = ?'; params.push(date); }

  const appointments = db.prepare(`
    SELECT a.*, t.name AS treatment_name, c.name AS clinician_name
    FROM appointments a
    LEFT JOIN treatments t ON t.id = a.treatment_id
    LEFT JOIN clinicians c ON c.id = a.clinician_id
    ${where}
    ORDER BY a.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset);

  const total = db.prepare(`SELECT COUNT(*) AS n FROM appointments a ${where}`).get(...params).n;

  res.json({ success: true, appointments, total, page: +page, limit: +limit });
});

// ─── GET /api/appointments/:ref — Admin: single ───────────────────────────────
router.get('/:ref', requireAuth, (req, res) => {
  const db = getDb();
  const appt = db.prepare(`
    SELECT a.*, t.name AS treatment_name, c.name AS clinician_name
    FROM appointments a
    LEFT JOIN treatments t ON t.id = a.treatment_id
    LEFT JOIN clinicians c ON c.id = a.clinician_id
    WHERE a.reference = ?
  `).get(req.params.ref);
  if (!appt) return res.status(404).json({ error: 'NOT_FOUND', message: 'Appointment not found.' });
  res.json({ success: true, appointment: appt });
});

// ─── PATCH /api/appointments/:ref/confirm — Admin: confirm ────────────────────
router.patch('/:ref/confirm', requireAuth, [
  body('confirmed_date').notEmpty().isISO8601(),
  body('confirmed_time').notEmpty(),
], validate, (req, res) => {
  const db = getDb();
  const { confirmed_date, confirmed_time, admin_notes } = req.body;
  const result = db.prepare(`
    UPDATE appointments
    SET status = 'confirmed', confirmed_date = ?, confirmed_time = ?,
        admin_notes = ?, updated_at = datetime('now')
    WHERE reference = ?
  `).run(confirmed_date, confirmed_time, admin_notes || null, req.params.ref);
  if (!result.changes) return res.status(404).json({ error: 'NOT_FOUND' });
  res.json({ success: true, message: 'Appointment confirmed.' });
});

// ─── PATCH /api/appointments/:ref/cancel — Admin or patient ──────────────────
router.patch('/:ref/cancel', (req, res) => {
  const db = getDb();
  const { reason } = req.body;
  const result = db.prepare(`
    UPDATE appointments
    SET status = 'cancelled', cancel_reason = ?, cancelled_by = 'patient', updated_at = datetime('now')
    WHERE reference = ? AND status IN ('requested','confirmed')
  `).run(reason || null, req.params.ref);
  if (!result.changes) return res.status(404).json({ error: 'NOT_FOUND', message: 'Appointment not found or already processed.' });
  res.json({ success: true, message: 'Appointment cancelled.' });
});

// ─── PATCH /api/appointments/:ref/status — Admin: update status ──────────────
router.patch('/:ref/status', requireAuth, [
  body('status').isIn(['requested','confirmed','cancelled','completed','dna']),
], validate, (req, res) => {
  const db = getDb();
  const result = db.prepare(`
    UPDATE appointments SET status = ?, updated_at = datetime('now') WHERE reference = ?
  `).run(req.body.status, req.params.ref);
  if (!result.changes) return res.status(404).json({ error: 'NOT_FOUND' });
  res.json({ success: true, message: 'Status updated.' });
});

module.exports = router;
