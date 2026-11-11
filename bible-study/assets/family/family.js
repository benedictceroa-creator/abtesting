/* Asha Books – Bible family tree
 * A focus view: the chosen person in the middle, parents above, children below
 * (grouped by the other parent), siblings alongside, and a trail of ancestors
 * back to Adam. The URL hash holds the person's id, so the back button works.
 */
(function () {
  'use strict';

  var DATA, BY = {}, KIDS = {}, SPOUSES = {};
  // Language: a Telugu page loads assets/i18n/te.js first and sets data-src and
  // data-translation on <body>; the English page has neither.
  var L = window.BS_LANG || null;
  var page = document.body.dataset;
  function t(s, vars) {
    var out = (L && L.ui[s]) || s;
    if (vars) Object.keys(vars).forEach(function (k) { out = out.split('{' + k + '}').join(vars[k]); });
    return out;
  }
  var els = {
    tree: document.getElementById('ft-tree'),
    detail: document.getElementById('ft-detail'),
    trail: document.getElementById('ft-trail'),
    trailLabel: document.getElementById('ft-trail-label'),
    jumps: document.getElementById('ft-jumps'),
    q: document.getElementById('ft-q'),
    results: document.getElementById('ft-results')
  };

  function h(tag, attrs, children) {
    var el = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : v);
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
  function era(p) { return DATA.eras[p.era]; }
  function initials(name) {
    var first = name.replace(/^John the /, '').split(/[\s-]/)[0];
    // Whole first letter, so a Telugu vowel sign stays with its consonant
    if (window.Intl && Intl.Segmenter) return new Intl.Segmenter().segment(first)[Symbol.iterator]().next().value.segment;
    return first.slice(0, 1);
  }

  // ---------- relationships ----------
  function index() {
    DATA.people.forEach(function (p) { BY[p.id] = p; KIDS[p.id] = []; SPOUSES[p.id] = []; });
    function marry(a, b) {
      if (SPOUSES[a].indexOf(b) === -1) SPOUSES[a].push(b);
      if (SPOUSES[b].indexOf(a) === -1) SPOUSES[b].push(a);
    }
    DATA.people.forEach(function (p) {
      p.parents.forEach(function (par) { KIDS[par].push(p.id); });
      (p.spouses || []).forEach(function (s) { marry(p.id, s); });
      if (p.parents.length === 2 && !p.gap) marry(p.parents[0], p.parents[1]);
    });
  }
  function siblings(p) {
    if (!p.parents.length || p.gap) return [];
    return KIDS[p.parents[0]].filter(function (k) { return k !== p.id && !BY[k].gap; });
  }
  // Ancestors by first parent, root first
  function ancestry(p) {
    var chain = [p];
    while (p.parents.length) { p = BY[p.parents[0]]; chain.unshift(p); }
    return chain;
  }
  function relation(child, parent) {
    if (child.gap) return t('Descendant of {name}', { name: parent.name });
    return t(child.sex === 'm' ? 'Son of {name}' : 'Daughter of {name}', { name: parent.name });
  }
  function subline(p) {
    if (p.parents.length) return relation(p, BY[p.parents[0]]);
    var sp = SPOUSES[p.id][0];
    if (sp) return t(p.sex === 'f' ? 'Wife of {name}' : 'Husband of {name}', { name: BY[sp].name });
    return era(p).label;
  }

  // ---------- cards ----------
  function card(p, opts) {
    opts = opts || {};
    var cls = 'ft-card' + (opts.size ? ' is-' + opts.size : '') + (p.line ? ' is-line' : '') + (opts.current ? ' is-current' : '');
    var el = h(opts.current ? 'div' : 'button', {
      class: cls, type: opts.current ? null : 'button', style: '--era:' + era(p).color,
      onclick: opts.current ? null : function () { go(p.id); },
      'aria-label': opts.current ? null : p.name + ', ' + (opts.sub || subline(p))
    }, [
      h('span', { class: 'ft-av', 'aria-hidden': 'true' }, [initials(p.name), p.line ? h('span', { class: 'ft-av-mark', title: t('In the line of Jesus') }, [icon('crown')]) : null]),
      h('span', { class: 'ft-card-txt' }, [
        h('span', { class: 'ft-name', text: p.name }),
        h('span', { class: 'ft-sub', text: opts.sub || subline(p) })
      ])
    ]);
    return el;
  }
  function row(label, nodes, cls) {
    return h('div', { class: 'ft-row ' + (cls || '') }, [
      label ? h('p', { class: 'ft-row-label', text: label }) : null,
      h('div', { class: 'ft-row-cards' }, nodes)
    ]);
  }

  // ---------- render ----------
  function renderTree(p) {
    var tree = els.tree;
    tree.innerHTML = '';
    tree.classList.remove('is-in');

    // parents
    if (p.parents.length) {
      tree.appendChild(row(t(p.gap ? 'Descended from' : 'Parents'), p.parents.map(function (id) { return card(BY[id], { size: 'sm' }); }), 'ft-parents'));
      tree.appendChild(h('div', { class: 'ft-link' + (p.gap ? ' is-gap' : ''), 'aria-hidden': 'true' }));
    } else {
      tree.appendChild(h('p', { class: 'ft-root', text: t(p.id === 'adam' || p.id === 'eve' ? 'Created by God (Genesis 1:27)' : 'Parents not named in Scripture') }));
    }

    // focus + spouses
    var spouses = SPOUSES[p.id];
    tree.appendChild(h('div', { class: 'ft-focus' }, [
      card(p, { size: 'lg', current: true, sub: era(p).label }),
      spouses.length ? h('div', { class: 'ft-spouses' }, [
        h('p', { class: 'ft-row-label', text: t(p.sex === 'f' ? (spouses.length > 1 ? 'Husbands' : 'Husband') : (spouses.length > 1 ? 'Wives' : 'Wife')) })
      ].concat(spouses.map(function (s) { return card(BY[s], { size: 'sm' }); }))) : null
    ]));

    // children, grouped by the other parent
    var kids = KIDS[p.id];
    if (kids.length) {
      tree.appendChild(h('div', { class: 'ft-link', 'aria-hidden': 'true' }));
      var groups = [], seen = {};
      kids.forEach(function (k) {
        var c = BY[k];
        var other = c.gap ? '~gap' : (c.parents.filter(function (x) { return x !== p.id; })[0] || '~');
        if (!seen[other]) { seen[other] = { key: other, kids: [] }; groups.push(seen[other]); }
        seen[other].kids.push(c);
      });
      var multi = groups.length > 1;
      tree.appendChild(h('div', { class: 'ft-children' }, groups.map(function (g) {
        var label = g.key === '~gap' ? t('Descendants') : !multi ? t('Children') : g.key === '~' ? t(p.sex === 'm' ? 'Mother not named' : 'Father not named') : t('With {name}', { name: BY[g.key].name });
        return row(label, g.kids.map(function (c) { return card(c, { sub: c.gap ? t('Descendant') : t(c.sex === 'm' ? 'Son' : 'Daughter') + (c.also ? t(' · also {name}', { name: c.also.split(',')[0] }) : '') }); }), 'ft-kids');
      })));
    } else {
      tree.appendChild(h('p', { class: 'ft-root ft-root-end', text: t(p.id === 'jesus' ? 'The promised offspring: “All the promises of God find their Yes in him” (2 Corinthians 1:20)' : 'No children shown on this tree') }));
    }

    // siblings
    var sibs = siblings(p);
    if (sibs.length) {
      tree.appendChild(h('div', { class: 'ft-sibs' }, [
        h('p', { class: 'ft-row-label', text: t('Brothers and sisters') }),
        h('div', { class: 'ft-chips' }, sibs.map(function (s) {
          return h('button', { type: 'button', class: 'ft-chip' + (BY[s].line ? ' is-line' : ''), style: '--era:' + era(BY[s]).color, onclick: function () { go(s); } }, [BY[s].name]);
        }))
      ]));
    }
    requestAnimationFrame(function () { tree.classList.add('is-in'); });
  }

  function renderTrail(p) {
    var chain = ancestry(p);
    els.trail.innerHTML = '';
    els.trailLabel.textContent = chain.length > 1
      ? t(chain.length > 2 ? 'Ancestors back to {name} · {n} generations shown' : 'Ancestors back to {name} · {n} generation shown', { name: chain[0].name, n: chain.length - 1 })
      : t('The first of a family line');
    chain.forEach(function (a, i) {
      var gap = i > 0 && chain[i].gap;
      els.trail.appendChild(h('li', { class: gap ? 'is-gap' : null }, [
        a === p ? h('span', { class: 'ft-crumb is-current', style: '--era:' + era(a).color, 'aria-current': 'true', text: a.name })
          : h('button', { type: 'button', class: 'ft-crumb' + (a.line ? ' is-line' : ''), style: '--era:' + era(a).color, onclick: function () { go(a.id); }, text: a.name })
      ]));
    });
    var last = els.trail.lastElementChild;
    if (last) els.trail.scrollTo({ left: els.trail.scrollWidth, behavior: 'smooth' });
  }

  function renderDetail(p) {
    var e = era(p), d = els.detail, line = DATA.people.filter(function (x) { return x.line; });
    var li = line.indexOf(p);
    d.innerHTML = '';
    var nodes = [
      h('span', { class: 'ft-era', style: '--era:' + e.color, text: e.label }),
      h('h2', { text: p.name }),
      p.also ? h('p', { class: 'ft-also', text: t('Also called {names}', { names: p.also }) }) : null
    ];
    var badges = [];
    if (p.id === 'jesus') badges.push(h('span', { class: 'ft-badge is-line' }, [icon('crown'), t('Son of David, son of Abraham (Matthew 1:1)')]));
    else if (p.line) badges.push(h('span', { class: 'ft-badge is-line' }, [icon('crown'), t('In the line of Jesus')]));
    if (p.matthew) badges.push(h('span', { class: 'ft-badge is-line' }, [icon('crown'), t('Named in Matthew 1')]));
    if (p.skipped) badges.push(h('span', { class: 'ft-badge', title: t('Matthew 1 names the key kings rather than every generation') }, [t('Not named in Matthew 1')]));
    if (p.age) badges.push(h('span', { class: 'ft-badge' }, [t('Lived {n} years', { n: p.age })]));
    if (badges.length) nodes.push(h('div', { class: 'ft-badges' }, badges));
    if (p.meaning) nodes.push(h('div', { class: 'ft-meaning' }, [
      h('span', { class: 'ft-meaning-k', text: t('The name means') }),
      h('p', null, [p.meaning.text + ' ', h('a', { href: bibleUrl(p.meaning.ref), target: '_blank', rel: 'noopener', text: '(' + refText(p.meaning.ref) + ')' })])
    ]));
    nodes.push(h('p', { class: 'ft-summary', text: p.summary }));
    if (p.note) nodes.push(h('p', { class: 'ft-note', text: p.note }));
    nodes.push(h('h3', { text: t('Read the Scripture') }));
    nodes.push(h('div', { class: 'ft-refs' }, p.refs.map(function (r) {
      return h('a', { href: bibleUrl(r), target: '_blank', rel: 'noopener' }, [icon('book'), refText(r)]);
    })));
    if (p.atlas) nodes.push(h('a', { class: 'btn btn-dark ft-atlas', href: p.atlas }, [icon('map'), t(p.sex === 'f' ? 'See her on the timeline' : 'See him on the timeline')]));
    if (p.line) {
      nodes.push(h('div', { class: 'ft-walk' }, [
        h('p', { class: 'ft-row-label', text: t('Adam to Jesus · {i} of {n}', { i: li + 1, n: line.length }) }),
        h('div', { class: 'ft-walk-btns' }, [
          li > 0 ? h('button', { type: 'button', class: 'btn btn-ghost', onclick: function () { go(line[li - 1].id); } }, [icon('up'), line[li - 1].name]) : null,
          li < line.length - 1 ? h('button', { type: 'button', class: 'btn btn-red', onclick: function () { go(line[li + 1].id); } }, [line[li + 1].name, icon('down')]) : null
        ])
      ]));
    }
    nodes.forEach(function (n) { if (n) d.appendChild(n); });
  }

  function show(id) {
    var p = BY[id] || BY.abraham;
    renderTree(p);
    renderTrail(p);
    renderDetail(p);
    document.title = p.name + t(' · Bible Family Tree | Asha Books');
    Array.prototype.forEach.call(els.jumps.children, function (b) { b.classList.toggle('is-active', b.dataset.id === p.id); });
  }
  function go(id) {
    if (location.hash.slice(1) === id) return;
    location.hash = id;
    var top = els.tree.getBoundingClientRect().top;
    if (top < 60 || top > window.innerHeight * 0.6) window.scrollTo({ top: window.scrollY + els.trail.getBoundingClientRect().top - 90, behavior: 'smooth' });
  }

  // ---------- jump chips & search ----------
  function buildJumps() {
    DATA.jumps.forEach(function (id) {
      var b = h('button', { type: 'button', class: 'ft-jump', 'data-id': id, style: '--era:' + era(BY[id]).color, onclick: function () { go(id); } }, [BY[id].name]);
      els.jumps.appendChild(b);
    });
  }
  function search() {
    var q = els.q.value.trim().toLowerCase();
    var r = els.results;
    r.innerHTML = '';
    if (!q) { r.hidden = true; els.q.setAttribute('aria-expanded', 'false'); return; }
    // On the Telugu page the English name (p.en) is searchable too
    var hits = DATA.people.filter(function (p) {
      return [p.name, p.en || ''].concat((p.also || '').split(/,\s*/)).some(function (a) { return a.toLowerCase().indexOf(q) === 0; });
    }).concat(DATA.people.filter(function (p) {
      return p.name.toLowerCase().indexOf(q) > 0 || (p.en || '').toLowerCase().indexOf(q) > 0;
    })).filter(function (p, i, all) { return all.indexOf(p) === i; }).slice(0, 8);
    if (!hits.length) r.appendChild(h('li', { class: 'ft-noresult', text: t('No one by that name on this tree yet') }));
    hits.forEach(function (p, i) {
      r.appendChild(h('li', { role: 'option', id: 'ft-opt-' + i }, [h('button', { type: 'button', style: '--era:' + era(p).color, onclick: function () { pick(p.id); } }, [
        h('span', { class: 'ft-av', 'aria-hidden': 'true' }, [initials(p.name)]),
        h('span', null, [h('strong', { text: p.name }), h('small', { text: subline(p) })])
      ])]));
    });
    r.hidden = false;
    els.q.setAttribute('aria-expanded', 'true');
  }
  function pick(id) { els.q.value = ''; search(); els.q.blur(); go(id); }

  function init(data) {
    DATA = data;
    index();
    buildJumps();
    els.q.addEventListener('input', search);
    els.q.addEventListener('keydown', function (e) {
      var first = els.results.querySelector('button');
      if (e.key === 'Enter' && first) { e.preventDefault(); first.click(); }
      if (e.key === 'ArrowDown' && first) { e.preventDefault(); first.focus(); }
      if (e.key === 'Escape') { els.q.value = ''; search(); }
    });
    els.results.addEventListener('keydown', function (e) {
      var btns = Array.prototype.slice.call(els.results.querySelectorAll('button')), i = btns.indexOf(document.activeElement);
      if (e.key === 'ArrowDown' && i < btns.length - 1) { e.preventDefault(); btns[i + 1].focus(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); (i > 0 ? btns[i - 1] : els.q).focus(); }
      if (e.key === 'Escape') { els.q.value = ''; search(); els.q.focus(); }
    });
    document.addEventListener('click', function (e) { if (!e.target.closest('.ft-search')) { els.results.hidden = true; } });
    window.addEventListener('hashchange', function () { show(decodeURIComponent(location.hash.slice(1))); });
    show(decodeURIComponent(location.hash.slice(1)) || 'abraham');
  }

  // Telugu words, matched to the English data by id; dates, links and references stay in the English file
  function translate(data, tr) {
    if (!tr) return data;
    Object.keys(tr.eras).forEach(function (k) { if (data.eras[k]) data.eras[k].label = tr.eras[k].label; });
    data.people.forEach(function (p) {
      var x = tr.people[p.id];
      p.en = p.name;
      if (!x) return;
      ['name', 'also', 'summary', 'note'].forEach(function (k) { if (x[k]) p[k] = x[k]; });
      if (x.meaning && p.meaning) p.meaning.text = x.meaning;
    });
    return data;
  }
  function getJSON(url) { return fetch(url).then(function (r) { return r.json(); }); }

  Promise.all([getJSON(page.src || 'data/family/people.json'), page.translation ? getJSON(page.translation) : null]).then(function (r) {
    init(translate(r[0], r[1]));
  }).catch(function (err) {
    els.tree.textContent = t('Sorry, the family tree could not be loaded.');
    console.error(err);
  });

  var top = document.querySelector('.top');
  window.addEventListener('scroll', function () { top.classList.toggle('is-scrolled', window.scrollY > 8); }, { passive: true });
})();
