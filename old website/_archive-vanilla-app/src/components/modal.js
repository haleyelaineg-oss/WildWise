/**
 * modal.js — WildWise lightweight modal controller
 *
 * Usage:
 *   import { openModal, closeModal } from '../components/modal.js'
 *
 *   openModal({
 *     title: 'Delete Case',
 *     body:  '<p>Are you sure? This cannot be undone.</p>',
 *     confirmLabel: 'Delete',
 *     confirmClass: 'btn-danger',
 *     onConfirm: async () => { ... }
 *   })
 */

const backdrop = document.getElementById('modalBackdrop')
const dialog   = document.getElementById('modalDialog')
const titleEl  = document.getElementById('modalTitle')
const bodyEl   = document.getElementById('modalBody')
const footerEl = document.getElementById('modalFooter')
const closeBtn = document.getElementById('modalClose')
const cancelBtn= document.getElementById('modalCancel')
const confirmBtn=document.getElementById('modalConfirm')

let _onConfirm = null

function trapFocus(e) {
  const focusable = dialog.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  const first = focusable[0]
  const last  = focusable[focusable.length - 1]
  if (e.key !== 'Tab') return
  if (e.shiftKey) {
    if (document.activeElement === first) { e.preventDefault(); last.focus() }
  } else {
    if (document.activeElement === last) { e.preventDefault(); first.focus() }
  }
}

export function openModal({ title = '', body = '', confirmLabel = 'Confirm',
                             cancelLabel = 'Cancel', confirmClass = 'btn-primary',
                             showFooter = true, onConfirm = null } = {}) {
  titleEl.textContent = title
  bodyEl.innerHTML    = body

  if (confirmBtn) {
    confirmBtn.textContent = confirmLabel
    confirmBtn.className = `${confirmClass} btn--sm`
  }
  if (cancelBtn) cancelBtn.textContent = cancelLabel
  if (footerEl)  footerEl.style.display = showFooter ? '' : 'none'

  _onConfirm = onConfirm
  backdrop.classList.add('open')
  backdrop.setAttribute('aria-hidden', 'false')
  document.body.style.overflow = 'hidden'
  dialog.addEventListener('keydown', trapFocus)
  setTimeout(() => closeBtn?.focus(), 50)
}

export function closeModal() {
  backdrop.classList.remove('open')
  backdrop.setAttribute('aria-hidden', 'true')
  document.body.style.overflow = ''
  dialog.removeEventListener('keydown', trapFocus)
  _onConfirm = null
}

// Wire up close triggers
if (closeBtn)  closeBtn.addEventListener('click', closeModal)
if (cancelBtn) cancelBtn.addEventListener('click', closeModal)
if (backdrop)  backdrop.addEventListener('click', e => {
  if (e.target === backdrop) closeModal()
})
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && backdrop?.classList.contains('open')) closeModal()
})
if (confirmBtn) confirmBtn.addEventListener('click', async () => {
  if (_onConfirm) {
    confirmBtn.disabled = true
    confirmBtn.classList.add('btn--loading')
    try { await _onConfirm() } finally {
      confirmBtn.disabled = false
      confirmBtn.classList.remove('btn--loading')
    }
  }
  closeModal()
})
