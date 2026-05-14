/**
 * animations.js — IntersectionObserver fade-in & stagger animations
 * Subtle: opacity + slight translateY, 0.4s ease
 */

(function () {
  'use strict';

  // Skip if user prefers reduced motion
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced) {
    // Make all animated elements immediately visible
    document.querySelectorAll('.fade-in, .stagger-children').forEach(function (el) {
      el.classList.add('visible');
    });
    return;
  }

  // -------------------------------------------------------------------------
  // Shared observer options
  // -------------------------------------------------------------------------

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.1,
  };


  // -------------------------------------------------------------------------
  // Fade-in observer
  // -------------------------------------------------------------------------

  const fadeObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.fade-in').forEach(function (el) {
    fadeObserver.observe(el);
  });


  // -------------------------------------------------------------------------
  // Stagger-children observer
  // -------------------------------------------------------------------------

  const staggerObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        staggerObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.stagger-children').forEach(function (el) {
    staggerObserver.observe(el);
  });


  // -------------------------------------------------------------------------
  // Counter animation for stat numbers
  // -------------------------------------------------------------------------

  function animateCounter(el) {
    const target = parseFloat(el.dataset.count);
    if (isNaN(target)) return;

    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const duration = 1200;
    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;

      // Format: integers with commas, decimals to 1 place
      const display = Number.isInteger(target)
        ? Math.round(current).toLocaleString()
        : current.toFixed(1);

      el.textContent = prefix + display + suffix;

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = prefix + (Number.isInteger(target) ? target.toLocaleString() : target.toFixed(1)) + suffix;
      }
    }

    requestAnimationFrame(tick);
  }

  const counterObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-count]').forEach(function (el) {
    counterObserver.observe(el);
  });

})();
