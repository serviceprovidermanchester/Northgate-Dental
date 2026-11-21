/**
 * SMS Utility — Northgate Dental
 * ================================
 * Dev mode  : logs message to console (no Twilio account needed).
 * Production: sends via Twilio REST API when env vars are present.
 *
 * Required env vars (production only):
 *   TWILIO_ACCOUNT_SID   — your Twilio account SID
 *   TWILIO_AUTH_TOKEN    — your Twilio auth token
 *   TWILIO_FROM_NUMBER   — your Twilio phone number, e.g. +441613709000
 *
 * @module utils/sms
 * @author SPManchester Private Limited <info@spmanchester.com>
 * @see    https://spmanchester.com/
 */

'use strict';

const https  = require('https');
const qs     = require('querystring');

/* ─── helpers ──────────────────────────────────────────────────────────────── */

/**
 * Minimal Twilio SMS send without the full SDK (zero extra dependencies).
 * Uses Node's built-in https module so the backend stays lean.
 *
 * @param {object} opts
 * @param {string} opts.to      — recipient E.164 number, e.g. '+447700900000'
 * @param {string} opts.message — plain-text body (max 160 chars for one SMS)
 * @returns {Promise<object>}   — Twilio response body (parsed JSON)
 */
function twilioSend({ to, message }) {
  return new Promise((resolve, reject) => {
    const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER } = process.env;

    const body = qs.stringify({
      To   : to,
      From : TWILIO_FROM_NUMBER,
      Body : message,
    });

    const options = {
      hostname : 'api.twilio.com',
      path     : `/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      method   : 'POST',
      auth     : `${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`,
      headers  : {
        'Content-Type'   : 'application/x-www-form-urlencoded',
        'Content-Length' : Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(`Twilio ${res.statusCode}: ${parsed.message || data}`));
          }
        } catch (e) {
          reject(new Error(`Twilio parse error: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

/* ─── public API ────────────────────────────────────────────────────────────── */

/**
 * Send an SMS message.
 *
 * In development (NODE_ENV !== 'production' or missing Twilio credentials)
 * the message is printed to stdout instead of sending.
 *
 * @param {object} opts
 * @param {string} opts.to      — recipient phone number (E.164 preferred)
 * @param {string} opts.message — text body
 * @returns {Promise<void>}
 */
async function sendSms({ to, message }) {
  const isProduction = process.env.NODE_ENV === 'production';
  const hasTwilio    = !!(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN  &&
    process.env.TWILIO_FROM_NUMBER
  );

  if (isProduction && hasTwilio) {
    try {
      const result = await twilioSend({ to, message });
      console.log(`[SMS] Sent to ${to} — SID: ${result.sid}`);
    } catch (err) {
      // Log but don't crash — SMS failure must never kill a booking
      console.error(`[SMS] Failed to send to ${to}:`, err.message);
    }
  } else {
    // Dev / staging — print to console so the developer can see what would be sent
    console.log('─'.repeat(60));
    console.log('[DEV SMS] Would send:');
    console.log(`  To     : ${to}`);
    console.log(`  Body   : ${message}`);
    console.log('─'.repeat(60));
  }
}

/**
 * Pre-built message templates for consistency.
 * All messages stay under 160 chars so they fit in one SMS segment.
 */
const templates = {
  /**
   * Sent to the patient when their appointment request is received.
   */
  bookingReceived: ({ name, ref, date, time }) =>
    `Hi ${name}, Northgate Dental received your request (${ref}) for ${date} at ${time}. We'll confirm within 2hrs. Call 0161 XXX XXXX if urgent.`,

  /**
   * Sent when staff confirm the appointment.
   */
  bookingConfirmed: ({ name, ref, date, time, clinician }) =>
    `Hi ${name}, your appointment (${ref}) is confirmed with ${clinician} on ${date} at ${time}. Reply CANCEL to cancel. Northgate Dental.`,

  /**
   * Sent when an appointment is cancelled.
   */
  bookingCancelled: ({ name, ref }) =>
    `Hi ${name}, your Northgate Dental appointment (${ref}) has been cancelled. Book again at northgatedental.co.uk or call us.`,

  /**
   * 24-hour reminder.
   */
  reminder24h: ({ name, date, time, clinician }) =>
    `Reminder: Northgate Dental appointment tomorrow, ${date} at ${time} with ${clinician}. Reply CANCEL to cancel or call 0161 XXX XXXX.`,
};

module.exports = { sendSms, templates };
