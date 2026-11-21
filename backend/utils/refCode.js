/**
 * Utility: Reference Code Generator
 * SPManchester Private Limited
 */

'use strict';

/**
 * Generates a booking reference in format PREFIX-XXXXX
 * e.g. refCode('NGD') → 'NGD-K7M2X'
 */
function refCode(prefix) {
  const chars = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `${prefix}-${chars}`;
}

/**
 * Generates a unique reference, checking DB for collision.
 * @param {object} db - better-sqlite3 instance
 * @param {string} prefix
 */
function uniqueRefCode(db, prefix = 'NGD') {
  let ref;
  let attempts = 0;
  do {
    ref = refCode(prefix);
    attempts++;
    if (attempts > 20) throw new Error('Could not generate unique reference after 20 attempts.');
  } while (db.prepare('SELECT id FROM appointments WHERE reference = ?').get(ref));
  return ref;
}

module.exports = { refCode, uniqueRefCode };
