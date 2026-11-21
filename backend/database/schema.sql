-- ============================================================
-- Northgate Dental — Database Schema (SQLite)
-- SPManchester Private Limited — https://spmanchester.com/
-- ============================================================

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- ─── CLINICIANS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clinicians (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  title       TEXT NOT NULL DEFAULT 'Dr',
  specialty   TEXT,
  bio         TEXT,
  avatar_url  TEXT,
  is_active   INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── TREATMENTS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS treatments (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  slug          TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  description   TEXT NOT NULL,
  details       TEXT,
  price_from    REAL NOT NULL,
  price_to      REAL,
  duration_min  INTEGER NOT NULL DEFAULT 45,
  emoji         TEXT,
  category      TEXT NOT NULL DEFAULT 'general',
  is_active     INTEGER NOT NULL DEFAULT 1,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── PATIENTS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS patients (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  email           TEXT NOT NULL UNIQUE,
  password_hash   TEXT,
  first_name      TEXT NOT NULL,
  last_name       TEXT NOT NULL,
  phone           TEXT NOT NULL,
  date_of_birth   TEXT,
  address         TEXT,
  nhs_number      TEXT,
  is_new_patient  INTEGER NOT NULL DEFAULT 1,
  is_active       INTEGER NOT NULL DEFAULT 1,
  verified        INTEGER NOT NULL DEFAULT 0,
  verify_token    TEXT,
  reset_token     TEXT,
  reset_expires   TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── APPOINTMENTS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS appointments (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  reference       TEXT NOT NULL UNIQUE,
  patient_id      INTEGER REFERENCES patients(id) ON DELETE SET NULL,
  -- Guest fields (when patient not registered)
  guest_name      TEXT,
  guest_phone     TEXT,
  guest_email     TEXT,
  -- Core booking data
  treatment_id    INTEGER NOT NULL REFERENCES treatments(id),
  clinician_id    INTEGER REFERENCES clinicians(id),
  preferred_date  TEXT NOT NULL,
  preferred_time  TEXT NOT NULL,
  confirmed_date  TEXT,
  confirmed_time  TEXT,
  notes           TEXT,
  -- Status flow: requested → confirmed → completed | cancelled | dna
  status          TEXT NOT NULL DEFAULT 'requested'
                  CHECK(status IN ('requested','confirmed','cancelled','completed','dna')),
  -- SMS / email tracking
  sms_sent        INTEGER NOT NULL DEFAULT 0,
  email_sent      INTEGER NOT NULL DEFAULT 0,
  reminder_sent   INTEGER NOT NULL DEFAULT 0,
  -- Admin
  admin_notes     TEXT,
  cancelled_by    TEXT,
  cancel_reason   TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── AVAILABILITY SLOTS ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS availability_slots (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  clinician_id  INTEGER NOT NULL REFERENCES clinicians(id),
  slot_date     TEXT NOT NULL,
  slot_time     TEXT NOT NULL,
  is_available  INTEGER NOT NULL DEFAULT 1,
  appointment_id INTEGER REFERENCES appointments(id) ON DELETE SET NULL,
  UNIQUE(clinician_id, slot_date, slot_time)
);

-- ─── REVIEWS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id    INTEGER REFERENCES patients(id) ON DELETE SET NULL,
  reviewer_name TEXT NOT NULL,
  rating        INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
  body          TEXT NOT NULL,
  treatment     TEXT,
  verified      INTEGER NOT NULL DEFAULT 0,
  is_visible    INTEGER NOT NULL DEFAULT 0,
  source        TEXT NOT NULL DEFAULT 'website',
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── CONTACT MESSAGES ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contact_messages (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT,
  subject     TEXT NOT NULL,
  message     TEXT NOT NULL,
  is_read     INTEGER NOT NULL DEFAULT 0,
  replied_at  TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── NEWSLETTER SUBSCRIBERS ───────────────────────────────────
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT NOT NULL UNIQUE,
  first_name    TEXT,
  is_active     INTEGER NOT NULL DEFAULT 1,
  subscribed_at TEXT NOT NULL DEFAULT (datetime('now')),
  unsubscribed_at TEXT
);

-- ─── ADMIN USERS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name          TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'staff'
                CHECK(role IN ('super','admin','staff')),
  last_login    TEXT,
  is_active     INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── INDEXES ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_appointments_reference   ON appointments(reference);
CREATE INDEX IF NOT EXISTS idx_appointments_status      ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_date        ON appointments(preferred_date);
CREATE INDEX IF NOT EXISTS idx_appointments_patient     ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_availability_clinician   ON availability_slots(clinician_id, slot_date);
CREATE INDEX IF NOT EXISTS idx_patients_email           ON patients(email);
CREATE INDEX IF NOT EXISTS idx_reviews_visible          ON reviews(is_visible);
