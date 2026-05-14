/**
 * nav.js — WildWise App sidebar navigation
 *
 * Responsibilities:
 *   - Renders role-specific nav links into #sidebarNav
 *   - Highlights the active page
 *   - Handles mobile sidebar toggle + overlay
 *   - Populates topbar user info
 *   - Wires sign-out button
 */

import { ROLES, ROLE_DASHBOARD } from '../lib/roles.js'
import { signOut } from '../lib/auth.js'

// ---------------------------------------------------------------------------
// Nav link definitions per role
// ---------------------------------------------------------------------------

const NAV_LINKS = {
  [ROLES.FINDER]: [
    { label: 'Dashboard',    href: '/pages/finder/dashboard.html',     icon: 'home' },
    { label: 'Report Animal', href: '/pages/finder/report-animal.html', icon: 'alert-circle' },
    { label: 'My Reports',   href: '/pages/finder/my-reports.html',    icon: 'list' },
    { label: 'Request Kit',  href: '/pages/finder/request-kit.html',   icon: 'package' },
  ],
  [ROLES.REHABBER]: [
    { section: 'Cases' },
    { label: 'Dashboard',         href: '/pages/rehabber/dashboard.html',         icon: 'home' },
    { label: 'Case Intake',       href: '/pages/rehabber/case-intake.html',       icon: 'plus-circle' },
    { label: 'Animal Records',    href: '/pages/rehabber/animal-records.html',    icon: 'clipboard' },
    { label: 'Medical Log',       href: '/pages/rehabber/medical-log.html',       icon: 'activity' },
    { label: 'Feeding Log',       href: '/pages/rehabber/feeding-log.html',       icon: 'coffee' },
    { label: 'Outcomes',          href: '/pages/rehabber/outcomes.html',          icon: 'check-circle' },
    { section: 'Operations' },
    { label: 'Inventory',         href: '/pages/rehabber/inventory.html',         icon: 'box' },
    { label: 'Volunteers',        href: '/pages/rehabber/volunteers.html',        icon: 'users' },
    { label: 'Sub-Permittees',    href: '/pages/rehabber/sub-permittees.html',    icon: 'user-check' },
    { label: 'Transport Dispatch',href: '/pages/rehabber/transport-dispatch.html',icon: 'truck' },
    { label: 'Vet Referral',      href: '/pages/rehabber/vet-referral.html',      icon: 'heart' },
    { section: 'Reports' },
    { label: 'Reporting',         href: '/pages/rehabber/reporting.html',         icon: 'bar-chart-2' },
  ],
  [ROLES.SUB_PERMITTEE]: [
    { label: 'Dashboard',         href: '/pages/sub-permittee/dashboard.html',         icon: 'home' },
    { label: 'My Cases',          href: '/pages/sub-permittee/my-cases.html',          icon: 'clipboard' },
    { label: 'Medical Log',       href: '/pages/sub-permittee/medical-log.html',       icon: 'activity' },
    { label: 'Feeding Log',       href: '/pages/sub-permittee/feeding-log.html',       icon: 'coffee' },
    { label: 'Transport Request', href: '/pages/sub-permittee/transport-request.html', icon: 'truck' },
  ],
  [ROLES.VOLUNTEER]: [
    { label: 'Dashboard',    href: '/pages/volunteer/dashboard.html',    icon: 'home' },
    { label: 'My Schedule',  href: '/pages/volunteer/my-schedule.html',  icon: 'calendar' },
    { label: 'Task Log',     href: '/pages/volunteer/task-log.html',     icon: 'check-square' },
    { label: 'Hour Tracking',href: '/pages/volunteer/hour-tracking.html',icon: 'clock' },
    { label: 'Training',     href: '/pages/volunteer/training.html',     icon: 'book-open' },
  ],
  [ROLES.TRANSPORT_VOLUNTEER]: [
    { label: 'Dashboard',      href: '/pages/transport-volunteer/dashboard.html',     icon: 'home' },
    { label: 'Driver Profile', href: '/pages/transport-volunteer/driver-profile.html',icon: 'user' },
    { label: 'Open Requests',  href: '/pages/transport-volunteer/open-requests.html', icon: 'inbox' },
    { label: 'Trip Matching',  href: '/pages/transport-volunteer/trip-matching.html', icon: 'map' },
    { label: 'Trip Log',       href: '/pages/transport-volunteer/trip-log.html',      icon: 'list' },
    { label: 'Request Kit',    href: '/pages/transport-volunteer/kit-request.html',   icon: 'package' },
  ],
  [ROLES.VET]: [
    { label: 'Dashboard',       href: '/pages/vet/dashboard.html',       icon: 'home' },
    { label: 'Assigned Cases',  href: '/pages/vet/assigned-cases.html',  icon: 'clipboard' },
    { label: 'Treatment Plans', href: '/pages/vet/treatment-plans.html', icon: 'file-text' },
    { label: 'Rx Log',          href: '/pages/vet/rx-log.html',          icon: 'activity' },
    { label: 'DEA Compliance',  href: '/pages/vet/dea-compliance.html',  icon: 'shield' },
    { label: 'Consult Notes',   href: '/pages/vet/consult-notes.html',   icon: 'message-square' },
  ],
  [ROLES.ADMIN]: [
    { label: 'Dashboard',    href: '/pages/admin/dashboard.html',    icon: 'home' },
    { label: 'Users',        href: '/pages/admin/users.html',        icon: 'users' },
    { label: 'Approvals',    href: '/pages/admin/approvals.html',    icon: 'user-check' },
    { label: 'Kit Inventory',href: '/pages/admin/kit-inventory.html',icon: 'box' },
    { label: 'Reports',      href: '/pages/admin/reports.html',      icon: 'bar-chart-2' },
  ],
}

// ---------------------------------------------------------------------------
// Simple Feather-style SVG icon map (inline, no dependency)
// ---------------------------------------------------------------------------

function getIcon(name) {
  const icons = {
    'home':          '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    'alert-circle':  '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
    'list':          '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',
    'package':       '<line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
    'plus-circle':   '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>',
    'clipboard':     '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>',
    'activity':      '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
    'coffee':        '<path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>',
    'check-circle':  '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
    'box':           '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>',
    'users':         '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    'user-check':    '<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/>',
    'truck':         '<rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
    'heart':         '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
    'bar-chart-2':   '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
    'calendar':      '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
    'check-square':  '<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
    'clock':         '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    'book-open':     '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
    'user':          '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    'inbox':         '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
    'map':           '<polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>',
    'file-text':     '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>',
    'shield':        '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    'message-square':'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  }
  const paths = icons[name] || '<circle cx="12" cy="12" r="4"/>'
  return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`
}

// ---------------------------------------------------------------------------
// Render nav for a given role
// ---------------------------------------------------------------------------

function renderNav(role) {
  const navEl = document.getElementById('sidebarNav')
  if (!navEl) return

  const links = [...(NAV_LINKS[role] || [])]
  const currentPath = window.location.pathname

  const profileLink = { label: 'Profile', href: '/pages/profile.html', icon: 'user' }
  if (!links.some(item => item.href === profileLink.href)) {
    links.unshift(profileLink)
  }

  let html = ''
  let inSection = false

  links.forEach(item => {
    if (item.section) {
      if (inSection) html += '</div>'
      html += `<div class="sidebar__nav-section">
        <div class="sidebar__section-label">${item.section}</div>`
      inSection = true
    } else {
      const isActive = currentPath.endsWith(item.href.split('/').pop())
      html += `
        <a href="${item.href}" class="sidebar__link${isActive ? ' active' : ''}"
           ${isActive ? 'aria-current="page"' : ''}>
          ${getIcon(item.icon)}
          <span class="sidebar__link-label">${item.label}</span>
        </a>`
    }
  })

  if (inSection) html += '</div>'
  navEl.innerHTML = html
}

// ---------------------------------------------------------------------------
// Populate user info in sidebar footer
// ---------------------------------------------------------------------------

function renderUserInfo(user) {
  const nameEl   = document.getElementById('sidebarUserName')
  const roleEl   = document.getElementById('sidebarUserRole')
  const avatarEl = document.getElementById('sidebarAvatar')
  if (!nameEl) return

  const displayName = user?.full_name || user?.email || 'User'
  nameEl.textContent = displayName
  roleEl.textContent = (user?.role || '').replace(/_/g, ' ')
  avatarEl.textContent = displayName.charAt(0).toUpperCase()
}

// ---------------------------------------------------------------------------
// Mobile sidebar toggle
// ---------------------------------------------------------------------------

function initMobileNav() {
  const sidebar  = document.getElementById('sidebar')
  const overlay  = document.getElementById('sidebarOverlay')
  const toggle   = document.getElementById('sidebarToggle')
  if (!sidebar || !overlay || !toggle) return

  function openSidebar() {
    sidebar.classList.add('open')
    overlay.classList.add('active')
    toggle.setAttribute('aria-expanded', 'true')
    document.body.style.overflow = 'hidden'
  }

  function closeSidebar() {
    sidebar.classList.remove('open')
    overlay.classList.remove('active')
    toggle.setAttribute('aria-expanded', 'false')
    document.body.style.overflow = ''
  }

  toggle.addEventListener('click', () => {
    sidebar.classList.contains('open') ? closeSidebar() : openSidebar()
  })

  overlay.addEventListener('click', closeSidebar)

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && sidebar.classList.contains('open')) closeSidebar()
  })
}

// ---------------------------------------------------------------------------
// Sign out
// ---------------------------------------------------------------------------

function initSignOut() {
  const btn = document.getElementById('signOutBtn')
  if (!btn) return
  btn.addEventListener('click', async () => {
    await signOut()
  })
}

// ---------------------------------------------------------------------------
// Set page title in topbar
// ---------------------------------------------------------------------------

export function setPageTitle(title) {
  const el = document.getElementById('pageTitle')
  if (el) el.textContent = title
  document.title = `${title} — WildWise`
}

// ---------------------------------------------------------------------------
// Init — call from each dashboard page
// ---------------------------------------------------------------------------

export function initNav(user) {
  if (!user) return
  renderNav(user.role)
  renderUserInfo(user)
  initMobileNav()
  initSignOut()
}
