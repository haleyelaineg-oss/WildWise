/**
 * forgot-password.js — WildWise password reset request
 */

import { sendPasswordReset } from '../../lib/auth.js'
import { setFieldError, clearFormErrors } from '../../lib/utils.js'

const form        = document.getElementById('resetForm')
const errorBox    = document.getElementById('resetError')
const submitBtn   = document.getElementById('resetBtn')
const requestView = document.getElementById('requestView')
const successView = document.getElementById('successView')
const sentToEl    = document.getElementById('sentTo')

form?.addEventListener('submit', async (e) => {
  e.preventDefault()
  clearFormErrors(form)
  errorBox.hidden = true

  const email = form.email.value.trim()
  if (!email) { setFieldError(form.email, 'Email is required'); return }

  submitBtn.disabled = true
  submitBtn.textContent = 'Sending…'

  const { error } = await sendPasswordReset(email)

  if (error) {
    errorBox.textContent = error.message || 'Failed to send reset link. Please try again.'
    errorBox.hidden = false
    submitBtn.disabled = false
    submitBtn.textContent = 'Send Reset Link'
    return
  }

  sentToEl.textContent = email
  requestView.hidden = true
  successView.hidden = false
})
