// WildWise — Netlify Function: send-email
// Sends transactional emails via Resend
// POST body: { to, subject, html }

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  // TODO: implement Resend email dispatch
  // const { to, subject, html } = JSON.parse(event.body)

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'send-email stub — not yet implemented' })
  }
}
