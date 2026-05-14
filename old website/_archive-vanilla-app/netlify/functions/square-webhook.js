// WildWise — Netlify Function: square-webhook
// Receives and verifies Square payment webhooks
// Validates SQUARE_WEBHOOK_SECRET before processing

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  // TODO: verify Square webhook signature
  // TODO: handle payment.completed, order.updated, etc.

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'square-webhook stub — not yet implemented' })
  }
}
