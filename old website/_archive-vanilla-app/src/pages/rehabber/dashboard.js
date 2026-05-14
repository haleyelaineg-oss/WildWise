import { requireAuth } from '../../lib/auth.js'
import { getShifts } from '../../lib/api.js'
import { initNav, setPageTitle } from '../../components/nav.js'
import { ROLES } from '../../lib/roles.js'

const statsEl = document.getElementById('dashboardStats')

function renderStat(label, value, help) {
  return `
    <div class="stat-card">
      <p class="stat-card__label">${label}</p>
      <p class="stat-card__value">${value}</p>
      ${help ? `<p class="stat-card__delta">${help}</p>` : ''}
    </div>`
}

async function refreshDashboard(user) {
  const { data: shifts = [] } = await getShifts({ rehabberId: user.id })
  const totalShifts = shifts.length
  const openSpots = shifts.reduce((sum, shift) => sum + (shift.spotsRemaining || 0), 0)
  const totalVolunteers = new Set(shifts.flatMap(shift => (shift.signups || []).map(signup => signup.volunteerId))).size

  statsEl.innerHTML = [
    renderStat('Open shifts', totalShifts, ''),
    renderStat('Spots remaining', openSpots, ''),
    renderStat('Volunteers signed up', totalVolunteers, ''),
  ].join('')
}

async function init() {
  const user = await requireAuth([ROLES.REHABBER])
  if (!user) return

  initNav(user)
  setPageTitle('Dashboard')
  await refreshDashboard(user)
}

init()
