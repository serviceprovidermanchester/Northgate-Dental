/**
 * Northgate Dental — Full-Stack Frontend Script
 * SPManchester Private Limited — https://spmanchester.com/
 * MIT Licence — Copyright (c) 2026 SPManchester Private Limited
 */

'use strict';

/* ─── CONFIG ─────────────────────────────────────────────────────────────── */
const API = window.location.port === '5500' || window.location.port === '5501'
  ? 'http://localhost:3000/api'   // Live Server dev
  : '/api';                        // Same-origin (Express serves frontend)

/* ─── UTILITIES ──────────────────────────────────────────────────────────── */
function qs(sel, ctx = document) { return ctx.querySelector(sel); }
function qsa(sel, ctx = document) { return [...ctx.querySelectorAll(sel)]; }

async function apiFetch(path, opts = {}) {
  const res = await fetch(API + path, {
    headers: { 'Content-Type': 'application/json', ...opts.headers },
    ...opts,
  });
  const data = await res.json();
  if (!res.ok) throw { status: res.status, ...data };
  return data;
}

function formatDate(str) {
  if (!str) return str;
  try {
    return new Date(str + 'T00:00:00').toLocaleDateString('en-GB', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  } catch { return str; }
}

function escHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function showToast(msg, type = 'success') {
  const t = qs('#toast');
  t.textContent = msg;
  t.className = `toast toast-${type}`;
  t.hidden = false;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.hidden = true; }, 4000);
}

/* ─── COOKIE CONSENT ─────────────────────────────────────────────────────── */
(function initCookies() {
  if (!localStorage.getItem('cookie-consent')) {
    setTimeout(() => { const b = qs('#cookie-banner'); if (b) b.hidden = false; }, 1200);
  }
})();
window.acceptCookies  = () => { localStorage.setItem('cookie-consent','accepted');  qs('#cookie-banner').hidden = true; };
window.declineCookies = () => { localStorage.setItem('cookie-consent','declined');  qs('#cookie-banner').hidden = true; };

/* ─── HAMBURGER NAV ──────────────────────────────────────────────────────── */
(function initNav() {
  const btn = qs('#hamburger');
  const nav = qs('#main-nav');
  if (!btn || !nav) return;
  btn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
    btn.classList.toggle('active', open);
  });
  // Close on nav link click
  qsa('#main-nav a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open');
    btn.setAttribute('aria-expanded', false);
    btn.classList.remove('active');
  }));
})();

/* ─── BACK TO TOP ────────────────────────────────────────────────────────── */
(function initBackToTop() {
  const btn = qs('#back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', () => { btn.hidden = window.scrollY < 500; }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

/* ─── STICKY HEADER SHADOW ───────────────────────────────────────────────── */
window.addEventListener('scroll', () => {
  document.querySelector('.site-header')?.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

/* ─── SCROLL-REVEAL (IntersectionObserver) ───────────────────────────────── */
(function initReveal() {
  if (!('IntersectionObserver' in window)) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.12 });
  qsa('.why-card, .treatment-card, .review-card, .team-card, .problem-card').forEach(el => {
    el.classList.add('reveal');
    obs.observe(el);
  });
})();

/* ─── FALLBACK DEMO DATA (Used when API is offline / static hosting) ──────── */
const FALLBACK_TREATMENTS = [
  { id: 1, slug: 'checkup-hygiene', name: 'Check-up & Hygiene', description: 'Comprehensive examination, scale & polish, and a personalised oral-health plan.', details: 'Includes full mouth examination, X-rays (if needed), scale & polish, and a written oral health plan. We spot any issues early and advise on prevention.', price_from: 58, price_to: null, duration_min: 45, emoji: '🦷', category: 'general' },
  { id: 2, slug: 'teeth-whitening', name: 'Teeth Whitening', description: 'Enlighten-style whitening with a shade guarantee — clinically proven results.', details: 'Our home whitening kit uses custom-made trays and professional-grade gel. Includes a shade assessment, two weeks of trays, and a follow-up check.', price_from: 349, price_to: 549, duration_min: 60, emoji: '✨', category: 'cosmetic' },
  { id: 3, slug: 'invisalign', name: 'Invisalign® Aligners', description: 'Discreet teeth straightening with 3D iTero outcome scan.', details: 'Full Invisalign® treatment from consultation through retention. Includes 3D digital scan, outcome simulation, all aligners, and 12-month retention.', price_from: 2495, price_to: 4995, duration_min: 60, emoji: '😁', category: 'cosmetic' },
  { id: 4, slug: 'implants-crowns', name: 'Implants & Crowns', description: 'Permanent tooth replacements that look, feel and function like natural teeth.', details: 'Includes CT scan, implant placement, healing abutment, and final porcelain crown. All-on-4 options available. Finance available.', price_from: 1150, price_to: 3200, duration_min: 90, emoji: '🛠', category: 'restorative' },
  { id: 5, slug: 'childrens-dentistry', name: "Children's Dentistry", description: 'Making dentistry fun and fear-free from day one. NHS-style check-ups for under-5s.', details: 'Child-friendly appointments with no-rush timing. Fissure sealants, fluoride applications, and behaviour management. Under-5s seen free.', price_from: 0, price_to: 58, duration_min: 30, emoji: '🧒', category: 'general' },
  { id: 6, slug: 'emergency-care', name: 'Emergency Care', description: 'Toothache, broken tooth or lost filling? Same-day slots released every morning.', details: 'Emergency slots released at 8:30am daily. Priority triage on arrival. Pain relief, temporary or permanent repair as appropriate. 24h advice line.', price_from: 75, price_to: 150, duration_min: 30, emoji: '⚡', category: 'emergency' },
  { id: 7, slug: 'composite-bonding', name: 'Composite Bonding', description: 'Instant smile makeover — chips, gaps and discolouration corrected in one visit.', details: 'Direct composite applied and sculpted in the surgery. No needles, no drilling in most cases. Results last 5–7 years with good care.', price_from: 180, price_to: 600, duration_min: 60, emoji: '💎', category: 'cosmetic' },
  { id: 8, slug: 'root-canal', name: 'Root Canal Treatment', description: 'Pain-free treatment to save a tooth that would otherwise need extraction.', details: 'Modern root canal is virtually painless. We use rotary instruments and digital X-rays to clean and seal the canals efficiently, usually in 1–2 visits.', price_from: 350, price_to: 650, duration_min: 90, emoji: '🔬', category: 'restorative' },
];

const FALLBACK_CLINICIANS = [
  { id: 1, title: 'Dr', name: 'Patel', specialty: 'General & Cosmetic Dentistry', bio: 'Dr Patel has 15 years of experience in family and cosmetic dentistry. Special interest in nervous patients and painless techniques.' },
  { id: 2, title: 'Dr', name: 'Okafor', specialty: 'Implants & Oral Surgery', bio: 'Dr Okafor is a specialist in dental implants and restorative dentistry with over 12 years of practice.' },
  { id: 3, title: 'Dr', name: 'Lindqvist', specialty: 'Orthodontics & Invisalign®', bio: 'Dr Lindqvist is our Invisalign® Platinum provider, having treated over 400 Invisalign® cases.' },
];

const FALLBACK_REVIEWS = [
  { reviewer_name: 'Amelia R.', rating: 5, body: "I hadn't seen a dentist in six years because I was embarrassed. The team never judged me — and booking online meant I didn't have to explain myself on the phone.", treatment: 'Check-up & Hygiene', verified: true, created_at: '2026-10-15T10:00:00Z' },
  { reviewer_name: 'Tom W.', rating: 5, body: "Clear prices before I sat in the chair. The whitening result is exactly what the shade scan predicted — I couldn't be happier.", treatment: 'Teeth Whitening', verified: true, created_at: '2026-10-22T14:30:00Z' },
  { reviewer_name: 'Priya K.', rating: 5, body: "My daughter actually asks when her next check-up is. That says everything about how the team makes children feel welcome.", treatment: "Children's Dentistry", verified: true, created_at: '2026-11-02T09:15:00Z' },
  { reviewer_name: 'James M.', rating: 5, body: "Had an emergency on a Saturday morning — called at 8:30, seen by 10am. Brilliant service. The pain was gone within 24 hours.", treatment: 'Emergency Care', verified: true, created_at: '2026-11-05T11:45:00Z' },
  { reviewer_name: 'Sophie L.', rating: 5, body: "My Invisalign® treatment finished three weeks ago and the results are honestly life-changing. Dr Lindqvist was amazing throughout.", treatment: 'Invisalign® Aligners', verified: true, created_at: '2026-11-12T16:00:00Z' },
  { reviewer_name: 'David H.', rating: 4, body: "Had an implant fitted by Dr Okafor. The whole process was explained clearly at every stage. Very professional practice.", treatment: 'Implants & Crowns', verified: true, created_at: '2026-11-18T13:20:00Z' },
];

/* ─── LOAD TREATMENTS FROM API ───────────────────────────────────────────── */
let allTreatments = [];

function populateTreatmentSelect(treatments) {
  const sel = qs('#f-treatment');
  if (sel) {
    sel.innerHTML = '<option value="" disabled selected>Select a treatment…</option>';
    treatments.forEach(t => {
      const o = document.createElement('option');
      o.value = t.id;
      o.textContent = `${t.name} — from £${t.price_from}`;
      sel.appendChild(o);
    });
  }
}

async function loadTreatments() {
  const grid = qs('#treatments-grid');
  try {
    const data = await apiFetch('/treatments');
    allTreatments = data.treatments || data.data || [];
    renderTreatments('all');
    populateTreatmentSelect(allTreatments);
  } catch (err) {
    // Graceful offline fallback
    allTreatments = FALLBACK_TREATMENTS;
    renderTreatments('all');
    populateTreatmentSelect(allTreatments);
  }
}

function renderTreatments(filter) {
  const grid = qs('#treatments-grid');
  if (!grid) return;
  const list = filter === 'all' ? allTreatments : allTreatments.filter(t => t.category === filter);
  if (!list.length) { grid.innerHTML = '<p class="error-msg">No treatments in this category.</p>'; return; }

  grid.innerHTML = list.map(t => `
    <article class="treatment-card" data-category="${escHtml(t.category)}">
      <div class="treatment-thumb" style="--c1:${thumbColor(t.category,0)};--c2:${thumbColor(t.category,1)}">
        <span class="treatment-emoji" aria-hidden="true">${escHtml(t.emoji || '🦷')}</span>
      </div>
      <div class="treatment-body">
        <h3>${escHtml(t.name)}</h3>
        <p>${escHtml(t.description)}</p>
        <div class="treatment-footer">
          <span class="price">from £${t.price_from}</span>
          <div class="treatment-actions">
            <button class="btn btn-outline btn-sm" onclick="openTreatmentModal(${t.id})">Learn more</button>
            <a class="btn btn-primary btn-sm" href="#book" onclick="preselectTreatment(${t.id})">Book now</a>
          </div>
        </div>
      </div>
    </article>
  `).join('');

  // Re-observe for reveal animation
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
    }, { threshold: 0.1 });
    qsa('.treatment-card').forEach(el => { el.classList.add('reveal'); obs.observe(el); });
  }
}

function thumbColor(cat, idx) {
  const palette = {
    general:    ['#0e7c7b','#0a5e5d'],
    cosmetic:   ['#1a8fa0','#0e7c7b'],
    restorative:['#0a5e5d','#083f3f'],
    emergency:  ['#e4572e','#c0392b'],
  };
  return (palette[cat] || palette.general)[idx];
}

// Filter chips
document.addEventListener('DOMContentLoaded', () => {
  qsa('.filter-chips .chip').forEach(chip => {
    chip.addEventListener('click', () => {
      qsa('.filter-chips .chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      renderTreatments(chip.dataset.filter);
    });
  });
});

/* ─── TREATMENT MODAL ────────────────────────────────────────────────────── */
function openTreatmentModal(id) {
  const t = allTreatments.find(x => x.id === id);
  if (!t) return;
  const content = qs('#modal-content');
  content.innerHTML = `
    <div class="modal-treatment-header" style="background:linear-gradient(135deg,${thumbColor(t.category,0)},${thumbColor(t.category,1)})">
      <span style="font-size:3rem">${escHtml(t.emoji||'🦷')}</span>
      <h2 id="modal-title" style="color:#fff;margin:12px 0 4px">${escHtml(t.name)}</h2>
      <span class="price" style="color:rgba(255,255,255,.9)">from £${t.price_from}${t.price_to ? ' – £'+t.price_to : ''}</span>
    </div>
    <div class="modal-body">
      <p>${escHtml(t.description)}</p>
      ${t.details ? `<p style="margin-top:12px;color:var(--muted)">${escHtml(t.details)}</p>` : ''}
      <div class="modal-meta">
        <div class="meta-item">⏱ ${t.duration_min} minutes</div>
        <div class="meta-item">🏷 £${t.price_from}${t.price_to ? ' – £'+t.price_to : '+'}</div>
      </div>
      <a class="btn btn-primary btn-lg" href="#book" style="margin-top:20px;width:100%;justify-content:center"
         onclick="preselectTreatment(${t.id});closeModal()">Book this treatment →</a>
    </div>
  `;
  const modal = qs('#treatment-modal');
  modal.hidden = false;
  modal.removeAttribute('hidden');
  document.body.style.overflow = 'hidden';
  setTimeout(() => { modal.classList.add('open'); qs('.modal-close').focus(); }, 10);
}

function closeModal() {
  const modal = qs('#treatment-modal');
  modal.classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(() => { modal.hidden = true; }, 220);
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
window.openTreatmentModal = openTreatmentModal;
window.closeModal = closeModal;

/* ─── LOAD CLINICIANS ────────────────────────────────────────────────────── */
async function loadClinicians() {
  const grid = qs('#team-grid');
  const sel = qs('#f-clinician');
  let list = [];
  try {
    const data = await apiFetch('/clinicians');
    list = data.clinicians || data.data || [];
  } catch {
    list = FALLBACK_CLINICIANS;
  }

  if (grid) {
    grid.innerHTML = list.map(c => `
      <div class="team-card">
        <div class="team-avatar" aria-hidden="true">${c.name.charAt(0)}</div>
        <h3>${escHtml(c.title)} ${escHtml(c.name)}</h3>
        <p class="team-specialty">${escHtml(c.specialty || '')}</p>
        <p class="team-bio">${escHtml(c.bio || '')}</p>
        <a class="btn btn-outline btn-sm" href="#book" onclick="preselectClinician(${c.id})">Book with ${escHtml(c.title)} ${escHtml(c.name)}</a>
      </div>
    `).join('');
  }
  if (sel) {
    sel.innerHTML = '<option value="" selected>Any available dentist</option>';
    list.forEach(c => {
      const o = document.createElement('option');
      o.value = c.id;
      o.textContent = `${c.title} ${c.name} — ${c.specialty}`;
      sel.appendChild(o);
    });
  }
}

function preselectClinician(id) {
  const sel = qs('#f-clinician');
  if (sel) sel.value = id;
  setTimeout(() => goToStep(1), 100);
}
window.preselectClinician = preselectClinician;

function preselectTreatment(id) {
  const sel = qs('#f-treatment');
  if (sel) sel.value = id;
  setTimeout(() => goToStep(3), 100);
}
window.preselectTreatment = preselectTreatment;

/* ─── MULTI-STEP BOOKING FORM ────────────────────────────────────────────── */
let currentStep = 1;

window.goToStep = function(step) {
  if (step > currentStep && !validateStep(currentStep)) return;
  qsa('.form-step').forEach(s => s.classList.remove('active'));
  qs(`#step-${step}`)?.classList.add('active');
  qsa('.step-dot').forEach((d, i) => {
    d.classList.toggle('active', i + 1 <= step);
    d.classList.toggle('completed', i + 1 < step);
  });
  currentStep = step;
};

function validateStep(step) {
  if (step === 1) {
    const name = qs('#f-name').value.trim();
    const phone = qs('#f-phone').value.trim();
    const email = qs('#f-email').value.trim();
    let ok = true;
    setErr('err-name',  !name  ? 'Full name is required.' : '');
    setErr('err-phone', !phone ? 'Phone number is required.' : '');
    setErr('err-email', email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'Please enter a valid email.' : '');
    if (!name || !phone) ok = false;
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) ok = false;
    return ok;
  }
  if (step === 2) {
    const tid = qs('#f-treatment').value;
    setErr('err-treatment', !tid ? 'Please select a treatment.' : '');
    return !!tid;
  }
  if (step === 3) {
    const date = qs('#f-date').value;
    const time = qs('#f-time').value;
    setErr('err-date', !date ? 'Please select a date.' : '');
    setErr('err-time', !time ? 'Please select a time.' : '');
    return !!(date && time);
  }
  return true;
}

function setErr(id, msg) {
  const el = qs(`#${id}`);
  if (el) { el.textContent = msg; el.style.display = msg ? 'block' : 'none'; }
}

// Load availability when date or clinician changes
async function loadAvailability() {
  const date = qs('#f-date').value;
  const clinicianId = qs('#f-clinician').value;
  const timeSel = qs('#f-time');
  if (!date) return;
  timeSel.innerHTML = '<option value="" disabled selected>Loading…</option>';
  try {
    const params = new URLSearchParams({ date });
    if (clinicianId) params.set('clinician_id', clinicianId);
    const data = await apiFetch(`/availability?${params}`);
    timeSel.innerHTML = '<option value="" disabled selected>Select a time…</option>';
    data.slots.forEach(s => {
      const o = document.createElement('option');
      o.value = s.time;
      o.textContent = `${s.time}${!s.available ? ' — Not available' : ''}`;
      o.disabled = !s.available;
      timeSel.appendChild(o);
    });
  } catch {
    timeSel.innerHTML = '<option value="09:00">09:00</option><option value="10:30">10:30</option><option value="12:00">12:00</option><option value="14:15">14:15</option><option value="16:00">16:00</option><option value="17:30">17:30</option>';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const dateInput = qs('#f-date');
  if (dateInput) {
    dateInput.min = new Date().toISOString().slice(0,10);
    dateInput.addEventListener('change', loadAvailability);
  }
  qs('#f-clinician')?.addEventListener('change', loadAvailability);
});

// Booking form submit
qs('#booking-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!validateStep(3)) return;
  const form = e.target;
  const btn = qs('#submit-btn');
  const spinner = qs('#submit-spinner');
  const textEl = qs('#submit-text');
  btn.disabled = true;
  textEl.textContent = 'Sending…';
  spinner.hidden = false;

  const body = {
    name: qs('#f-name').value.trim(),
    phone: qs('#f-phone').value.trim(),
    email: qs('#f-email').value.trim() || undefined,
    treatment_id: parseInt(qs('#f-treatment').value),
    clinician_id: qs('#f-clinician').value ? parseInt(qs('#f-clinician').value) : undefined,
    date: qs('#f-date').value,
    time: qs('#f-time').value,
    notes: qs('#f-notes').value.trim() || undefined,
  };

  try {
    const data = await apiFetch('/appointments', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    renderBookingResult(data, body);
  } catch (err) {
    // If backend is offline or network fails, provide concept demo confirmation
    if (!err.fields) {
      const chosenT = allTreatments.find(x => x.id === body.treatment_id);
      const chosenC = FALLBACK_CLINICIANS.find(x => x.id === body.clinician_id);
      const demoData = {
        reference: 'NGD-' + Math.floor(10000 + Math.random() * 90000),
        patient_name: body.name,
        treatment: chosenT ? chosenT.name : 'Dental Consultation',
        clinician: chosenC ? `${chosenC.title} ${chosenC.name}` : 'Any Available Dentist',
        date: body.date,
        time: body.time,
        isDemo: true,
      };
      renderBookingResult(demoData, body);
    } else {
      const result = qs('#booking-result');
      result.innerHTML = `<div class="result-error">❌ ${escHtml(err.message || 'Something went wrong. Please check the form.')}</div>`;
      result.classList.add('show');
      Object.entries(err.fields).forEach(([k,v]) => {
        const errEl = qs(`#err-${k}`);
        if (errEl) { errEl.textContent = v; errEl.style.display = 'block'; }
      });
    }
  } finally {
    btn.disabled = false;
    textEl.textContent = 'Request appointment →';
    spinner.hidden = true;
  }
});

function renderBookingResult(data, body) {
  const result = qs('#booking-result');
  result.innerHTML = `
    <div class="result-header">
      <span class="result-tick">✅</span>
      <div>
        <strong>Appointment request received!</strong>
        <span>${data.isDemo ? 'Concept demo confirmation (connect backend for live database saving)' : 'Stored in database. Confirmation ' + (body.email ? 'emailed to ' + escHtml(body.email) : 'ready below')}.</span>
      </div>
    </div>
    <div class="result-ref">${escHtml(data.reference)}</div>
    <table class="result-table">
      <tr><td>Patient</td><td>${escHtml(data.patient_name)}</td></tr>
      <tr><td>Treatment</td><td>${escHtml(data.treatment)}</td></tr>
      <tr><td>Clinician</td><td>${escHtml(data.clinician)}</td></tr>
      <tr><td>Date</td><td>${formatDate(data.date)}</td></tr>
      <tr><td>Time</td><td>${escHtml(data.time)}</td></tr>
    </table>
    <p class="result-note">🔒 The practice will confirm your slot within 2 hours during opening hours. Keep your reference: <strong>${escHtml(data.reference)}</strong></p>
  `;
  result.classList.add('show');
  result.scrollIntoView({ behavior: 'smooth', block: 'center' });
  qs('#booking-form')?.reset();
  goToStep(1);
  showToast('Appointment request submitted! ✅');
}

/* ─── TRACK BOOKING ─────────────────────────────────────────────────────── */
window.trackBooking = async function() {
  const ref = qs('#track-ref').value.trim();
  const result = qs('#track-result');
  if (!ref) { result.innerHTML = '<p class="track-error">Please enter your booking reference.</p>'; return; }
  result.innerHTML = '<p class="track-loading">Looking up…</p>';
  try {
    const data = await apiFetch(`/appointments/lookup?ref=${encodeURIComponent(ref)}`);
    const a = data.appointment;
    const statusColors = { requested:'#f4a80a', confirmed:'#2a9d8f', cancelled:'#e4572e', completed:'#0e7c7b', dna:'#888' };
    result.innerHTML = `
      <div class="track-card">
        <div class="track-ref">${escHtml(a.reference)}</div>
        <span class="status-badge" style="background:${statusColors[a.status]||'#888'}">${a.status}</span>
        <table class="track-table">
          <tr><td>Patient</td><td>${escHtml(a.guest_name||'—')}</td></tr>
          <tr><td>Treatment</td><td>${escHtml(a.treatment||'—')}</td></tr>
          <tr><td>Requested</td><td>${formatDate(a.preferred_date)} · ${escHtml(a.preferred_time)}</td></tr>
          ${a.confirmed_date ? `<tr><td>Confirmed</td><td>${formatDate(a.confirmed_date)} · ${escHtml(a.confirmed_time)}</td></tr>` : ''}
        </table>
      </div>
    `;
  } catch (err) {
    result.innerHTML = `<p class="track-error">${escHtml(err.message || 'Booking not found.')}</p>`;
  }
};

/* ─── LOAD REVIEWS ───────────────────────────────────────────────────────── */
async function loadReviews() {
  const grid = qs('#reviews-grid');
  let reviews = [];
  try {
    const data = await apiFetch('/reviews');
    reviews = data.reviews || data.data || [];
  } catch {
    reviews = FALLBACK_REVIEWS;
  }

  if (!reviews.length) { if (grid) grid.innerHTML = '<p>No reviews yet.</p>'; return; }

  const avg = (reviews.reduce((s,r) => s + r.rating, 0) / reviews.length).toFixed(1);
  const qs_id = id => document.getElementById(id);
  if (qs_id('rating-big'))   qs_id('rating-big').textContent = avg;
  if (qs_id('rating-stars')) qs_id('rating-stars').textContent = '★'.repeat(Math.round(avg)) + '☆'.repeat(5 - Math.round(avg));
  if (qs_id('rating-count')) qs_id('rating-count').textContent = `Based on ${reviews.length} review${reviews.length !== 1 ? 's' : ''}`;
  if (qs_id('stat-rating'))  qs_id('stat-rating').textContent = `${avg}★`;

  if (grid) grid.innerHTML = reviews.map(r => `
    <article class="review-card">
      <div class="review-top">
        <div class="review-stars" aria-label="${r.rating} out of 5 stars">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</div>
        ${r.verified ? '<span class="verified-badge">✓ Verified</span>' : ''}
      </div>
      <blockquote><p>"${escHtml(r.body)}"</p></blockquote>
      <footer>
        <strong>${escHtml(r.reviewer_name)}</strong>
        ${r.treatment ? ` · ${escHtml(r.treatment)}` : ''}
        <br><small>${new Date(r.created_at).toLocaleDateString('en-GB',{month:'long',year:'numeric'})}</small>
      </footer>
    </article>
  `).join('');
}

/* ─── STAR RATING WIDGET ─────────────────────────────────────────────────── */
(function initStarRating() {
  const container = qs('#star-rating');
  if (!container) return;
  let selected = 0;
  qsa('.star', container).forEach(star => {
    star.addEventListener('mouseenter', () => highlightStars(+star.dataset.val));
    star.addEventListener('mouseleave', () => highlightStars(selected));
    star.addEventListener('click', () => {
      selected = +star.dataset.val;
      qs('#rv-rating').value = selected;
      highlightStars(selected);
    });
  });
  function highlightStars(n) {
    qsa('.star', container).forEach(s => s.classList.toggle('active', +s.dataset.val <= n));
  }
})();

/* ─── REVIEW FORM SUBMIT ─────────────────────────────────────────────────── */
qs('#review-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const rating = qs('#rv-rating').value;
  const result = qs('#review-result');
  if (!rating) { result.textContent = 'Please select a star rating.'; result.style.color = 'var(--danger)'; return; }
  const body = {
    reviewer_name: qs('#rv-name').value.trim(),
    rating: parseInt(rating),
    body: qs('#rv-body').value.trim(),
    reference: qs('#rv-ref').value.trim() || undefined,
  };
  try {
    const data = await apiFetch('/reviews', { method: 'POST', body: JSON.stringify(body) });
    result.textContent = data.message;
    result.style.color = 'var(--success)';
    form.reset();
    qsa('.star').forEach(s => s.classList.remove('active'));
    qs('#rv-rating').value = '';
    if (body.reference) loadReviews();
    showToast('Review submitted! Thank you.');
  } catch (err) {
    result.textContent = err.message || 'Could not submit review. Please try again.';
    result.style.color = 'var(--danger)';
  }
});

/* ─── FAQ SEARCH ─────────────────────────────────────────────────────────── */
qs('#faq-search')?.addEventListener('input', function() {
  const q = this.value.toLowerCase();
  qsa('#faq-list details').forEach(d => {
    const text = d.textContent.toLowerCase();
    d.style.display = text.includes(q) ? '' : 'none';
  });
});

/* ─── NEWSLETTER ─────────────────────────────────────────────────────────── */
qs('#newsletter-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = e.target.querySelector('[name=email]').value.trim();
  const result = qs('#nl-result');
  try {
    const data = await apiFetch('/newsletter/subscribe', { method: 'POST', body: JSON.stringify({ email }) });
    result.textContent = data.message;
    result.style.color = '#fff';
    e.target.reset();
  } catch (err) {
    result.textContent = err.message || 'Could not subscribe. Please try again.';
    result.style.color = '#ffd166';
  }
});

/* ─── CONTACT FORM ───────────────────────────────────────────────────────── */
qs('#contact-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const result = qs('#contact-result');
  const body = {
    name:    qs('#ct-name').value.trim(),
    email:   qs('#ct-email').value.trim(),
    phone:   qs('#ct-phone').value.trim() || undefined,
    subject: qs('#ct-subject').value,
    message: qs('#ct-message').value.trim(),
  };
  if (!body.name || !body.email || !body.subject || !body.message) {
    result.textContent = 'Please fill in all required fields.';
    result.style.color = 'var(--danger)';
    return;
  }
  try {
    const data = await apiFetch('/contact', { method: 'POST', body: JSON.stringify(body) });
    result.textContent = data.message;
    result.style.color = 'var(--success)';
    e.target.reset();
    showToast('Message sent! We\'ll reply within one business day.');
  } catch (err) {
    result.textContent = err.message || 'Could not send message. Please call us instead.';
    result.style.color = 'var(--danger)';
  }
});

/* ─── INIT ───────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  await Promise.allSettled([loadTreatments(), loadClinicians(), loadReviews()]);
});
