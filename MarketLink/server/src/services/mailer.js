import nodemailer from 'nodemailer';
import env from '../config/env.js';

/**
 * Three ways to deliver e-mail (set SMTP_HOST in server/.env):
 *  - a real SMTP server (e.g. smtp.gmail.com)        -> e-mails are really sent
 *  - SMTP_HOST=ethereal                               -> free test inbox; a link to view each e-mail is printed
 *  - SMTP_HOST empty (default)                        -> the e-mail is printed in the server console
 */
export function mailMode() {
  if (!env.smtp.host) return 'console';
  return env.smtp.host.toLowerCase() === 'ethereal' ? 'ethereal' : 'smtp';
}

let transporterPromise;
function getTransporter() {
  if (!transporterPromise) {
    const mode = mailMode();
    if (mode === 'smtp') {
      transporterPromise = Promise.resolve(
        nodemailer.createTransport({
          host: env.smtp.host,
          port: env.smtp.port,
          secure: env.smtp.port === 465,
          auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.pass } : undefined,
        })
      );
    } else if (mode === 'ethereal') {
      transporterPromise = nodemailer.createTestAccount().then((account) => {
        console.log(`[mail] Ethereal test inbox ready: ${account.user} (password ${account.pass}) - log in at https://ethereal.email`);
        return nodemailer.createTransport({ host: account.smtp.host, port: account.smtp.port, secure: account.smtp.secure, auth: { user: account.user, pass: account.pass } });
      });
      transporterPromise.catch(() => {
        transporterPromise = undefined; // try again next time (e.g. no internet right now)
      });
    } else {
      transporterPromise = Promise.resolve(nodemailer.createTransport({ jsonTransport: true }));
    }
  }
  return transporterPromise;
}

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
    const transporter = await getTransporter();
    const info = await transporter.sendMail({ from: env.smtp.from, to, subject: `MarketLink: ${subject}`, text: message, html });
    if (mailMode() === 'ethereal') console.log(`[mail] To: ${to} | ${subject} | view: ${nodemailer.getTestMessageUrl(info)}`);
    if (mailMode() === 'console' && env.nodeEnv !== 'test') {
      console.log(`[mail] (console mode) To: ${to} | Subject: ${subject}\n       ${message.replace(/\n/g, '\n       ')}`);
    }
    return info;
  } catch (err) {
    console.error('[mail] failed to send e-mail:', err.message);
  }
}
