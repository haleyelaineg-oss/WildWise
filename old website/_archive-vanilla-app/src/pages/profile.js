import { requireAuth } from '../lib/auth.js'
import { initNav, setPageTitle } from '../components/nav.js'

const profileInfo = document.getElementById('profileInfo')

function renderStatus(user) {
  if (user.approved === false) {
    return '<span style="color:#bf3b3b;font-weight:700">Pending approval</span>'
  }
  return '<span style="color:#2f8a4a;font-weight:700">Approved</span>'
}

function renderProfile(user) {
  const roleLabel = user.role?.replace(/_/g, ' ') || 'Volunteer'
  return `
    <div style="display:grid;gap:1rem;">
      <div><strong>Name:</strong> ${user.full_name || user.email}</div>
      <div><strong>Email:</strong> ${user.email}</div>
      <div><strong>Role:</strong> ${roleLabel}</div>
      <div><strong>Status:</strong> ${renderStatus(user)}</div>
      ${user.license_number ? `<div><strong>License:</strong> ${user.license_number} (${user.license_state || 'N/A'})</div>` : ''}
      ${user.rehabber_email ? `<div><strong>Rehabber:</strong> ${user.rehabber_email}</div>` : ''}
      <div><strong>Member since:</strong> ${user.created_at ? new Date(user.created_at).toLocaleDateString('en-US') : 'Unknown'}</div>
    </div>`
}

async function init() {
  const user = await requireAuth()
  if (!user) return

  initNav(user)
  setPageTitle('Profile')

  if (profileInfo) {
    profileInfo.innerHTML = renderProfile(user)
  }
}

init()
