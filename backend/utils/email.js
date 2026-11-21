/**
 * Utility: Email (Nodemailer)
 * SPManchester Private Limited
 */

'use strict';

const nodemailer = require('nodemailer');

function createTransporter() {
  if (process.env.NODE_ENV === 'production') {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  // Dev: log to console instead of sending
  return {
    sendMail: async (opts) => {
      console.log('\n📧 [DEV EMAIL — not sent]');
      console.log('  To:      ', opts.to);
      console.log('  Subject: ', opts.subject);
      console.log('  Text:    ', (opts.text || '').slice(0, 100));
      return { messageId: 'dev-' + Date.now() };
    }
  };
}

async function sendAppointmentConfirmation({ to, name, reference, treatment, clinician, date, time }) {
  const transporter = createTransporter();
  const dateStr = new Date(date + 'T00:00:00').toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
  return transporter.sendMail({
    from: `"Northgate Dental" <${process.env.SMTP_USER || 'noreply@northgatedental.co.uk'}>`,
    to,
    subject: `Appointment Request Confirmed — ${reference}`,
    text: `
Dear ${name},

Thank you for your appointment request at Northgate Dental.

Booking Reference: ${reference}
Treatment:         ${treatment}
Clinician:         ${clinician}
Requested Date:    ${dateStr}
Requested Time:    ${time}

We will confirm your exact slot within 2 hours during opening hours (Mon–Sat 08:30–18:00).

If you need to change or cancel, please quote your reference: ${reference}

Kind regards,
Northgate Dental
Didsbury, Manchester
📞 0161 XXX XXXX
🌐 northgatedental.co.uk

---
Concept website built by SPManchester Private Limited — spmanchester.com
`.trim(),
  });
}

async function sendAdminNewBooking({ reference, name, phone, treatment, date, time }) {
  const transporter = createTransporter();
  return transporter.sendMail({
    from: `"Northgate Dental System" <${process.env.SMTP_USER || 'noreply@northgatedental.co.uk'}>`,
    to: process.env.ADMIN_EMAIL || 'reception@northgatedental.co.uk',
    subject: `[NEW BOOKING] ${reference} — ${treatment}`,
    text: `New appointment request received.\n\nRef: ${reference}\nPatient: ${name}\nPhone: ${phone}\nTreatment: ${treatment}\nDate: ${date} at ${time}\n\nLog in to the admin dashboard to confirm: http://localhost:3000/admin/`,
  });
}

async function sendContactConfirmation({ to, name, subject }) {
  const transporter = createTransporter();
  return transporter.sendMail({
    from: `"Northgate Dental" <${process.env.SMTP_USER || 'noreply@northgatedental.co.uk'}>`,
    to,
    subject: `We received your message — ${subject}`,
    text: `Dear ${name},\n\nThank you for contacting Northgate Dental. We have received your message regarding "${subject}" and will respond within one business day.\n\nKind regards,\nNorthgate Dental Team`,
  });
}

module.exports = { sendAppointmentConfirmation, sendAdminNewBooking, sendContactConfirmation };
