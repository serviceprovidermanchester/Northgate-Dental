/**
 * Routes: Availability
 * SPManchester Private Limited
 */

'use strict';

const express = require('express');
const { query, validationResult } = require('express-validator');
const { getDb } = require('../database/db');

const router = express.Router();

const DEFAULT_TIMES = ['09:00','10:00','10:30','11:00','12:00','13:30','14:00','14:15','15:00','16:00','16:30','17:00','17:30'];

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ error: 'VALIDATION_ERROR', fields: errors.array().reduce((a, e) => { a[e.path] = e.msg; return a; }, {}) });
  next();
}

// GET /api/availability?date=2026-12-15&clinician_id=1
router.get('/', [
  query('date').notEmpty().isISO8601().withMessage('Date is required (YYYY-MM-DD).'),
  query('clinician_id').optional().isInt({ min: 1 }),
], validate, (req, res) => {
  const db = getDb();
  const { date, clinician_id } = req.query;

  // Get booked slots for this date/clinician
  let bookedSql = `
    SELECT preferred_time FROM appointments
    WHERE preferred_date = ? AND status IN ('requested','confirmed')
  `;
  const params = [date];
  if (clinician_id) { bookedSql += ' AND clinician_id = ?'; params.push(clinician_id); }

  const booked = db.prepare(bookedSql).all(...params).map(r => r.preferred_time);

  // Check if day is a weekend (Sunday = 0)
  const dayOfWeek = new Date(date + 'T00:00:00').getDay();
  const isSunday = dayOfWeek === 0;

  const slots = DEFAULT_TIMES
    .filter(t => !isSunday || parseInt(t) < 13) // Saturdays shorter
    .map(t => ({ time: t, available: !booked.includes(t) }));

  res.json({
    success: true,
    date,
    clinician_id: clinician_id ? parseInt(clinician_id) : null,
    slots,
  });
});

module.exports = router;
