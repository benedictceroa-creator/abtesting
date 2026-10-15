// ── JOHNS ACADEMY CAREER COMPASS — CLAUDE CHAT PROXY ─────────────────────────
//
// SETUP (one-time, ~5 minutes):
//
// 1. Go to https://script.google.com → New Project → paste this entire file.
// 2. Add your Claude API key:
//    - Click the lock icon (Project Settings) → Script Properties
//    - Add property: Name = CLAUDE_API_KEY, Value = sk-ant-...your key...
// 3. Deploy → New deployment → Web app
//    - Execute as: Me
//    - Who has access: Anyone
//    - Click Deploy → copy the Web App URL
// 4. Paste that URL into CHAT_PROXY_URL at the top of app.js.
// 5. Done — the AI chat will now work in Career Compass.
//
// ─────────────────────────────────────────────────────────────────────────────

function doPost(e) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('CLAUDE_API_KEY');

  if (!apiKey) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: 'CLAUDE_API_KEY not set in Script Properties.' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch {
    return ContentService
      .createTextOutput(JSON.stringify({ error: 'Invalid JSON body.' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const response = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    payload: JSON.stringify({
      model: body.model || 'claude-haiku-4-5-20251001',
      max_tokens: body.max_tokens || 600,
      system: body.system || '',
      messages: body.messages || [],
    }),
    muteHttpExceptions: true,
  });

  return ContentService
    .createTextOutput(response.getContentText())
    .setMimeType(ContentService.MimeType.JSON);
}

// Needed to allow cross-origin requests from the browser
function doOptions(e) {
  return ContentService.createTextOutput('').setMimeType(ContentService.MimeType.TEXT);
}
