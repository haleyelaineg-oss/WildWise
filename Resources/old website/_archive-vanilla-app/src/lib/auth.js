/**
 * auth.js — WildWise authentication helpers
 *
 * Wraps Supabase auth methods and localStorage fallback behavior.
 */

import { supabase } from './supabase.js'
import { ROLES, ROLE_DASHBOARD, ROLES_REQUIRING_APPROVAL, ROLES_REQUIRING_LICENSE } from './roles.js'
import { genId } from './utils.js'

const LOCAL_USERS_KEY = 'wildwise_users'
const LOCAL_SESSION_KEY = 'wildwise_session'

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase()
}

function loadLocalUsers() {
  try {
    return JSON.parse(window.localStorage.getItem(LOCAL_USERS_KEY) || '[]')
  } catch {
    return []
  }
}

function saveLocalUsers(users) {
  window.localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users || []))
}

function loadLocalSession() {
  try {
    return JSON.parse(window.localStorage.getItem(LOCAL_SESSION_KEY) || 'null')
  } catch {
    return null
  }
}

function saveLocalSession(session) {
  window.localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(session))
}

function clearLocalSession() {
  window.localStorage.removeItem(LOCAL_SESSION_KEY)
}

// ---------------------------------------------------------------------------
// Session helpers
// ---------------------------------------------------------------------------

/**
 * Returns the current Supabase session, or local session fallback.
 */
export async function getSession() {
  if (supabase) {
    const { data } = await supabase.auth.getSession()
    return data?.session || null
  }
  return loadLocalSession()
}

/**
 * Returns the logged-in user with their app role from the profiles table.
 */
export async function getCurrentUser() {
  if (supabase) {
    const session = await getSession()
    if (!session?.user) return null

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (profile) {
      return { ...session.user, ...profile }
    }

    const fullName = session.user.user_metadata?.full_name
      || session.user.user_metadata?.name
      || session.user.email

    const { data: createdProfile, error: profileError } = await supabase.from('profiles').insert({
      id:             session.user.id,
      email:          normalizeEmail(session.user.email),
      full_name:      fullName,
      role:           ROLES.VOLUNTEER,
      approved:       true,
      license_number: null,
      license_state:  null,
      rehabber_email: null,
      created_at:     new Date().toISOString(),
    }).select().single()

    if (profileError || !createdProfile) {
      return null
    }

    return { ...session.user, ...createdProfile }
  }

  const session = loadLocalSession()
  if (!session?.userId) return null

  const users = loadLocalUsers()
  return users.find(user => user.id === session.userId) || null
}

export async function getUserById(userId) {
  if (supabase) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    return data || null
  }
  const users = loadLocalUsers()
  return users.find(user => user.id === userId) || null
}

// ---------------------------------------------------------------------------
// Sign in / Sign up
// ---------------------------------------------------------------------------

/**
 * Sign in with email + password.
 * Returns { user, error }.
 */
export async function signIn(email, password) {
  const normalizedEmail = normalizeEmail(email)

  if (supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password })
    return { user: data?.user || null, error }
  }

  const users = loadLocalUsers()
  const user = users.find(u => u.email === normalizedEmail && u.password === password)
  if (!user) {
    return { user: null, error: new Error('Invalid email or password.') }
  }

  saveLocalSession({ userId: user.id })
  return { user, error: null }
}

/**
 * Register a new account.
 * Creates auth user + inserts a profile row with the chosen role.
 * Returns { user, error }.
 */
export async function signUp({ email, password, fullName, role, licenseNumber, licenseState, rehabberEmail }) {
  const normalizedEmail = normalizeEmail(email)

  if (supabase) {
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: { data: { full_name: fullName } }
    })
    if (error) return { user: null, error }

    const { data: profile, error: profileError } = await supabase.from('profiles').insert({
      id:        data.user.id,
      email:     normalizedEmail,
      full_name: fullName,
      role,
      approved:  !ROLES_REQUIRING_APPROVAL.includes(role),
      license_number: licenseNumber || null,
      license_state:  licenseState || null,
      rehabber_email: rehabberEmail || null,
    }).select().single()

    if (profileError || !profile) {
      await supabase.auth.signOut()
      return { user: null, error: profileError || new Error('Failed to create user profile.') }
    }

    return { user: data.user, error: null }
  }

  const users = loadLocalUsers()
  if (users.some(user => user.email === normalizedEmail)) {
    return { user: null, error: new Error('An account already exists with that email.') }
  }

  const user = {
    id:             genId('user'),
    email:          normalizedEmail,
    password:       password,
    full_name:      fullName,
    role,
    approved:       ROLES_REQUIRING_APPROVAL.includes(role) ? false : true,
    license_number: licenseNumber || null,
    license_state:  licenseState || null,
    rehabber_email: rehabberEmail || null,
    created_at:     new Date().toISOString(),
  }

  users.push(user)
  saveLocalUsers(users)
  saveLocalSession({ userId: user.id })

  return { user, error: null }
}

/**
 * Send a password-reset email.
 */
export async function sendPasswordReset(email) {
  if (supabase) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/pages/auth/login.html`
    })
    return { error }
  }

  return { error: null }
}

/**
 * Sign out and redirect to login.
 */
export async function signOut() {
  if (supabase) {
    await supabase.auth.signOut()
  } else {
    clearLocalSession()
  }
  window.location.href = '/pages/auth/login.html'
}

// ---------------------------------------------------------------------------
// Route guard
// ---------------------------------------------------------------------------

/**
 * Call at the top of every protected page.
 * Redirects to login if not authenticated, or to pending page if not approved.
 *
 * @param {string[]} [allowedRoles] — if provided, restrict to these roles
 */
export async function requireAuth(allowedRoles = []) {
  const user = await getCurrentUser()

  if (!user) {
    window.location.href = '/pages/auth/login.html'
    return null
  }

  // Check approval status
  if (user.approved === false) {
    const pendingPages = {
      [ROLES.SUB_PERMITTEE]: '/pages/sub-permittee/pending-approval.html',
      [ROLES.VET]:            '/pages/vet/pending-approval.html',
      [ROLES.REHABBER]:       '/pages/rehabber/pending-approval.html',
    }
    const pendingPage = pendingPages[user.role]
    const currentPage = window.location.pathname
    const isProfilePage = currentPage.endsWith('/profile.html') || currentPage.endsWith('profile.html')
    if (pendingPage && !isProfilePage && !currentPage.endsWith(pendingPage.split('/').pop())) {
      window.location.href = pendingPage
      return null
    }
  }

  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    const dashboard = ROLE_DASHBOARD[user.role] || '/pages/auth/login.html'
    window.location.href = dashboard
    return null
  }

  return user
}
