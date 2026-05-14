// WildWise — Role constants and permission helpers

export const ROLES = {
  FINDER:              'finder',
  REHABBER:            'licensed_rehabber',
  SUB_PERMITTEE:       'sub_permittee',
  VOLUNTEER:           'volunteer',
  TRANSPORT_VOLUNTEER: 'transport_volunteer',
  VET:                 'licensed_vet',
  ADMIN:               'admin'
}

// Roles that require license verification before activation
export const ROLES_REQUIRING_LICENSE = [
  ROLES.REHABBER,
  ROLES.VET
]

// Roles that require third-party approval before activation
// Rehabber + Vet = admin approval
// Sub-permittee = their specified rehabber's approval
export const ROLES_REQUIRING_APPROVAL = [
  ROLES.REHABBER,
  ROLES.VET,
  ROLES.SUB_PERMITTEE
]

// Role-to-dashboard mapping
export const ROLE_DASHBOARD = {
  [ROLES.FINDER]:              '/pages/finder/dashboard.html',
  [ROLES.REHABBER]:            '/pages/rehabber/dashboard.html',
  [ROLES.SUB_PERMITTEE]:       '/pages/sub-permittee/dashboard.html',
  [ROLES.VOLUNTEER]:           '/pages/volunteer/dashboard.html',
  [ROLES.TRANSPORT_VOLUNTEER]: '/pages/transport-volunteer/dashboard.html',
  [ROLES.VET]:                 '/pages/vet/dashboard.html',
  [ROLES.ADMIN]:               '/pages/admin/dashboard.html'
}
