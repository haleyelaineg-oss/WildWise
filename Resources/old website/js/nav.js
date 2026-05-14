/**
 * nav.js — Sticky nav, hamburger menu, active links, smooth scroll
 */

(function () {
  'use strict';

  const nav        = document.querySelector('.nav');
  const hamburger  = document.querySelector('.nav__hamburger');
  const mobileMenu = document.querySelector('.nav__mobile');
  const mobileLinks = document.querySelectorAll('.nav__mobile-link');
  const allNavLinks = document.querySelectorAll('.nav__link, .nav__mobile-link');

  // -------------------------------------------------------------------------
  // Scrolled state
  // -------------------------------------------------------------------------

  function onScroll() {
    if (window.scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load


  // -------------------------------------------------------------------------
  // Hamburger / mobile menu toggle
  // -------------------------------------------------------------------------

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function () {
      const isOpen = hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on mobile link click
    mobileLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', false);
        document.body.style.overflow = '';
      });
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (
        mobileMenu.classList.contains('open') &&
        !mobileMenu.contains(e.target) &&
        !hamburger.contains(e.target)
      ) {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', false);
        document.body.style.overflow = '';
      }
    });

    // Close on escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', false);
        document.body.style.overflow = '';
        hamburger.focus();
      }
    });
  }


  // -------------------------------------------------------------------------
  // Active link — mark current page
  // -------------------------------------------------------------------------

  const currentPath = window.location.pathname.split('/').pop() || 'index.html';

  allNavLinks.forEach(function (link) {
    const href = link.getAttribute('href');
    if (!href) return;

    const linkFile = href.split('/').pop().split('#')[0];

    if (
      linkFile === currentPath ||
      (currentPath === '' && linkFile === 'index.html') ||
      (currentPath === 'index.html' && (linkFile === '' || linkFile === 'index.html'))
    ) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });


  // -------------------------------------------------------------------------
  // Smooth scroll for anchor links
  // -------------------------------------------------------------------------

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href').slice(1);
      if (!targetId) return;

      const target = document.getElementById(targetId);
      if (!target) return;

      e.preventDefault();

      const navHeight = nav ? nav.offsetHeight : 0;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;

      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    });
  });

})();
