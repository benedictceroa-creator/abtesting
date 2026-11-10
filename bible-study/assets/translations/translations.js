/* Asha Books – Bible translation guide
 * The spectrum from the Asha Books graphic made interactive: pins along a
 * gradient bar, a detail card for the chosen translation, the three
 * approaches, John 3:16 along the spectrum, and a Bible Gateway compare tool.
 */
(function () {
  'use strict';

  var DATA, BY = {}, current = null, picks = ['kjv', 'esv', 'niv', 'nlt', 'msg'];
  var MAX_PICKS = 5;
  var $ = function (id) { return document.getElementById(id); };

  // The graphic's gradient: yellow, orange, coral, pink
  var STOPS = [[0, [247, 224, 122]], [45, [242, 162, 114]], [72, [238, 138, 140]], [100, [224, 126, 214]]];
  function colorAt(pos) {
    for (var i = 1; i < STOPS.length; i++) {
      if (pos <= STOPS[i][0]) {
        var a = STOPS[i - 1], b = STOPS[i], f = (pos - a[0]) / (b[0] - a[0]);
        return 'rgb(' + a[1].map(function (c, k) { return Math.round(c + (b[1][k] - c) * f); }).join(',') + ')';
      }
    }
    return 'rgb(' + STOPS[STOPS.length - 1][1].join(',') + ')';
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
    var u = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    u.setAttribute('href', '#i-' + name);
    s.appendChild(u);
    return s;
  }
  function gateway(ref, versions) {
    return 'https://www.biblegateway.com/passage/?search=' + encodeURIComponent(ref) + '&version=' + versions.join(';');
  }
  var READING = ['', 'More demanding', 'Moderate', 'Easy to read'];

  // ---------- spectrum ----------
  function buildPins() {
    var box = $('tg-pins');
    DATA.translations.forEach(function (t) {
      var b = h('button', {
        type: 'button', role: 'option', class: 'tg-pin is-' + t.row, 'data-id': t.id, 'aria-selected': 'false',
        style: '--pos:' + t.pos + '%;--c:' + colorAt(t.pos), title: t.name,
        onclick: function () { select(t.id, true); }
      }, [h('span', { class: 'tg-pin-dot' }), h('span', { class: 'tg-pin-line' }), h('span', { class: 'tg-pin-label', text: t.abbr })]);
      box.appendChild(b);
    });
    box.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft' && e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      e.preventDefault();
      step(e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1, true);
    });
  }
  function step(d, focus) {
    var list = DATA.translations, i = list.indexOf(current) + d;
    if (i < 0 || i >= list.length) return;
    select(list[i].id, false);
    if (focus) document.querySelector('.tg-pin[data-id="' + list[i].id + '"]').focus();
  }

  function select(id, scroll) {
    var t = BY[id];
    if (!t) return;
    current = t;
    Array.prototype.forEach.call(document.querySelectorAll('.tg-pin'), function (p) {
      var on = p.dataset.id === id;
      p.classList.toggle('is-on', on);
      p.setAttribute('aria-selected', String(on));
      p.tabIndex = on ? 0 : -1;
    });
    try { history.replaceState(null, '', '#' + id); } catch (e) { /* sandboxed */ }
    renderCard(t);
    if (scroll) {
      var r = $('tg-card').getBoundingClientRect();
      if (r.top > window.innerHeight * 0.75 || r.bottom < 80) $('tg-card').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function renderCard(t) {
    var c = $('tg-card'), ap = DATA.approaches[t.approach], i = DATA.translations.indexOf(t);
    var prev = DATA.translations[i - 1], next = DATA.translations[i + 1];
    c.innerHTML = '';
    c.style.setProperty('--c', colorAt(t.pos));
    var picked = picks.indexOf(t.id) !== -1;
    [
      h('div', { class: 'tg-card-head' }, [
        h('div', null, [
          h('span', { class: 'tg-approach', text: ap.label }),
          h('h2', null, [h('span', { class: 'tg-abbr', text: t.abbr }), h('span', { class: 'tg-name', text: t.name })])
        ]),
        h('div', { class: 'tg-nav' }, [
          h('button', { type: 'button', class: 'tg-round', 'aria-label': 'More literal', disabled: prev ? null : 'disabled', onclick: function () { step(-1); } }, [icon('left')]),
          h('button', { type: 'button', class: 'tg-round', 'aria-label': 'More readable', disabled: next ? null : 'disabled', onclick: function () { step(1); } }, [icon('right')])
        ])
      ]),
      h('dl', { class: 'tg-facts' }, [
        fact('First published', t.year),
        fact('Translated by', t.by),
        h('div', null, [h('dt', { text: 'Reading level' }), h('dd', null, [
          h('span', { class: 'tg-meter', 'aria-hidden': 'true' }, [1, 2, 3].map(function (n) { return h('i', { class: n <= t.reading ? 'on' : null }); })),
          READING[t.reading]
        ])]),
        t.basis ? fact('Translated from', t.basis) : fact('Approach', ap.aka)
      ]),
      h('p', { class: 'tg-about', text: t.about }),
      h('p', { class: 'tg-good' }, [h('strong', { text: 'Good for: ' }), t.goodFor]),
      t.note ? h('p', { class: 'tg-note', text: t.note }) : null,
      h('div', { class: 'tg-actions' }, [
        t.gateway ? h('a', { class: 'btn btn-white', href: gateway('John 3', [t.gateway]), target: '_blank', rel: 'noopener' }, [icon('book'), 'Read John 3 in the ' + t.abbr])
          : t.id === 'interlinear' ? h('a', { class: 'btn btn-white', href: 'https://biblehub.com/interlinear/john/3-16.htm', target: '_blank', rel: 'noopener' }, [icon('book'), 'See John 3:16 in an interlinear']) : null,
        t.shop ? h('a', { class: 'btn btn-glass', href: t.shop, target: '_blank', rel: 'noopener' }, [icon('bag'), 'Shop ' + t.abbr + ' Bibles']) : null,
        t.gateway ? h('button', { type: 'button', class: 'btn btn-glass', 'aria-pressed': String(picked), onclick: function () { togglePick(t.id); renderCard(t); } },
          [icon(picked ? 'check' : 'plus'), picked ? 'In your comparison' : 'Add to comparison']) : null
      ])
    ].forEach(function (n) { if (n) c.appendChild(n); });
  }
  function fact(k, v) { return h('div', null, [h('dt', { text: k }), h('dd', { text: v })]); }

  // ---------- three approaches ----------
  function buildWays() {
    var box = $('tg-ways'), centres = { word: 12, thought: 52, paraphrase: 92 };
    Object.keys(DATA.approaches).forEach(function (k) {
      var a = DATA.approaches[k], list = DATA.translations.filter(function (t) { return t.approach === k; });
      box.appendChild(h('article', { class: 'tg-way', style: '--c:' + colorAt(centres[k]) }, [
        h('p', { class: 'tg-way-aka', text: a.aka }),
        h('h3', { text: a.label }),
        h('p', { class: 'tg-way-sum', text: a.summary }),
        h('div', { class: 'tg-pc' }, [
          h('ul', { class: 'tg-pros' }, a.pros.map(function (x) { return h('li', { text: x }); })),
          h('ul', { class: 'tg-cons' }, a.cons.map(function (x) { return h('li', { text: x }); }))
        ]),
        h('div', { class: 'tg-way-list' }, list.map(function (t) {
          return h('button', { type: 'button', class: 'tg-tag', style: '--c:' + colorAt(t.pos), onclick: function () { select(t.id); $('tg-spec').scrollIntoView({ behavior: 'smooth', block: 'center' }); } }, [t.abbr]);
        }))
      ]));
    });
  }

  // ---------- John 3:16 ladder ----------
  function buildLadder() {
    var box = $('tg-ladder');
    DATA.samples.forEach(function (s) {
      var t = BY[s.id], pos = t ? t.pos : 2;
      box.appendChild(h('li', { class: 'tg-rung' + (s.gloss ? ' is-greek' : ''), style: '--c:' + colorAt(pos) + ';--pos:' + pos + '%' }, [
        h('div', { class: 'tg-rung-head' }, [
          h('span', { class: 'tg-rung-label', text: s.label }),
          h('span', { class: 'tg-mini', 'aria-hidden': 'true' }, [h('i')])
        ]),
        h('p', { class: 'tg-rung-text', lang: s.gloss ? 'grc' : null, text: s.text }),
        s.gloss ? h('p', { class: 'tg-gloss', text: s.gloss }) : null
      ]));
    });
  }

  // ---------- compare ----------
  function buildCompare() {
    ['Psalm 23', 'John 1:1-14', 'Romans 8:28-39', 'Isaiah 40:28-31', 'Philippians 4:4-13', 'Genesis 1:1-5', '1 Corinthians 13'].forEach(function (r) {
      $('tg-quick').appendChild(h('button', { type: 'button', class: 'tg-qbtn', onclick: function () { $('tg-ref').value = r; } }, [r]));
    });
    renderPicks();
    $('tg-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var ref = $('tg-ref').value.trim() || 'Psalm 23';
      var versions = picks.map(function (id) { return BY[id].gateway; });
      if (!versions.length) versions = ['ESV'];
      window.open(gateway(ref, versions), '_blank', 'noopener');
    });
  }
  function togglePick(id) {
    var i = picks.indexOf(id);
    if (i !== -1) picks.splice(i, 1);
    else if (picks.length < MAX_PICKS) picks.push(id);
    else { picks.shift(); picks.push(id); }
    renderPicks();
  }
  function renderPicks() {
    var box = $('tg-picks');
    box.innerHTML = '';
    DATA.translations.filter(function (t) { return t.gateway; }).forEach(function (t) {
      var on = picks.indexOf(t.id) !== -1;
      box.appendChild(h('button', { type: 'button', class: 'tg-pick' + (on ? ' is-on' : ''), 'aria-pressed': String(on), style: '--c:' + colorAt(t.pos), title: t.name,
        onclick: function () { togglePick(t.id); if (current) renderCard(current); } }, [t.abbr]));
    });
    $('tg-count').textContent = '(' + picks.length + ' of ' + MAX_PICKS + ')';
  }

  // ---------- guide ----------
  function buildGuide() {
    DATA.guide.forEach(function (g) {
      $('tg-guide').appendChild(h('article', { class: 'tg-g' }, [
        h('h3', { text: g.title }),
        h('p', { text: g.text }),
        h('div', { class: 'tg-way-list' }, g.ids.map(function (id) {
          var t = BY[id];
          return h('button', { type: 'button', class: 'tg-tag', style: '--c:' + colorAt(t.pos), onclick: function () { select(id); $('tg-spec').scrollIntoView({ behavior: 'smooth', block: 'center' }); } }, [t.abbr]);
        }))
      ]));
    });
  }

  function init(data) {
    DATA = data;
    DATA.translations.forEach(function (t) { BY[t.id] = t; });
    buildPins();
    buildWays();
    buildLadder();
    buildCompare();
    buildGuide();
    var start = location.hash.slice(1).toLowerCase();
    select(BY[start] ? start : 'niv', false);
  }

  fetch('data/translations/translations.json').then(function (r) { return r.json(); }).then(init).catch(function (err) {
    $('tg-card').textContent = 'Sorry, the translation guide could not be loaded.';
    console.error(err);
  });

  var top = document.querySelector('.top');
  window.addEventListener('scroll', function () { top.classList.toggle('is-scrolled', window.scrollY > 8); }, { passive: true });
})();
