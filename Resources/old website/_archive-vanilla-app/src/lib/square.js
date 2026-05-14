/**
 * square.js — Square payment helpers
 *
 * Kit purchases and donation flows go through Square.
 * Heavy lifting (webhook verification, order creation) happens in
 * netlify/functions/square-webhook.js and the Square dashboard.
 *
 * Client-side: we redirect to a Square payment link or use
 * the Square Web Payments SDK for embedded checkout.
 */

const KIT_REQUEST_URL = '/.netlify/functions/kit-request'

/**
 * Submit a rescue kit request (may involve a payment).
 * @param {{ userId: string, role: string, kitType: string, shippingAddress: object }} payload
 */
export async function requestKit(payload) {
  const res = await fetch(KIT_REQUEST_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`Kit request failed: ${res.status}`)
  return res.json()
}

/**
 * Redirect to a Square-hosted payment link for a kit purchase.
 * @param {string} paymentLinkUrl — from Square dashboard or API
 */
export function redirectToSquareCheckout(paymentLinkUrl) {
  window.location.href = paymentLinkUrl
}

// TODO: Integrate Square Web Payments SDK for inline checkout
// https://developer.squareup.com/docs/web-payments/overview
