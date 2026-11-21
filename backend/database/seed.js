/**
 * Database Seed — Sample Data
 * SPManchester Private Limited — https://spmanchester.com/
 * Run: node backend/database/seed.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const bcrypt = require('bcryptjs');
const { setupDatabase, getDb } = require('./db');

setupDatabase();
const db = getDb();

console.log('🌱 Seeding database...');

// ─── CLINICIANS ───────────────────────────────────────────────────────────────
const insertClinician = db.prepare(`
  INSERT OR IGNORE INTO clinicians (name, title, specialty, bio, is_active)
  VALUES (?, ?, ?, ?, 1)
`);

const clinicians = [
  ['Patel',    'Dr', 'General & Cosmetic Dentistry', 'Dr Patel has 15 years of experience in family and cosmetic dentistry. Special interest in nervous patients and painless techniques.'],
  ['Okafor',   'Dr', 'Implants & Oral Surgery',      'Dr Okafor is a specialist in dental implants and restorative dentistry with over 12 years of practice.'],
  ['Lindqvist','Dr', 'Orthodontics & Invisalign®',   'Dr Lindqvist is our Invisalign® Platinum provider, having treated over 400 Invisalign® cases.'],
];
clinicians.forEach(c => insertClinician.run(...c));
console.log('  ✓ Clinicians seeded');

// ─── TREATMENTS ───────────────────────────────────────────────────────────────
const insertTreatment = db.prepare(`
  INSERT OR IGNORE INTO treatments
    (slug, name, description, details, price_from, price_to, duration_min, emoji, category, sort_order)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const treatments = [
  ['checkup-hygiene',    'Check-up & Hygiene',       'Comprehensive examination, scale & polish, and a personalised oral-health plan.',     'Includes full mouth examination, X-rays (if needed), scale & polish, and a written oral health plan. We will spot any issues early and advise on prevention.', 58,    null,  45, '🦷', 'general',   1],
  ['teeth-whitening',    'Teeth Whitening',           'Enlighten-style whitening with a shade guarantee — clinically proven results.',       'Our home whitening kit uses custom-made trays and professional-grade gel. Includes a shade assessment, two weeks of trays, and a follow-up check.', 349,   549,  60, '✨', 'cosmetic',  2],
  ['invisalign',         'Invisalign® Aligners',      'Discreet teeth straightening with 3D iTero outcome scan.',                           'Full Invisalign® treatment from consultation through retention. Includes 3D digital scan, outcome simulation, all aligners, and 12-month retention.', 2495, 4995,  60, '😁', 'cosmetic',  3],
  ['implants-crowns',    'Implants & Crowns',         'Permanent tooth replacements that look, feel and function like natural teeth.',       'Includes CT scan, implant placement, healing abutment, and final porcelain crown. All-on-4 options available. Finance available.', 1150, 3200,  90, '🛠', 'restorative',4],
  ['childrens-dentistry','Children\'s Dentistry',     'Making dentistry fun and fear-free from day one. NHS-style check-ups for under-5s.', 'Child-friendly appointments with no-rush timing. Fissure sealants, fluoride applications, and behaviour management. Under-5s seen free.', 0,     58,   30, '🧒', 'general',   5],
  ['emergency-care',     'Emergency Care',            'Toothache, broken tooth or lost filling? Same-day slots released every morning.',     'Emergency slots released at 8:30am daily. Priority triage on arrival. Pain relief, temporary or permanent repair as appropriate. 24h advice line.', 75,  150,   30, '⚡', 'emergency', 6],
  ['composite-bonding',  'Composite Bonding',         'Instant smile makeover — chips, gaps and discolouration corrected in one visit.',     'Direct composite applied and sculpted in the surgery. No needles, no drilling in most cases. Results last 5–7 years with good care.', 180,  600,   60, '💎', 'cosmetic',  7],
  ['root-canal',         'Root Canal Treatment',      'Pain-free treatment to save a tooth that would otherwise need extraction.',           'Modern root canal is virtually painless. We use rotary instruments and digital X-rays to clean and seal the canals efficiently, usually in 1–2 visits.', 350, 650, 90, '🔬', 'restorative',8],
];
treatments.forEach(t => insertTreatment.run(...t));
console.log('  ✓ Treatments seeded');

// ─── REVIEWS ──────────────────────────────────────────────────────────────────
const insertReview = db.prepare(`
  INSERT OR IGNORE INTO reviews (reviewer_name, rating, body, treatment, verified, is_visible, source)
  VALUES (?, ?, ?, ?, 1, 1, 'website')
`);

const reviews = [
  ['Amelia R.',  5, "I hadn't seen a dentist in six years because I was embarrassed. The team never judged me — and booking online meant I didn't have to explain myself on the phone.", 'Check-up & Hygiene'],
  ['Tom W.',     5, "Clear prices before I sat in the chair. The whitening result is exactly what the shade scan predicted — I couldn't be happier.", 'Teeth Whitening'],
  ['Priya K.',   5, "My daughter actually asks when her next check-up is. That says everything about how the team makes children feel welcome.", "Children's Dentistry"],
  ['James M.',   5, "Had an emergency on a Saturday morning — called at 8:30, seen by 10am. Brilliant service. The pain was gone within 24 hours.", 'Emergency Care'],
  ['Sophie L.',  5, "My Invisalign® treatment finished three weeks ago and the results are honestly life-changing. Dr Lindqvist was amazing throughout.", 'Invisalign® Aligners'],
  ['David H.',   4, "Had an implant fitted by Dr Okafor. The whole process was explained clearly at every stage. Very professional practice.", 'Implants & Crowns'],
];
reviews.forEach(r => insertReview.run(...r));
console.log('  ✓ Reviews seeded');

// ─── ADMIN USER ───────────────────────────────────────────────────────────────
const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'Admin@NGD2026!';
const hash = bcrypt.hashSync(adminPassword, 12);

db.prepare(`
  INSERT OR IGNORE INTO admin_users (email, password_hash, name, role)
  VALUES (?, ?, ?, 'super')
`).run('admin@northgatedental.co.uk', hash, 'Practice Admin');

console.log('  ✓ Admin user seeded');
console.log('    Email:    admin@northgatedental.co.uk');
console.log('    Password:', adminPassword);
console.log('    ⚠️  Change this password immediately in a live deployment!');

// ─── SAMPLE APPOINTMENTS ──────────────────────────────────────────────────────
const sampleAppts = [
  { ref: 'NGD-DEMO1', gname: 'Sarah Ahmed',    gphone: '07700900001', gemail: 'sarah@example.com',  tid: 1, cid: 1, date: '2026-12-15', time: '09:00', status: 'confirmed',  notes: 'First visit' },
  { ref: 'NGD-DEMO2', gname: 'Mohammed Ali',   gphone: '07700900002', gemail: 'mali@example.com',   tid: 2, cid: 3, date: '2026-12-16', time: '10:30', status: 'requested',  notes: '' },
  { ref: 'NGD-DEMO3', gname: 'Emma Thompson',  gphone: '07700900003', gemail: 'emma@example.com',   tid: 3, cid: 3, date: '2026-12-17', time: '14:15', status: 'confirmed',  notes: 'Nervous patient' },
  { ref: 'NGD-DEMO4', gname: 'Raj Sharma',     gphone: '07700900004', gemail: 'raj@example.com',    tid: 6, cid: 1, date: '2026-12-18', time: '09:00', status: 'completed',  notes: 'Emergency — toothache' },
  { ref: 'NGD-DEMO5', gname: 'Lucy Davies',    gphone: '07700900005', gemail: 'lucy@example.com',   tid: 5, cid: 2, date: '2026-12-19', time: '12:00', status: 'requested',  notes: '' },
];

const insertAppt = db.prepare(`
  INSERT OR IGNORE INTO appointments
    (reference, guest_name, guest_phone, guest_email, treatment_id, clinician_id, preferred_date, preferred_time, status, notes)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
sampleAppts.forEach(a => insertAppt.run(a.ref, a.gname, a.gphone, a.gemail, a.tid, a.cid, a.date, a.time, a.status, a.notes));
console.log('  ✓ Sample appointments seeded');

console.log('\n✅ Database seeding complete!\n');
process.exit(0);
