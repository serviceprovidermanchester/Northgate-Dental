/**
 * Database Connection & Setup
 * SPManchester Private Limited — https://spmanchester.com/
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', 'data', 'northgate.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

function setupDatabase() {
  const database = getDb();
  const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
  database.exec(schema);
  console.log('✅ Database schema applied.');
  return database;
}

module.exports = { getDb, setupDatabase };
