/**
 * toast.js — WildWise lightweight toast notifications
 *
 * Usage:
 *   import { toast } from '../components/toast.js'
 *   toast.success('Case saved!')
 *   toast.error('Something went wrong.')
 *   toast.info('3 new transport requests.')
 *   toast.warning('License expires in 30 days.')
 */

const ICONS = {
  success: '<polyline points="20 6 9 17 4 12"/>',
  error:   '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>',
  warning: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  info:    '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
}

// Inject container + styles once
function ensureContainer() {
  let container = document.getElementById('toastContainer')
  if (container) return container

  container = document.createElement('div')
  container.id = 'toastContainer'
  container.setAttribute('aria-live', 'polite')
  container.setAttribute('aria-atomic', 'false')

  const style = document.createElement('style')
  style.textContent = `
    #toastContainer {
      position: fixed;
      bottom: var(--space-6, 1.5rem);
      right: var(--space-6, 1.5rem);
      display: flex;
      flex-direction: column;
      gap: var(--space-3, 0.75rem);
      z-index: var(--z-toast, 400);
      pointer-events: none;
    }
    .toast {
      display: flex;
      align-items: flex-start;
      gap: var(--space-3, 0.75rem);
      padding: var(--space-4, 1rem) var(--space-5, 1.25rem);
      background: var(--color-white, #fff);
      border: 1px solid var(--color-border, rgba(47,72,88,0.12));
      border-radius: var(--radius-lg, 12px);
      box-shadow: var(--shadow-lg, 0 10px 32px rgba(47,72,88,0.14));
      max-width: 360px;
      pointer-events: all;
      opacity: 0;
      transform: translateX(16px);
      transition: opacity 250ms ease, transform 250ms ease;
    }
    .toast.show { opacity: 1; transform: translateX(0); }
    .toast.hide { opacity: 0; transform: translateX(16px); }
    .toast__icon { flex-shrink: 0; margin-top: 1px; }
    .toast__icon svg { display: block; }
    .toast__body { flex: 1; min-width: 0; }
    .toast__title { font-weight: 600; font-size: 0.875rem; color: var(--color-navy, #2f4858); line-height: 1.3; }
    .toast__msg   { font-size: 0.8125rem; color: var(--color-text-muted, #5a6370); margin-top: 2px; line-height: 1.4; }
    .toast__close { flex-shrink: 0; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; border-radius: 4px; color: var(--color-text-muted, #5a6370); cursor: pointer; background: none; border: none; padding: 0; }
    .toast__close:hover { background: var(--color-border, rgba(47,72,88,0.12)); color: var(--color-navy, #2f4858); }
    .toast--success .toast__icon { color: var(--color-success, #4a7c59); }
    .toast--error   .toast__icon { color: var(--color-danger,  #b94040); }
    .toast--warning .toast__icon { color: var(--color-warning, #c9882a); }
    .toast--info    .toast__icon { color: var(--color-steel,   #33658a); }
  `
  document.head.appendChild(style)
  document.body.appendChild(container)
  return container
}

function show(type, message, { title, duration = 4000 } = {}) {
  const container = ensureContainer()
  const el = document.createElement('div')
  el.className = `toast toast--${type}`
  el.setAttribute('role', 'alert')

  const defaultTitles = { success: 'Success', error: 'Error', warning: 'Warning', info: 'Info' }
  const t = title || defaultTitles[type]

  el.innerHTML = `
    <div class="toast__icon">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        ${ICONS[type]}
      </svg>
    </div>
    <div class="toast__body">
      <div class="toast__title">${t}</div>
      ${message ? `<div class="toast__msg">${message}</div>` : ''}
    </div>
    <button class="toast__close" aria-label="Dismiss">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  `

  container.appendChild(el)
  requestAnimationFrame(() => el.classList.add('show'))

  function dismiss() {
    el.classList.remove('show')
    el.classList.add('hide')
    el.addEventListener('transitionend', () => el.remove(), { once: true })
  }

  el.querySelector('.toast__close').addEventListener('click', dismiss)
  if (duration > 0) setTimeout(dismiss, duration)

  return { dismiss }
}

export const toast = {
  success: (msg, opts) => show('success', msg, opts),
  error:   (msg, opts) => show('error',   msg, opts),
  warning: (msg, opts) => show('warning', msg, opts),
  info:    (msg, opts) => show('info',    msg, opts),
}
