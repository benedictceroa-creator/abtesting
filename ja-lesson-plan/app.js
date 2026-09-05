// ── CONFIGURATION ──────────────────────────────────────────────
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyZ0ICGEOPv1N2kmXF2x5kQbyEvUOVBko2dNBgezGkr3KrYW4DEPD2Hkz0gjJTC4jowHw/exec';

// Simple shared password for all teachers
const TEACHER_PASSWORD = 'JohnsAcademy2025';

// ── STATE ───────────────────────────────────────────────────────
let currentSubject = '';
let currentGrade = '';
let currentSchool = '';
let selectedActivity = '';
let selectedAssessment = '';
let selectedRealworld = '';
let activeDay = null; // 'mon'|'tue'|'wed'|'thu'|'fri'|'sat'
const holidayDays = new Set();

// ── VIEW HELPERS ────────────────────────────────────────────────
function showView(id) {
  document.querySelectorAll('.view').forEach(v => {
    v.classList.add('hidden');
    v.classList.remove('active');
  });
  const target = document.getElementById(id);
  target.classList.remove('hidden');
  target.classList.add('active');
}

// ── LOGIN ───────────────────────────────────────────────────────
document.getElementById('login-form').addEventListener('submit', function (e) {
  e.preventDefault();
  const pwd = document.getElementById('password').value;
  const err = document.getElementById('login-error');

  if (pwd === TEACHER_PASSWORD) {
    err.classList.add('hidden');
    sessionStorage.setItem('authenticated', 'true');
    showView('view-select');
    loadSubjectsGrades();
  } else {
    err.classList.remove('hidden');
    document.getElementById('password').value = '';
  }
});

// ── LOGOUT ──────────────────────────────────────────────────────
function logout() {
  sessionStorage.removeItem('authenticated');
  currentSubject = '';
  currentGrade = '';
  currentSchool = '';
  document.getElementById('password').value = '';
  document.getElementById('school-select').value = '';
  document.getElementById('subject-select').value = '';
  document.getElementById('grade-select').value = '';
  showView('view-login');
}

document.getElementById('logout-btn').addEventListener('click', logout);
document.getElementById('logout-btn-2').addEventListener('click', logout);
document.getElementById('logout-btn-3').addEventListener('click', logout);

// ── DYNAMIC SUBJECT & GRADE DROPDOWNS ───────────────────────────
let subjectGradeMap = null; // cached after first fetch

async function loadSubjectsGrades() {
  if (subjectGradeMap) { populateSubjectDropdown(); return; }

  const subjectSel = document.getElementById('subject-select');
  const gradeSel   = document.getElementById('grade-select');
  subjectSel.innerHTML = '<option value="">-- Loading… --</option>';
  subjectSel.disabled  = true;
  gradeSel.innerHTML   = '<option value="">-- Select Subject first --</option>';
  gradeSel.disabled    = true;

  try {
    const res  = await fetch(`${SCRIPT_URL}?action=getSubjectsGrades`);
    const data = await res.json();
    if (data.status !== 'ok') throw new Error(data.message);
    subjectGradeMap = data.subjectGrades;
    populateSubjectDropdown();
  } catch (err) {
    subjectSel.innerHTML = '<option value="">-- Failed to load --</option>';
    console.error('loadSubjectsGrades failed:', err);
  }
}

function populateSubjectDropdown() {
  const subjectSel = document.getElementById('subject-select');
  subjectSel.innerHTML = '<option value="">-- Select Subject --</option>';
  Object.keys(subjectGradeMap).forEach(s => {
    const opt = document.createElement('option');
    opt.value = opt.textContent = s;
    subjectSel.appendChild(opt);
  });
  subjectSel.disabled = false;

  // Restore previously selected value if still valid
  if (currentSubject && subjectGradeMap[currentSubject]) {
    subjectSel.value = currentSubject;
    populateGradeDropdown(currentSubject);
  }
}

function populateGradeDropdown(subject) {
  const gradeSel = document.getElementById('grade-select');
  const grades   = (subjectGradeMap && subjectGradeMap[subject]) || [];
  gradeSel.innerHTML = '<option value="">-- Select Grade --</option>';
  grades.forEach(g => {
    const opt = document.createElement('option');
    opt.value       = g;
    opt.textContent = `Grade ${g}`;
    gradeSel.appendChild(opt);
  });
  gradeSel.disabled = grades.length === 0;

  if (currentGrade && grades.includes(currentGrade)) {
    gradeSel.value = currentGrade;
  }
}

document.getElementById('subject-select').addEventListener('change', function () {
  populateGradeDropdown(this.value);
});

// ── SCHOOL SELECTION & PREVIOUS WEEK CHECK ───────────────────────
function localStoragePlanKey() {
  return `ja_plan_${currentSchool}_${currentSubject}_${currentGrade}`;
}

function getLastPlan() {
  try {
    const raw = localStorage.getItem(localStoragePlanKey());
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveLastPlan(planData) {
  try { localStorage.setItem(localStoragePlanKey(), JSON.stringify(planData)); } catch { }
}

// ── SERVER PLAN STORAGE ─────────────────────────────────────────
async function getLastPlanFromServer(school, subject, grade) {
  try {
    const url = `${SCRIPT_URL}?action=getLastPlan` +
      `&school=${encodeURIComponent(school)}` +
      `&subject=${encodeURIComponent(subject)}` +
      `&grade=${encodeURIComponent(grade)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.status === 'ok' && data.plan) {
      saveLastPlan(data.plan); // cache locally
      return data.plan;
    }
  } catch { }
  return getLastPlan(); // fall back to localStorage if server unreachable
}

async function savePlanToServer(planData) {
  try {
    const params = new URLSearchParams({
      action:   'savePlan',
      planData: JSON.stringify(planData),
    });
    await fetch(`${SCRIPT_URL}?${params.toString()}`);
  } catch (err) { console.warn('savePlanToServer failed (non-fatal):', err); }
}

async function saveReviewToServer(school, subject, grade, weekDateRaw, completionStatus) {
  try {
    const params = new URLSearchParams({
      action:           'saveReview',
      school, subject, grade, weekDateRaw,
      completionStatus: JSON.stringify(completionStatus),
      reviewedAt:       new Date().toISOString(),
    });
    await fetch(`${SCRIPT_URL}?${params.toString()}`);
  } catch (err) { console.warn('saveReviewToServer failed (non-fatal):', err); }
}

async function checkPreviousWeekReview() {
  const plan = await getLastPlanFromServer(currentSchool, currentSubject, currentGrade);
  if (plan && !plan.completionStatus) {
    renderReviewView(plan);
  } else {
    enterPlanner();
  }
}

function enterPlanner() {
  document.getElementById('planner-title').textContent = `${currentSubject} — Grade ${currentGrade}`;
  showView('view-planner');
  loadOptions();
  resetPreview();
}

function renderReviewView(planData) {
  document.getElementById('review-title').textContent = `${planData.subject} — Grade ${planData.grade}`;
  document.getElementById('review-school').textContent = planData.school;
  document.getElementById('review-subject').textContent = planData.subject;
  document.getElementById('review-grade').textContent = `Grade ${planData.grade}`;
  document.getElementById('review-weekdate').textContent = planData.weekDate;
  document.getElementById('review-lesson').textContent = planData.lesson || '—';

  const tbody = document.getElementById('review-tbody');
  tbody.innerHTML = '';

  planData.days.forEach(day => {
    const tr = document.createElement('tr');
    if (day.isHoliday) {
      tr.innerHTML = `
        <td class="review-day-cell">${escHtml(day.label)}<br><span class="holiday-badge">HOLIDAY</span></td>
        <td colspan="3" style="text-align:center;color:#92400e;font-style:italic">Holiday</td>
        <td style="color:#cbd5e0;text-align:center">—</td>`;
    } else {
      const hasContent = !!(day.activity || day.topic);
      tr.innerHTML = `
        <td class="review-day-cell">${escHtml(day.label)}</td>
        <td>${escHtml(day.topic) || '<span style="color:#cbd5e0">—</span>'}</td>
        <td>${escHtml(day.activity) || '<span style="color:#cbd5e0">—</span>'}</td>
        <td>${escHtml(day.assessment) || '<span style="color:#cbd5e0">—</span>'}</td>
        <td>${hasContent
          ? `<select class="completion-select" data-day="${day.day}">
              <option value="">— Select —</option>
              <option value="completed">Completed</option>
              <option value="not-completed">Not Completed</option>
              <option value="partial">Partial</option>
            </select>`
          : '<span style="color:#cbd5e0;text-align:center">—</span>'
        }</td>`;
    }
    tbody.appendChild(tr);
  });

  document.getElementById('review-warning').classList.add('hidden');
  showView('view-review');
}

document.getElementById('review-submit-btn').addEventListener('click', async function () {
  const selects = document.querySelectorAll('#review-tbody .completion-select');
  let allMarked = true;
  selects.forEach(sel => { if (!sel.value) allMarked = false; });

  if (!allMarked) {
    document.getElementById('review-warning').classList.remove('hidden');
    return;
  }

  const plan = getLastPlan();
  if (plan) {
    const status = {};
    selects.forEach(sel => { status[sel.dataset.day] = sel.value; });
    plan.completionStatus = status;
    plan.reviewedAt = new Date().toISOString();
    saveLastPlan(plan);
    saveReviewToServer(plan.school, plan.subject, plan.grade, plan.weekDateRaw, status);
  }

  enterPlanner();
});

document.getElementById('review-skip-btn').addEventListener('click', function () {
  enterPlanner();
});

document.getElementById('review-back-btn').addEventListener('click', function () {
  showView('view-select');
  loadSubjectsGrades();
});

// ── SUBJECT & GRADE SELECTION ────────────────────────────────────
document.getElementById('go-btn').addEventListener('click', async function () {
  const school = document.getElementById('school-select').value;
  const subject = document.getElementById('subject-select').value;
  const grade = document.getElementById('grade-select').value;
  const err = document.getElementById('select-error');

  if (!school || !subject || !grade) {
    err.classList.remove('hidden');
    return;
  }

  err.classList.add('hidden');
  currentSchool = school;
  currentSubject = subject;
  currentGrade = grade;

  await checkPreviousWeekReview();
});

// ── LOAD DROPDOWN OPTIONS FROM CURRICULUM SHEET ──────────────────
async function loadOptions() {
  const lessonSel = document.getElementById('f-lesson');
  const topicSel = document.getElementById('f-topic');

  setSelectOptions(lessonSel, [], '-- Loading… --', true);
  setSelectOptions(topicSel, [], '-- Select Lesson first --', true);
  topicSel.disabled = true;
  hideActivityPicker();
  hideAssessmentPicker();
  hideRealworldPicker();

  try {
    const url = `${SCRIPT_URL}?action=options&subject=${encodeURIComponent(currentSubject)}&grade=${encodeURIComponent(currentGrade)}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== 'ok') throw new Error(data.message);

    setSelectOptions(lessonSel, data.lessons, '-- Select Lesson --', false);

  } catch (err) {
    setSelectOptions(lessonSel, [], '-- Failed to load --', false);
    console.error('Options load error:', err);
  }
}

// When Lesson changes → fetch Topics, update preview
document.getElementById('f-lesson').addEventListener('change', async function () {
  const lesson = this.value;
  const topicSel = document.getElementById('f-topic');

  hideActivityPicker();
  hideAssessmentPicker();
  hideRealworldPicker();
  resetActiveDay();
  updatePreview();

  if (!lesson) {
    setSelectOptions(topicSel, [], '-- Select Lesson first --', true);
    topicSel.disabled = true;
    return;
  }

  setSelectOptions(topicSel, [], '-- Loading… --', true);
  topicSel.disabled = true;

  try {
    const url = `${SCRIPT_URL}?action=options&subject=${encodeURIComponent(currentSubject)}&grade=${encodeURIComponent(currentGrade)}&lesson=${encodeURIComponent(lesson)}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== 'ok') throw new Error(data.message);

    setSelectOptions(topicSel, data.topics, '-- Select Topic --', false);
    topicSel.disabled = false;

  } catch (err) {
    setSelectOptions(topicSel, [], '-- Failed to load --', false);
    console.error('Topic load error:', err);
  }
});

// When Topic changes → show three activity cards, update preview
document.getElementById('f-topic').addEventListener('change', async function () {
  const lesson = document.getElementById('f-lesson').value;
  const topic = this.value;

  hideActivityPicker();
  hideAssessmentPicker();
  hideRealworldPicker();
  updatePreview();

  if (!topic) return;

  // Fill the active day's topic cell, or all days if none is selected
  if (activeDay) {
    document.getElementById(`preview-topic-${activeDay}`).textContent = topic;
  } else {
    DAYS.forEach(d => {
      document.getElementById(`preview-topic-${d}`).textContent = topic;
    });
  }

  document.getElementById('activity-text-1').textContent = 'Loading…';
  document.getElementById('activity-text-2').textContent = 'Loading…';
  document.getElementById('activity-text-3').textContent = 'Loading…';
  document.getElementById('assessment-text-1').textContent = 'Loading…';
  document.getElementById('assessment-text-2').textContent = 'Loading…';
  document.getElementById('assessment-text-3').textContent = 'Loading…';
  document.getElementById('realworld-text-1').textContent = 'Loading…';
  document.getElementById('realworld-text-2').textContent = 'Loading…';
  document.getElementById('realworld-text-3').textContent = 'Loading…';
  document.getElementById('activity-picker').classList.remove('hidden');
  document.getElementById('assessment-picker').classList.remove('hidden');
  document.getElementById('realworld-picker').classList.remove('hidden');
  document.getElementById('active-day-bar').classList.remove('hidden');

  try {
    const url = `${SCRIPT_URL}?action=options&subject=${encodeURIComponent(currentSubject)}&grade=${encodeURIComponent(currentGrade)}&lesson=${encodeURIComponent(lesson)}&topic=${encodeURIComponent(topic)}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== 'ok') throw new Error(data.message);

    document.getElementById('activity-text-1').textContent = data.activity1 || '(none)';
    document.getElementById('activity-text-2').textContent = data.activity2 || '(none)';
    document.getElementById('activity-text-3').textContent = data.activity3 || '(none)';
    document.getElementById('assessment-text-1').textContent = data.assessment1 || '(none)';
    document.getElementById('assessment-text-2').textContent = data.assessment2 || '(none)';
    document.getElementById('assessment-text-3').textContent = data.assessment3 || '(none)';
    document.getElementById('realworld-text-1').textContent = data.realworld1 || '(none)';
    document.getElementById('realworld-text-2').textContent = data.realworld2 || '(none)';
    document.getElementById('realworld-text-3').textContent = data.realworld3 || '(none)';

  } catch (err) {
    document.getElementById('activity-text-1').textContent = 'Failed to load';
    document.getElementById('activity-text-2').textContent = '—';
    document.getElementById('activity-text-3').textContent = '—';
    document.getElementById('assessment-text-1').textContent = 'Failed to load';
    document.getElementById('assessment-text-2').textContent = '—';
    document.getElementById('assessment-text-3').textContent = '—';
    document.getElementById('realworld-text-1').textContent = 'Failed to load';
    document.getElementById('realworld-text-2').textContent = '—';
    document.getElementById('realworld-text-3').textContent = '—';
    console.error('Options load error:', err);
  }
});

// ── ACTIVE DAY (row selection in right panel) ────────────────────
const DAY_NAMES_MAP = { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday' };

function setActiveDay(day) {
  document.querySelectorAll('.plan-row').forEach(r => r.classList.remove('row-active'));
  activeDay = day;
  const bar = document.getElementById('active-day-bar');
  const txt = document.getElementById('active-day-text');
  if (day) {
    document.getElementById(`row-${day}`)?.classList.add('row-active');
    bar.classList.add('has-day');
    txt.innerHTML = `Applying to: <strong>${DAY_NAMES_MAP[day]}</strong>`;
    // Reset topic dropdown so the same topic can be re-selected for a different day
    const topicSel = document.getElementById('f-topic');
    if (topicSel && !topicSel.disabled) topicSel.value = '';
  } else {
    bar.classList.remove('has-day');
    txt.textContent = 'Click a day row in the plan to select it';
  }
  updateHolidayButton();
}

// ── HOLIDAY ──────────────────────────────────────────────────────
function toggleHoliday() {
  if (!activeDay) {
    alert('Click a day row in the plan first, then use this button to mark it as a holiday.');
    return;
  }

  const row = document.getElementById(`row-${activeDay}`);
  const dayCell = document.getElementById(`preview-day-${activeDay}`);
  const dataCols = ['topic', 'activity', 'assessment'];

  if (holidayDays.has(activeDay)) {
    // Remove holiday
    holidayDays.delete(activeDay);
    row.classList.remove('holiday');
    dayCell.querySelector('.holiday-badge')?.remove();
    dataCols.forEach(col => {
      const cell = document.getElementById(`preview-${col}-${activeDay}`);
      cell.contentEditable = 'true';
      cell.textContent = '';
    });
  } else {
    // Mark as holiday
    holidayDays.add(activeDay);
    row.classList.add('holiday');
    dataCols.forEach(col => {
      const cell = document.getElementById(`preview-${col}-${activeDay}`);
      cell.textContent = '';
      cell.contentEditable = 'false';
    });
    const badge = document.createElement('span');
    badge.className = 'holiday-badge';
    badge.textContent = 'HOLIDAY';
    dayCell.appendChild(badge);
  }

  updateHolidayButton();
}

function updateHolidayButton() {
  const btn = document.getElementById('holiday-btn');
  if (!btn) return;
  if (activeDay && holidayDays.has(activeDay)) {
    btn.textContent = 'Remove Holiday';
    btn.classList.add('is-holiday');
  } else {
    btn.textContent = 'Mark Day as Holiday';
    btn.classList.remove('is-holiday');
  }
}

// ── ACTIVITY PICKER ──────────────────────────────────────────────
function hideActivityPicker() {
  document.getElementById('activity-picker').classList.add('hidden');
  document.querySelectorAll('#activity-picker .activity-card').forEach(c => c.classList.remove('selected'));
  selectedActivity = '';
  document.getElementById('f-activities').value = '';
}

function resetActiveDay() {
  activeDay = null;
  document.querySelectorAll('.plan-row').forEach(r => r.classList.remove('row-active'));
  const bar = document.getElementById('active-day-bar');
  bar.classList.add('hidden');
  bar.classList.remove('has-day');
  document.getElementById('active-day-text').textContent = 'Click a day row in the plan to select it';
  updateHolidayButton();
}

function selectActivity(num) {
  document.querySelectorAll('#activity-picker .activity-card').forEach(c => c.classList.remove('selected'));
  document.getElementById(`activity-card-${num}`).classList.add('selected');
  selectedActivity = document.getElementById(`activity-text-${num}`).textContent;
  document.getElementById('f-activities').value = selectedActivity;

  if (activeDay) {
    const cell = document.getElementById(`preview-activity-${activeDay}`);
    cell.textContent = selectedActivity;
  } else {
    DAYS.forEach(d => {
      document.getElementById(`preview-activity-${d}`).textContent = selectedActivity;
    });
  }
}

// ── REALWORLD PICKER ──────────────────────────────────────────────
function hideRealworldPicker() {
  document.getElementById('realworld-picker').classList.add('hidden');
  document.querySelectorAll('#realworld-picker .activity-card').forEach(c => c.classList.remove('selected'));
  selectedRealworld = '';
  document.getElementById('f-realworld').value = '';
}

function selectRealworld(num) {
  document.querySelectorAll('#realworld-picker .activity-card').forEach(c => c.classList.remove('selected'));
  document.getElementById(`realworld-card-${num}`).classList.add('selected');
  selectedRealworld = document.getElementById(`realworld-text-${num}`).textContent;
  document.getElementById('f-realworld').value = selectedRealworld;
  document.getElementById('preview-realworld').textContent = selectedRealworld;
}

// ── ASSESSMENT PICKER ─────────────────────────────────────────────
function hideAssessmentPicker() {
  document.getElementById('assessment-picker').classList.add('hidden');
  document.querySelectorAll('#assessment-picker .activity-card').forEach(c => c.classList.remove('selected'));
  selectedAssessment = '';
  document.getElementById('f-assessments').value = '';
}

function selectAssessment(num) {
  document.querySelectorAll('#assessment-picker .activity-card').forEach(c => c.classList.remove('selected'));
  document.getElementById(`assessment-card-${num}`).classList.add('selected');
  selectedAssessment = document.getElementById(`assessment-text-${num}`).textContent;
  document.getElementById('f-assessments').value = selectedAssessment;

  if (activeDay) {
    document.getElementById(`preview-assessment-${activeDay}`).textContent = selectedAssessment;
  } else {
    DAYS.forEach(d => {
      document.getElementById(`preview-assessment-${d}`).textContent = selectedAssessment;
    });
  }
}

// Helper: populate a <select>
function setSelectOptions(selectEl, values, placeholder, disabled) {
  selectEl.innerHTML = `<option value="">${placeholder}</option>`;
  values.forEach(v => {
    const opt = document.createElement('option');
    opt.value = opt.textContent = v;
    selectEl.appendChild(opt);
  });
  selectEl.disabled = disabled;
}

// ── BACK BUTTON ──────────────────────────────────────────────────
document.getElementById('back-btn').addEventListener('click', function () {
  showView('view-select');
  loadSubjectsGrades();
});

// ── WEEK DATE HELPERS ─────────────────────────────────────────────
const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getWeekDayLabels(dateStr) {
  if (!dateStr) return DAY_NAMES.slice();
  const d = new Date(dateStr + 'T00:00:00');
  const dow = d.getDay(); // 0=Sun
  const monday = new Date(d);
  monday.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1));
  return DAY_NAMES.map((name, i) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    const label = day.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    return `${name} (${label})`;
  });
}

// ── LIVE PREVIEW ─────────────────────────────────────────────────
function resetPreview() {
  document.getElementById('preview-school-name').textContent =
    currentSchool ? `John's Academy – ${currentSchool}` : "John's Academy School";
  document.getElementById('preview-subject-label').textContent =
    `${currentSubject} — Grade ${currentGrade}`;

  ['preview-date', 'preview-lesson'].forEach(id => {
    const el = document.getElementById(id);
    el.textContent = id === 'preview-date' ? 'Not entered' : 'Not selected';
    el.classList.add('empty');
  });

  // Clear contenteditable cells
  document.getElementById('preview-objective').textContent = '';
  document.getElementById('preview-material').textContent = '';
  document.getElementById('preview-realworld').textContent = '';
  document.getElementById('preview-preparedby').textContent = '';

  // Clear holidays
  holidayDays.clear();
  DAY_NAMES.forEach((name, i) => {
    const d = DAYS[i];
    const row = document.getElementById(`row-${d}`);
    if (row) row.classList.remove('holiday');
    const dayCell = document.getElementById(`preview-day-${d}`);
    if (dayCell) {
      dayCell.querySelector('.holiday-badge')?.remove();
      dayCell.textContent = name;
    }
    ['topic', 'activity', 'assessment'].forEach(col => {
      const cell = document.getElementById(`preview-${col}-${d}`);
      if (cell) { cell.contentEditable = 'true'; cell.textContent = ''; }
    });
  });

  resetActiveDay();
}

function updatePreview() {
  const dateStr = document.getElementById('f-date').value;
  const lesson = document.getElementById('f-lesson').value;

  function setMeta(id, val, placeholder) {
    const el = document.getElementById(id);
    if (val) { el.textContent = val; el.classList.remove('empty'); }
    else { el.textContent = placeholder; el.classList.add('empty'); }
  }

  setMeta('preview-date', formatDate(dateStr), 'Not entered');
  setMeta('preview-lesson', lesson, 'Not selected');

  // Update day labels with calculated dates
  const dayLabels = getWeekDayLabels(dateStr);
  DAYS.forEach((d, i) => {
    document.getElementById(`preview-day-${d}`).textContent = dayLabels[i];
  });
}

// Live-update preview as teacher picks a date
['f-date'].forEach(id => {
  document.getElementById(id).addEventListener('input', updatePreview);
  document.getElementById(id).addEventListener('change', updatePreview);
});

// Clean up empty contenteditable cells on blur (remove stray <br> nodes)
document.addEventListener('focusout', e => {
  if (e.target.matches('.editable-cell')) {
    if (e.target.innerHTML === '<br>' || e.target.innerHTML.trim() === '') {
      e.target.textContent = '';
    }
  }
});

// ── SAVE PLAN TO GOOGLE SHEETS ────────────────────────────────────
document.getElementById('add-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  const hasActivity = DAYS.some(d => !holidayDays.has(d) && (document.getElementById(`preview-activity-${d}`).textContent || '').trim());
  if (!hasActivity) {
    alert('Please select an activity (click a day row, then pick an activity from the left panel).');
    document.getElementById('activity-picker').scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  const saveBtn = document.getElementById('save-btn');
  const saveStatus = document.getElementById('save-status');
  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving…';
  saveStatus.classList.add('hidden');

  const primaryActivity = DAYS.map(d => (document.getElementById(`preview-activity-${d}`).textContent || '').trim()).find(a => a) || '';
  const primaryAssessment = DAYS.map(d => (document.getElementById(`preview-assessment-${d}`).textContent || '').trim()).find(a => a) || '';

  const saveParams = new URLSearchParams({
    action:      'add',
    school:      currentSchool,
    subject:     currentSubject,
    grade:       currentGrade,
    date:        formatDate(document.getElementById('f-date').value),
    lesson:      document.getElementById('f-lesson').value.trim(),
    topic:       document.getElementById('f-topic').value.trim(),
    objective:   (document.getElementById('preview-objective').textContent || '').trim(),
    activities:  primaryActivity,
    material:    (document.getElementById('preview-material').textContent || '').trim(),
    assessments: primaryAssessment,
    realworld:   (document.getElementById('preview-realworld').textContent || '').trim(),
    preparedby:  (document.getElementById('preview-preparedby').textContent || '').trim(),
  });

  try {
    const res = await fetch(`${SCRIPT_URL}?${saveParams.toString()}`);
    const data = await res.json();

    if (data.status === 'ok') {
      saveBtn.textContent = '✓ Saved!';
      saveStatus.textContent = 'Plan saved to Google Sheets.';
      saveStatus.className = 'save-status success';
      saveStatus.classList.remove('hidden');

      const weekDateRaw = document.getElementById('f-date').value;
      const planSnapshot = {
        school: currentSchool,
        subject: currentSubject,
        grade: currentGrade,
        weekDate: formatDate(weekDateRaw),
        weekDateRaw,
        lesson: document.getElementById('f-lesson').value.trim(),
        days: DAYS.map((d, i) => ({
          day: d,
          label: getWeekDayLabels(weekDateRaw)[i],
          topic: (document.getElementById(`preview-topic-${d}`).textContent || '').trim(),
          activity: (document.getElementById(`preview-activity-${d}`).textContent || '').trim(),
          assessment: (document.getElementById(`preview-assessment-${d}`).textContent || '').trim(),
          isHoliday: holidayDays.has(d),
        })),
        completionStatus: null,
        savedAt: new Date().toISOString(),
      };
      saveLastPlan(planSnapshot);
      savePlanToServer(planSnapshot);

      setTimeout(() => {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Plan';
        saveStatus.classList.add('hidden');
        document.getElementById('add-form').reset();
        hideActivityPicker();
        hideAssessmentPicker();
        hideRealworldPicker();
        loadOptions();
        resetPreview();
      }, 2000);
    } else {
      throw new Error(data.message || 'Save failed');
    }
  } catch (err) {
    saveStatus.textContent = err.message || 'Could not save. Please try again.';
    saveStatus.className = 'save-status error-msg';
    saveStatus.classList.remove('hidden');
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Plan';
    console.error('Save error:', err);
  }
});

// ── DOWNLOAD AS PDF ───────────────────────────────────────────────
function downloadPDF() {
  const dateStr = document.getElementById('f-date').value;
  const lesson = document.getElementById('f-lesson').value;
  const topic = document.getElementById('f-topic').value;
  const objective = (document.getElementById('preview-objective').textContent || '').trim();
  const material = (document.getElementById('preview-material').textContent || '').trim();
  const realworld = (document.getElementById('preview-realworld').textContent || '').trim();
  const preparedby = (document.getElementById('preview-preparedby').textContent || '').trim();

  if (!lesson && !topic && !objective) {
    alert('Please fill in at least some fields before downloading.');
    return;
  }

  const dayLabels = getWeekDayLabels(dateStr);
  const weekStartLabel = formatDate(dateStr) || '—';

  function weekRows() {
    return dayLabels.map((day, i) => {
      const d = DAYS[i];
      if (holidayDays.has(d)) {
        return `
      <tr style="background:#fef9c3">
        <td class="day-cell" style="background:#fef08a">${escHtml(day)}<br><span style="font-size:0.6rem;font-weight:800;letter-spacing:0.12em;color:#78350f;background:#fbbf24;border-radius:3px;padding:1px 5px">HOLIDAY</span></td>
        <td colspan="3" style="text-align:center;color:#92400e;font-weight:600;font-style:italic;background:#fef9c3">Holiday</td>
      </tr>`;
      }
      const dayTopic = (document.getElementById(`preview-topic-${d}`).textContent || '').trim() || topic;
      const dayAct = (document.getElementById(`preview-activity-${d}`).textContent || '').trim();
      const dayAssess = (document.getElementById(`preview-assessment-${d}`).textContent || '').trim();
      return `
      <tr>
        <td class="day-cell">${escHtml(day)}</td>
        <td>${escHtml(dayTopic) || '<span class="empty">—</span>'}</td>
        <td>${escHtml(dayAct) || '<span class="empty">—</span>'}</td>
        <td>${escHtml(dayAssess) || '<span class="empty">—</span>'}</td>
      </tr>`;
    }).join('');
  }

  function footerRow(label, value) {
    return `<tr>
      <td class="lbl">${label}</td>
      <td colspan="3">${escHtml(value) || '<span class="empty">—</span>'}</td>
    </tr>`;
  }

  const logoSrc = window.location.href.replace(/\/[^/]*$/, '') + '/logo.jpg';

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Weekly Lesson Plan – ${escHtml(currentSubject)} Grade ${escHtml(currentGrade)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; padding: 36px; color: #1a202c; }
    .header { display: flex; align-items: center; gap: 20px; border-bottom: 3px solid #1a365d; padding-bottom: 16px; margin-bottom: 16px; }
    .header img { height: 64px; width: auto; border-radius: 4px; }
    .header h1 { font-size: 1.3rem; color: #1a365d; }
    .header p { font-size: 0.82rem; color: #718096; margin-top: 3px; }
    .subject-bar { background: #ebf8ff; border: 1px solid #bee3f8; border-radius: 6px; padding: 8px 16px; margin-bottom: 12px; font-size: 0.88rem; color: #2b6cb0; font-weight: 600; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr 2fr; gap: 0; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; margin-bottom: 16px; }
    .meta-item { padding: 10px 14px; border-right: 1px solid #e2e8f0; }
    .meta-item:last-child { border-right: none; }
    .meta-lbl { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #718096; margin-bottom: 3px; }
    .meta-val { font-size: 0.88rem; font-weight: 600; color: #1a365d; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 0; }
    thead tr { background: #1a365d; color: #fff; }
    thead th { padding: 9px 12px; text-align: left; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
    tbody tr { border-bottom: 1px solid #e2e8f0; }
    tbody tr:nth-child(even) { background: #f7fafc; }
    td { padding: 10px 12px; vertical-align: top; font-size: 0.82rem; }
    .day-cell { font-weight: 700; color: #1a365d; background: #ebf4ff; border-right: 1px solid #bee3f8; width: 22%; white-space: nowrap; }
    .lbl { width: 180px; font-weight: 700; font-size: 0.73rem; text-transform: uppercase; letter-spacing: 0.05em; color: #718096; background: #f7fafc; border-right: 1px solid #e2e8f0; }
    .empty { color: #cbd5e0; font-style: italic; }
    .footer-table { margin-top: 0; border-top: 2px solid #e2e8f0; }
    .prepared-by { margin-top: 16px; font-size: 0.875rem; color: #4a5568; }
    .generated { margin-top: 8px; font-size: 0.7rem; color: #a0aec0; text-align: right; }
    @media print { body { padding: 0; } @page { margin: 1.2cm; size: A4 landscape; } }
  </style>
</head>
<body>
  <div class="header">
    <img src="${logoSrc}" alt="John's Academy" />
    <div>
      <h1>${escHtml(currentSchool ? `John's Academy – ${currentSchool}` : "John's Academy School")}</h1>
      <p>Educate | Empower | Transform</p>
    </div>
  </div>
  <div class="subject-bar">School: ${escHtml(currentSchool)} &nbsp;&nbsp;&nbsp; Subject: ${escHtml(currentSubject)} &nbsp;&nbsp;&nbsp; Grade: ${escHtml(currentGrade)}</div>
  <div class="meta-grid">
    <div class="meta-item"><div class="meta-lbl">Week Starting</div><div class="meta-val">${escHtml(weekStartLabel)}</div></div>
    <div class="meta-item"><div class="meta-lbl">Lesson</div><div class="meta-val">${escHtml(lesson) || '—'}</div></div>
    <div class="meta-item"><div class="meta-lbl">Objective</div><div class="meta-val">${escHtml(objective) || '—'}</div></div>
  </div>
  <table>
    <thead>
      <tr>
        <th style="width:22%">Day (Date)</th>
        <th style="width:22%">Topic</th>
        <th style="width:34%">Activity</th>
        <th style="width:22%">Assessment</th>
      </tr>
    </thead>
    <tbody>${weekRows()}</tbody>
  </table>
  <table class="footer-table">
    ${footerRow('Material', material)}
    ${footerRow('Real World Connection', realworld)}
  </table>
  <div class="prepared-by">Prepared by: <strong>${escHtml(preparedby) || '—'}</strong></div>
  <div class="generated">Generated on ${new Date().toLocaleString()}</div>
  <script>window.onload = function () { window.print(); };<\/script>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  win.addEventListener('unload', () => URL.revokeObjectURL(url));
}

// ── UTILITY ──────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
}

function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── INIT: check session ───────────────────────────────────────────
if (sessionStorage.getItem('authenticated') === 'true') {
  showView('view-select');
  loadSubjectsGrades();
}
