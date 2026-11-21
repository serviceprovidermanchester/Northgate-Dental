/**
 * admin.js — Northgate Dental Admin Dashboard
 * ═════════════════════════════════════════════
 * Vanilla ES6+, zero external libraries.
 * Single-page admin shell with client-side routing.
 *
 * Pages:   dashboard | appointments | treatments | reviews | messages
 *          newsletter | settings
 *
 * Auth:    JWT stored in localStorage; every API call includes Bearer token.
 *          Expired/missing token → redirect to login screen.
 *
 * @author  SPManchester Private Limited <info@spmanchester.com>
 * @see     https://spmanchester.com/
 */

'use strict';

/* ─── API base ─────────────────────────────────────────────────────────────── */
const API = window.location.port === '5500'
  ? 'http://localhost:3000/api'
  : '/api';

/* ─── State ────────────────────────────────────────────────────────────────── */
const state = {
  token     : null,
  admin     : null,
  activePage: null,
};

/* ═════════════════════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════════════════════ */

/** Escape HTML to prevent XSS when inserting untrusted content. */
function escHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Format ISO date string → readable date. */
function formatDate(str) {
  if (!str) return '—';
  try {
    return new Date(str).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  } catch { return str; }
}

/** Format ISO datetime string → readable date + time. */
function formatDateTime(str) {
  if (!str) return '—';
  try {
    return new Date(str).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return str; }
}

/** Format a date string as YYYY-MM-DD for <input type=date>. */
function toInputDate(str) {
  if (!str) return '';
  try { return new Date(str).toISOString().slice(0, 10); }
  catch { return ''; }
}

/** Status badge HTML. */
function badge(status) {
  const map = {
    requested : 'badge-requested',
    confirmed : 'badge-confirmed',
    cancelled : 'badge-cancelled',
    completed : 'badge-completed',
    dna       : 'badge-dna',
    pending   : 'badge-pending',
    approved  : 'badge-approved',
    hidden    : 'badge-hidden',
    read      : 'badge-read',
    unread    : 'badge-unread',
    active    : 'badge-active',
    inactive  : 'badge-inactive',
    superadmin: 'badge-superadmin',
    admin     : 'badge-admin',
  };
  const cls = map[status] || 'badge-pending';
  return `<span class="badge ${cls}">${escHtml(status)}</span>`;
}

/** Star display (1–5). */
function stars(n) {
  const full  = '★'.repeat(Math.min(5, Math.max(0, n)));
  const empty = '☆'.repeat(5 - full.length);
  return `<span class="stars">${full}${empty}</span>`;
}

/** Show a toast notification. type = 'success' | 'error' | 'warning' | 'info' */
function showToast(msg, type = 'info') {
  const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
  const container = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `<span class="toast-icon">${icons[type] || 'ℹ'}</span>
                  <span class="toast-msg">${escHtml(msg)}</span>`;
  container.appendChild(el);
  setTimeout(() => {
    el.classList.add('removing');
    el.addEventListener('animationend', () => el.remove(), { once: true });
  }, 4000);
}

/** Authenticated fetch wrapper. Throws on HTTP errors. */
async function apiFetch(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  if (state.token) headers['Authorization'] = `Bearer ${state.token}`;
  const res = await fetch(`${API}${path}`, { ...opts, headers });

  if (res.status === 401) {
    // Token expired or invalid → force logout
    doLogout(true);
    throw new Error('Session expired. Please log in again.');
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || data.message || `HTTP ${res.status}`);
  return data;
}

/** Render "Loading…" row spanning n columns. */
function loadingRow(cols = 6) {
  return `<tr class="loading-row"><td colspan="${cols}">
    <span class="spinner"></span> Loading…
  </td></tr>`;
}

/** Render "No records" empty row. */
function emptyRow(msg = 'No records found.', cols = 6) {
  return `<tr><td colspan="${cols}" class="text-muted" style="text-align:center;padding:2rem">
    ${escHtml(msg)}
  </td></tr>`;
}

/** Build a simple HTML bar chart from [{label, value}] data. */
function buildBarChart(data) {
  if (!data || !data.length) return '<p class="text-muted text-sm">No data yet.</p>';
  const max = Math.max(...data.map(d => d.value), 1);
  return `<div class="bar-chart">
    ${data.map(d => {
      const pct = Math.round((d.value / max) * 140);
      return `<div class="bar-col">
        <div class="bar" style="height:${pct}px">
          <span class="bar-tooltip">${escHtml(d.label)}: ${d.value}</span>
        </div>
        <span class="bar-label">${escHtml(d.label)}</span>
      </div>`;
    }).join('')}
  </div>`;
}

/* ═════════════════════════════════════════════════════════════════════════════
   AUTH
═══════════════════════════════════════════════════════════════════════════════ */

function doLogout(expired = false) {
  state.token = null;
  state.admin = null;
  localStorage.removeItem('ngd-admin-token');
  localStorage.removeItem('ngd-admin-info');
  showLoginScreen();
  if (expired) showToast('Your session has expired. Please log in again.', 'warning');
}

function showLoginScreen() {
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('app-shell').classList.add('hidden');
}

function showAppShell() {
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('app-shell').classList.remove('hidden');
  updateSidebarUser();
  startClock();
  navigateTo('dashboard');
}

async function handleLogin(e) {
  e.preventDefault();
  const form   = e.target;
  const btn    = form.querySelector('button[type=submit]');
  const errEl  = document.getElementById('login-error');
  errEl.classList.add('hidden');

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Signing in…';

  try {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body  : JSON.stringify({
        email   : form.email.value.trim(),
        password: form.password.value,
      }),
    });

    state.token = data.token;
    state.admin = data.admin;
    localStorage.setItem('ngd-admin-token', data.token);
    localStorage.setItem('ngd-admin-info', JSON.stringify(data.admin));
    showAppShell();
  } catch (err) {
    errEl.textContent = err.message || 'Login failed. Check your credentials.';
    errEl.classList.remove('hidden');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Sign In';
  }
}

function tryRestoreSession() {
  const token = localStorage.getItem('ngd-admin-token');
  const info  = localStorage.getItem('ngd-admin-info');
  if (token && info) {
    try {
      state.token = token;
      state.admin = JSON.parse(info);
      showAppShell();
      return true;
    } catch { /* fall through */ }
  }
  return false;
}

/* ═════════════════════════════════════════════════════════════════════════════
   SIDEBAR + HEADER
═══════════════════════════════════════════════════════════════════════════════ */

function updateSidebarUser() {
  if (!state.admin) return;
  const name   = state.admin.name || state.admin.email || 'Admin';
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const el = document.querySelector('.sidebar-username');
  if (el) el.textContent = name;
  const roleEl = document.querySelector('.sidebar-role');
  if (roleEl) roleEl.textContent = state.admin.role || 'admin';
  const avEl = document.querySelector('.sidebar-avatar');
  if (avEl) avEl.textContent = initials;
}

/** Update the live clock in the header every second. */
function startClock() {
  const el = document.getElementById('header-time');
  if (!el) return;
  const tick = () => {
    el.textContent = new Date().toLocaleTimeString('en-GB', {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  };
  tick();
  setInterval(tick, 1000);
}

/** Set the sidebar active item and update the page title. */
function setSidebarActive(page) {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === page);
  });
  const titles = {
    dashboard   : '📊 Dashboard',
    appointments: '📅 Appointments',
    treatments  : '🦷 Treatments',
    reviews     : '⭐ Reviews',
    messages    : '✉️ Messages',
    newsletter  : '📰 Newsletter',
    settings    : '⚙️ Settings',
  };
  const titleEl = document.getElementById('page-title');
  if (titleEl) titleEl.textContent = titles[page] || page;
}

/** Sidebar toggle for mobile. */
function toggleSidebar() {
  const sidebar  = document.getElementById('sidebar');
  const overlay  = document.getElementById('sidebar-overlay');
  const isOpen   = sidebar.classList.contains('open');
  sidebar.classList.toggle('open', !isOpen);
  overlay.classList.toggle('open', !isOpen);
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('open');
}

/* ═════════════════════════════════════════════════════════════════════════════
   CLIENT-SIDE ROUTER
═══════════════════════════════════════════════════════════════════════════════ */

const pages = {
  dashboard   : renderDashboard,
  appointments: renderAppointments,
  treatments  : renderTreatments,
  reviews     : renderReviews,
  messages    : renderMessages,
  newsletter  : renderNewsletter,
  settings    : renderSettings,
};

function navigateTo(page) {
  if (!pages[page]) page = 'dashboard';
  state.activePage = page;
  setSidebarActive(page);
  closeSidebar();

  const main = document.getElementById('page-main');
  main.innerHTML = `<div class="page-loading"><span class="spinner"></span> Loading…</div>`;
  pages[page](main);
}

/* ═════════════════════════════════════════════════════════════════════════════
   PAGE: DASHBOARD
═══════════════════════════════════════════════════════════════════════════════ */

async function renderDashboard(container) {
  container.innerHTML = `<div class="page-loading"><span class="spinner"></span> Fetching stats…</div>`;
  try {
    const data = await apiFetch('/admin/stats');
    const s    = data.stats || {};

    container.innerHTML = `
      <div class="page-header"><h2>Overview</h2></div>

      <div class="stat-grid">
        <div class="stat-card stat-info">
          <div class="stat-label">Total Appointments</div>
          <div class="stat-value">${s.appointments?.total ?? 0}</div>
          <div class="stat-sub">all time</div>
          <div class="stat-icon">📅</div>
        </div>
        <div class="stat-card stat-warning">
          <div class="stat-label">Requested</div>
          <div class="stat-value">${s.appointments?.requested ?? 0}</div>
          <div class="stat-sub">awaiting confirmation</div>
          <div class="stat-icon">🕐</div>
        </div>
        <div class="stat-card stat-success">
          <div class="stat-label">Confirmed</div>
          <div class="stat-value">${s.appointments?.confirmed ?? 0}</div>
          <div class="stat-sub">upcoming</div>
          <div class="stat-icon">✓</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Today</div>
          <div class="stat-value">${s.appointments?.today ?? 0}</div>
          <div class="stat-sub">appointments today</div>
          <div class="stat-icon">📆</div>
        </div>
        <div class="stat-card stat-warning">
          <div class="stat-label">Pending Reviews</div>
          <div class="stat-value">${s.reviews?.pending ?? 0}</div>
          <div class="stat-sub">need moderation</div>
          <div class="stat-icon">⭐</div>
        </div>
        <div class="stat-card stat-info">
          <div class="stat-label">Unread Messages</div>
          <div class="stat-value">${s.messages?.unread ?? 0}</div>
          <div class="stat-sub">contact enquiries</div>
          <div class="stat-icon">✉️</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Subscribers</div>
          <div class="stat-value">${s.newsletter?.active ?? 0}</div>
          <div class="stat-sub">newsletter signups</div>
          <div class="stat-icon">📰</div>
        </div>
      </div>

      <div class="dashboard-grid">
        <div class="chart-card">
          <h3>Appointments by Treatment</h3>
          <div id="chart-treatments"></div>
        </div>
        <div class="chart-card">
          <h3>Appointments by Status</h3>
          <div id="chart-status"></div>
        </div>
      </div>

      <div class="table-card">
        <div class="table-card-header">
          <h3>Recent Appointment Requests</h3>
          <button class="btn btn-secondary btn-sm" onclick="navigateTo('appointments')">View All →</button>
        </div>
        <div class="table-wrap">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Reference</th><th>Patient</th><th>Treatment</th>
                <th>Date</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody id="recent-appts-body">
              ${loadingRow(6)}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Build charts from byTreatment / byStatus data
    const treatmentChart = (s.appointments?.byTreatment || []).map(r => ({
      label: r.treatment_name || r.treatment || 'Unknown',
      value: r.count,
    }));
    const statusChart = (s.appointments?.byStatus || []).map(r => ({
      label: r.status,
      value: r.count,
    }));

    document.getElementById('chart-treatments').innerHTML = buildBarChart(treatmentChart);
    document.getElementById('chart-status').innerHTML     = buildBarChart(statusChart);

    // Fetch recent appointments
    try {
      const aData = await apiFetch('/appointments?limit=8');
      const appts = aData.appointments || aData.data || [];
      const tbody = document.getElementById('recent-appts-body');
      if (!appts.length) {
        tbody.innerHTML = emptyRow('No appointments yet.', 6);
      } else {
        tbody.innerHTML = appts.map(a => `
          <tr>
            <td><span class="ref-code">${escHtml(a.reference)}</span></td>
            <td>${escHtml(a.patient_name)}</td>
            <td>${escHtml(a.treatment_name || a.treatment)}</td>
            <td>${formatDate(a.preferred_date)}</td>
            <td>${badge(a.status)}</td>
            <td>
              ${a.status === 'requested' ? `<button class="btn btn-success btn-xs" onclick="openConfirmModal('${escHtml(a.reference)}')">Confirm</button>` : ''}
            </td>
          </tr>`).join('');
      }
    } catch { /* non-fatal */ }

  } catch (err) {
    container.innerHTML = `<div class="callout callout-danger">Failed to load dashboard: ${escHtml(err.message)}</div>`;
  }
}

/* ═════════════════════════════════════════════════════════════════════════════
   PAGE: APPOINTMENTS
═══════════════════════════════════════════════════════════════════════════════ */

let apptFilters = { status: '', date: '', search: '' };

async function renderAppointments(container) {
  container.innerHTML = `
    <div class="page-header"><h2>Appointments</h2></div>

    <div class="filter-bar">
      <select class="form-control" id="filter-status" onchange="apptFilters.status=this.value;loadAppointments()">
        <option value="">All Statuses</option>
        <option value="requested">Requested</option>
        <option value="confirmed">Confirmed</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
        <option value="dna">DNA</option>
      </select>
      <input type="date" class="form-control" id="filter-date"
             oninput="apptFilters.date=this.value;loadAppointments()" style="width:auto">
      <div class="search-wrap">
        <span class="search-icon">🔍</span>
        <input type="search" class="form-control" id="filter-search" placeholder="Reference or patient…"
               oninput="apptFilters.search=this.value;loadAppointments()">
      </div>
      <button class="btn btn-secondary btn-sm" onclick="apptFilters={status:'',date:'',search:''};
        document.getElementById('filter-status').value='';
        document.getElementById('filter-date').value='';
        document.getElementById('filter-search').value='';
        loadAppointments()">Clear</button>
    </div>

    <div class="table-card">
      <div class="table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Reference</th>
              <th>Patient</th>
              <th>Phone</th>
              <th>Treatment</th>
              <th>Clinician</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="appts-table-body">${loadingRow(9)}</tbody>
        </table>
      </div>
    </div>

    <!-- Confirm Modal (injected here) -->
    <div class="modal-backdrop hidden" id="confirm-modal">
      <div class="modal">
        <div class="modal-header">
          <h3>Confirm Appointment</h3>
          <button class="modal-close" onclick="closeModal('confirm-modal')">✕</button>
        </div>
        <div class="modal-body">
          <p class="text-sm text-muted mb-2">Reference: <strong id="modal-ref"></strong></p>
          <div class="form-group">
            <label for="modal-date">Confirmed Date <span class="req">*</span></label>
            <input type="date" id="modal-date" class="form-control">
          </div>
          <div class="form-group">
            <label for="modal-time">Confirmed Time <span class="req">*</span></label>
            <select id="modal-time" class="form-control">
              <option value="">Select time…</option>
              <option value="09:00">09:00</option><option value="09:30">09:30</option>
              <option value="10:00">10:00</option><option value="10:30">10:30</option>
              <option value="11:00">11:00</option><option value="11:30">11:30</option>
              <option value="12:00">12:00</option><option value="13:00">13:00</option>
              <option value="13:30">13:30</option><option value="14:00">14:00</option>
              <option value="14:30">14:30</option><option value="15:00">15:00</option>
              <option value="15:30">15:30</option><option value="16:00">16:00</option>
              <option value="16:30">16:30</option><option value="17:00">17:00</option>
            </select>
          </div>
          <div class="form-group">
            <label for="modal-notes">Admin Notes (optional)</label>
            <textarea id="modal-notes" class="form-control" rows="2"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('confirm-modal')">Cancel</button>
          <button class="btn btn-success" id="modal-confirm-btn" onclick="submitConfirm()">✓ Confirm Appointment</button>
        </div>
      </div>
    </div>
  `;
  loadAppointments();
}

async function loadAppointments() {
  const tbody = document.getElementById('appts-table-body');
  if (!tbody) return;
  tbody.innerHTML = loadingRow(9);
  try {
    const params = new URLSearchParams();
    if (apptFilters.status) params.set('status', apptFilters.status);
    if (apptFilters.date)   params.set('date',   apptFilters.date);
    if (apptFilters.search) params.set('search',  apptFilters.search);

    const data  = await apiFetch(`/appointments?${params}`);
    const appts = data.appointments || data.data || [];
    if (!appts.length) { tbody.innerHTML = emptyRow('No appointments match your filters.', 9); return; }

    tbody.innerHTML = appts.map(a => `
      <tr id="arow-${escHtml(a.reference)}">
        <td><span class="ref-code">${escHtml(a.reference)}</span></td>
        <td>${escHtml(a.patient_name)}</td>
        <td><a href="tel:${escHtml(a.patient_phone)}">${escHtml(a.patient_phone)}</a></td>
        <td>${escHtml(a.treatment_name || a.treatment)}</td>
        <td>${escHtml(a.clinician_name || a.clinician)}</td>
        <td>${formatDate(a.preferred_date)}</td>
        <td>${escHtml(a.preferred_time || '—')}</td>
        <td>${badge(a.status)}</td>
        <td><div class="btn-group">${apptActions(a)}</div></td>
      </tr>`).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="9" class="text-muted" style="text-align:center;padding:1rem">
      Error: ${escHtml(err.message)}</td></tr>`;
  }
}

function apptActions(a) {
  const ref = a.reference;
  let btns = '';
  if (a.status === 'requested') {
    btns += `<button class="btn btn-success btn-xs" onclick="openConfirmModal('${ref}')">Confirm</button>`;
    btns += `<button class="btn btn-danger btn-xs" onclick="patchAppt('${ref}','cancel')">Cancel</button>`;
  }
  if (a.status === 'confirmed') {
    btns += `<button class="btn btn-primary btn-xs" onclick="patchAppt('${ref}','complete')">Complete</button>`;
    btns += `<button class="btn btn-warning btn-xs" onclick="patchAppt('${ref}','dna')">DNA</button>`;
    btns += `<button class="btn btn-danger btn-xs" onclick="patchAppt('${ref}','cancel')">Cancel</button>`;
  }
  return btns || `<span class="text-muted text-xs">${a.status}</span>`;
}

async function patchAppt(ref, action) {
  const urlMap = {
    cancel  : `/appointments/${ref}/cancel`,
    complete: `/appointments/${ref}/status`,
    dna     : `/appointments/${ref}/status`,
  };
  const bodyMap = {
    cancel  : { reason: 'Cancelled by admin' },
    complete: { status: 'completed' },
    dna     : { status: 'dna' },
  };
  try {
    await apiFetch(urlMap[action], { method: 'PATCH', body: JSON.stringify(bodyMap[action]) });
    showToast(`Appointment ${ref} updated.`, 'success');
    loadAppointments();
  } catch (err) {
    showToast(`Failed: ${err.message}`, 'error');
  }
}

let modalRef = null;

function openConfirmModal(ref) {
  modalRef = ref;
  document.getElementById('modal-ref').textContent = ref;
  document.getElementById('modal-date').value  = '';
  document.getElementById('modal-time').value  = '';
  document.getElementById('modal-notes').value = '';
  document.getElementById('confirm-modal').classList.remove('hidden');
}

async function submitConfirm() {
  const date  = document.getElementById('modal-date').value;
  const time  = document.getElementById('modal-time').value;
  const notes = document.getElementById('modal-notes').value;
  if (!date || !time) { showToast('Please select both date and time.', 'warning'); return; }

  const btn = document.getElementById('modal-confirm-btn');
  btn.disabled = true;
  try {
    await apiFetch(`/appointments/${modalRef}/confirm`, {
      method: 'PATCH',
      body  : JSON.stringify({ confirmedDate: date, confirmedTime: time, adminNotes: notes }),
    });
    showToast(`Appointment ${modalRef} confirmed.`, 'success');
    closeModal('confirm-modal');
    loadAppointments();
  } catch (err) {
    showToast(`Failed: ${err.message}`, 'error');
  } finally {
    btn.disabled = false;
  }
}

function closeModal(id) {
  document.getElementById(id)?.classList.add('hidden');
}

/* ═════════════════════════════════════════════════════════════════════════════
   PAGE: TREATMENTS
═══════════════════════════════════════════════════════════════════════════════ */

async function renderTreatments(container) {
  container.innerHTML = `
    <div class="page-header"><h2>Treatments & Fees</h2></div>
    <div class="callout callout-info">ℹ️ Fees shown are sample / concept prices. Update them here for a live build.</div>
    <div class="table-card">
      <div class="table-wrap">
        <table class="admin-table">
          <thead>
            <tr><th>Treatment</th><th>Category</th><th>Duration</th><th>Fee</th><th>Actions</th></tr>
          </thead>
          <tbody id="treatments-body">${loadingRow(5)}</tbody>
        </table>
      </div>
    </div>`;
  loadTreatments();
}

async function loadTreatments() {
  const tbody = document.getElementById('treatments-body');
  if (!tbody) return;
  try {
    const data = await apiFetch('/treatments');
    const list = data.treatments || data.data || [];
    if (!list.length) { tbody.innerHTML = emptyRow('No treatments found.', 5); return; }
    tbody.innerHTML = list.map(t => `
      <tr id="trow-${t.id}">
        <td><strong>${escHtml(t.name)}</strong><br>
            <span class="text-muted text-xs">${escHtml(t.slug || '')}</span></td>
        <td>${escHtml(t.category || '—')}</td>
        <td>${escHtml(t.duration_minutes ? t.duration_minutes + ' min' : '—')}</td>
        <td id="fee-cell-${t.id}">
          <div class="inline-edit">
            <span class="price-display" id="fee-display-${t.id}">£${escHtml(String(t.fee ?? 0))}</span>
            <input type="number" class="form-control" id="fee-input-${t.id}" value="${t.fee ?? 0}"
                   min="0" step="5" style="display:none" onkeydown="if(event.key==='Enter')saveFee(${t.id})">
          </div>
        </td>
        <td><div class="btn-group">
          <button class="btn btn-secondary btn-xs" id="fee-edit-${t.id}" onclick="editFee(${t.id})">Edit</button>
          <button class="btn btn-primary btn-xs" id="fee-save-${t.id}" style="display:none" onclick="saveFee(${t.id})">Save</button>
          <button class="btn btn-ghost btn-xs" id="fee-cancel-${t.id}" style="display:none" onclick="cancelFee(${t.id})">✕</button>
        </div></td>
      </tr>`).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-muted" style="text-align:center;padding:1rem">${escHtml(err.message)}</td></tr>`;
  }
}

function editFee(id) {
  document.getElementById(`fee-display-${id}`).style.display = 'none';
  document.getElementById(`fee-input-${id}`).style.display   = '';
  document.getElementById(`fee-edit-${id}`).style.display    = 'none';
  document.getElementById(`fee-save-${id}`).style.display    = '';
  document.getElementById(`fee-cancel-${id}`).style.display  = '';
  document.getElementById(`fee-input-${id}`).focus();
}

function cancelFee(id) {
  document.getElementById(`fee-display-${id}`).style.display = '';
  document.getElementById(`fee-input-${id}`).style.display   = 'none';
  document.getElementById(`fee-edit-${id}`).style.display    = '';
  document.getElementById(`fee-save-${id}`).style.display    = 'none';
  document.getElementById(`fee-cancel-${id}`).style.display  = 'none';
}

async function saveFee(id) {
  const val = parseFloat(document.getElementById(`fee-input-${id}`).value);
  if (isNaN(val) || val < 0) { showToast('Invalid fee value.', 'warning'); return; }
  try {
    await apiFetch(`/treatments/${id}`, { method: 'PATCH', body: JSON.stringify({ fee: val }) });
    document.getElementById(`fee-display-${id}`).textContent = `£${val}`;
    cancelFee(id);
    showToast('Fee updated.', 'success');
  } catch (err) {
    showToast(`Failed: ${err.message}`, 'error');
  }
}

/* ═════════════════════════════════════════════════════════════════════════════
   PAGE: REVIEWS
═══════════════════════════════════════════════════════════════════════════════ */

async function renderReviews(container) {
  container.innerHTML = `
    <div class="page-header"><h2>Patient Reviews</h2></div>
    <div class="filter-bar">
      <select class="form-control" id="review-filter" onchange="loadReviews(this.value)" style="width:auto">
        <option value="">All</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="hidden">Hidden</option>
      </select>
    </div>
    <div class="table-card">
      <div class="table-wrap">
        <table class="admin-table">
          <thead>
            <tr><th>Patient</th><th>Rating</th><th>Review</th><th>Treatment</th><th>Date</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody id="reviews-body">${loadingRow(7)}</tbody>
        </table>
      </div>
    </div>`;
  loadReviews('');
}

async function loadReviews(statusFilter = '') {
  const tbody = document.getElementById('reviews-body');
  if (!tbody) return;
  tbody.innerHTML = loadingRow(7);
  try {
    const params = statusFilter ? `?status=${encodeURIComponent(statusFilter)}` : '';
    const data   = await apiFetch(`/reviews/all${params}`);
    const list   = data.reviews || data.data || [];
    if (!list.length) { tbody.innerHTML = emptyRow('No reviews found.', 7); return; }
    tbody.innerHTML = list.map(r => `
      <tr id="rrow-${r.id}">
        <td><strong>${escHtml(r.patient_name)}</strong><br>
            <span class="text-muted text-xs">${escHtml(r.patient_email || '')}</span></td>
        <td>${stars(r.rating)} <span class="text-xs text-muted">(${r.rating}/5)</span></td>
        <td style="max-width:260px"><div style="max-height:3.5rem;overflow:hidden">${escHtml(r.body)}</div></td>
        <td>${escHtml(r.treatment_name || '—')}</td>
        <td>${formatDate(r.created_at)}</td>
        <td>${badge(r.status)}</td>
        <td><div class="btn-group">
          ${r.status !== 'approved' ? `<button class="btn btn-success btn-xs" onclick="reviewAction(${r.id},'approve')">Approve</button>` : ''}
          ${r.status !== 'hidden'   ? `<button class="btn btn-warning btn-xs" onclick="reviewAction(${r.id},'hide')">Hide</button>` : ''}
          <button class="btn btn-danger btn-xs" onclick="reviewAction(${r.id},'delete')">Delete</button>
        </div></td>
      </tr>`).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-muted" style="text-align:center;padding:1rem">${escHtml(err.message)}</td></tr>`;
  }
}

async function reviewAction(id, action) {
  if (action === 'delete' && !confirm('Delete this review? This cannot be undone.')) return;
  try {
    if (action === 'delete') {
      await apiFetch(`/reviews/${id}`, { method: 'DELETE' });
    } else {
      await apiFetch(`/reviews/${id}/${action}`, { method: 'PATCH' });
    }
    showToast(`Review ${action}d.`, 'success');
    const statusFilter = document.getElementById('review-filter')?.value || '';
    loadReviews(statusFilter);
  } catch (err) {
    showToast(`Failed: ${err.message}`, 'error');
  }
}

/* ═════════════════════════════════════════════════════════════════════════════
   PAGE: MESSAGES (Contact)
═══════════════════════════════════════════════════════════════════════════════ */

async function renderMessages(container) {
  container.innerHTML = `
    <div class="page-header"><h2>Contact Messages</h2></div>
    <div class="table-card">
      <div class="table-wrap">
        <table class="admin-table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Phone</th><th>Subject</th><th>Message</th><th>Date</th><th>Status</th><th>Action</th></tr>
          </thead>
          <tbody id="messages-body">${loadingRow(8)}</tbody>
        </table>
      </div>
    </div>`;
  loadMessages();
}

async function loadMessages() {
  const tbody = document.getElementById('messages-body');
  if (!tbody) return;
  tbody.innerHTML = loadingRow(8);
  try {
    const data = await apiFetch('/contact');
    const list = data.messages || data.data || [];
    if (!list.length) { tbody.innerHTML = emptyRow('No messages yet.', 8); return; }
    tbody.innerHTML = list.map(m => `
      <tr id="mrow-${m.id}">
        <td><strong>${escHtml(m.name)}</strong></td>
        <td><a href="mailto:${escHtml(m.email)}">${escHtml(m.email)}</a></td>
        <td>${m.phone ? `<a href="tel:${escHtml(m.phone)}">${escHtml(m.phone)}</a>` : '—'}</td>
        <td>${escHtml(m.subject || '—')}</td>
        <td style="max-width:220px"><div style="max-height:3.5rem;overflow:hidden;white-space:pre-wrap">${escHtml(m.message)}</div></td>
        <td>${formatDateTime(m.created_at)}</td>
        <td>${badge(m.is_read ? 'read' : 'unread')}</td>
        <td>${!m.is_read
          ? `<button class="btn btn-secondary btn-xs" onclick="markRead(${m.id})">Mark Read</button>`
          : '—'}</td>
      </tr>`).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-muted" style="text-align:center;padding:1rem">${escHtml(err.message)}</td></tr>`;
  }
}

async function markRead(id) {
  try {
    await apiFetch(`/contact/${id}/read`, { method: 'PATCH' });
    showToast('Message marked as read.', 'success');
    loadMessages();
  } catch (err) {
    showToast(`Failed: ${err.message}`, 'error');
  }
}

/* ═════════════════════════════════════════════════════════════════════════════
   PAGE: NEWSLETTER
═══════════════════════════════════════════════════════════════════════════════ */

async function renderNewsletter(container) {
  container.innerHTML = `
    <div class="page-header"><h2>Newsletter Subscribers</h2></div>
    <div class="table-card">
      <div class="table-card-header">
        <h3>Subscriber List</h3>
        <button class="btn btn-secondary btn-sm" onclick="exportNewsletter()">⬇ Export CSV</button>
      </div>
      <div class="table-wrap">
        <table class="admin-table">
          <thead>
            <tr><th>#</th><th>Email</th><th>Name</th><th>Signed Up</th><th>Status</th></tr>
          </thead>
          <tbody id="newsletter-body">${loadingRow(5)}</tbody>
        </table>
      </div>
    </div>`;
  loadNewsletter();
}

async function loadNewsletter() {
  const tbody = document.getElementById('newsletter-body');
  if (!tbody) return;
  tbody.innerHTML = loadingRow(5);
  try {
    const data = await apiFetch('/newsletter/subscribers');
    const list = data.subscribers || data.data || [];
    if (!list.length) { tbody.innerHTML = emptyRow('No subscribers yet.', 5); return; }
    tbody.innerHTML = list.map((s, i) => `
      <tr>
        <td class="text-muted text-sm">${i + 1}</td>
        <td>${escHtml(s.email)}</td>
        <td>${escHtml(s.name || '—')}</td>
        <td>${formatDate(s.created_at)}</td>
        <td>${badge(s.unsubscribed_at ? 'inactive' : 'active')}</td>
      </tr>`).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-muted" style="text-align:center;padding:1rem">${escHtml(err.message)}</td></tr>`;
  }
}

async function exportNewsletter() {
  try {
    const data = await apiFetch('/newsletter/subscribers');
    const list = data.subscribers || data.data || [];
    if (!list.length) { showToast('No subscribers to export.', 'warning'); return; }

    const header = 'Email,Name,Signed Up,Status\n';
    const rows   = list.map(s => [
      s.email,
      s.name || '',
      s.created_at ? new Date(s.created_at).toISOString().slice(0, 10) : '',
      s.unsubscribed_at ? 'inactive' : 'active',
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `northgate-dental-subscribers-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('CSV exported.', 'success');
  } catch (err) {
    showToast(`Export failed: ${err.message}`, 'error');
  }
}

/* ═════════════════════════════════════════════════════════════════════════════
   PAGE: SETTINGS
═══════════════════════════════════════════════════════════════════════════════ */

async function renderSettings(container) {
  const admin = state.admin || {};
  container.innerHTML = `
    <div class="page-header"><h2>Account Settings</h2></div>

    <div class="form-card" style="max-width:520px">
      <h3>Admin Information</h3>
      <div class="form-group">
        <label>Name</label>
        <input type="text" class="form-control" value="${escHtml(admin.name || '')}" disabled>
      </div>
      <div class="form-group">
        <label>Email</label>
        <input type="email" class="form-control" value="${escHtml(admin.email || '')}" disabled>
      </div>
      <div class="form-group">
        <label>Role</label>
        <input type="text" class="form-control" value="${escHtml(admin.role || 'admin')}" disabled>
      </div>
    </div>

    <div class="form-card" style="max-width:520px">
      <h3>Change Password</h3>
      <form id="change-pw-form" onsubmit="handleChangePassword(event)">
        <div class="form-group">
          <label for="current-pw">Current Password <span class="req">*</span></label>
          <input type="password" id="current-pw" class="form-control" required autocomplete="current-password">
        </div>
        <div class="form-group">
          <label for="new-pw">New Password <span class="req">*</span></label>
          <input type="password" id="new-pw" class="form-control" required minlength="8" autocomplete="new-password">
          <span class="form-hint">Minimum 8 characters.</span>
        </div>
        <div class="form-group">
          <label for="confirm-pw">Confirm New Password <span class="req">*</span></label>
          <input type="password" id="confirm-pw" class="form-control" required minlength="8" autocomplete="new-password">
        </div>
        <button type="submit" class="btn btn-primary" id="pw-submit-btn">Update Password</button>
      </form>
    </div>

    <div class="form-card" style="max-width:520px">
      <h3>About This Build</h3>
      <dl style="display:grid;grid-template-columns:140px 1fr;gap:.5rem 1rem;font-size:.875rem">
        <dt class="text-muted">Project</dt>
        <dd>Northgate Dental — Concept Portfolio Site</dd>
        <dt class="text-muted">Version</dt>
        <dd>1.0.0</dd>
        <dt class="text-muted">Author</dt>
        <dd><a href="https://spmanchester.com/" target="_blank" rel="noopener">SPManchester Private Limited</a></dd>
        <dt class="text-muted">Contact</dt>
        <dd><a href="mailto:info@spmanchester.com">info@spmanchester.com</a></dd>
        <dt class="text-muted">GitHub</dt>
        <dd><a href="https://github.com/serviceprovidermanchester" target="_blank" rel="noopener">serviceprovidermanchester</a></dd>
        <dt class="text-muted">Node</dt>
        <dd id="node-ver">checking…</dd>
      </dl>
    </div>
  `;
  // Try to get server info
  apiFetch('/health').then(d => {
    const el = document.getElementById('node-ver');
    if (el) el.textContent = d.node || 'available';
  }).catch(() => {
    const el = document.getElementById('node-ver');
    if (el) el.textContent = 'unknown';
  });
}

async function handleChangePassword(e) {
  e.preventDefault();
  const current  = document.getElementById('current-pw').value;
  const newPw    = document.getElementById('new-pw').value;
  const confirm  = document.getElementById('confirm-pw').value;
  const btn      = document.getElementById('pw-submit-btn');

  if (newPw !== confirm) {
    showToast('New passwords do not match.', 'warning');
    return;
  }

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Updating…';
  try {
    await apiFetch('/auth/change-password', {
      method: 'POST',
      body  : JSON.stringify({ currentPassword: current, newPassword: newPw }),
    });
    showToast('Password updated successfully.', 'success');
    document.getElementById('change-pw-form').reset();
  } catch (err) {
    showToast(`Failed: ${err.message}`, 'error');
  } finally {
    btn.disabled    = false;
    btn.textContent = 'Update Password';
  }
}

/* ═════════════════════════════════════════════════════════════════════════════
   GLOBAL KEYBOARD / ESCAPE
═══════════════════════════════════════════════════════════════════════════════ */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-backdrop:not(.hidden)').forEach(el => el.classList.add('hidden'));
    closeSidebar();
  }
});

/* ═════════════════════════════════════════════════════════════════════════════
   BOOT
═══════════════════════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  /* ── Login form ── */
  document.getElementById('login-form')?.addEventListener('submit', handleLogin);

  /* ── Logout button ── */
  document.getElementById('logout-btn')?.addEventListener('click', () => doLogout());

  /* ── Sidebar navigation ── */
  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    item.addEventListener('click', () => navigateTo(item.dataset.page));
  });

  /* ── Sidebar toggle (mobile) ── */
  document.getElementById('sidebar-toggle')?.addEventListener('click', toggleSidebar);
  document.getElementById('sidebar-overlay')?.addEventListener('click', closeSidebar);

  /* ── Try to restore previous session, otherwise show login ── */
  if (!tryRestoreSession()) {
    showLoginScreen();
  }
});
