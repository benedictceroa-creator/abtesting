/* Asha Books – Bible book explorer
 * A shelf of all 66 books (sized by chapters), filterable cards grouped by
 * section, and a detail drawer. The URL hash holds the open book's id.
 */
(function () {
  'use strict';

  var DATA, BY = {}, filter = { t: '', section: '', q: '' }, lastFocus = null;
  var $ = function (id) { return document.getElementById(id); };
  // Language: a Telugu page loads assets/i18n/te.js first and sets data-src and
  // data-translation on <body>; the English page has neither.
  var L = window.BS_LANG || null;
  var page = document.body.dataset;
  function t(s, vars) {
    var out = (L && L.ui[s]) || s;
    if (vars) Object.keys(vars).forEach(function (k) { out = out.split('{' + k + '}').join(vars[k]); });
    return out;
  }
  var els = { shelf: $('bx-shelf'), seg: $('bx-seg'), chips: $('bx-chips'), groups: $('bx-groups'), empty: $('bx-empty'), q: $('bx-q'), scrim: $('bx-scrim'), drawer: $('bx-drawer'), d: $('bx-d') };

  function h(tag, attrs, children) {
    var el = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v);
    });
    (children || []).forEach(function (c) { if (c) el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return el;
  }
  function icon(name) {
    var s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('class', 'ic');
    var u = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    u.setAttribute('href', '#i-' + name);
    s.appendChild(u);
    return s;
  }
  function bibleUrl(ref) { return L ? L.bibleUrl(ref) : 'https://www.biblegateway.com/passage/?search=' + encodeURIComponent(ref) + '&version=ESV'; }
  function refText(ref) { return L ? L.refText(ref) : ref; }
  function chapters(n) { return t(n === 1 ? '{n} chapter' : '{n} chapters', { n: n }); }
  function sec(b) { return DATA.sections[b.section]; }

  // ---------- shelf: every book as a strip, width by chapters ----------
  function buildShelf() {
    DATA.books.forEach(function (b) {
      els.shelf.appendChild(h('button', {
        type: 'button', class: 'bx-spine', style: 'flex-grow:' + b.chapters + ';--c:' + sec(b).color,
        title: b.name + ' · ' + chapters(b.chapters), 'aria-label': b.name, 'data-id': b.id,
        onclick: function () { open(b.id); }
      }));
      if (b.id === 'malachi') els.shelf.appendChild(h('span', { class: 'bx-shelf-gap', 'aria-hidden': 'true' }));
    });
  }

  // ---------- filters ----------
  function buildChips() {
    Object.keys(DATA.sections).forEach(function (k) {
      var s = DATA.sections[k];
      els.chips.appendChild(h('button', { type: 'button', class: 'bx-chip', 'data-s': k, 'data-t': s.t, style: '--c:' + s.color, 'aria-pressed': 'false', onclick: function () {
        filter.section = filter.section === k ? '' : k;
        render();
      } }, [s.label]));
    });
    els.seg.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      filter.t = b.dataset.t;
      if (filter.section && DATA.sections[filter.section].t !== filter.t && filter.t) filter.section = '';
      render();
    });
    els.q.addEventListener('input', function () { filter.q = els.q.value.trim().toLowerCase(); render(); });
  }
  function matches(b) {
    var s = sec(b);
    if (filter.t && s.t !== filter.t) return false;
    if (filter.section && b.section !== filter.section) return false;
    if (filter.q) {
      // On the Telugu page the English name (b.en) is searchable too
      var hay = (b.name + ' ' + (b.en || '') + ' ' + b.abbr + ' ' + b.author + ' ' + b.theme).toLowerCase();
      if (hay.indexOf(filter.q) === -1) return false;
    }
    return true;
  }

  // ---------- cards ----------
  function render() {
    Array.prototype.forEach.call(els.seg.children, function (b) { b.setAttribute('aria-selected', String(b.dataset.t === filter.t)); });
    Array.prototype.forEach.call(els.chips.children, function (c) {
      c.setAttribute('aria-pressed', String(c.dataset.s === filter.section));
      c.hidden = !!filter.t && c.dataset.t !== filter.t;
    });
    Array.prototype.forEach.call(els.shelf.querySelectorAll('.bx-spine'), function (s) { s.classList.toggle('is-dim', !matches(BY[s.dataset.id])); });

    els.groups.innerHTML = '';
    var any = false;
    Object.keys(DATA.sections).forEach(function (k) {
      var s = DATA.sections[k];
      var books = DATA.books.filter(function (b) { return b.section === k && matches(b); });
      if (!books.length) return;
      any = true;
      var total = DATA.books.filter(function (b) { return b.section === k; }).length;
      els.groups.appendChild(h('section', { class: 'bx-group', style: '--c:' + s.color, 'aria-label': s.label }, [
        h('div', { class: 'bx-group-head' }, [
          h('p', { class: 'bx-t', text: t(s.t === 'OT' ? 'Old Testament' : 'New Testament') }),
          h('h2', null, [s.label, h('span', { class: 'bx-count', text: t(total === 1 ? '{n} book' : '{n} books', { n: total }) })]),
          h('p', { class: 'bx-about', text: s.about })
        ]),
        h('div', { class: 'bx-cards' }, books.map(card))
      ]));
    });
    els.empty.hidden = any;
  }
  function card(b) {
    return h('button', { type: 'button', class: 'bx-card', 'data-id': b.id, style: '--c:' + sec(b).color, onclick: function () { open(b.id); } }, [
      h('span', { class: 'bx-cover' }, [
        h('span', { class: 'bx-n', text: String(b.n) }),
        h('span', { class: 'bx-abbr', text: b.abbr }),
        h('span', { class: 'bx-ch', text: chapters(b.chapters) })
      ]),
      h('span', { class: 'bx-card-body' }, [
        h('span', { class: 'bx-name', text: b.name }),
        h('span', { class: 'bx-theme', text: b.theme }),
        h('span', { class: 'bx-meta', text: b.author.replace(/ \(.*\)$/, '') + ' · ' + b.written })
      ])
    ]);
  }

  // ---------- drawer ----------
  function open(id) {
    if (location.hash.slice(1) !== id) location.hash = id;
    else show(id);
  }
  function show(id) {
    var b = BY[id];
    if (!b) { close(true); return; }
    if (els.drawer.hidden) lastFocus = document.activeElement;
    var s = sec(b), i = b.n - 1, prev = DATA.books[i - 1], next = DATA.books[i + 1];
    var d = els.d;
    d.innerHTML = '';
    d.style.setProperty('--c', s.color);
    [
      h('div', { class: 'bx-d-top' }, [
        h('span', { class: 'bx-d-sec', text: s.label + ' · ' + t('Book {n} of 66', { n: b.n }) }),
        h('button', { type: 'button', class: 'bx-close', 'aria-label': t('Close'), onclick: function () { close(); } }, [icon('x')])
      ]),
      h('h2', { id: 'bx-d-title', text: b.name }),
      h('p', { class: 'bx-d-theme', text: b.theme }),
      h('dl', { class: 'bx-facts' }, [
        fact(t('Author'), b.author), fact(t('Written'), b.written), fact(t('Chapters'), String(b.chapters)), fact(t('Testament'), t(s.t === 'OT' ? 'Old' : 'New'))
      ]),
      h('p', { class: 'bx-d-summary', text: b.summary }),
      h('figure', { class: 'bx-verse' }, [
        h('p', { class: 'bx-verse-k', text: t('Key verse') }),
        h('blockquote', { text: b.keyVerse.text }),
        h('figcaption', null, [h('a', { href: bibleUrl(b.keyVerse.ref), target: '_blank', rel: 'noopener', text: refText(b.keyVerse.ref) })])
      ]),
      h('div', { class: 'bx-christ' }, [
        h('p', { class: 'bx-christ-k' }, [icon('cross'), t('Christ in {name}', { name: b.name })]),
        h('p', { text: b.christ })
      ]),
      b.note ? h('p', { class: 'bx-note', text: b.note }) : null,
      h('div', { class: 'bx-d-actions' }, [
        h('a', { class: 'btn btn-red', href: bibleUrl((b.en || b.name) + ' 1'), target: '_blank', rel: 'noopener' }, [icon('book'), t('Start reading {name}', { name: b.name })]),
        b.atlas ? h('a', { class: 'btn btn-ghost', href: b.atlas }, [icon('map'), t(b.atlas.indexOf('family') === 0 ? 'Family tree' : 'On the timeline')]) : null
      ]),
      h('div', { class: 'bx-d-nav' }, [
        prev ? h('button', { type: 'button', class: 'bx-step', onclick: function () { open(prev.id); } }, [icon('left'), h('span', null, [h('small', { text: t('Previous') }), prev.name])]) : h('span'),
        next ? h('button', { type: 'button', class: 'bx-step is-next', onclick: function () { open(next.id); } }, [h('span', null, [h('small', { text: t('Next') }), next.name]), icon('right')]) : h('span')
      ])
    ].forEach(function (n) { if (n) d.appendChild(n); });

    els.scrim.hidden = false;
    els.drawer.hidden = false;
    document.body.classList.add('bx-locked');
    els.drawer.scrollTop = 0;
    requestAnimationFrame(function () { els.drawer.classList.add('is-open'); els.scrim.classList.add('is-open'); });
    d.querySelector('.bx-close').focus({ preventScroll: true });
    document.title = b.name + t(' · Bible Book Explorer | Asha Books');
    Array.prototype.forEach.call(els.shelf.querySelectorAll('.bx-spine'), function (sp) { sp.classList.toggle('is-current', sp.dataset.id === id); });
  }
  function fact(k, v) { return h('div', null, [h('dt', { text: k }), h('dd', { text: v })]); }
  function close(fromHash) {
    if (els.drawer.hidden) return;
    els.drawer.classList.remove('is-open');
    els.scrim.classList.remove('is-open');
    document.body.classList.remove('bx-locked');
    setTimeout(function () { els.drawer.hidden = true; els.scrim.hidden = true; }, 250);
    document.title = t('Bible Book Explorer: All 66 Books at a Glance | Asha Books');
    Array.prototype.forEach.call(els.shelf.querySelectorAll('.is-current'), function (sp) { sp.classList.remove('is-current'); });
    if (!fromHash) history.pushState(null, '', location.pathname + location.search);
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  function init(data) {
    DATA = data;
    DATA.books.forEach(function (b) { BY[b.id] = b; });
    buildShelf();
    buildChips();
    render();
    els.scrim.addEventListener('click', function () { close(); });
    document.addEventListener('keydown', function (e) {
      if (els.drawer.hidden) return;
      if (e.key === 'Escape') close();
      // keep focus inside the drawer
      if (e.key === 'Tab') {
        var f = els.drawer.querySelectorAll('a, button');
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    });
    window.addEventListener('hashchange', function () {
      var id = location.hash.slice(1);
      if (id) show(id); else close(true);
    });
    if (location.hash.length > 1) show(location.hash.slice(1));
  }

  // Telugu words, matched to the English data by id; chapters, references and links stay in the English file
  function translate(data, tr) {
    if (!tr) return data;
    Object.keys(tr.sections).forEach(function (k) {
      var s = data.sections[k], x = tr.sections[k];
      if (s) { s.label = x.label; s.about = x.about; }
    });
    data.books.forEach(function (b) {
      var x = tr.books[b.id];
      b.en = b.name;
      if (!x) return;
      ['name', 'abbr', 'author', 'written', 'theme', 'summary', 'christ', 'note'].forEach(function (k) { if (x[k]) b[k] = x[k]; });
      if (x.keyVerse) b.keyVerse.text = x.keyVerse;
    });
    return data;
  }
  function getJSON(url) { return fetch(url).then(function (r) { return r.json(); }); }

  Promise.all([getJSON(page.src || 'data/books/books.json'), page.translation ? getJSON(page.translation) : null]).then(function (r) {
    init(translate(r[0], r[1]));
  }).catch(function (err) {
    els.groups.textContent = t('Sorry, the book explorer could not be loaded.');
    console.error(err);
  });

  var top = document.querySelector('.top');
  window.addEventListener('scroll', function () { top.classList.toggle('is-scrolled', window.scrollY > 8); }, { passive: true });
})();
