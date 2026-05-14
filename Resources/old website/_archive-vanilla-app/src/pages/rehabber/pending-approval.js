import { requireAuth } from '../../lib/auth.js'
import { ROLES } from '../../lib/roles.js'

async function init() {
  const user = await requireAuth([ROLES.REHABBER])
  if (!user) return
  if (user.approved === true) {
    window.location.href = '/pages/rehabber/dashboard.html'
  }
}

init()
