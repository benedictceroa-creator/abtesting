/**
 * Asha Jyothi Employable Skill Training Centre
 * Header & Mobile Navigation Module
 * 
 * Zero-overflow mobile drawer navigation with backdrop blur & accessibility.
 */

'use strict';

function initNavigation() {
  const header = document.querySelector('.site-header');
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id], header[id]');

  if (!header || !navToggle || !navMenu) return;

  // 1. Ensure backdrop overlay exists for mobile
  let navOverlay = document.querySelector('.nav-overlay');
  if (!navOverlay) {
    navOverlay = document.createElement('div');
    navOverlay.className = 'nav-overlay';
    navOverlay.setAttribute('aria-hidden', 'true');
    document.body.appendChild(navOverlay);
  }

  // 2. Sticky Header Elevation on Scroll
  const handleScrollElevation = () => {
    if (window.scrollY > 15) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  };

  window.addEventListener('scroll', handleScrollElevation, { passive: true });
  handleScrollElevation();

  // 3. Mobile Navigation Toggle (Zero Horizontal Overflow)
  const toggleMobileNav = (forceClose = false) => {
    const shouldOpen = forceClose ? false : !navMenu.classList.contains('is-open');

    navToggle.classList.toggle('is-active', shouldOpen);
    navMenu.classList.toggle('is-open', shouldOpen);
    navOverlay.classList.toggle('is-open', shouldOpen);
    navToggle.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
    document.body.classList.toggle('nav-menu-open', shouldOpen);

    if (shouldOpen) {
      const firstLink = navMenu.querySelector('a');
      if (firstLink) firstLink.focus();
    }
  };

  navToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMobileNav();
  });

  navOverlay.addEventListener('click', () => {
    toggleMobileNav(true);
  });

  // Close mobile nav on any navigation link click
  navMenu.addEventListener('click', (e) => {
    if (e.target.closest('a')) {
      toggleMobileNav(true);
    }
  });

  // Close mobile nav on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('is-open')) {
      toggleMobileNav(true);
      navToggle.focus();
    }
  });

  // 4. Active Section Highlighting (Scrollspy)
  if ('IntersectionObserver' in window && sections.length > 0) {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -65% 0px',
      threshold: 0
    };

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const currentId = entry.target.getAttribute('id');
          navLinks.forEach((link) => {
            const href = link.getAttribute('href');
            if (href === `#${currentId}`) {
              link.classList.add('is-active');
              link.setAttribute('aria-current', 'true');
            } else if (href && href.startsWith('#')) {
              link.classList.remove('is-active');
              link.removeAttribute('aria-current');
            }
          });
        }
      });
    }, observerOptions);

    sections.forEach((section) => sectionObserver.observe(section));
  }
}

// Global exposure
window.initNavigation = initNavigation;
