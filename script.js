/* ════════════════════════════════════════════════════════
   OLIS — script.js
   Validates the waitlist form and records each opt-in to a
   Google Sheet via an Apps Script web app.
   ════════════════════════════════════════════════════════ */

/* ────────────────────────────────────────────────────────
   GOOGLE SHEET CONNECTION
   1. Open your Google Sheet → Extensions → Apps Script
   2. Delete anything there and paste:

        function doPost(e) {
          var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
          sheet.appendRow([e.parameter.first, e.parameter.last,
                           e.parameter.email, e.parameter.ts]);
          return ContentService.createTextOutput("ok");
        }

   3. Deploy → New deployment → ⚙ → Web app.
      Execute as "Me", Who has access "Anyone". Deploy & authorize.
   4. Copy the Web App URL and paste it below, replacing
      PASTE_YOUR_APPS_SCRIPT_URL_HERE.
   ──────────────────────────────────────────────────────── */
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz3c7RsuShQN6weYWM2kBfW70xOsig1cF6joybPrjXI0CFwwG0lst9uO9vdk-fnDWQPUQ/exec";

document.addEventListener('DOMContentLoaded', function () {
  const form    = document.getElementById('waitlist');
  const first   = document.getElementById('first');
  const last    = document.getElementById('last');
  const input   = document.getElementById('email');
  const button  = document.getElementById('submit');
  const note    = document.getElementById('note');
  const success = document.getElementById('success');

  if (!form) return;

  const valid = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const fn = first.value.trim();
    const ln = last.value.trim();
    const email = input.value.trim();
    note.classList.remove('error');

    if (!fn || !ln) {
      note.textContent = 'Please enter your first and last name.';
      note.classList.add('error');
      (fn ? last : first).focus();
      return;
    }
    if (!valid(email)) {
      note.textContent = 'Please enter a valid email address.';
      note.classList.add('error');
      input.focus();
      return;
    }

    button.disabled = true;
    button.textContent = '…';
    note.textContent = '';

    try {
      if (SCRIPT_URL && !SCRIPT_URL.startsWith('PASTE_')) {
        const body = new FormData();
        body.append('first', fn);
        body.append('last', ln);
        body.append('email', email);
        body.append('ts', new Date().toISOString());
        // no-cors: fire-and-forget write; Apps Script records the row.
        await fetch(SCRIPT_URL, { method: 'POST', mode: 'no-cors', body });
      } else {
        // Not yet connected to a sheet — simulate success for preview.
        console.warn('SCRIPT_URL not set — captured locally only:', fn, ln, email);
        await new Promise(r => setTimeout(r, 500));
      }
      form.style.display = 'none';
      success.classList.add('show');
    } catch (err) {
      console.error(err);
      note.textContent = 'Something went wrong. Please try again.';
      note.classList.add('error');
      button.disabled = false;
      button.textContent = 'Opt in';
    }
  });
});
