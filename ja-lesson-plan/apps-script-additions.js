// ══════════════════════════════════════════════════════════════════
//  Johns Academy – Teacher Activity Planner
//  Complete Apps Script — paste this entire file into a new project
//
//  HOW TO DEPLOY:
//  1. Go to script.google.com → New project
//  2. Paste this entire file (replace the default code)
//  3. Click Deploy → New deployment
//     • Type: Web app
//     • Execute as: Me
//     • Who has access: Anyone
//  4. Copy the deployment URL and paste it into app.js as SCRIPT_URL
// ══════════════════════════════════════════════════════════════════

// ── Sheet names ─────────────────────────────────────────────────
const CURRICULUM_SHEET  = 'Sheet1';       // your existing curriculum tab
const PLANS_LOG_SHEET   = 'Lesson Plans'; // created automatically on first save
const SNAPSHOTS_SHEET   = 'Plans';        // created automatically on first save

// ── Router ──────────────────────────────────────────────────────
function doGet(e) {
  const action = e.parameter.action;
  if (action === 'options')     return handleOptions(e.parameter);
  if (action === 'getLastPlan') return handleGetLastPlan(e.parameter);
  return jsonResponse({ status: 'error', message: 'Unknown GET action: ' + action });
}

function doPost(e) {
  const payload = JSON.parse(e.postData.contents);
  if (payload.action === 'add')        return handleAdd(payload);
  if (payload.action === 'savePlan')   return handleSavePlan(payload);
  if (payload.action === 'saveReview') return handleSaveReview(payload);
  return jsonResponse({ status: 'error', message: 'Unknown POST action: ' + payload.action });
}

// ── GET: curriculum options ──────────────────────────────────────
// Called 3 times as teacher drills down: subject+grade → lesson → topic
function handleOptions(params) {
  const { subject, grade, lesson, topic } = params;

  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CURRICULUM_SHEET);
  if (!sheet) return jsonResponse({ status: 'error', message: 'Curriculum sheet "' + CURRICULUM_SHEET + '" not found' });

  const data    = sheet.getDataRange().getValues();
  const headers = data[0].map(h => h.toString().trim().toLowerCase());

  // Resolve column indexes by header name (flexible — works even if columns are added/reordered)
  function col(name) { return headers.indexOf(name.toLowerCase()); }
  const iSubject = col('subject');
  const iGrade   = col('grade');
  const iLesson  = col('lesson');
  const iTopic   = col('topic');
  const iAct1    = col('activity 1');
  const iAct2    = col('activity 2');
  const iAct3    = col('activity 3');
  // Assessment: fall back to "assessment" if numbered columns don't exist
  const iAss1    = col('assessment 1') >= 0 ? col('assessment 1') : col('assessment');
  const iAss2    = col('assessment 2');
  const iAss3    = col('assessment 3');
  const iReal1   = col('realworld 1');
  const iReal2   = col('realworld 2');
  const iReal3   = col('realworld 3');

  function cell(row, idx) {
    return idx >= 0 ? (row[idx] || '').toString().trim() : '';
  }

  // Filter to rows matching subject + grade
  const rows = data.slice(1).filter(r =>
    cell(r, iSubject) === subject &&
    cell(r, iGrade)   === String(grade)
  );

  // 1️⃣  No lesson yet → return distinct lessons
  if (!lesson) {
    const lessons = [...new Set(rows.map(r => cell(r, iLesson)).filter(Boolean))];
    return jsonResponse({ status: 'ok', lessons });
  }

  const lessonRows = rows.filter(r => cell(r, iLesson) === lesson);

  // 2️⃣  No topic yet → return distinct topics for this lesson
  if (!topic) {
    const topics = [...new Set(lessonRows.map(r => cell(r, iTopic)).filter(Boolean))];
    return jsonResponse({ status: 'ok', topics });
  }

  // 3️⃣  Topic given → return activities, assessments, realworld for that row
  const row = lessonRows.find(r => cell(r, iTopic) === topic);
  if (!row) return jsonResponse({ status: 'error', message: 'Topic not found' });

  return jsonResponse({
    status:      'ok',
    activity1:   cell(row, iAct1),
    activity2:   cell(row, iAct2),
    activity3:   cell(row, iAct3),
    assessment1: cell(row, iAss1),
    assessment2: cell(row, iAss2),
    assessment3: cell(row, iAss3),
    realworld1:  cell(row, iReal1),
    realworld2:  cell(row, iReal2),
    realworld3:  cell(row, iReal3),
  });
}

// ── POST: save plan summary to "Lesson Plans" sheet ─────────────
function handleAdd(payload) {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  let   sheet = ss.getSheetByName(PLANS_LOG_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(PLANS_LOG_SHEET);
    sheet.appendRow([
      'Timestamp', 'School', 'Subject', 'Grade', 'Week Starting',
      'Lesson', 'Topic', 'Objective', 'Activity', 'Material',
      'Assessment', 'Real World Connection', 'Prepared By'
    ]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, 13).setFontWeight('bold');
  }

  sheet.appendRow([
    new Date().toISOString(),
    payload.school      || '',
    payload.subject     || '',
    payload.grade       || '',
    payload.date        || '',
    payload.lesson      || '',
    payload.topic       || '',
    payload.objective   || '',
    payload.activities  || '',
    payload.material    || '',
    payload.assessments || '',
    payload.realworld   || '',
    payload.preparedby  || '',
  ]);

  return jsonResponse({ status: 'ok' });
}

// ── POST: save full plan snapshot (per-day breakdown) ───────────
// Called right after handleAdd so the review feature has the daily detail
function handleSavePlan(payload) {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  let   sheet = ss.getSheetByName(SNAPSHOTS_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(SNAPSHOTS_SHEET);
    sheet.appendRow([
      'PlanId', 'School', 'Subject', 'Grade',
      'WeekDate', 'SavedAt', 'PlanJSON', 'ReviewedAt', 'CompletionJSON'
    ]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, 9).setFontWeight('bold');
  }

  // PlanId is unique per school+subject+grade+week — safe to upsert
  const planId = [payload.school, payload.subject, payload.grade, payload.weekDateRaw].join('_');
  const rows   = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === planId) {
      sheet.getRange(i + 1, 6).setValue(new Date().toISOString()); // SavedAt
      sheet.getRange(i + 1, 7).setValue(JSON.stringify(payload));  // PlanJSON
      return jsonResponse({ status: 'ok' });
    }
  }

  sheet.appendRow([
    planId,
    payload.school   || '',
    payload.subject  || '',
    payload.grade    || '',
    payload.weekDate || '',
    payload.savedAt  || new Date().toISOString(),
    JSON.stringify(payload),
    '',   // ReviewedAt — empty until teacher completes the review screen
    '',   // CompletionJSON
  ]);

  return jsonResponse({ status: 'ok' });
}

// ── GET: fetch most recent unreviewed plan for school+subject+grade
function handleGetLastPlan(params) {
  const { school, subject, grade } = params;

  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SNAPSHOTS_SHEET);

  if (!sheet) return jsonResponse({ status: 'ok', plan: null });

  const rows = sheet.getDataRange().getValues();

  // Walk backwards → most recent first; return first unreviewed match
  for (let i = rows.length - 1; i >= 1; i--) {
    const [, rowSchool, rowSubject, rowGrade, , , planJson, reviewedAt] = rows[i];
    if (
      rowSchool  === school  &&
      rowSubject === subject &&
      String(rowGrade) === String(grade) &&
      !reviewedAt
    ) {
      return jsonResponse({ status: 'ok', plan: JSON.parse(planJson) });
    }
  }

  return jsonResponse({ status: 'ok', plan: null });
}

// ── POST: save completion review ─────────────────────────────────
function handleSaveReview(payload) {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SNAPSHOTS_SHEET);

  if (!sheet) return jsonResponse({ status: 'error', message: 'Plans sheet not found' });

  const planId = [payload.school, payload.subject, payload.grade, payload.weekDateRaw].join('_');
  const rows   = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === planId) {
      sheet.getRange(i + 1, 8).setValue(payload.reviewedAt || new Date().toISOString());
      sheet.getRange(i + 1, 9).setValue(JSON.stringify(payload.completionStatus));
      return jsonResponse({ status: 'ok' });
    }
  }

  return jsonResponse({ status: 'error', message: 'Plan not found — savePlan must be called first' });
}

// ── Shared helper ────────────────────────────────────────────────
function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
