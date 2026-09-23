import nodemailer from 'nodemailer';
import env from '../config/env.js';

// If SMTP details are configured, real e-mails are sent. Otherwise nodemailer's
// JSON transport is used and the e-mail is printed to the console (handy for demos).
const transporter = env.smtp.host
  ? nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.pass } : undefined,
    })
  : nodemailer.createTransport({ jsonTransport: true });

function layout(title, bodyHtml) {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#f7f4ec;padding:24px">
    <div style="max-width:560px;margin:auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e7e1d2">
      <div style="background:#1e3a2b;color:#fff;padding:18px 24px;font-size:20px;font-weight:bold">MarketLink</div>
      <div style="padding:24px;color:#1c2421;line-height:1.6">
        <h2 style="margin-top:0;color:#1e3a2b">${title}</h2>
        ${bodyHtml}
      </div>
      <div style="padding:14px 24px;background:#f0ece1;color:#6b7a72;font-size:12px">
        Fresh from local farmers. Pay at pickup &middot; This is an automated message.
      </div>
    </div>
  </div>`;
}

const escapeHtml = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/** Sends an e-mail. Never throws: a failed e-mail must not break the order flow. */
export async function sendMail({ to, subject, message }) {
  if (!to) return;
  try {
    const body = escapeHtml(message)
      .replace(/(https:\/\/[^\s<]+)/g, '<a href="$1" style="color:#2e7d4f">$1</a>')
      .replace(/\n/g, '<br>');
    const html = layout(escapeHtml(subject), `<p>${body}</p>`);
    const info = await transporter.sendMail({ from: env.smtp.from, to, subject: `MarketLink: ${subject}`, text: message, html });
    if (!env.smtp.host && env.nodeEnv !== 'test') {
      console.log(`[mail] (console mode) To: ${to} | Subject: ${subject}\n       ${message.replace(/\n/g, '\n       ')}`);
    }
    return info;
  } catch (err) {
    console.error('[mail] failed to send e-mail:', err.message);
  }
}
