/**
 * Asha Garment Factory — Quote form handler
 *
 * Receives quote requests from the website, logs each one as a row in the
 * "Quote Requests" sheet, and emails a notification to NOTIFY_EMAIL.
 *
 * SETUP: see README.md in this folder.
 */

const NOTIFY_EMAIL = 'benedict@johnfoundation.org';
const SHEET_NAME   = 'Quote Requests';

// Column order in the sheet: [header label, payload key]
const FIELDS = [
  ['Received',          'timestamp'],
  ['Name',              'name'],
  ['Company / Brand',   'company'],
  ['Email',             'email'],
  ['WhatsApp / Phone',  'phone'],
  ['Country',           'country'],
  ['Product Category',  'product'],
  ['Monthly Quantity',  'quantity'],
  ['Sourcing Stage',    'stage'],
  ['Requirements',      'message'],
];

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);

    const data  = JSON.parse(e.postData.contents);
    const sheet = getSheet_();

    data.timestamp = new Date();
    sheet.appendRow(FIELDS.map(([, key]) => clean_(data[key])));

    sendNotification_(data);

    return json_({ result: 'success' });
  } catch (err) {
    console.error(err);
    return json_({ result: 'error', message: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/* Run once from the editor to grant permissions and create the sheet tab */
function setup() {
  getSheet_();
  console.log(`Ready. Emails left today: ${MailApp.getRemainingDailyQuota()}`);
}

/* Creates the sheet and header row on first use */
function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(FIELDS.map(([label]) => label));
    sheet.getRange(1, 1, 1, FIELDS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function sendNotification_(data) {
  const lines = FIELDS
    .filter(([, key]) => key !== 'timestamp')
    .map(([label, key]) => `${label}: ${data[key] || '—'}`);

  const options = { name: 'AGF Website' };
  if (data.email) options.replyTo = data.email;

  MailApp.sendEmail(
    NOTIFY_EMAIL,
    `New quote request — ${data.company || data.name || 'Website'}`,
    `A new quote request came in from the website.\n\n${lines.join('\n')}\n\n` +
    `Reply to this email to respond directly to the client.`,
    options
  );
}

/* Stops submitted text like "=IMPORTXML(...)" from running as a formula */
function clean_(value) {
  if (value instanceof Date) return value;
  const str = String(value == null ? '' : value).trim();
  return /^[=+\-@]/.test(str) ? `'${str}` : str;
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
