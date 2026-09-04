const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyZ0ICGEOPv1N2kmXF2x5kQbyEvUOVBko2dNBgezGkr3KrYW4DEPD2Hkz0gjJTC4jowHw/exec';

const PRINCIPAL_PASSWORD = 'JohnsAcademy@Principal2025';

// ── State ────────────────────────────────────────────────────────
let currentTab    = 'reviews';
let reviewPlans   = [];
let currentPlans  = [];
let openRows      = new Set();

// ── View helpers ─────────────────────────────────────────────────
function showView(id) {
  document.querySelectorAll('.view').forEach(v => {
    v.classList.remove('active');
    v.style.display = 'none';
  });
  const el = document.getElementById(id);
  el.classList.add('active');
  el.style.display = 'block';
}

// ── Tab switching ─────────────────────────────────────────────────
function switchTab(tab) {
  currentTab = tab;

  document.getElementById('tab-btn-reviews').classList.toggle('active', tab === 'reviews');
  document.getElementById('tab-btn-current').classList.toggle('active', tab === 'current');
  document.getElementById('tab-reviews').classList.toggle('hidden', tab !== 'reviews');
  document.getElementById('tab-current').classList.toggle('hidden', tab !== 'current');

  // Repopulate week filter and re-render for the newly active tab
  const plans = tab === 'reviews' ? reviewPlans : currentPlans;
  populateWeekFilter(plans);
  if (tab === 'reviews') renderReviews();
  else renderCurrentPlans();
}

// ── Login ────────────────────────────────────────────────────────
document.getElementById('login-form').addEventListener('submit', function (e) {
  e.preventDefault();
  const pwd = document.getElementById('password').value;
  if (pwd === PRINCIPAL_PASSWORD) {
    document.getElementById('login-error').classList.add('hidden');
    sessionStorage.setItem('principal_auth', 'true');
    showView('view-dashboard');
    switchTab('reviews');
  } else {
    document.getElementById('login-error').classList.remove('hidden');
    document.getElementById('password').value = '';
  }
});

document.getElementById('logout-btn').addEventListener('click', function () {
  sessionStorage.removeItem('principal_auth');
  document.getElementById('password').value = '';
  reviewPlans  = [];
  currentPlans = [];
  showView('view-login');
});

// ── Load ─────────────────────────────────────────────────────────
document.getElementById('load-btn').addEventListener('click', loadPlans);

async function loadPlans() {
  const school  = document.getElementById('school-filter').value;
  const loadBtn = document.getElementById('load-btn');

  loadBtn.disabled    = true;
  loadBtn.textContent = 'Loading…';
  document.getElementById('loading-msg').classList.remove('hidden');
  document.getElementById('tab-reviews').classList.add('hidden');
  document.getElementById('tab-current').classList.add('hidden');

  try {
    if (currentTab === 'reviews') {
      const url  = `${SCRIPT_URL}?action=getReviews&school=${encodeURIComponent(school)}`;
      const data = await fetch(url).then(r => r.json());
      if (data.status !== 'ok') throw new Error(data.message);
      reviewPlans = data.plans;
      populateWeekFilter(reviewPlans);
      renderReviews();
    } else {
      const url  = `${SCRIPT_URL}?action=getAllPlans&school=${encodeURIComponent(school)}`;
      const data = await fetch(url).then(r => r.json());
      if (data.status !== 'ok') throw new Error(data.message);
      currentPlans = data.plans;
      populateWeekFilter(currentPlans);
      renderCurrentPlans();
    }
  } catch (err) {
    alert('Could not load plans: ' + err.message);
    console.error(err);
  } finally {
    document.getElementById('loading-msg').classList.add('hidden');
    loadBtn.disabled    = false;
    loadBtn.textContent = 'Load Plans';
    // Re-show the active tab
    document.getElementById('tab-' + currentTab).classList.remove('hidden');
  }
}

// ── Week filter ───────────────────────────────────────────────────
function populateWeekFilter(plans) {
  const weeks  = [...new Set(plans.map(p => p.weekDate))].sort();
  const select = document.getElementById('week-filter');
  select.innerHTML = '<option value="">-- All weeks --</option>';
  weeks.forEach(w => {
    const opt = document.createElement('option');
    opt.value = opt.textContent = w;
    select.appendChild(opt);
  });
}

document.getElementById('week-filter').addEventListener('change', function () {
  if (currentTab === 'reviews') renderReviews();
  else renderCurrentPlans();
});

// ── TAB 1: Completed Reviews ──────────────────────────────────────
function renderReviews() {
  const weekFilter = document.getElementById('week-filter').value;
  const plans      = weekFilter ? reviewPlans.filter(p => p.weekDate === weekFilter) : reviewPlans;

  let totalCompleted = 0, totalPartial = 0, totalNotDone = 0, totalTracked = 0;
  plans.forEach(plan => {
    Object.values(plan.completionStatus || {}).forEach(s => {
      if (s === 'completed')      { totalCompleted++; totalTracked++; }
      else if (s === 'partial')   { totalPartial++;   totalTracked++; }
      else if (s === 'not-completed') { totalNotDone++; totalTracked++; }
    });
  });

  document.getElementById('stat-plans').textContent     = plans.length;
  document.getElementById('stat-completed').textContent = totalCompleted;
  document.getElementById('stat-partial').textContent   = totalPartial;
  document.getElementById('stat-notdone').textContent   = totalNotDone;
  document.getElementById('stat-rate').textContent      = totalTracked
    ? Math.round((totalCompleted / totalTracked) * 100) + '%' : '—';

  const tbody = document.getElementById('plans-tbody');
  tbody.innerHTML = '';
  openRows.clear();

  document.getElementById('empty-state-reviews').classList.toggle('hidden', plans.length > 0);
  if (plans.length === 0) return;

  plans.forEach((plan, idx) => {
    const status  = plan.completionStatus || {};
    const done    = Object.values(status).filter(s => s === 'completed').length;
    const partial = Object.values(status).filter(s => s === 'partial').length;
    const notDone = Object.values(status).filter(s => s === 'not-completed').length;
    const tracked = done + partial + notDone;
    const pct     = tracked ? Math.round((done / tracked) * 100) : null;

    const pillClass = pct === null ? 'grey' : pct >= 80 ? 'green' : pct >= 50 ? 'yellow' : 'red';
    const pillText  = pct === null ? '—' : pct + '%';

    const tr = document.createElement('tr');
    tr.className   = 'plan-row';
    tr.dataset.idx = idx;
    tr.dataset.tbl = 'reviews';
    tr.innerHTML   = `
      <td class="subject-cell">${escHtml(plan.subject)}</td>
      <td class="grade-cell">Grade ${escHtml(plan.grade)}</td>
      <td>${escHtml(plan.weekDate)}</td>
      <td><span class="pill green">${done}</span></td>
      <td><span class="pill yellow">${partial}</span></td>
      <td><span class="pill red">${notDone}</span></td>
      <td><span class="pill ${pillClass}">${pillText}</span></td>
      <td><button class="toggle-btn" data-idx="${idx}" data-tbl="reviews">▶ Details</button></td>`;
    tbody.appendChild(tr);

    const dtr = document.createElement('tr');
    dtr.className   = 'detail-row';
    dtr.dataset.idx = idx;
    dtr.dataset.tbl = 'reviews';
    dtr.innerHTML   = `<td class="detail-cell" colspan="8">${buildReviewDetailHTML(plan)}</td>`;
    tbody.appendChild(dtr);
  });
}

function buildReviewDetailHTML(plan) {
  const status = plan.completionStatus || {};
  const rows   = (plan.days || []).map(day => {
    if (day.isHoliday) {
      return `<tr>
        <td>${escHtml(day.label)}</td>
        <td colspan="3" style="color:#92400e;font-style:italic">Holiday</td>
        <td>—</td></tr>`;
    }
    const s    = status[day.day] || '';
    const icon = s === 'completed'     ? '<span style="color:#276749">✓ Completed</span>'
               : s === 'partial'       ? '<span style="color:#b7791f">◑ Partial</span>'
               : s === 'not-completed' ? '<span style="color:#9b2c2c">✗ Not Done</span>'
               :                        '<span style="color:#a0aec0">—</span>';
    return `<tr>
      <td>${escHtml(day.label)}</td>
      <td>${escHtml(day.topic) || '<span style="color:#a0aec0">—</span>'}</td>
      <td>${escHtml(day.activity) || '<span style="color:#a0aec0">—</span>'}</td>
      <td>${escHtml(day.assessment) || '<span style="color:#a0aec0">—</span>'}</td>
      <td>${icon}</td></tr>`;
  }).join('');

  return `<div class="detail-inner"><table class="detail-table">
    <thead><tr><th>Day</th><th>Topic</th><th>Activity</th><th>Assessment</th><th>Status</th></tr></thead>
    <tbody>${rows}</tbody></table></div>`;
}

// ── TAB 2: Current Week Plans ─────────────────────────────────────
function renderCurrentPlans() {
  const weekFilter = document.getElementById('week-filter').value;
  const plans      = weekFilter ? currentPlans.filter(p => p.weekDate === weekFilter) : currentPlans;

  const tbody = document.getElementById('current-tbody');
  tbody.innerHTML = '';
  openRows.clear();

  document.getElementById('empty-state-current').classList.toggle('hidden', plans.length > 0);
  if (plans.length === 0) return;

  plans.forEach((plan, idx) => {
    const daysPlanned = (plan.days || []).filter(d => !d.isHoliday).length;
    const reviewed    = plan.reviewedAt
      ? `<span class="pill green">Reviewed</span>`
      : `<span class="pill grey">Pending</span>`;

    const tr = document.createElement('tr');
    tr.className   = 'plan-row';
    tr.dataset.idx = idx;
    tr.dataset.tbl = 'current';
    tr.innerHTML   = `
      <td class="subject-cell">${escHtml(plan.subject)}</td>
      <td class="grade-cell">Grade ${escHtml(plan.grade)}</td>
      <td>${escHtml(plan.weekDate)}</td>
      <td><span class="pill blue-light">${daysPlanned} day${daysPlanned !== 1 ? 's' : ''}</span></td>
      <td>${reviewed}</td>
      <td><button class="toggle-btn" data-idx="${idx}" data-tbl="current">▶ Details</button></td>`;
    tbody.appendChild(tr);

    const dtr = document.createElement('tr');
    dtr.className   = 'detail-row';
    dtr.dataset.idx = idx;
    dtr.dataset.tbl = 'current';
    dtr.innerHTML   = `<td class="detail-cell" colspan="6">${buildCurrentDetailHTML(plan)}</td>`;
    tbody.appendChild(dtr);
  });
}

function buildCurrentDetailHTML(plan) {
  const rows = (plan.days || []).map(day => {
    if (day.isHoliday) {
      return `<tr>
        <td>${escHtml(day.label)}</td>
        <td colspan="3" style="color:#92400e;font-style:italic">Holiday</td></tr>`;
    }
    return `<tr>
      <td>${escHtml(day.label)}</td>
      <td>${escHtml(day.topic) || '<span style="color:#a0aec0">—</span>'}</td>
      <td>${escHtml(day.activity) || '<span style="color:#a0aec0">—</span>'}</td>
      <td>${escHtml(day.assessment) || '<span style="color:#a0aec0">—</span>'}</td></tr>`;
  }).join('');

  return `<div class="detail-inner"><table class="detail-table">
    <thead><tr><th>Day</th><th>Topic</th><th>Activity</th><th>Assessment</th></tr></thead>
    <tbody>${rows}</tbody></table></div>`;
}

// ── Toggle detail rows (shared) ───────────────────────────────────
function toggleDetail(idx, tbl) {
  const key        = `${tbl}-${idx}`;
  const summaryRow = document.querySelector(`.plan-row[data-idx="${idx}"][data-tbl="${tbl}"]`);
  const detailRow  = document.querySelector(`.detail-row[data-idx="${idx}"][data-tbl="${tbl}"]`);
  const btn        = summaryRow.querySelector('.toggle-btn');

  if (openRows.has(key)) {
    openRows.delete(key);
    detailRow.classList.remove('open');
    summaryRow.classList.remove('open');
    btn.textContent = '▶ Details';
  } else {
    openRows.add(key);
    detailRow.classList.add('open');
    summaryRow.classList.add('open');
    btn.textContent = '▼ Hide';
  }
}

document.getElementById('plans-tbody').addEventListener('click', function (e) {
  const btn = e.target.closest('.toggle-btn') || e.target.closest('.plan-row');
  if (!btn) return;
  const idx = btn.dataset.idx;
  const tbl = btn.dataset.tbl || 'reviews';
  if (idx !== undefined) toggleDetail(idx, tbl);
});

document.getElementById('current-tbody').addEventListener('click', function (e) {
  const btn = e.target.closest('.toggle-btn') || e.target.closest('.plan-row');
  if (!btn) return;
  const idx = btn.dataset.idx;
  const tbl = btn.dataset.tbl || 'current';
  if (idx !== undefined) toggleDetail(idx, tbl);
});

// ── Utility ──────────────────────────────────────────────────────
function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Init ─────────────────────────────────────────────────────────
if (sessionStorage.getItem('principal_auth') === 'true') {
  showView('view-dashboard');
  switchTab('reviews');
} else {
  showView('view-login');
}
