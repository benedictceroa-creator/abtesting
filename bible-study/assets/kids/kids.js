/* Asha Books – kids' activity sheets page: WhatsApp share links, header border, reveal on scroll */
(function () {
  'use strict';
  document.documentElement.classList.add('js');

  // WhatsApp links share this page, opened at the sheet's card
  var page = location.href.split('#')[0];
  document.querySelectorAll('[data-share]').forEach(function (a) {
    a.href = 'https://wa.me/?text=' + encodeURIComponent(a.dataset.share + '\n' + page + '#' + a.dataset.id);
  });

  var top = document.querySelector('.top');
  window.addEventListener('scroll', function () { top.classList.toggle('is-scrolled', window.scrollY > 8); }, { passive: true });

  var items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  items.forEach(function (el, i) {
    el.style.transitionDelay = (i % 3) * 70 + 'ms';
    io.observe(el);
  });
})();
