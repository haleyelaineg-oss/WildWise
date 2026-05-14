/**
 * contact.js — Form tab switching, basic validation, submission handling
 * Forms use mailto: or Netlify Forms (data-netlify="true")
 */

(function () {
  'use strict';

  // -------------------------------------------------------------------------
  // Tab switching
  // -------------------------------------------------------------------------

  const tabs   = document.querySelectorAll('.form-tab');
  const panels = document.querySelectorAll('.form-panel');

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      const target = tab.dataset.tab;

      // Update tab states
      tabs.forEach(function (t) {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      // Update panel visibility
      panels.forEach(function (panel) {
        panel.classList.remove('active');
        panel.setAttribute('aria-hidden', 'true');
      });
      const activePanel = document.getElementById(target);
      if (activePanel) {
        activePanel.classList.add('active');
        activePanel.setAttribute('aria-hidden', 'false');
      }
    });
  });

  // Activate first tab on load
  if (tabs.length > 0) {
    tabs[0].click();
  }


  // -------------------------------------------------------------------------
  // Handle URL hash for deep-linking to a specific form tab
  // e.g. contact.html#volunteer
  // -------------------------------------------------------------------------

  function activateTabFromHash() {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const matchingTab = document.querySelector('[data-tab="' + hash + '"]');
    if (matchingTab) matchingTab.click();
  }

  activateTabFromHash();
  window.addEventListener('hashchange', activateTabFromHash);


  // -------------------------------------------------------------------------
  // Form validation & submission
  // -------------------------------------------------------------------------

  const forms = document.querySelectorAll('.contact-form');

  forms.forEach(function (form) {
    form.addEventListener('submit', function (e) {

      // If using Netlify Forms, let Netlify handle it (don't preventDefault)
      // If using mailto:, we validate first then allow the action
      if (form.dataset.netlify === 'true') {
        if (!validateForm(form)) {
          e.preventDefault();
        }
        return;
      }

      // For mailto: forms — validate, then show success hint
      if (!validateForm(form)) {
        e.preventDefault();
        return;
      }

      // Show a soft success message after short delay (mailto opens client)
      setTimeout(function () {
        showSuccess(form);
      }, 500);
    });
  });


  function validateForm(form) {
    let valid = true;
    const requiredFields = form.querySelectorAll('[required]');

    requiredFields.forEach(function (field) {
      clearError(field);
      if (!field.value.trim()) {
        showError(field, 'This field is required.');
        valid = false;
      } else if (field.type === 'email' && !isValidEmail(field.value)) {
        showError(field, 'Please enter a valid email address.');
        valid = false;
      }
    });

    if (!valid) {
      const firstError = form.querySelector('.form-error');
      if (firstError) {
        firstError.closest('.form-group')
          ?.querySelector('input, textarea, select')
          ?.focus();
      }
    }

    return valid;
  }

  function showError(field, message) {
    field.classList.add('has-error');
    field.style.borderColor = '#c0392b';

    const existing = field.parentElement.querySelector('.form-error');
    if (!existing) {
      const err = document.createElement('span');
      err.className = 'form-error form-hint';
      err.style.color = '#c0392b';
      err.textContent = message;
      err.setAttribute('role', 'alert');
      field.insertAdjacentElement('afterend', err);
    }
  }

  function clearError(field) {
    field.classList.remove('has-error');
    field.style.borderColor = '';
    const err = field.parentElement.querySelector('.form-error');
    if (err) err.remove();
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function showSuccess(form) {
    const successEl = form.closest('.form-panel')?.querySelector('.form-success');
    if (successEl) {
      form.style.display = 'none';
      successEl.classList.add('visible');
    }
  }

  // Clear error on input
  document.querySelectorAll('.form-input, .form-textarea, .form-select').forEach(function (field) {
    field.addEventListener('input', function () {
      clearError(field);
    });
  });

})();
