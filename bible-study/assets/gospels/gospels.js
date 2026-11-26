/* Asha Books – Four Gospels compared
 * Portrait cards, an at-a-glance table, first/last words, a shared-vs-unique
 * chart, and an events matrix (one row per event, one column per Gospel).
 * The URL hash holds what the drawer shows: #g-<gospel id> or #e-<event id>.
 */
(function () {
  'use strict';

  var KEYS = ['mt', 'mk', 'lk', 'jn'];
  var DATA, G = {}, EV = {}, filter = { mode: 'all', q: '' }, visible = [], lastFocus = null;
  var $ = function (id) { return document.getElementById(id); };
  var els = {
    portraits: $('gx-portraits'), table: $('gx-table'), words: $('gx-words'), wordsSeg: $('gx-words-seg'),
    bars: $('gx-bars'), src: $('gx-src'), strip: $('gx-stats'), chips: $('gx-filter'), matrix: $('gx-matrix'),
    empty: $('gx-empty'), order: $('gx-order'), q: $('gx-q'), scrim: $('bx-scrim'), drawer: $('bx-drawer'), d: $('bx-d')
  };
  var BASE_TITLE = document.title;
  // Language: a Telugu page loads assets/i18n/te.js first and sets data-src and
  // data-translation on <body>; the overlay's "ui" holds this page's screen text.
  var L = window.BS_LANG || null, UI = {};
  function t(s, vars) {
    var out = UI[s] || (L && L.ui[s]) || s;
    if (vars) Object.keys(vars).forEach(function (k) { out = out.split('{' + k + '}').join(vars[k]); });
    return out;
  }

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
    s.setAttribute('aria-hidden', 'true');
    var u = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    u.setAttribute('href', '#i-' + name);
    s.appendChild(u);
    return s;
  }
  function bibleUrl(ref) { return L ? L.bibleUrl(ref) : 'https://www.biblegateway.com/passage/?search=' + encodeURIComponent(ref) + '&version=ESV'; }
  function dash(ref) { return ref.replace(/(\d)-(\d)/g, '$1–$2'); }
  // "Matthew 5:1-7:29" -> "Matthew 5:1–7:29" (or "మత్తయి 5:1–7:29") for display
  function pretty(ref) { return dash(L ? L.refText(ref) : ref); }
  // drop the book name: "Matthew 14:13-21" -> "14:13–21"
  function short(ref) { return dash(ref.replace(/^(\d\s)?[A-Za-z]+\s/, '')); }
  function refLink(ref, cls) { return h('a', { class: cls || 'gx-ref', href: bibleUrl(ref), target: '_blank', rel: 'noopener', text: pretty(ref) }); }
  function gOf(k) { return DATA.gospels[KEYS.indexOf(k)]; }
  function inG(e) { return KEYS.filter(function (k) { return e.refs[k]; }); }
  function listNames(names) {
    if (names.length < 2) return names.join('');
    return names.slice(0, -1).join(', ') + t(' and ') + names[names.length - 1];
  }

  // ---------- 1. portraits ----------
  function buildPortraits() {
    DATA.gospels.forEach(function (g, i) {
      els.portraits.appendChild(h('button', { type: 'button', class: 'gx-portrait', style: '--c:' + g.color, onclick: function () { go('g-' + g.id); } }, [
        h('span', { class: 'gx-p-top' }, [
          h('span', { class: 'gx-p-n', text: String(i + 1) }),
          h('span', { class: 'gx-p-name', text: g.name }),
          h('span', { class: 'gx-p-portrait', text: g.portrait })
        ]),
        h('span', { class: 'gx-p-body' }, [
          h('span', { class: 'gx-p-line' }, [h('b', { text: t('By ') }), g.author]),
          h('span', { class: 'gx-p-line' }, [h('b', { text: t('For ') }), g.readers]),
          h('span', { class: 'gx-p-line' }, [h('b', { text: t('Written ') }), g.written]),
          h('span', { class: 'gx-p-more' }, [t('Meet the writer'), icon('arrow')])
        ])
      ]));
    });
  }

  // ---------- 2. comparison table ----------
  var ROWS = [
    ['Written by', 'author'],
    ['When', 'written'],
    ['Where', 'place'],
    ['First readers', 'readers'],
    ['Jesus is shown as', 'portrait', 'strong'],
    ['Why it was written', 'purpose'],
    ['Style', 'style'],
    ['Look out for', 'keyWord'],
    ['Begins', 'opens'],
    ['Ends', 'ends'],
    ['Length', function (g) { return t('{c} chapters · {v} verses', { c: g.chapters, v: g.verses.toLocaleString('en-IN') }); }],
    ['Found only here', function (g) {
      return h('span', { class: 'gx-mini' }, [
        h('span', { class: 'gx-mini-bar' }, [h('span', { style: 'width:' + g.unique + '%' })]),
        h('span', { class: 'gx-mini-n', text: t('about {n}%', { n: g.unique }) })
      ]);
    }]
  ];
  function buildTable() {
    var head = h('tr', null, [h('td', { class: 'gx-corner' })].concat(DATA.gospels.map(function (g) {
      return h('th', { scope: 'col', style: '--c:' + g.color }, [
        h('button', { type: 'button', class: 'gx-th', onclick: function () { go('g-' + g.id); } }, [g.name])
      ]);
    })));
    var body = ROWS.map(function (r) {
      return h('tr', null, [h('th', { scope: 'row', text: t(r[0]) })].concat(DATA.gospels.map(function (g) {
        var v = typeof r[1] === 'function' ? r[1](g) : g[r[1]];
        return h('td', { style: '--c:' + g.color, class: r[2] ? 'is-' + r[2] : null }, [v]);
      })));
    });
    els.table.appendChild(h('thead', null, [head]));
    els.table.appendChild(h('tbody', null, body));
  }

  // ---------- 3. first and last words ----------
  function buildWords(which) {
    els.words.innerHTML = '';
    DATA.gospels.forEach(function (g) {
      var w = which === 'last' ? g.lastWords : g.firstWords;
      els.words.appendChild(h('figure', { class: 'gx-word', style: '--c:' + g.color }, [
        h('p', { class: 'gx-word-k', text: g.name }),
        h('blockquote', { text: w.text }),
        h('figcaption', null, [refLink(w.ref)]),
        which === 'last' && g.lastNote ? h('p', { class: 'gx-word-note', text: g.lastNote }) : null
      ]));
    });
    Array.prototype.forEach.call(els.wordsSeg.children, function (b) { b.setAttribute('aria-selected', String(b.dataset.w === which)); });
  }

  // ---------- 4. shared and unique ----------
  function buildBars() {
    var max = Math.max.apply(null, DATA.gospels.map(function (g) { return g.verses; }));
    DATA.gospels.forEach(function (g) {
      var w = g.verses / max * 78;
      els.bars.appendChild(h('div', { class: 'gx-bar-row', style: '--c:' + g.color }, [
        h('div', { class: 'gx-bar-label' }, [h('strong', { text: g.name }), h('span', { text: t('{v} verses', { v: g.verses.toLocaleString('en-IN') }) })]),
        h('div', { class: 'gx-bar-track' }, [
          h('div', { class: 'gx-bar', style: 'width:' + w + '%', role: 'img', 'aria-label': g.name + ': ' + t('{v} verses', { v: g.verses }) + ', ' + t('{n}% unique', { n: g.unique }) }, [
            h('span', { class: 'gx-bar-u', style: 'width:' + g.unique + '%' })
          ]),
          h('span', { class: 'gx-bar-pct', text: t('{n}% unique', { n: g.unique }) })
        ])
      ]));
    });
    els.src.textContent = DATA.meta.uniqueSource;
  }

  // ---------- 5. events ----------
  var FILTERS = [
    { id: 'all', label: 'All events', test: function () { return true; } },
    { id: 'four', label: 'In all four', test: function (e) { return inG(e).length === 4; } },
    { id: 'syn', label: 'Matthew, Mark & Luke', test: function (e) { var r = e.refs; return r.mt && r.mk && r.lk && !r.jn; } },
    { id: 'one', label: 'In one Gospel only', test: function (e) { return inG(e).length === 1; } }
  ].concat(KEYS.map(function (k) {
    return { id: 'only-' + k, key: k, test: function (e) { var g = inG(e); return g.length === 1 && g[0] === k; } };
  }));
  function fById(id) { for (var i = 0; i < FILTERS.length; i++) if (FILTERS[i].id === id) return FILTERS[i]; return FILTERS[0]; }

  function buildFilters() {
    FILTERS.forEach(function (f) {
      var g = f.key ? gOf(f.key) : null;
      var n = DATA.events.filter(f.test).length;
      els.chips.appendChild(h('button', {
        type: 'button', class: 'bx-chip gx-chip' + (g ? '' : ' gx-chip-plain'), 'data-f': f.id, 'aria-pressed': 'false',
        style: '--c:' + (g ? g.color : '#141414'), onclick: function () { setFilter(f.id); }
      }, [g ? t('Only in {name}', { name: g.name }) : t(f.label), h('span', { class: 'gx-chip-n', text: String(n) })]));
    });
    els.q.addEventListener('input', function () { filter.q = els.q.value.trim().toLowerCase(); renderMatrix(); });
  }
  function setFilter(id) {
    filter.mode = filter.mode === id && id !== 'all' ? 'all' : id;
    renderMatrix();
  }

  // a "fingerprint" of the whole story: one column per event, a cell per Gospel
  function buildStrip() {
    var wrap = h('div', { class: 'gx-strip', 'aria-hidden': 'true' });
    var labels = h('div', { class: 'gx-strip-phases', 'aria-hidden': 'true' });
    DATA.phases.forEach(function (p, pi) {
      var evs = DATA.events.filter(function (e) { return e.phase === p.id; });
      var grp = h('div', { class: 'gx-strip-grp', style: 'flex-grow:' + evs.length });
      evs.forEach(function (e) {
        grp.appendChild(h('button', { type: 'button', class: 'gx-strip-col', tabindex: '-1', title: e.title, 'data-id': e.id, onclick: function () { go('e-' + e.id); } },
          KEYS.map(function (k) { return h('span', { class: e.refs[k] ? 'on' : '', style: e.refs[k] ? '--c:' + gOf(k).color : null }); })));
      });
      wrap.appendChild(grp);
      labels.appendChild(h('span', { style: 'flex-grow:' + evs.length, title: p.label, text: String(pi + 1) }));
    });
    var names = h('div', { class: 'gx-strip-names', 'aria-hidden': 'true' }, DATA.gospels.map(function (g) { return h('span', { style: '--c:' + g.color, text: g.abbr }); }));
    var four = DATA.events.filter(function (e) { return inG(e).length === 4; }).length;
    var one = DATA.events.filter(function (e) { return inG(e).length === 1; }).length;
    els.strip.appendChild(h('div', { class: 'gx-strip-box' }, [
      h('p', { class: 'gx-strip-cap' }, [
        h('strong', { text: t('{n} events at a glance. ', { n: DATA.events.length }) }),
        t('Each column is one event, from the birth to the ascension. {four} are told by all four Gospels; {one} by just one.', { four: four, one: one })
      ]),
      h('div', { class: 'gx-strip-main' }, [names, h('div', { class: 'gx-strip-plot' }, [wrap, labels])])
    ]));
  }

  function matches(e) {
    if (!fById(filter.mode).test(e)) return false;
    if (filter.q) {
      var d = e.details || {};
      var hay = [e.title, e.en || '', e.note || ''].concat(KEYS.map(function (k) { return e.refs[k] ? e.refs[k] + ' ' + pretty(e.refs[k]) + ' ' + (d[k] || '') : ''; })).join(' ').toLowerCase();
      if (hay.indexOf(filter.q) === -1) return false;
    }
    return true;
  }

  function renderMatrix() {
    Array.prototype.forEach.call(els.chips.children, function (c) { c.setAttribute('aria-pressed', String(c.dataset.f === filter.mode)); });
    els.matrix.innerHTML = '';
    visible = DATA.events.filter(matches);
    var shown = {};
    visible.forEach(function (e) { shown[e.id] = true; });
    Array.prototype.forEach.call(els.strip.querySelectorAll('.gx-strip-col'), function (c) { c.classList.toggle('is-dim', !shown[c.dataset.id]); });

    els.matrix.appendChild(h('div', { class: 'gx-mhead' }, [h('span', { class: 'gx-mhead-ev', text: t('Event') })].concat(DATA.gospels.map(function (g) {
      return h('span', { class: 'gx-mhead-g', style: '--c:' + g.color }, [h('span', { class: 'gx-full', text: g.name }), h('span', { class: 'gx-abbr', text: g.abbr })]);
    }))));

    DATA.phases.forEach(function (p, pi) {
      var evs = visible.filter(function (e) { return e.phase === p.id; });
      if (!evs.length) return;
      els.matrix.appendChild(h('div', { class: 'gx-phase' }, [
        h('span', { class: 'gx-phase-n', text: String(pi + 1) }),
        h('div', null, [h('h3', { text: p.label }), h('p', { text: p.about })])
      ]));
      evs.forEach(function (e) { els.matrix.appendChild(row(e)); });
    });
    els.empty.hidden = visible.length > 0;
  }
  function row(e) {
    var n = inG(e).length;
    return h('button', { type: 'button', class: 'gx-row', 'data-id': e.id, onclick: function () { go('e-' + e.id); } }, [
      h('span', { class: 'gx-ev' }, [
        h('span', { class: 'gx-ev-t', text: e.title }),
        h('span', { class: 'gx-ev-meta' }, [
          n === 4 ? h('span', { class: 'gx-tag gx-tag-four', text: t('All four') }) : null,
          e.sign ? h('span', { class: 'gx-tag', text: t('Sign {n} of 7', { n: e.sign }) }) : null,
          e.details ? h('span', { class: 'gx-tag gx-tag-cmp', text: t('Compare') }) : null
        ])
      ])
    ].concat(KEYS.map(function (k) {
      var g = gOf(k), ref = e.refs[k];
      return ref
        ? h('span', { class: 'gx-cell is-on', style: '--c:' + g.color, title: pretty(ref) }, [h('span', { class: 'gx-dot' }), h('span', { class: 'gx-cell-ref', text: short(ref) })])
        : h('span', { class: 'gx-cell', 'aria-label': t('Not in {name}', { name: g.name }) }, [h('span', { class: 'gx-dash' })]);
    })));
  }

  // ---------- drawer ----------
  function go(hash) {
    if (location.hash.slice(1) !== hash) location.hash = hash;
    else show(hash);
  }
  function show(hash) {
    var m = /^([ge])-(.+)$/.exec(hash || '');
    if (!m) { close(true); return; }
    var node = m[1] === 'g' ? (G[m[2]] && gospelView(G[m[2]])) : (EV[m[2]] && eventView(EV[m[2]]));
    if (!node) { close(true); return; }
    if (els.drawer.hidden) lastFocus = document.activeElement;
    els.d.innerHTML = '';
    els.d.style.setProperty('--c', node.color);
    node.items.forEach(function (n) { if (n) els.d.appendChild(n); });
    els.scrim.hidden = false;
    els.drawer.hidden = false;
    document.body.classList.add('bx-locked');
    els.drawer.scrollTop = 0;
    requestAnimationFrame(function () { els.drawer.classList.add('is-open'); els.scrim.classList.add('is-open'); });
    els.d.querySelector('.bx-close').focus({ preventScroll: true });
    document.title = node.title + t(' · Four Gospels Compared | Asha Books');
    Array.prototype.forEach.call(els.strip.querySelectorAll('.gx-strip-col'), function (c) { c.classList.toggle('is-current', m[1] === 'e' && c.dataset.id === m[2]); });
  }
  function top(label) {
    return h('div', { class: 'bx-d-top' }, [
      h('span', { class: 'bx-d-sec', text: label }),
      h('button', { type: 'button', class: 'bx-close', 'aria-label': t('Close'), onclick: function () { close(); } }, [icon('x')])
    ]);
  }
  function stepper(prev, next, ev) {
    return h('div', { class: 'bx-d-nav' }, [
      prev ? h('button', { type: 'button', class: 'bx-step', onclick: function () { go(prev.hash); } }, [icon('left'), h('span', null, [h('small', { text: t(ev ? 'Previous event' : 'Previous') }), prev.title])]) : h('span'),
      next ? h('button', { type: 'button', class: 'bx-step is-next', onclick: function () { go(next.hash); } }, [h('span', null, [h('small', { text: t(ev ? 'Next event' : 'Next') }), next.title]), icon('right')]) : h('span')
    ]);
  }
  function fact(k, v) { return h('div', null, [h('dt', { text: k }), h('dd', { text: v })]); }
  function refList(list) {
    return h('div', { class: 'gx-d-list' }, [
      h('h3', { class: 'gx-d-h', text: list.title }),
      h('ol', null, list.items.map(function (it) { return h('li', null, [h('span', { text: it.label }), refLink(it.ref, 'gx-ref gx-ref-sm')]); }))
    ]);
  }

  function gospelView(g) {
    var i = DATA.gospels.indexOf(g), k = KEYS[i];
    var prev = DATA.gospels[i - 1], next = DATA.gospels[i + 1];
    var onlyHere = DATA.events.filter(function (e) { var x = inG(e); return x.length === 1 && x[0] === k; }).length;
    return {
      color: g.color, title: g.name,
      items: [
        top(t('The Gospel of {name} · {i} of 4', { name: g.name, i: i + 1 })),
        h('h2', { id: 'bx-d-title', text: g.name }),
        h('p', { class: 'bx-d-theme' }, [h('span', { class: 'gx-d-portrait', text: g.portrait }), ' ', g.portraitLong]),
        h('dl', { class: 'bx-facts' }, [fact(t('Written by'), g.author), fact(t('When'), g.written), fact(t('Where'), g.place), fact(t('First readers'), g.readers)]),
        h('h3', { class: 'gx-d-h', text: t('Who wrote it') }),
        h('p', { class: 'gx-d-p', text: g.authorBio }),
        h('p', { class: 'gx-d-refs' }, g.authorRefs.map(function (r) { return refLink(r, 'gx-ref gx-ref-sm'); })),
        h('h3', { class: 'gx-d-h', text: t('Who it was for') }),
        h('p', { class: 'gx-d-p', text: g.readersLong }),
        h('h3', { class: 'gx-d-h', text: t('Why it was written') }),
        h('p', { class: 'gx-d-p', text: g.purpose }),
        h('h3', { class: 'gx-d-h', text: t('Style: {s}', { s: L ? g.style : g.style.toLowerCase() }) }),
        h('p', { class: 'gx-d-p', text: g.styleLong }),
        h('figure', { class: 'bx-verse' }, [
          h('p', { class: 'bx-verse-k', text: t('Key verse') }),
          h('blockquote', { text: g.keyVerse.text }),
          h('figcaption', null, [h('a', { href: bibleUrl(g.keyVerse.ref), target: '_blank', rel: 'noopener', text: pretty(g.keyVerse.ref) })])
        ]),
        h('h3', { class: 'gx-d-h', text: t('What makes {name} different', { name: g.name }) }),
        h('ul', { class: 'gx-d-ul' }, g.distinctives.map(function (t) { return h('li', { text: t }); })),
        g.list ? refList(g.list) : null,
        g.list2 ? refList(g.list2) : null,
        h('div', { class: 'bx-d-actions' }, [
          h('button', { type: 'button', class: 'btn btn-red', onclick: function () { close(); filter.q = ''; els.q.value = ''; filter.mode = 'only-' + k; renderMatrix(); $('events').scrollIntoView({ behavior: 'smooth' }); } },
            [t('{n} events only in {name}', { n: onlyHere, name: g.name }), icon('arrow')]),
          h('a', { class: 'btn btn-ghost', href: bibleUrl((g.en || g.name) + ' 1'), target: '_blank', rel: 'noopener' }, [icon('book'), t('Start reading')]),
          h('a', { class: 'btn btn-ghost', href: g.books }, [t('In the book explorer')])
        ]),
        stepper(prev && { hash: 'g-' + prev.id, title: prev.name }, next && { hash: 'g-' + next.id, title: next.name })
      ]
    };
  }

  function eventView(e) {
    var ph = DATA.phases.filter(function (p) { return p.id === e.phase; })[0];
    var has = inG(e), d = e.details || {};
    // step through what the matrix currently shows, or all events if this one is filtered out
    var list = visible.indexOf(e) > -1 ? visible : DATA.events;
    var i = list.indexOf(e), prev = list[i - 1], next = list[i + 1];
    var refs = has.map(function (k) { return e.refs[k]; });
    var color = has.length === 1 ? gOf(has[0]).color : '#141414';
    return {
      color: color, title: e.title,
      items: [
        top(ph.label),
        h('h2', { id: 'bx-d-title', text: e.title }),
        h('div', { class: 'gx-cover', 'aria-label': t('Recorded in {names}', { names: listNames(has.map(function (k) { return gOf(k).name; })) }) }, KEYS.map(function (k) {
          return h('span', { class: e.refs[k] ? 'on' : '', style: '--c:' + gOf(k).color, text: gOf(k).abbr });
        })),
        h('p', { class: 'gx-d-in', text: has.length === 4 ? t('Told in all four Gospels.') : t(has.length === 1 ? 'Told in {names} only.' : 'Told in {names}.', { names: listNames(has.map(function (k) { return gOf(k).name; })) }) }),
        h('div', { class: 'gx-accounts' + (has.length === 1 ? ' is-single' : '') }, KEYS.map(function (k) {
          var g = gOf(k), ref = e.refs[k];
          if (!ref) return has.length === 1 ? null : h('div', { class: 'gx-acc is-off', style: '--c:' + g.color }, [h('p', { class: 'gx-acc-g', text: g.name }), h('p', { class: 'gx-acc-none', text: t('Not recorded') })]);
          return h('div', { class: 'gx-acc', style: '--c:' + g.color }, [
            h('p', { class: 'gx-acc-g', text: g.name }),
            refLink(ref, 'gx-acc-ref'),
            d[k] ? h('p', { class: 'gx-acc-d', text: d[k] }) : null
          ]);
        })),
        e.sign ? h('p', { class: 'bx-note', text: t('The {ord} of the seven signs John chose “so that you may believe” (John 20:31).', { ord: ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh'][e.sign - 1], n: e.sign }) }) : null,
        e.note ? h('div', { class: 'bx-christ gx-note' }, [h('p', { class: 'bx-christ-k' }, [icon('info'), t('Good to know')]), h('p', { text: e.note })]) : null,
        h('div', { class: 'bx-d-actions' }, [
          // YouVersion (the Telugu Bible) opens one passage at a time, so there each account links on its own card
          refs.length === 1 || !L ? h('a', { class: 'btn btn-red', href: bibleUrl(refs.join('; ')), target: '_blank', rel: 'noopener' }, [icon('book'), refs.length > 1 ? t('Read all {n} accounts', { n: refs.length }) : t('Read the passage')]) : null,
          e.atlas ? h('a', { class: 'btn btn-ghost', href: 'jesus-and-paul.html#event:' + e.atlas }, [icon('map'), t('On the map and timeline')]) : null,
          e.link ? h('a', { class: 'btn btn-ghost', href: e.link.href }, [icon('tree'), e.link.label]) : null
        ]),
        stepper(prev && { hash: 'e-' + prev.id, title: prev.title }, next && { hash: 'e-' + next.id, title: next.title }, true)
      ]
    };
  }

  function close(fromHash) {
    if (els.drawer.hidden) return;
    els.drawer.classList.remove('is-open');
    els.scrim.classList.remove('is-open');
    document.body.classList.remove('bx-locked');
    setTimeout(function () { els.drawer.hidden = true; els.scrim.hidden = true; }, 250);
    document.title = BASE_TITLE;
    Array.prototype.forEach.call(els.strip.querySelectorAll('.is-current'), function (c) { c.classList.remove('is-current'); });
    if (!fromHash) history.pushState(null, '', location.pathname + location.search);
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  function init(data) {
    DATA = data;
    DATA.gospels.forEach(function (g) { G[g.id] = g; });
    DATA.events.forEach(function (e) { EV[e.id] = e; });
    buildPortraits();
    buildTable();
    buildWords('first');
    els.wordsSeg.addEventListener('click', function (ev) { var b = ev.target.closest('button'); if (b) buildWords(b.dataset.w); });
    buildBars();
    buildStrip();
    buildFilters();
    renderMatrix();
    els.order.textContent = DATA.meta.orderNote;

    els.scrim.addEventListener('click', function () { close(); });
    document.addEventListener('keydown', function (ev) {
      if (els.drawer.hidden) return;
      if (ev.key === 'Escape') close();
      if (ev.key === 'Tab') {
        var f = els.drawer.querySelectorAll('a, button');
        if (!f.length) return;
        if (ev.shiftKey && document.activeElement === f[0]) { ev.preventDefault(); f[f.length - 1].focus(); }
        else if (!ev.shiftKey && document.activeElement === f[f.length - 1]) { ev.preventDefault(); f[0].focus(); }
      }
    });
    window.addEventListener('hashchange', function () { show(location.hash.slice(1)); });
    if (/^#[ge]-/.test(location.hash)) show(location.hash.slice(1));
  }

  // Telugu words, matched to the English data by id; references, colours and numbers stay in the English file
  function translate(data, tr) {
    if (!tr) return data;
    UI = tr.ui || {};
    Object.keys(tr.meta || {}).forEach(function (k) { data.meta[k] = tr.meta[k]; });
    data.gospels.forEach(function (g) {
      var x = tr.gospels[g.id];
      g.en = g.name;
      if (!x) return;
      ['name', 'abbr', 'portrait', 'portraitLong', 'author', 'authorBio', 'written', 'place', 'readers', 'readersLong', 'purpose',
        'style', 'styleLong', 'opens', 'ends', 'keyWord', 'lastNote', 'distinctives'].forEach(function (k) { if (x[k]) g[k] = x[k]; });
      ['firstWords', 'lastWords', 'keyVerse'].forEach(function (k) { if (x[k]) g[k].text = x[k]; });
      ['list', 'list2'].forEach(function (k) {
        if (!x[k] || !g[k]) return;
        g[k].title = x[k].title;
        g[k].items.forEach(function (it, i) { if (x[k].items[i]) it.label = x[k].items[i]; });
      });
    });
    data.phases.forEach(function (p) { var x = tr.phases[p.id]; if (x) { p.label = x.label; p.about = x.about; } });
    data.events.forEach(function (e) {
      var x = tr.events[e.id];
      e.en = e.title;
      if (!x) return;
      if (x.title) e.title = x.title;
      if (x.note) e.note = x.note;
      if (x.details) e.details = x.details;
      if (x.link && e.link) e.link.label = x.link;
    });
    return data;
  }
  function getJSON(url) { return fetch(url).then(function (r) { return r.json(); }); }

  Promise.all([getJSON(document.body.dataset.src || 'data/gospels/gospels.json'), document.body.dataset.translation ? getJSON(document.body.dataset.translation) : null]).then(function (r) {
    init(translate(r[0], r[1]));
  }).catch(function (err) {
    els.matrix.textContent = t('Sorry, the Gospel comparison could not be loaded.');
    console.error(err);
  });

  var bar = document.querySelector('.top');
  window.addEventListener('scroll', function () { bar.classList.toggle('is-scrolled', window.scrollY > 8); }, { passive: true });
})();
