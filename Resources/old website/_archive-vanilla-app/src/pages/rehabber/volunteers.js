import { requireAuth } from '../../lib/auth.js'
import { createShift, getShifts } from '../../lib/api.js'
import { initNav, setPageTitle } from '../../components/nav.js'
import { ROLES } from '../../lib/roles.js'
import { formatDate } from '../../lib/utils.js'

const form = document.getElementById('shiftForm')
const shiftList = document.getElementById('shiftList')
const errorBox = document.getElementById('shiftError')
let currentUser = null

function showError(message) {
  if (!errorBox) return
  errorBox.textContent = message
  errorBox.hidden = !message
}

function renderShift(shift) {
  const volunteerList = shift.signups?.length
    ? `<ul style="margin: 0.5rem 0 0 0; padding-left: 1.25rem;">${shift.signups.map(signup => `<li>${signup.volunteerName}</li>`).join('')}</ul>`
    : '<p style="margin: 0.5rem 0 0 0; color: var(--color-text-muted);">No volunteers signed up yet.</p>'

  return `
    <article class="stat-card" style="margin-bottom: 1rem;">
      <p class="stat-card__label">${shift.title}</p>
      <p class="stat-card__value">${formatDate(shift.date)} ${shift.start_time || ''} – ${shift.end_time || ''}</p>
      <p>Task: ${shift.task}</p>
      <p>Capacity: ${shift.capacity} | Spots left: ${shift.spotsRemaining}</p>
      <div style="margin-top: 0.75rem;">
        <strong>Volunteers signed up</strong>
        ${volunteerList}
      </div>
    </article>`
}

async function refreshShifts() {
  if (!currentUser) return
  const { data: shifts = [] } = await getShifts({ rehabberId: currentUser.id })

  if (!shifts.length) {
    shiftList.innerHTML = '<p>No shifts created yet. Use the form above to create the first opportunity.</p>'
    return
  }

  shiftList.innerHTML = shifts.map(renderShift).join('')
}

form?.addEventListener('submit', async (event) => {
  event.preventDefault()
  showError('')

  const formData = new FormData(form)
  const payload = {
    title: formData.get('title')?.toString().trim(),
    task: formData.get('task')?.toString().trim(),
    date: formData.get('date')?.toString(),
    start_time: formData.get('startTime')?.toString(),
    end_time: formData.get('endTime')?.toString(),
    capacity: Number(formData.get('capacity') || 1),
    rehabberId: currentUser.id,
  }

  if (!payload.title || !payload.task || !payload.date || !payload.start_time || !payload.end_time) {
    showError('Please complete all fields before creating a shift.')
    return
  }

  const { error } = await createShift(payload)
  if (error) {
    showError(error.message)
    return
  }

  form.reset()
  await refreshShifts()
})

async function init() {
  currentUser = await requireAuth([ROLES.REHABBER])
  if (!currentUser) return

  initNav(currentUser)
  setPageTitle('Volunteer shifts')
  await refreshShifts()
}

init()
