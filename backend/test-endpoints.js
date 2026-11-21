/**
 * Automated End-to-End Test Suite
 * Northgate Dental Full-Stack API & Static Serving
 * SPManchester Private Limited — spmanchester.com
 */

'use strict';

const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, headers: res.headers, body: json });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting Northgate Dental E2E Test Suite...\n');
  let token = null;

  // 1. Health
  console.log('1. Testing GET /api/health...');
  const health = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/health',
    method: 'GET'
  });
  console.log('   Status:', health.status, '| Status body:', health.body.status);
  if (health.status !== 200 || health.body.status !== 'ok') throw new Error('Health check failed');

  // 2. Treatments
  console.log('2. Testing GET /api/treatments...');
  const treatments = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/treatments',
    method: 'GET'
  });
  const tCount = treatments.body.treatments ? treatments.body.treatments.length : 0;
  console.log('   Status:', treatments.status, '| Treatments found:', tCount);
  if (treatments.status !== 200 || tCount === 0) throw new Error('Treatments check failed');

  // 3. Clinicians
  console.log('3. Testing GET /api/clinicians...');
  const clinicians = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/clinicians',
    method: 'GET'
  });
  const cCount = clinicians.body.clinicians ? clinicians.body.clinicians.length : 0;
  console.log('   Status:', clinicians.status, '| Clinicians found:', cCount);
  if (clinicians.status !== 200 || cCount === 0) throw new Error('Clinicians check failed');

  // 4. Reviews
  console.log('4. Testing GET /api/reviews...');
  const reviews = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/reviews',
    method: 'GET'
  });
  const rCount = reviews.body.reviews ? reviews.body.reviews.length : 0;
  console.log('   Status:', reviews.status, '| Reviews found:', rCount);
  if (reviews.status !== 200 || rCount === 0) throw new Error('Reviews check failed');

  // 5. Admin Login
  console.log('5. Testing POST /api/auth/login...');
  const login = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    email: 'admin@northgatedental.co.uk',
    password: process.env.ADMIN_DEFAULT_PASSWORD || 'Admin@NGD2026!'
  });
  console.log('   Status:', login.status, '| Email:', login.body.admin ? login.body.admin.email : 'None');
  if (login.status !== 200 || !login.body.token) throw new Error('Admin login failed');
  token = login.body.token;

  // 6. Admin Stats (Authorized)
  console.log('6. Testing GET /api/admin/stats (Protected with JWT)...');
  const stats = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/admin/stats',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('   Status:', stats.status, '| Total appointments in stats:', stats.body.stats.appointments.total);
  if (stats.status !== 200) throw new Error('Admin stats check failed');

  // 7. Create Appointment
  console.log('7. Testing POST /api/appointments...');
  const booking = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/appointments',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'E2E Test Patient',
    phone: '07700900999',
    email: 'test@example.com',
    treatment_id: 1,
    clinician_id: 1,
    date: '2026-12-15',
    time: '11:00',
    notes: 'Automated test suite appointment'
  });
  console.log('   Status:', booking.status, '| Generated Reference:', booking.body.reference);
  if (booking.status !== 201 || !booking.body.reference) throw new Error('Booking creation failed');

  // 8. Track Appointment Lookup
  console.log('8. Testing GET /api/appointments/lookup?ref=...');
  const lookup = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: `/api/appointments/lookup?ref=${booking.body.reference}`,
    method: 'GET'
  });
  console.log('   Status:', lookup.status, '| Found status:', lookup.body.appointment.status);
  if (lookup.status !== 200 || lookup.body.appointment.reference !== booking.body.reference) {
    throw new Error('Appointment lookup failed');
  }

  // 9. Newsletter Subscription
  console.log('9. Testing POST /api/newsletter/subscribe...');
  const nl = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/newsletter/subscribe',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'subscriber@example.com', name: 'Test Subscriber' });
  console.log('   Status:', nl.status, '| Message:', nl.body.message);
  if (nl.status !== 200 && nl.status !== 201) throw new Error('Newsletter subscribe failed');

  // 10. Contact Message
  console.log('10. Testing POST /api/contact...');
  const contact = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/contact',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'Test Enquirer',
    email: 'enquiry@example.com',
    phone: '01610001111',
    subject: 'General Question',
    message: 'Hello from the test suite'
  });
  console.log('   Status:', contact.status, '| Message:', contact.body.message);
  if (contact.status !== 201) throw new Error('Contact message submission failed');

  // 11. Static Delivery
  console.log('11. Testing Frontend Static Delivery (GET /)...');
  const indexPage = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/',
    method: 'GET'
  });
  console.log('   Status:', indexPage.status, '| Body length:', indexPage.body.length);
  if (indexPage.status !== 200 || !indexPage.body.includes('Northgate Dental')) throw new Error('Index static serving failed');

  // 12. Admin Delivery
  console.log('12. Testing Admin Static Delivery (GET /admin/)...');
  const adminPage = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/admin/',
    method: 'GET'
  });
  console.log('   Status:', adminPage.status, '| Body length:', adminPage.body.length);
  if (adminPage.status !== 200 || !adminPage.body.includes('Admin Dashboard')) throw new Error('Admin static serving failed');

  console.log('\n========================================');
  console.log('🎉 ALL 12 END-TO-END TESTS PASSED 100%! ');
  console.log('========================================\n');
  process.exit(0);
}

// Start server and run tests
require('./server');
setTimeout(() => {
  runTests().catch(err => {
    console.error('\n❌ TEST FAILURE:', err.message);
    process.exit(1);
  });
}, 800);
