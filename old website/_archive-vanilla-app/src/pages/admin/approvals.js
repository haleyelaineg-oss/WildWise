import { requireAuth } from '../../lib/auth.js'
import { getProfiles, updateProfile } from '../../lib/api.js'
import { initNav, setPageTitle } from '../../components/nav.js'
import { ROLES } from '../../lib/roles.js'

const approvalsList = document.getElementById('approvalsList')
const messageBox = document.getElementById('approvalsMessage')
let currentUser = null

function showMessage(message, isError = false) {
  if (!messageBox) return
  messageBox.textContent = message
  messageBox.hidden = !message
  messageBox.classList.toggle('auth-error', isError)
  if (!isError) messageBox.classList.remove('auth-error')
}

function renderApprovalCard(profile) {
  const roleLabel = profile.role.replace(/_/g, ' ')
  return `
    <article class="stat-card" style="margin-bottom: 1rem;">
      <p class="stat-card__label">${profile.full_name || profile.email}</p>
      <p class="stat-card__value">${profile.email}</p>
      <p>Role: ${roleLabel}</p>
      ${profile.license_number ? `<p>License: ${profile.license_number} (${profile.license_state || 'N/A'})</p>` : ''}
      ${profile.rehabber_email ? `<p>Rehabber: ${profile.rehabber_email}</p>` : ''}
      <div style="margin-top: 1rem; display:flex; gap:0.75rem; flex-wrap:wrap;">
        <button data-id="${profile.id}" class="btn-primary approveButton">Approve</button>
      </div>
    </article>`
}

async function refreshApprovals() {
  if (!currentUser) return
  const { data: profiles = [], error } = await getProfiles({ approved: false })
  if (error) {
    showMessage(error.message || 'Unable to load pending approvals.', true)
    return
  }

  const pending = profiles.filter(profile => [ROLES.REHABBER, ROLES.VET].includes(profile.role))

  if (!pending.length) {
    approvalsList.innerHTML = '<p>No pending account approvals at this time.</p>'
    return
  }

  approvalsList.innerHTML = pending.map(renderApprovalCard).join('')
  document.querySelectorAll('.approveButton').forEach(button => {
    button.addEventListener('click', async () => {
      const profileId = button.dataset.id
      button.disabled = true
      const { data, error: updateError } = await updateProfile(profileId, { approved: true })
      if (updateError) {
        showMessage(updateError.message || 'Approval failed.', true)
        button.disabled = false
        return
      }
      showMessage(`${data.full_name || data.email} approved successfully.`, false)
      await refreshApprovals()
    })
  })
}

async function init() {
  currentUser = await requireAuth([ROLES.ADMIN])
  if (!currentUser) return

  initNav(currentUser)
  setPageTitle('Approvals')
  await refreshApprovals()
}

init()
