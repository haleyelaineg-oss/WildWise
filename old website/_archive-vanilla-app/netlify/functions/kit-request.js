// WildWise — Netlify Function: kit-request
// Processes rescue kit requests from Finders and Transport Volunteers
// POST body: { userId, role, kitType, shippingAddress }

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  // TODO: validate request, deduct inventory, trigger send-email

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'kit-request stub — not yet implemented' })
  }
}
