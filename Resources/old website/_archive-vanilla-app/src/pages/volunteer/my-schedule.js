import { requireAuth } from '../../lib/auth.js'
import { getShifts, getVolunteerSignups, signUpForShift, cancelShiftSignup } from '../../lib/api.js'
import { initNav, setPageTitle } from '../../components/nav.js'
import { ROLES } from '../../lib/roles.js'
import { formatDate } from '../../lib/utils.js'

const signedUpList = document.getElementById('signedUpList')
const openShiftsList = document.getElementById('openShiftsList')
const messageBox = document.getElementById('scheduleMessage')
let currentUser = null

function showMessage(message, isError = false) {
  if (!messageBox) return
  messageBox.textContent = message
  messageBox.hidden = !message
  messageBox.classList.toggle('auth-error', isError)
  if (!isError) messageBox.classList.remove('auth-error')
}

function renderShiftSummary(shift) {
  return `
    <div class="stat-card" style="margin-bottom: 1rem;">
      <p class="stat-card__label">${shift.title}</p>
      <p class="stat-card__value">${formatDate(shift.date)} ${shift.start_time || ''} – ${shift.end_time || ''}</p>
      <p>Task: ${shift.task}</p>
      <p>Hosted by: ${shift.rehabberName || 'Rehabber'}</p>
    </div>`
}

function renderOpenShift(shift) {
  return `
    <div class="stat-card" style="margin-bottom: 1rem;">
      <p class="stat-card__label">${shift.title}</p>
      <p class="stat-card__value">${formatDate(shift.date)} ${shift.start_time || ''} – ${shift.end_time || ''}</p>
      <p>Task: ${shift.task}</p>
      <p>Remaining spots: ${shift.spotsRemaining}</p>
      <button data-shift-id="${shift.id}" class="btn-primary signupButton">Sign up</button>
    </div>`
}

async function refreshSchedule() {
  if (!currentUser) return
  const { data: allShifts = [] } = await getShifts()
  const { data: signups = [] } = await getVolunteerSignups(currentUser.id)

  const shiftById = new Map(allShifts.map(shift => [shift.id, shift]))
  const upcoming = signups
    .map(signup => ({ signup, shift: shiftById.get(signup.shiftId) }))
    .filter(item => item.shift)

  const signedUpHtml = upcoming.length
    ? upcoming.map(({ signup, shift }) => `
        <div class="stat-card" style="margin-bottom: 1rem;">
          <p class="stat-card__label">${shift.title}</p>
          <p class="stat-card__value">${formatDate(shift.date)} ${shift.start_time || ''} – ${shift.end_time || ''}</p>
          <p>Task: ${shift.task}</p>
          <button data-signup-id="${signup.id}" class="btn-secondary cancelButton">Cancel</button>
        </div>`
      ).join('')
    : '<p>No confirmed shifts yet. Sign up below to get started.</p>'

  signedUpList.innerHTML = signedUpHtml

  const signedShiftIds = new Set(signups.map(item => item.shiftId))
  const openShifts = allShifts.filter(shift => shift.spotsRemaining > 0 && !signedShiftIds.has(shift.id))
  openShiftsList.innerHTML = openShifts.length
    ? openShifts.map(renderOpenShift).join('')
    : '<p>No open opportunities available right now.</p>'

  document.querySelectorAll('.signupButton').forEach(button => {
    button.addEventListener('click', async () => {
      await handleSignup(button.dataset.shiftId)
    })
  })

  document.querySelectorAll('.cancelButton').forEach(button => {
    button.addEventListener('click', async () => {
      await handleCancel(button.dataset.signupId)
    })
  })
}

async function handleSignup(shiftId) {
  const { error } = await signUpForShift({
    shiftId,
    volunteerId: currentUser.id,
    volunteerName: currentUser.full_name || currentUser.email,
  })

  if (error) {
    showMessage(error.message, true)
    return
  }

  showMessage('Signed up successfully.', false)
  await refreshSchedule()
}

async function handleCancel(signupId) {
  const { error } = await cancelShiftSignup(signupId)
  if (error) {
    showMessage(error.message, true)
    return
  }

  showMessage('Shift signup canceled.', false)
  await refreshSchedule()
}

async function init() {
  currentUser = await requireAuth([ROLES.VOLUNTEER])
  if (!currentUser) return

  initNav(currentUser)
  setPageTitle('My Schedule')
  await refreshSchedule()
}

init()
