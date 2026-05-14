import { requireAuth } from '../../lib/auth.js'
import { getVolunteerSignups, getShifts } from '../../lib/api.js'
import { initNav, setPageTitle } from '../../components/nav.js'
import { ROLES } from '../../lib/roles.js'

const statsEl = document.getElementById('volunteerStats')

function renderStat(label, value) {
  return `
    <div class="stat-card">
      <p class="stat-card__label">${label}</p>
      <p class="stat-card__value">${value}</p>
    </div>`
}

async function refreshVolunteerDashboard(user) {
  const { data: signups = [] } = await getVolunteerSignups(user.id)
  const { data: allShifts = [] } = await getShifts()
  const upcoming = signups.filter(signup => allShifts.some(shift => shift.id === signup.shiftId)).length
  const openOpportunities = allShifts.filter(shift => shift.spotsRemaining > 0).length

  statsEl.innerHTML = [
    renderStat('Signed up for', upcoming),
    renderStat('Open opportunities', openOpportunities),
  ].join('')
}

async function init() {
  const user = await requireAuth([ROLES.VOLUNTEER])
  if (!user) return

  initNav(user)
  setPageTitle('Dashboard')
  await refreshVolunteerDashboard(user)
}

init()
