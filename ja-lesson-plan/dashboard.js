const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyZ0ICGEOPv1N2kmXF2x5kQbyEvUOVBko2dNBgezGkr3KrYW4DEPD2Hkz0gjJTC4jowHw/exec';

const PRINCIPAL_PASSWORD = 'JohnsAcademy@Principal2025';

// ── State ────────────────────────────────────────────────────────
let allPlans    = [];   // all fetched plans for the current school
let openRows    = new Set();

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

// ── Login ────────────────────────────────────────────────────────
document.getElementById('login-form').addEventListener('submit', function (e) {
  e.preventDefault();
  const pwd = document.getElementById('password').value;
  if (pwd === PRINCIPAL_PASSWORD) {
    document.getElementById('login-error').classList.add('hidden');
    sessionStorage.setItem('principal_auth', 'true');
    showView('view-dashboard');
  } else {
    document.getElementById('login-error').classList.remove('hidden');
    document.getElementById('password').value = '';
  }
});

document.getElementById('logout-btn').addEventListener('click', function () {
  sessionStorage.removeItem('principal_auth');
  document.getElementById('password').value = '';
  allPlans = [];
  showView('view-login');
});

// ── Load plans ───────────────────────────────────────────────────
document.getElementById('load-btn').addEventListener('click', loadPlans);

async function loadPlans() {
  const school  = document.getElementById('school-filter').value;
  const loadBtn = document.getElementById('load-btn');

  loadBtn.disabled    = true;
  loadBtn.textContent = 'Loading…';
  document.getElementById('loading-msg').classList.remove('hidden');
  document.getElementById('dashboard-content').classList.add('hidden');

  try {
    const url  = `${SCRIPT_URL}?action=getReviews&school=${encodeURIComponent(school)}`;
    const res  = await fetch(url);
    const data = await res.json();

    if (data.status !== 'ok') throw new Error(data.message);

    allPlans = data.plans;
    populateWeekFilter(allPlans);
    renderDashboard();

  } catch (err) {
    alert('Could not load plans: ' + err.message);
    console.error(err);
  } finally {
    document.getElementById('loading-msg').classList.add('hidden');
    loadBtn.disabled    = false;
    loadBtn.textContent = 'Load Plans';
  }
}

// ── Week filter dropdown ─────────────────────────────────────────
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

document.getElementById('week-filter').addEventListener('change', renderDashboard);

// ── Render ───────────────────────────────────────────────────────
function renderDashboard() {
  const weekFilter = document.getElementById('week-filter').value;
  const plans      = weekFilter ? allPlans.filter(p => p.weekDate === weekFilter) : allPlans;

  // Summary stats
  let totalCompleted = 0, totalPartial = 0, totalNotDone = 0, totalTracked = 0;

  plans.forEach(plan => {
    Object.values(plan.completionStatus || {}).forEach(status => {
      if (status === 'completed')     { totalCompleted++; totalTracked++; }
      else if (status === 'partial')  { totalPartial++;   totalTracked++; }
      else if (status === 'not-completed') { totalNotDone++; totalTracked++; }
    });
  });

  document.getElementById('stat-plans').textContent     = plans.length;
  document.getElementById('stat-completed').textContent = totalCompleted;
  document.getElementById('stat-partial').textContent   = totalPartial;
  document.getElementById('stat-notdone').textContent   = totalNotDone;
  document.getElementById('stat-rate').textContent      = totalTracked
    ? Math.round((totalCompleted / totalTracked) * 100) + '%'
    : '—';

  // Table
  const tbody = document.getElementById('plans-tbody');
  tbody.innerHTML = '';
  openRows.clear();

  const empty = document.getElementById('empty-state');

  if (plans.length === 0) {
    empty.classList.remove('hidden');
    document.getElementById('dashboard-content').classList.remove('hidden');
    return;
  }

  empty.classList.add('hidden');

  plans.forEach((plan, idx) => {
    const status    = plan.completionStatus || {};
    const done      = Object.values(status).filter(s => s === 'completed').length;
    const partial   = Object.values(status).filter(s => s === 'partial').length;
    const notDone   = Object.values(status).filter(s => s === 'not-completed').length;
    const tracked   = done + partial + notDone;
    const pct       = tracked ? Math.round((done / tracked) * 100) : null;

    const pillClass = pct === null ? 'grey' : pct >= 80 ? 'green' : pct >= 50 ? 'yellow' : 'red';
    const pillText  = pct === null ? '—' : pct + '%';

    const tr = document.createElement('tr');
    tr.className = 'plan-row';
    tr.dataset.idx = idx;
    tr.innerHTML = `
      <td class="subject-cell">${escHtml(plan.subject)}</td>
      <td class="grade-cell">Grade ${escHtml(plan.grade)}</td>
      <td>${escHtml(plan.weekDate)}</td>
      <td><span class="pill green">${done}</span></td>
      <td><span class="pill yellow">${partial}</span></td>
      <td><span class="pill red">${notDone}</span></td>
      <td><span class="pill ${pillClass}">${pillText}</span></td>
      <td><button class="toggle-btn" data-idx="${idx}">▶ Details</button></td>`;
    tbody.appendChild(tr);

    const dtr = document.createElement('tr');
    dtr.className  = 'detail-row';
    dtr.dataset.idx = idx;
    dtr.innerHTML  = `<td class="detail-cell" colspan="8">${buildDetailHTML(plan)}</td>`;
    tbody.appendChild(dtr);
  });

  document.getElementById('dashboard-content').classList.remove('hidden');
}

function toggleDetail(idx) {
  const summaryRow = document.querySelector(`.plan-row[data-idx="${idx}"]`);
  const detailRow  = document.querySelector(`.detail-row[data-idx="${idx}"]`);
  const btn        = summaryRow.querySelector('.toggle-btn');

  if (openRows.has(idx)) {
    openRows.delete(idx);
    detailRow.classList.remove('open');
    summaryRow.classList.remove('open');
    btn.textContent = '▶ Details';
  } else {
    openRows.add(idx);
    detailRow.classList.add('open');
    summaryRow.classList.add('open');
    btn.textContent = '▼ Hide';
  }
}

function buildDetailHTML(plan) {
  const status = plan.completionStatus || {};
  const rows   = (plan.days || []).map(day => {
    if (day.isHoliday) {
      return `<tr>
        <td>${escHtml(day.label)}</td>
        <td colspan="3" style="color:#92400e;font-style:italic">Holiday</td>
        <td>—</td>
      </tr>`;
    }
    const s    = status[day.day] || '';
    const icon = s === 'completed'     ? '<span class="status-icon" style="color:#276749">✓ Completed</span>'
               : s === 'partial'       ? '<span class="status-icon" style="color:#b7791f">◑ Partial</span>'
               : s === 'not-completed' ? '<span class="status-icon" style="color:#9b2c2c">✗ Not Done</span>'
               :                        '<span style="color:#a0aec0">—</span>';
    return `<tr>
      <td>${escHtml(day.label)}</td>
      <td>${escHtml(day.topic) || '<span style="color:#a0aec0">—</span>'}</td>
      <td>${escHtml(day.activity) || '<span style="color:#a0aec0">—</span>'}</td>
      <td>${escHtml(day.assessment) || '<span style="color:#a0aec0">—</span>'}</td>
      <td>${icon}</td>
    </tr>`;
  }).join('');

  return `
    <div class="detail-inner">
      <table class="detail-table">
        <thead>
          <tr>
            <th>Day</th><th>Topic</th><th>Activity</th><th>Assessment</th><th>Status</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

// ── Utility ──────────────────────────────────────────────────────
function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Table click delegation (set once) ───────────────────────────
document.getElementById('plans-tbody').addEventListener('click', function (e) {
  const btn = e.target.closest('.toggle-btn');
  const row = e.target.closest('.plan-row');
  const idx = (btn || row)?.dataset.idx;
  if (idx === undefined) return;
  toggleDetail(idx);
});

// ── Init ─────────────────────────────────────────────────────────
if (sessionStorage.getItem('principal_auth') === 'true') {
  showView('view-dashboard');
} else {
  showView('view-login');
}
