/**
 * resend.js — Email helpers via Netlify function
 *
 * All email is sent server-side through netlify/functions/send-email.js
 * to keep the Resend API key out of the browser.
 */

const SEND_EMAIL_URL = '/.netlify/functions/send-email'

/**
 * Low-level email dispatcher.
 * @param {{ to: string, subject: string, html: string }} options
 */
async function sendEmail({ to, subject, html }) {
  const res = await fetch(SEND_EMAIL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, subject, html }),
  })
  if (!res.ok) throw new Error(`Email send failed: ${res.status}`)
  return res.json()
}

// ---------------------------------------------------------------------------
// Named email templates
// ---------------------------------------------------------------------------

export async function sendWelcomeEmail({ to, name, role }) {
  return sendEmail({
    to,
    subject: 'Welcome to WildWise!',
    html: `<p>Hi ${name}, your ${role} account has been created. Check your dashboard to get started.</p>`,
  })
}

export async function sendApprovalEmail({ to, name, approved }) {
  const msg = approved
    ? `Your WildWise account has been approved. You can now log in and access your dashboard.`
    : `Your WildWise account application was not approved at this time. Please contact support for more information.`
  return sendEmail({ to, subject: `WildWise — Account ${approved ? 'Approved' : 'Not Approved'}`, html: `<p>Hi ${name},</p><p>${msg}</p>` })
}

export async function sendKitRequestEmail({ to, name, kitType, address }) {
  return sendEmail({
    to,
    subject: 'WildWise — Rescue Kit Request Received',
    html: `<p>Hi ${name},</p><p>Your request for a <strong>${kitType}</strong> rescue kit has been received. It will be shipped to: ${address}.</p>`,
  })
}

export async function sendCaseAssignmentEmail({ to, name, caseId, species }) {
  return sendEmail({
    to,
    subject: `WildWise — New Case Assigned: ${species} (#${caseId})`,
    html: `<p>Hi ${name},</p><p>A new case has been assigned to you: <strong>${species}</strong> (Case #${caseId}). Log in to view details.</p>`,
  })
}

export async function sendTransportRequestEmail({ to, name, species, pickup, dropoff }) {
  return sendEmail({
    to,
    subject: `WildWise — Transport Request: ${species}`,
    html: `<p>Hi ${name},</p><p>A transport request has been submitted for a <strong>${species}</strong>.<br>Pickup: ${pickup}<br>Drop-off: ${dropoff}</p>`,
  })
}
