/**
 * login.js — WildWise sign-in page
 */

import { signIn, getCurrentUser } from '../../lib/auth.js'
import { ROLE_DASHBOARD } from '../../lib/roles.js'
import { setFieldError, clearFormErrors } from '../../lib/utils.js'

const form         = document.getElementById('loginForm')
const errorBox     = document.getElementById('loginError')
const submitBtn    = document.getElementById('loginBtn')

form?.addEventListener('submit', async (e) => {
  e.preventDefault()
  clearFormErrors(form)
  errorBox.hidden = true

  const email    = form.email.value.trim()
  const password = form.password.value

  if (!email)    { setFieldError(form.email,    'Email is required');    return }
  if (!password) { setFieldError(form.password, 'Password is required'); return }

  submitBtn.disabled = true
  submitBtn.textContent = 'Signing in…'

  const { user, error } = await signIn(email, password)

  if (error) {
    errorBox.textContent = error.message || 'Sign in failed. Check your credentials.'
    errorBox.hidden = false
    submitBtn.disabled = false
    submitBtn.textContent = 'Sign In'
    return
  }

  let role = user?.role
  if (!role) {
    const currentUser = await getCurrentUser()
    role = currentUser?.role
  }

  if (!role) {
    errorBox.textContent = 'Unable to determine account role. Please try again.'
    errorBox.hidden = false
    submitBtn.disabled = false
    submitBtn.textContent = 'Sign In'
    return
  }

  const destination = ROLE_DASHBOARD[role] || '/pages/auth/login.html'
  window.location.href = destination
})

async function init() {
  const currentUser = await getCurrentUser()
  if (currentUser?.role) {
    const destination = ROLE_DASHBOARD[currentUser.role] || '/pages/auth/login.html'
    window.location.href = destination
  }
}

init()
