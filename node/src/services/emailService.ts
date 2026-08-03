import { env } from '../config/env.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('email');

/** True when a Resend key is configured. All senders no-op (log) without it. */
export function isEmailEnabled(): boolean {
  return !!env.RESEND_API_KEY;
}

const FROM = () => env.EMAIL_FROM ?? 'TechFirms <onboarding@resend.dev>';

/** Public site base URL for building links in emails. */
export function appUrl(): string {
  const raw = env.APP_URL ?? env.CORS_ORIGIN.split(',')[0] ?? 'http://localhost:3000';
  return /^https?:\/\//.test(raw) ? raw.replace(/\/$/, '') : `https://${raw}`;
}

const shell = (title: string, bodyHtml: string) =>
  `<div style="font-family:system-ui,Segoe UI,Arial,sans-serif;max-width:520px;margin:0 auto;color:#111">
     <h2 style="margin:0 0 12px">${title}</h2>${bodyHtml}
     <p style="margin-top:24px;color:#888;font-size:12px">— TechFirms</p>
   </div>`;

async function send(to: string, subject: string, html: string): Promise<boolean> {
  if (!env.RESEND_API_KEY) {
    logger.info({ to, subject }, 'email disabled (no RESEND_API_KEY) — skipping');
    return false;
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM(), to, subject, html }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      logger.warn({ status: res.status, to, detail: detail.slice(0, 200) }, 'resend non-200');
      return false;
    }
    return true;
  } catch (e) {
    logger.warn({ err: e, to }, 'email send failed');
    return false;
  }
}

export async function sendLeadNotification(to: string, companyName: string, projectType: string) {
  return send(
    to,
    `New project inquiry for ${companyName}`,
    shell('You have a new inquiry 🎉', `<p>A buyer submitted a project on TechFirms: <strong>${projectType}</strong>.</p><p><a href="${appUrl()}/dashboard">Open your dashboard</a> to see the details and respond.</p>`),
  );
}

export async function sendTeamInvite(to: string, companyName: string, role: string, acceptPath: string) {
  return send(
    to,
    `You're invited to help manage ${companyName} on TechFirms`,
    shell(`Join ${companyName}`, `<p>You've been invited as a <strong>${role}</strong>.</p><p><a href="${appUrl()}${acceptPath}">Accept the invitation</a></p>`),
  );
}

export async function sendReviewInvite(to: string, companyName: string, reviewPath: string) {
  return send(
    to,
    `Share your experience with ${companyName}`,
    shell(`Review ${companyName}`, `<p>${companyName} invited you to leave a verified review on TechFirms.</p><p><a href="${appUrl()}${reviewPath}">Write your review</a></p>`),
  );
}
