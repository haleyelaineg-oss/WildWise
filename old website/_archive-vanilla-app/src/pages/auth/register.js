/**
 * register.js — WildWise account creation
 */

import { signUp } from '../../lib/auth.js'
import { ROLES, ROLES_REQUIRING_LICENSE, ROLE_DASHBOARD } from '../../lib/roles.js'
import { setFieldError, clearFormErrors } from '../../lib/utils.js'

const form          = document.getElementById('registerForm')
const errorBox      = document.getElementById('registerError')
const submitBtn     = document.getElementById('registerBtn')
const roleSelect    = document.getElementById('role')
const licenseFields = document.getElementById('licenseFields')
const rehabberFields= document.getElementById('rehabberFields')
const roleHint      = document.getElementById('roleHint')

const ROLE_HINTS = {
  finder:              'You can report injured animals and request rescue kits.',
  licensed_rehabber:   'Your permit will be reviewed by an admin before activation.',
  sub_permittee:       'Your rehabber will receive an approval request.',
  volunteer:           'You can be assigned tasks and track volunteer hours.',
  transport_volunteer: 'You can view open transport requests and log trips.',
  licensed_vet:        'Your license will be reviewed by an admin before activation.',
}

roleSelect?.addEventListener('change', () => {
  const role = roleSelect.value
  const needsLicense  = [ROLES.REHABBER, ROLES.VET].includes(role)
  const needsRehabber = role === ROLES.SUB_PERMITTEE

  licenseFields.hidden  = !needsLicense
  rehabberFields.hidden = !needsRehabber
  roleHint.textContent  = ROLE_HINTS[role] || ''
})

form?.addEventListener('submit', async (e) => {
  e.preventDefault()
  clearFormErrors(form)
  errorBox.hidden = true

  const data = Object.fromEntries(new FormData(form))
  let valid = true

  if (!data.fullName)        { setFieldError(form.fullName,        'Full name is required');     valid = false }
  if (!data.email)           { setFieldError(form.email,           'Email is required');          valid = false }
  if (!data.password)        { setFieldError(form.password,        'Password is required');       valid = false }
  if (data.password?.length < 8) { setFieldError(form.password,   'Password must be 8+ characters'); valid = false }
  if (data.password !== data.confirmPassword) {
    setFieldError(form.confirmPassword, 'Passwords do not match')
    valid = false
  }
  if (!data.role)            { setFieldError(form.role,            'Please select a role');       valid = false }

  const needsLicense  = [ROLES.REHABBER, ROLES.VET].includes(data.role)
  const needsRehabber = data.role === ROLES.SUB_PERMITTEE

  if (needsLicense) {
    if (!data.licenseNumber) { setFieldError(form.licenseNumber, 'License number is required'); valid = false }
    if (!data.licenseState)  { setFieldError(form.licenseState,  'Issuing state is required'); valid = false }
  }

  if (needsRehabber && !data.rehabberEmail) {
    setFieldError(form.rehabberEmail, 'Your rehabber email is required')
    valid = false
  }

  if (!valid) return

  submitBtn.disabled = true
  submitBtn.textContent = 'Creating account…'

  const { user, error } = await signUp({
    email:         data.email,
    password:      data.password,
    fullName:      data.fullName,
    role:          data.role,
    licenseNumber: data.licenseNumber,
    licenseState:  data.licenseState,
    rehabberEmail: data.rehabberEmail,
  })

  if (error) {
    errorBox.textContent = error.message || 'Registration failed. Please try again.'
    errorBox.hidden = false
    submitBtn.disabled = false
    submitBtn.textContent = 'Create Account'
    return
  }

  window.location.href = ROLE_DASHBOARD[data.role] || '/pages/auth/login.html'
})
