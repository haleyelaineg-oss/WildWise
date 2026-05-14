/**
 * utils.js — Shared utility functions
 */

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

/**
 * Format a date string or Date object as "Jan 15, 2025"
 */
export function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'month', month: 'short', day: 'numeric'
  })
}

/**
 * Format a date as relative time: "2 hours ago", "3 days ago"
 */
export function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000)
  const intervals = [
    [31536000, 'year'], [2592000, 'month'], [604800, 'week'],
    [86400, 'day'],     [3600, 'hour'],     [60, 'minute'],
  ]
  for (const [secs, label] of intervals) {
    const n = Math.floor(seconds / secs)
    if (n >= 1) return `${n} ${label}${n > 1 ? 's' : ''} ago`
  }
  return 'just now'
}

/**
 * Format a date as "YYYY-MM-DD" for input[type=date]
 */
export function toInputDate(date) {
  if (!date) return ''
  return new Date(date).toISOString().split('T')[0]
}

// ---------------------------------------------------------------------------
// String helpers
// ---------------------------------------------------------------------------

/**
 * Capitalize first letter: "hello world" → "Hello world"
 */
export function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Convert snake_case to Title Case: "licensed_rehabber" → "Licensed Rehabber"
 */
export function humanizeRole(role) {
  if (!role) return ''
  return role.split('_').map(w => capitalize(w)).join(' ')
}

/**
 * Truncate a string to maxLength with ellipsis
 */
export function truncate(str, maxLength = 80) {
  if (!str || str.length <= maxLength) return str
  return str.slice(0, maxLength).trimEnd() + '…'
}

/**
 * Generate initials from a full name: "Jane Doe" → "JD"
 */
export function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]?.toUpperCase()).filter(Boolean).slice(0, 2).join('')
}

// ---------------------------------------------------------------------------
// Form helpers
// ---------------------------------------------------------------------------

/**
 * Serialize a <form> element into a plain object
 */
export function serializeForm(formEl) {
  return Object.fromEntries(new FormData(formEl))
}

/**
 * Show/hide a field-level error message
 */
export function setFieldError(inputEl, message) {
  if (!inputEl) return
  const group = inputEl.closest('.form-group')
  if (!group) return
  const existing = group.querySelector('.form-error-msg')
  if (existing) existing.remove()
  if (message) {
    const errEl = document.createElement('p')
    errEl.className = 'form-error-msg'
    errEl.textContent = message
    group.appendChild(errEl)
    inputEl.classList.add('form-input--error')
  } else {
    inputEl.classList.remove('form-input--error')
  }
}

/**
 * Clear all field errors on a form
 */
export function clearFormErrors(formEl) {
  formEl.querySelectorAll('.form-error-msg').forEach(el => el.remove())
  formEl.querySelectorAll('.form-input--error').forEach(el =>
    el.classList.remove('form-input--error')
  )
}

// ---------------------------------------------------------------------------
// Misc
// ---------------------------------------------------------------------------

/**
 * Debounce a function
 */
export function debounce(fn, delay = 300) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

/**
 * Generate a simple random ID (not cryptographic)
 */
export function genId(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`
}

/**
 * Copy text to clipboard, returns Promise<boolean>
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
