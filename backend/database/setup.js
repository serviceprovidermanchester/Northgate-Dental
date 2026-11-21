/**
 * Database Setup Script — Northgate Dental
 * ==========================================
 * Standalone script to initialise the SQLite database and seed it
 * with sample data. Safe to run more than once — schema creation
 * is idempotent (CREATE TABLE IF NOT EXISTS) and seed guards against
 * duplicate rows via ON CONFLICT IGNORE.
 *
 * Usage:
 *   cd backend
 *   node database/setup.js
 *
 * @author SPManchester Private Limited <info@spmanchester.com>
 * @see    https://spmanchester.com/
 */

'use strict';

// Load .env from project root (one level above backend/)
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });

const { setupDatabase } = require('./db');
const seed              = require('./seed');

(async () => {
  try {
    console.log('\n📦  Northgate Dental — Database Setup');
    console.log('═'.repeat(45));

    // 1. Create tables and indexes
    console.log('\n1/2  Initialising schema …');
    setupDatabase();
    console.log('     ✓ Schema ready');

    // 2. Seed reference data + demo rows
    console.log('\n2/2  Seeding data …');
    seed();
    console.log('     ✓ Seed complete');

    console.log('\n✅  Setup finished — database is ready.');
    console.log('    Start the server with: node server.js\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌  Setup failed:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
})();
