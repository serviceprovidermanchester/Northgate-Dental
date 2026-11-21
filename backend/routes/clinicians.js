/**
 * Routes: Clinicians
 * SPManchester Private Limited
 */

'use strict';

const express = require('express');
const { getDb } = require('../database/db');

const router = express.Router();

// GET /api/clinicians — Public
router.get('/', (req, res) => {
  const db = getDb();
  const clinicians = db.prepare('SELECT id, name, title, specialty, bio FROM clinicians WHERE is_active = 1 ORDER BY id').all();
  res.json({ success: true, clinicians });
});

module.exports = router;
