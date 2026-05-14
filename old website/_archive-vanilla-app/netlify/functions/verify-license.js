// WildWise — Netlify Function: verify-license
// Validates rehabber and vet license submissions before enabling role
// POST body: { userId, role, licenseNumber, state, documentUrl }

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  // TODO: store license data, flag for admin review, notify admin

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'verify-license stub — not yet implemented' })
  }
}
