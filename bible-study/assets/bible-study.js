/* Asha Books – Bible Timeline & Atlas
 *
 * Mount point:
 *   <div data-bible-study
 *        data-timeline="data/timeline.json"
 *        data-places="data/places.json"
 *        data-territories="data/territories.json"
 *        data-bible-version="ESV"
 *        data-shop-url="https://ashabooks.com"></div>
 *
 * Requires Leaflet 1.9.x to be loaded first.
 *
 * Other languages: load assets/i18n/<lang>.js first (screen text, book names,
 * Bible links) and add data-translation="data/<lang>/<page>.json" (the page's
 * translated words, made with scripts/telugu-overlay.py).
 */
(function () {
  'use strict';

  var root = document.querySelector('[data-bible-study]');
  if (!root) return;

  // Screen text in the page's language; English when no translation is loaded
  var LANG = window.BS_LANG || {};
  function t(s, vars) {
    var out = (LANG.ui && LANG.ui[s]) || s;
    if (vars) Object.keys(vars).forEach(function (k) { out = out.split('{' + k + '}').join(vars[k]); });
    return out;
  }

  var cfg = {
    translationUrl: root.dataset.translation || '',
    timelineUrl: root.dataset.timeline || 'data/timeline.json',
    placesUrl: root.dataset.places || 'data/places.json',
    territoriesUrl: root.dataset.territories || 'data/territories.json',
    version: root.dataset.bibleVersion || 'ESV',
    shopUrl: root.dataset.shopUrl || '',
    shopLabel: root.dataset.shopLabel || t('Go deeper: study Bibles and Bible atlases at Asha Books')
  };

  var LANES = [
    { key: 'empires', label: t('Empires') },
    { key: 'rulers', label: t('Rulers of the nations') },
    { key: 'israel', label: t('Kings of Israel (north)') },
    { key: 'judah', label: t('Kings of Judah (south)') },
    { key: 'leaders', label: t('Leaders after the exile') },
    { key: 'prophets', label: t('Prophets') },
    { key: 'events', label: t('Key events') }
  ];
  var LABEL_H = 22, ROW_H = 24, LANE_PAD = 6, PAD_X = 24, MIN_BAR = 6;

  var VERDICTS = {
    right: t('Did what was right in the eyes of the LORD'),
    mixed: t('Did some things right in the eyes of the LORD, but not wholeheartedly'),
    evil: t('Did evil in the eyes of the LORD'),
    none: t('Scripture gives no formal verdict on this reign')
  };

  var T, TERR, PLACES = {}, ITEMS = [], BY_KEY = {};
  var scale = 3, range;
  var els = {}, map, markers = {}, overlay, terrLayer;
  var selected = null;
  var snapIdx = 0, showTerr = true;

  // ---------- helpers ----------
  function h(tag, attrs, children) {
    var el = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'class') el.className = attrs[k];
      else if (k === 'text') el.textContent = attrs[k];
      else if (k === 'html') el.innerHTML = attrs[k];
      else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] != null) el.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return el;
  }
  // Years may be fractional, counted from the Passover month (about April):
  // -1446 is spring 1446 BC, so the calendar year runs from a quarter-year earlier
  function bc(y) { return Math.ceil(-y - 0.25 - 1e-9); }
  // There is no year 0: the instant 0 is where 1 BC ends and AD 1 begins
  function yr(y) { return y < 0 ? t('{y} BC', { y: bc(y) }) : t('AD {y}', { y: Math.max(1, Math.floor(y)) }); }
  function span(a, b, approx) {
    var c = approx ? t('c. ') : '';
    if (a < 0 && b < 0) return c + t('{y} BC', { y: bc(a) === bc(b) ? bc(a) : bc(a) + '–' + bc(b) });
    return c + (yr(a) === yr(b) ? yr(a) : yr(a) + '–' + yr(b));
  }
  // References stay in English in the data; a translation shows and links them in its own Bible
  function bibleUrl(ref) {
    if (LANG.bibleUrl) return LANG.bibleUrl(ref);
    return 'https://www.biblegateway.com/passage/?search=' + encodeURIComponent(ref) + '&version=' + encodeURIComponent(cfg.version);
  }
  function refText(ref) { return LANG.refText ? LANG.refText(ref) : ref; }
  function confClass(c) { return c >= 800 ? 'high' : c >= 500 ? 'mid' : 'low'; }
  function confLabel(c) { return c >= 800 ? t('High') : c >= 500 ? t('Moderate') : t('Low'); }

  var measureCtx;
  function textW(s) {
    if (!measureCtx) {
      measureCtx = document.createElement('canvas').getContext('2d');
      measureCtx.font = '600 12px ' + getComputedStyle(root).fontFamily;
    }
    return Math.ceil(measureCtx.measureText(s).width);
  }

  // ---------- data → timeline items ----------
  function buildItems() {
    if (T.meta.lanes) {
      // Generic page: each lane's items come from the array with the lane's key
      T.meta.lanes.forEach(function (lane) {
        (T[lane.key] || []).forEach(function (d) {
          var s = d.start != null ? d.start : d.year, e = d.end != null ? d.end : d.year;
          add({ type: lane.type, lane: lane.key, id: d.id, label: d.name || d.title, start: Math.max(s, range[0]), end: Math.min(e, range[1]),
            coStart: d.coStart, color: lane.color, data: d, places: d.places || [] });
        });
      });
      return;
    }
    T.empires.forEach(function (e) {
      add({ type: 'empire', lane: 'empires', id: e.id, label: e.name, start: Math.max(e.start, range[0]), end: Math.min(e.end, range[1]), data: e, places: [] });
    });
    T.rulers.forEach(function (r) {
      add({ type: 'ruler', lane: 'rulers', id: r.id, label: r.name, start: r.start, end: r.end, data: r, places: r.places });
    });
    T.kings.forEach(function (k) {
      add({ type: 'king', lane: k.kingdom, id: k.id, label: k.name.replace(' (queen)', ''), start: k.start, end: k.end, coStart: k.coStart, data: k, places: k.places });
    });
    (T.leaders || []).forEach(function (l) {
      add({ type: 'leader', lane: 'leaders', id: l.id, label: l.name, start: l.start, end: l.end, data: l, places: l.places });
    });
    T.prophets.forEach(function (p) {
      add({ type: 'prophet', lane: 'prophets', id: p.id, label: p.name, start: p.start, end: p.end, data: p, places: p.places });
    });
    T.events.forEach(function (e) {
      add({ type: 'event', lane: 'events', id: e.id, label: e.title, start: e.year, end: e.year, data: e, places: e.places });
    });
    function add(it) { it.key = it.type + ':' + it.id; ITEMS.push(it); BY_KEY[it.key] = it; }
  }

  // ---------- timeline ----------
  function x(year) { return PAD_X + (year - range[0]) * scale; }

  function renderTimeline() {
    var canvas = els.canvas;
    canvas.innerHTML = '';
    var width = x(range[1]) + PAD_X + 160;
    canvas.style.width = width + 'px';

    var axis = h('div', { class: 'bs-axis' });
    var ticks = axisTicks();
    ticks.forEach(function (t) { axis.appendChild(h('div', { class: 'bs-tick', style: 'left:' + x(t.y) + 'px', text: t.label })); });
    canvas.appendChild(axis);
    ticks.forEach(function (t) { canvas.appendChild(h('div', { class: 'bs-gridline', style: 'left:' + x(t.y) + 'px' })); });

    LANES.forEach(function (lane) {
      var laneEl = h('div', { class: 'bs-lane' }, [h('span', { class: 'bs-lane-label', text: lane.label })]);
      var rows = [];
      ITEMS.filter(function (it) { return it.lane === lane.key; })
        .sort(function (a, b) { return (a.coStart || a.start) - (b.coStart || b.start); })
        .forEach(function (it) {
          var el = renderItem(it);
          var row = 0;
          while (rows[row] != null && rows[row] > it._x0 - 4) row++;
          rows[row] = it._x1;
          el.style.top = (LABEL_H + row * ROW_H) + 'px';
          laneEl.appendChild(el);
        });
      laneEl.style.height = (LABEL_H + Math.max(1, rows.length) * ROW_H + LANE_PAD) + 'px';
      canvas.appendChild(laneEl);
    });

    els.now = h('button', { type: 'button', class: 'bs-now', title: t('Year shown on the kingdoms map'), onclick: function () { select('map:' + TERR.snapshots[snapIdx].id); } },
      [h('span', { class: 'bs-now-flag' })]);
    canvas.appendChild(els.now);
    updateNowMarker();
    applySelectionClasses();
  }

  // Year ticks at least ~70px apart; when zoomed far in, ticks for months
  // (the Bible's months, counted from the Passover month in spring)
  function axisTicks() {
    var ticks = [], y;
    if (scale >= 150) {
      var mstep = [1, 2, 3, 6].filter(function (m) { return m * scale / 12 >= 64; })[0] || 6;
      for (y = Math.floor(range[0]); y <= range[1]; y++) {
        for (var m = 0; m < 12; m += mstep) {
          var t = y + m / 12;
          if (t >= range[0] && t <= range[1]) ticks.push({ y: t, label: m === 0 ? yr(t) : T.meta.monthNames ? T.meta.monthNames[m] : 'month ' + (m + 1) });
        }
      }
      return ticks;
    }
    var step = [1, 5, 10, 25, 50, 100].filter(function (s) { return s * scale >= 70; })[0] || 100;
    for (y = Math.ceil(range[0] / step) * step; y <= range[1]; y += step) ticks.push({ y: y, label: yr(y) });
    return ticks;
  }

  function updateNowMarker() {
    if (!els.now || !TERR) return;
    var s = TERR.snapshots[snapIdx];
    els.now.hidden = !showTerr;
    els.now.style.left = x(s.year) + 'px';
    els.now.firstChild.textContent = t('Map: {y}', { y: yr(s.year) });
  }

  function renderItem(it) {
    var lw = textW(it.label);
    var cls = 'bs-item bs-k-' + (it.type === 'king' ? it.lane : it.type);
    if (it.data.certainty === 'approx' || it.data.certainty === 'disputed') cls += ' is-approx';
    if (it.type === 'king') cls += ' bs-v-' + (it.data.verdict || 'none');
    var aria = it.label + ', ' + kindLabel(it) + ', ' + dateLine(it);
    var el;

    if (it.type === 'event') {
      var left = x(it.start);
      cls += ' c-' + it.data.certainty;
      el = h('button', { type: 'button', class: cls, style: 'left:' + left + 'px', 'aria-label': aria, title: it.label + ' (' + dateLine(it) + ')' },
        [h('span', { class: 'bs-lbl', text: it.label })]);
      it._x0 = left - 6;
      it._x1 = left + 16 + lw + 10;
    } else {
      var start = it.coStart || it.start;
      var left0 = x(start);
      var w = Math.max(MIN_BAR, x(it.end) - left0);
      var coW = it.coStart ? x(it.start) - left0 : 0;
      var narrow = w < lw + 14;
      if (narrow) cls += ' is-narrow';
      el = h('button', { type: 'button', class: cls, style: 'left:' + left0 + 'px;width:' + w + 'px', 'aria-label': aria, title: it.label + ' (' + dateLine(it) + ')' }, [
        coW ? h('span', { class: 'bs-co', style: 'width:' + coW + 'px' + (it.color ? ';background-color:' + it.color : '') }) : null,
        h('span', { class: 'bs-bar', style: [it.type === 'empire' ? 'background:' + it.data.color : it.color ? 'background:' + it.color : '', coW ? 'left:' + coW + 'px' : ''].filter(Boolean).join(';') || null }),
        h('span', { class: 'bs-lbl', style: narrow ? 'position:absolute;left:' + (w + 4) + 'px;top:0' : null, text: it.label })
      ]);
      it._x0 = left0;
      it._x1 = narrow ? left0 + w + lw + 12 : left0 + w;
    }
    el.addEventListener('click', function () { select(it.key); });
    it.el = el;
    return el;
  }

  function zoom(factor) {
    var tl = els.tl;
    var centerYear = range[0] + (tl.scrollLeft + tl.clientWidth / 2 - PAD_X) / scale;
    var fit = fitScale();
    scale = factor ? Math.min(maxScale(), Math.max(fit, scale * factor)) : fit;
    renderTimeline();
    tl.scrollLeft = x(centerYear) - tl.clientWidth / 2;
    markPhase(null);
  }
  function fitScale(r) {
    r = r || range;
    return Math.max(0.6, (els.tl.clientWidth - PAD_X * 2 - 120) / (r[1] - r[0]));
  }
  // Allow zooming in a little further than the narrowest phase
  function maxScale() {
    var m = 24;
    (T.meta.phases || []).forEach(function (p) { m = Math.max(m, fitScale(p.range) * 1.6); });
    return m;
  }
  function showPhase(p) {
    scale = fitScale(p.range);
    renderTimeline();
    els.tl.scrollLeft = x(p.range[0]) - PAD_X;
    markPhase(p);
  }
  function markPhase(p) {
    (els.phaseBtns || []).forEach(function (b) { b.classList.toggle('is-active', b._phase === p); });
  }

  function scrollToItem(it) {
    if (!it || !it.el) return;
    var tl = els.tl, left = it._x0;
    if (left < tl.scrollLeft + 40 || left > tl.scrollLeft + tl.clientWidth - 120) {
      tl.scrollTo({ left: Math.max(0, left - tl.clientWidth / 3), behavior: 'smooth' });
    }
  }

  // ---------- map ----------
  // Default map views; a page's territories.json can override them in meta.views
  var CORE = [[29.6, 33.9], [34.0, 37.4]], CORE_LABEL = t('Israel & Judah');
  var REGION = [[24.5, 29.5], [38.5, 49.0]], REGION_LABEL = t('Whole region');

  function initMap() {
    map = L.map(els.map, { scrollWheelZoom: false, zoomSnap: 0.5, maxZoom: 11, minZoom: 3 });
    var cawm = L.tileLayer('https://cawm.lib.uiowa.edu/tiles/{z}/{x}/{y}.png', {
      maxZoom: 11,
      attribution: 'Base map &copy; <a href="https://cawm.lib.uiowa.edu/" target="_blank" rel="noopener">Consortium of Ancient World Mappers</a> &middot; Places: <a href="https://www.openbible.info/geo/" target="_blank" rel="noopener">OpenBible.info</a>'
    }).addTo(map);
    var errors = 0;
    cawm.on('tileerror', function () {
      if (++errors !== 6) return;
      map.removeLayer(cawm);
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 11, maxNativeZoom: 13,
        attribution: 'Tiles &copy; Esri &middot; Places: <a href="https://www.openbible.info/geo/" target="_blank" rel="noopener">OpenBible.info</a>'
      }).addTo(map);
    });
    map.fitBounds(CORE);
    // Territories sit above the tiles but below place markers (overlayPane is 400)
    map.createPane('territories').style.zIndex = 350;
    map.createPane('routes').style.zIndex = 380;
    terrLayer = L.layerGroup().addTo(map);
    map.on('zoomend', zoomClasses);
    zoomClasses();
    overlay = L.layerGroup().addTo(map);

    Object.keys(PLACES).forEach(function (id) {
      var p = PLACES[id];
      var m = L.circleMarker([p.lat, p.lon], baseStyle(p)).addTo(map);
      m.bindTooltip(p.name, { direction: 'right', offset: [8, 0], className: 'bs-maplabel' });
      m.on('click', function () { select('place:' + id); });
      markers[id] = m;
    });
  }

  function baseStyle(p, dim) {
    var c = confClass(p.confidence);
    return {
      radius: 6, weight: c === 'low' ? 2 : 1.5, color: '#C82035',
      fillColor: c === 'high' ? '#C82035' : c === 'mid' ? '#E88D9A' : '#ffffff',
      fillOpacity: dim ? 0.25 : 0.95, opacity: dim ? 0.3 : 1,
      dashArray: c === 'low' ? '3 3' : null
    };
  }

  function highlightPlaces(ids, opts) {
    overlay.clearLayers();
    var set = {};
    ids.forEach(function (id) { set[id] = true; });
    Object.keys(markers).forEach(function (id) {
      var m = markers[id], p = PLACES[id], on = set[id];
      m.setStyle(ids.length ? (on ? Object.assign(baseStyle(p), { radius: 9, weight: 3, fillOpacity: 1 }) : baseStyle(p, true)) : baseStyle(p));
      m.unbindTooltip();
      m.bindTooltip(p.name, { direction: 'right', offset: [on ? 10 : 8, 0], className: 'bs-maplabel', permanent: !!on });
      if (on) m.bringToFront();
    });
    if (opts && opts.alternatives) {
      var p = PLACES[ids[0]];
      p.alternatives.forEach(function (a) {
        L.polyline([[p.lat, p.lon], [a.lat, a.lon]], { color: '#777', weight: 1.5, dashArray: '4 4' }).addTo(overlay);
        L.circleMarker([a.lat, a.lon], { radius: 5, color: '#555', weight: 1.5, fillColor: '#fff', fillOpacity: 1 })
          .bindTooltip(t('Alternative: {site} ({pct}%)', { site: a.site, pct: Math.round(a.confidence / 10) }), { className: 'bs-maplabel' })
          .addTo(overlay);
      });
    }
    if (!ids.length) return;
    var pts = ids.map(function (id) { return [PLACES[id].lat, PLACES[id].lon]; });
    if (opts && opts.alternatives) PLACES[ids[0]].alternatives.forEach(function (a) { pts.push([a.lat, a.lon]); });
    if (pts.length === 1) map.flyTo(pts[0], Math.max(map.getZoom(), 8), { duration: 0.6 });
    else map.flyToBounds(L.latLngBounds(pts).pad(0.15), { maxZoom: 9, duration: 0.6 });
  }

  // ---------- kingdoms (territory snapshots) ----------
  var STATUS_STYLE = {
    empire: { fillOpacity: 0.10, weight: 1, opacity: 0.45 },
    kingdom: { fillOpacity: 0.30, weight: 1.5, opacity: 0.85 },
    subject: { fillOpacity: 0.16, weight: 1.5, opacity: 0.85, dashArray: '6 4' },
    province: { fillOpacity: 0.22, weight: 1.2, opacity: 0.75, dashArray: '2 4' }
  };

  function zoomClasses() {
    var z = map.getZoom();
    els.map.classList.toggle('bs-far', z < 6.5);
    els.map.classList.toggle('bs-near', z >= 7);
  }

  function renderTerritories() {
    terrLayer.clearLayers();
    updateNowMarker();
    renderSnapBar();
    if (!showTerr) return;
    var s = TERR.snapshots[snapIdx];
    // empires first so the smaller kingdoms draw on top of them
    var regions = s.regions.slice().sort(function (a, b) { return (a.status === 'empire' ? 0 : 1) - (b.status === 'empire' ? 0 : 1); });
    regions.forEach(function (r) {
      var color = TERR.colors[r.color];
      var rings = r.shapes.map(function (k) { return TERR.shapes[k]; });
      L.polygon(rings, Object.assign({ pane: 'territories', color: color, fillColor: color, interactive: true }, STATUS_STYLE[r.status]))
        .bindTooltip(r.name + ' · ' + TERR.statuses[r.status], { sticky: true, className: 'bs-maplabel' })
        .on('click', function () { select('map:' + s.id); })
        .addTo(terrLayer);
      if (r.label) {
        L.tooltip({ permanent: true, direction: 'center', interactive: false, pane: 'territories',
          className: 'bs-terr-label ' + (r.status === 'empire' ? 'is-empire' : 'is-local') })
          .setLatLng(r.label).setContent(r.name.split(' (')[0]).addTo(terrLayer);
      }
    });
    (s.routes || []).forEach(function (ref) {
      var route = TERR.routes[ref.route], st = TERR.routeStyles[ref.style];
      var pts = route.via.map(function (v) { return typeof v === 'string' ? [PLACES[v].lat, PLACES[v].lon] : v; });
      L.polyline(pts, { pane: 'routes', color: st.color, weight: st.weight, dashArray: st.dashArray || null, opacity: 0.9, lineJoin: 'round' })
        .bindTooltip(route.name + ' · ' + st.label, { sticky: true, className: 'bs-maplabel' })
        .addTo(terrLayer);
      // a small dot marks where this stage of the journey ends
      if (ref.style !== 'past') {
        L.circleMarker(pts[pts.length - 1], { pane: 'routes', radius: 4, color: st.color, fillColor: st.color, fillOpacity: 1, weight: 1, interactive: false }).addTo(terrLayer);
      }
    });
  }

  function flyToSnapshot() {
    var v = TERR.snapshots[snapIdx].view;
    if (v && showTerr) map.flyToBounds(v, { duration: 0.6 });
  }

  function setSnapshot(i) {
    snapIdx = Math.max(0, Math.min(TERR.snapshots.length - 1, i));
    renderTerritories();
  }

  // The snapshot closest to the middle of an item's dates
  // or, where a page sets snapRule "latest", the last map at or before that date
  function nearestSnapshot(it) {
    var mid = ((it.coStart || it.start) + it.end) / 2, best = 0;
    TERR.snapshots.forEach(function (s, i) {
      if (TERR.meta.snapRule === 'latest') { if (s.year <= mid + 1e-6) best = i; }
      else if (Math.abs(s.year - mid) < Math.abs(TERR.snapshots[best].year - mid)) best = i;
    });
    return best;
  }

  function renderSnapBar() {
    var s = TERR.snapshots[snapIdx];
    els.snapRange.value = snapIdx;
    els.snapRange.disabled = !showTerr;
    els.snapPrev.disabled = !showTerr || snapIdx === 0;
    els.snapNext.disabled = !showTerr || snapIdx === TERR.snapshots.length - 1;
    els.snapTitle.textContent = yr(s.year) + ': ' + s.title;
    els.snapBar.classList.toggle('is-off', !showTerr);
  }

  // ---------- selection ----------
  function select(key, opts) {
    selected = key;
    var parts = key.split(':'), type = parts[0], id = parts[1];
    try { history.replaceState(null, '', '#' + key); } catch (e) { /* sandboxed */ }

    if (type === 'place') {
      var p = PLACES[id];
      if (!p) return;
      renderPlace(p);
      highlightPlaces([id], { alternatives: true });
    } else if (type === 'map') {
      var si = TERR.snapshots.map(function (s) { return s.id; }).indexOf(id);
      if (si === -1) return;
      if (!showTerr) toggleTerritories(true);
      if (si !== snapIdx) setSnapshot(si);
      flyToSnapshot();
      renderSnapshot(TERR.snapshots[si]);
      highlightPlaces([]);
    } else {
      var it = BY_KEY[key];
      if (!it) return;
      if (showTerr && it.type !== 'empire') {
        var ni = nearestSnapshot(it);
        if (ni !== snapIdx) setSnapshot(ni);
      }
      renderDetail(it);
      var ids = it.places.slice();
      if (it.type === 'empire') {
        T.rulers.filter(function (r) { return r.empire === id; }).forEach(function (r) { ids = ids.concat(r.places); });
        ids = ids.filter(function (v, i) { return ids.indexOf(v) === i; });
      }
      highlightPlaces(ids);
      if (!opts || opts.scroll !== false) scrollToItem(it);
    }
    applySelectionClasses();
    if (opts && opts.reveal) els.detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function clearSelection() {
    selected = null;
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { /* sandboxed */ }
    renderIntro();
    highlightPlaces([]);
    map.flyToBounds(CORE, { duration: 0.6 });
    applySelectionClasses();
  }

  function applySelectionClasses() {
    var placeId = selected && selected.indexOf('place:') === 0 ? selected.slice(6) : null;
    els.app.classList.toggle('has-focus', !!placeId);
    ITEMS.forEach(function (it) {
      if (!it.el) return;
      it.el.classList.toggle('is-selected', it.key === selected);
      it.el.classList.toggle('is-related', !!placeId && it.places.indexOf(placeId) !== -1);
    });
  }

  // ---------- detail panel ----------
  function kindLabel(it) {
    if (it.type === 'king') return t((it.id === 'athaliah' ? 'Queen of ' : 'King of ') + (it.lane === 'israel' ? 'Israel' : 'Judah'));
    if (it.data.role) return it.data.role;
    var lane = LANES.filter(function (l) { return l.key === it.lane; })[0];
    if (lane && lane.kind) return lane.kind;
    return t({ prophet: 'Prophet', leader: 'After the exile', event: 'Event', ruler: 'Foreign ruler', empire: 'Empire' }[it.type]);
  }
  function dateLine(it) {
    var d = it.data, approx = d.certainty === 'approx';
    if (it.type === 'event') return span(it.start, it.end, approx) + (d.date ? ' · ' + d.date : '');
    if (it.type === 'prophet') return t('Ministry {dates}', { dates: span(it.start, it.end, approx) });
    if (it.type === 'leader' || it.type === 'stage') {
      return span(d.start != null ? d.start : it.start, d.end, approx) + (it.coStart ? ' (' + (T.meta.coPhrase || t('co-regent from')) + ' ' + yr(it.coStart) + ')' : '');
    }
    if (it.type === 'empire') return span(d.start, d.end, true);
    var s = (d.datePrefix || t('Reigned')) + ' ' + span(it.start, it.end, approx);
    if (it.coStart) s += ' (' + t('co-regent from') + ' ' + yr(it.coStart) + ')';
    return s;
  }
  function badge(c) {
    if (!c) return null;
    var name = t({ fixed: 'Fixed', calculated: 'Calculated', approx: 'Approximate', disputed: 'Disputed' }[c]);
    return h('span', { class: 'bs-badge ' + c, title: T.certainty[c], tabindex: '0', text: name });
  }
  function refList(refs) {
    if (!refs || !refs.length) return null;
    return h('ul', { class: 'bs-refs' }, refs.map(function (r) {
      return h('li', null, [h('a', { href: bibleUrl(r), target: '_blank', rel: 'noopener', text: refText(r) })]);
    }));
  }
  function placeChips(ids) {
    if (!ids || !ids.length) return null;
    return h('div', { class: 'bs-chips' }, ids.map(function (id) {
      var p = PLACES[id];
      return h('button', { type: 'button', class: 'bs-chip', onclick: function () { select('place:' + id); } },
        [h('span', { class: 'bs-dot ' + confClass(p.confidence) }), p.name]);
    }));
  }
  function itemChips(items) {
    return h('div', { class: 'bs-chips' }, items.map(function (it) {
      return h('button', { type: 'button', class: 'bs-chip', onclick: function () { select(it.key); } }, [it.label]);
    }));
  }
  function cta() {
    if (!cfg.shopUrl) return null;
    return h('a', { class: 'bs-cta', href: cfg.shopUrl, text: cfg.shopLabel + ' →' });
  }
  function setDetail(nodes) {
    els.detail.innerHTML = '';
    nodes.forEach(function (n) { if (n) els.detail.appendChild(n); });
    els.detail.scrollTop = 0;
  }

  function renderDetail(it) {
    var d = it.data;
    var kindCls = it.type === 'king' ? it.lane : it.type;
    var nodes = [
      h('div', { class: 'bs-kind ' + kindCls, style: it.color ? 'color:' + it.color : null, text: kindLabel(it) }),
      h('h2', { text: it.type === 'event' ? d.title : d.name }),
      h('p', null, [h('span', { class: 'bs-when', text: dateLine(it) }), badge(d.certainty || (it.type === 'king' ? 'calculated' : null))])
    ];
    if (d.summary) nodes.push(h('p', { text: d.summary }));
    if (d.basis) nodes.push(h('p', { class: 'bs-note', text: t('Dating basis: ') + d.basis }));
    if (it.type === 'king') {
      var v = d.verdict || 'none';
      nodes.push(h('p', { class: 'bs-verdict ' + v }, [
        h('strong', { text: VERDICTS[v] }),
        d.verdictRef ? h('span', null, [' (', h('a', { href: bibleUrl(d.verdictRef), target: '_blank', rel: 'noopener', text: refText(d.verdictRef) }), ')']) : null
      ]));
    }
    if (d.evidence) nodes.push(h('div', { class: 'bs-evidence' }, [h('strong', { text: t('Evidence outside the Bible') }), d.evidence]));
    if (d.note) nodes.push(h('p', { class: 'bs-note', text: d.note }));
    if (d.link) nodes.push(h('p', null, [h('a', { class: 'bs-link', href: d.link.href, text: d.link.label + ' \u2192' })]));
    if (it.type === 'empire') {
      var rulers = ITEMS.filter(function (r) { return r.type === 'ruler' && r.data.empire === it.id; });
      if (rulers.length) nodes.push(h('h3', { text: t('Rulers in this period') }), itemChips(rulers));
    }
    if (d.refs && d.refs.length) nodes.push(h('h3', { text: t('Read the Scripture') }), refList(d.refs));
    if (it.places.length) nodes.push(h('h3', { text: t('Places') }), placeChips(it.places));
    var during = contemporaries(it);
    if (during.length) nodes.push(h('h3', { text: t(it.type === 'event' ? 'Who was alive at the time' : 'Contemporaries') }), itemChips(during));
    if (showTerr) {
      var snap = TERR.snapshots[snapIdx];
      nodes.push(h('p', { class: 'bs-source' }, [(TERR.meta.mapShows || t('Map shows the kingdoms in')) + ' ', h('a', { href: '#map:' + snap.id, onclick: function (e) { e.preventDefault(); select('map:' + snap.id); }, text: yr(snap.year) + ': ' + snap.title }), '.']));
    }
    if (it.type === 'king' || it.type === 'prophet' || (T.meta.lanes && it.type !== 'event')) nodes.push(h('p', { class: 'bs-source', text: t('Dates: ') + T.meta.chronologyShort }));
    nodes.push(cta());
    setDetail(nodes);
  }

  function contemporaries(it) {
    if (it.type === 'empire') return [];
    var a = it.coStart || it.start, b = it.end;
    return ITEMS.filter(function (o) {
      if (o === it || (o.type !== 'king' && o.type !== 'prophet' && o.type !== 'leader')) return false;
      if (it.type === 'king' && o.type === 'king' && o.lane === it.lane) return false;
      var s = o.coStart || o.start;
      return s <= b && o.end >= a;
    }).slice(0, 14);
  }

  function renderPlace(p) {
    var related = ITEMS.filter(function (it) { return it.places.indexOf(p.id) !== -1; })
      .sort(function (a, b) { return a.start - b.start; });
    var pct = Math.round(p.confidence / 10);
    var nodes = [
      h('div', { class: 'bs-kind place', text: t('Place') + (p.types.length ? ' · ' + p.types.filter(function (k) { return k !== 'special'; }).map(function (k) { return t(k); }).join(', ') : '') }),
      h('h2', { text: p.name }),
      h('p', null, [t('Identified with '), h('strong', { text: p.site })]),
      h('div', { class: 'bs-conf', title: pct + '%' }, [h('span', { style: 'width:' + pct + '%' })]),
      h('p', { class: 'bs-note', style: 'border:0;padding:0;margin-top:0', text: t('{level} confidence in this identification ({pct}%)', { level: confLabel(p.confidence), pct: pct }) })
    ];
    if (p.alternatives.length) {
      nodes.push(h('h3', { text: t('Other proposed sites') }),
        h('ul', { class: 'bs-alt' }, p.alternatives.map(function (a) {
          return h('li', { text: a.site + ' (' + Math.round(a.confidence / 10) + '%)' });
        })));
    }
    if (related.length) nodes.push(h('h3', { text: t('On this timeline') }), itemChips(related));
    nodes.push(h('p', { class: 'bs-source' }, [
      t(p.verseCount === 1 ? 'Mentioned in 1 verse. Location data: ' : 'Mentioned in {n} verses. Location data: ', { n: p.verseCount }),
      h('a', { href: p.source, target: '_blank', rel: 'noopener', text: 'OpenBible.info' }), ' (CC BY 4.0).'
    ]));
    nodes.push(cta());
    setDetail(nodes);
  }

  var SWATCH_ALPHA = { kingdom: '55', subject: '29', province: '3a', empire: '1c' };

  function renderSnapshot(s) {
    var seen = {};
    var rows = s.regions.filter(function (r) { var k = r.name; if (seen[k]) return false; seen[k] = true; return true; })
      .map(function (r) {
        var c = TERR.colors[r.color];
        return h('li', null, [
          h('i', { class: 'bs-swatch is-' + r.status, style: 'border-color:' + c + ';background:' + c + SWATCH_ALPHA[r.status] }),
          h('span', null, [h('strong', { text: r.name }), ' · ' + TERR.statuses[r.status]])
        ]);
      });
    var alive = ITEMS.filter(function (it) {
      return (it.type === 'king' || it.type === 'prophet' || it.type === 'leader' || it.type === 'ruler') &&
        (it.coStart || it.start) - 3 <= s.year && it.end + 3 >= s.year;
    });
    setDetail([
      h('div', { class: 'bs-kind event', text: (TERR.meta.mapKind || t('Map · the kingdoms in')) + ' ' + yr(s.year) }),
      h('h2', { text: s.title }),
      h('p', { text: s.summary }),
      s.note ? h('p', { class: 'bs-note', text: s.note }) : null,
      h('h3', { text: t('Read the Scripture') }), refList(s.refs),
      h('h3', { text: t('On this map') }), h('ul', { class: 'bs-regions' }, rows),
      alive.length ? h('h3', { text: t('Who was alive at the time') }) : null,
      alive.length ? itemChips(alive) : null,
      h('p', { class: 'bs-source', text: TERR.meta.note }),
      cta()
    ]);
  }

  function renderIntro() {
    var c = T.certainty;
    setDetail([
      h('div', { class: 'bs-intro' }, [
        h('div', { class: 'bs-kind event', text: t('How to use') }),
        h('h2', { text: T.meta.introTitle || t('Explore the kings, prophets and places') }),
        h('ul', null, [
          h('li', { text: t('Tap anything on the timeline to read about it, see its Scripture passages and show its places on the map.') }),
          T.meta.phases ? h('li', { text: t('Use the buttons above the timeline ({list}) to jump to each part of the story.', { list: T.meta.phases.map(function (p) { return p.label; }).join(', ') }) }) : null,
          h('li', { text: t('Tap a place on the map to see everything on the timeline that happened there.') }),
          h('li', { text: t('Use the slider under the map to watch the kingdoms and empires change over time. Choosing anything on the timeline moves the map to that time.') }),
          h('li', { text: t('Use + and − to zoom the timeline; drag or scroll sideways to move through time.') })
        ]),
        h('h3', { text: t('How sure are the dates?') }),
        T.meta.lanes ? h('p', { text: T.meta.chronology }) : null,
        T.meta.alternative ? h('p', { class: 'bs-note', text: T.meta.alternative }) : null,
        h('p', null, [badge('fixed'), ' ', c.fixed.split(': ')[1]]),
        h('p', null, [badge('calculated'), ' ', c.calculated.split(': ')[1]]),
        h('p', null, [badge('approx'), ' ', c.approx.split(': ')[1]]),
        h('h3', { text: t('How sure are the places?') }),
        h('p', null, [h('span', { class: 'bs-dot high' }), t('High') + '  ', h('span', { class: 'bs-dot mid' }), t('Moderate') + '  ', h('span', { class: 'bs-dot low' }), t('Low confidence in the modern location')]),
        cta()
      ])
    ]);
  }

  // ---------- shell ----------
  function buildShell() {
    root.innerHTML = '';
    els.app = h('div', { class: 'bs-app' });
    els.tl = h('div', { class: 'bs-tl', role: 'region', 'aria-label': t('Timeline'), tabindex: '0' });
    els.canvas = h('div', { class: 'bs-tl-canvas' });
    els.tl.appendChild(els.canvas);
    els.map = h('div', { class: 'bs-map', role: 'region', 'aria-label': t('Map of Bible places') });
    els.detail = h('div', { class: 'bs-detail', 'aria-live': 'polite' });

    var verdictToggle = h('input', { type: 'checkbox' });
    verdictToggle.addEventListener('change', function () { els.app.classList.toggle('show-verdict', verdictToggle.checked); });

    els.app.appendChild(h('div', { class: 'bs-toolbar' }, [
      h('span', { class: 'bs-zoom' }, [
        h('button', { type: 'button', class: 'bs-btn', 'aria-label': t('Zoom out'), onclick: function () { zoom(1 / 1.6); }, text: '−' }),
        h('button', { type: 'button', class: 'bs-btn', 'aria-label': t('Zoom in'), onclick: function () { zoom(1.6); }, text: '+' }),
        h('button', { type: 'button', class: 'bs-btn', onclick: function () { zoom(0); }, text: t('Fit') })
      ]),
      T.kings ? h('label', { class: 'bs-toggle' }, [verdictToggle, t('Colour kings by the Bible\'s verdict')]) : null,
      T.meta.phases ? h('span', { class: 'bs-phases' }, els.phaseBtns = T.meta.phases.map(function (p) {
        var b = h('button', { type: 'button', class: 'bs-btn bs-phase', onclick: function () { showPhase(p); }, text: p.label });
        b._phase = p;
        return b;
      })) : null,
      h('span', { class: 'bs-legend', id: 'bs-legend' })
    ]));
    els.terrToggle = h('input', { type: 'checkbox', checked: 'checked' });
    els.terrToggle.addEventListener('change', function () { toggleTerritories(els.terrToggle.checked); });
    els.snapRange = h('input', { type: 'range', min: '0', max: String(TERR.snapshots.length - 1), step: '1', value: '0', 'aria-label': t('Year shown on the kingdoms map') });
    els.snapRange.addEventListener('input', function () { stepSnapshot(+els.snapRange.value - snapIdx); });
    els.snapPrev = h('button', { type: 'button', class: 'bs-btn', 'aria-label': t('Earlier'), onclick: function () { stepSnapshot(-1); }, text: '◀' });
    els.snapNext = h('button', { type: 'button', class: 'bs-btn', 'aria-label': t('Later'), onclick: function () { stepSnapshot(1); }, text: '▶' });
    els.snapTitle = h('button', { type: 'button', class: 'bs-snap-title', onclick: function () { select('map:' + TERR.snapshots[snapIdx].id); } });
    els.snapBar = h('div', { class: 'bs-snapbar' }, [
      h('div', { class: 'bs-snap-head' }, [
        h('label', { class: 'bs-toggle' }, [els.terrToggle, TERR.meta.toggleLabel || t('Show kingdoms')]),
        els.snapTitle
      ]),
      h('div', { class: 'bs-snap-ctrl' }, [els.snapPrev, els.snapRange, els.snapNext]),
      h('div', { class: 'bs-snap-ticks' }, TERR.snapshots.map(function (s, i) {
        return h('button', { type: 'button', style: 'left:' + (i / (TERR.snapshots.length - 1) * 100) + '%', onclick: function () { stepSnapshot(i - snapIdx); }, text: s.tick || String(bc(s.year)) });
      })),
      h('div', { class: 'bs-snap-key' }, [
        h('span', null, [h('i', { class: 'bs-swatch is-kingdom' }), t('Independent')]),
        h('span', null, [h('i', { class: 'bs-swatch is-subject' }), t('Vassal / under another power')]),
        h('span', null, [h('i', { class: 'bs-swatch is-province' }), t('Province of an empire')]),
        h('span', null, [t('Borders are approximate')])
      ].concat(Object.keys(TERR.routeStyles || {}).map(function (k) {
        var st = TERR.routeStyles[k];
        return h('span', null, [h('i', { class: 'bs-routekey', style: 'border-top:' + Math.max(2, st.weight - 0.5) + 'px ' + (st.dashArray ? 'dashed' : 'solid') + ' ' + st.color }), st.label]);
      })))
    ]);

    els.app.appendChild(els.tl);
    els.app.appendChild(h('div', { class: 'bs-main' }, [
      h('div', { class: 'bs-mapwrap' }, [
        els.map,
        els.snapBar,
        h('div', { class: 'bs-map-actions' }, [
          h('button', { type: 'button', class: 'bs-btn', onclick: function () { map.flyToBounds(CORE, { duration: 0.6 }); }, text: CORE_LABEL }),
          h('button', { type: 'button', class: 'bs-btn', onclick: function () { map.flyToBounds(REGION, { duration: 0.6 }); }, text: REGION_LABEL }),
          h('button', { type: 'button', class: 'bs-btn', onclick: clearSelection, text: t('Clear') })
        ])
      ]),
      els.detail
    ]));
    root.appendChild(els.app);
    els.legend = els.app.querySelector('#bs-legend');
    updateLegend(false);
    verdictToggle.addEventListener('change', function () { updateLegend(verdictToggle.checked); });
  }

  function toggleTerritories(on) {
    showTerr = on;
    els.terrToggle.checked = on;
    renderTerritories();
  }

  // Slider / arrows: if the map description is open, keep it in step
  function stepSnapshot(delta) {
    setSnapshot(snapIdx + delta);
    flyToSnapshot();
    if (selected && selected.indexOf('map:') === 0) select('map:' + TERR.snapshots[snapIdx].id);
  }

  function updateLegend(verdict) {
    var keys = verdict
      ? [['var(--bs-right)', t('Did right')], ['var(--bs-mixed)', t('Mixed')], ['var(--bs-evil)', t('Did evil')], ['var(--bs-none)', t('No verdict')]]
      : T.meta.lanes
        ? T.meta.lanes.filter(function (l) { return l.color; }).map(function (l) { return [l.color, l.label]; })
        : [['var(--bs-israel)', t('Israel')], ['var(--bs-judah)', t('Judah')], ['var(--bs-prophet)', t('Prophets')]];
    els.legend.innerHTML = '';
    keys.forEach(function (k) {
      els.legend.appendChild(h('span', null, [h('i', { style: 'background:' + k[0] }), k[1]]));
    });
    if (ITEMS.some(function (it) { return it.coStart; })) {
      els.legend.appendChild(h('span', null, [h('i', { style: 'background:repeating-linear-gradient(135deg,#aaa 0 3px,#ddd 3px 6px)' }), T.meta.coLabel || t('Co-regency')]));
    }
  }

  function init(timeline, places, territories) {
    T = timeline;
    TERR = territories;
    range = T.meta.range;
    if (T.meta.lanes) LANES = T.meta.lanes;
    var v = TERR.meta.views;
    if (v) { CORE = v.core; CORE_LABEL = v.coreLabel; REGION = v.region; REGION_LABEL = v.regionLabel; }
    places.forEach(function (p) { PLACES[p.id] = p; });
    buildItems();
    buildShell();
    scale = Math.max(fitScale(), 2.5);
    renderTimeline();
    var startPhase = (T.meta.phases || []).filter(function (p) { return p.label === T.meta.defaultPhase; })[0];
    if (startPhase) showPhase(startPhase);
    initMap();
    renderTerritories();

    var hash = decodeURIComponent(location.hash.slice(1));
    var isSnap = hash.indexOf('map:') === 0 && TERR.snapshots.some(function (s) { return 'map:' + s.id === hash; });
    if (hash && (BY_KEY[hash] || isSnap || (hash.indexOf('place:') === 0 && PLACES[hash.slice(6)]))) select(hash);
    else renderIntro();

    var lastW = els.tl.clientWidth;
    window.addEventListener('resize', function () {
      if (Math.abs(els.tl.clientWidth - lastW) < 40) return;
      lastW = els.tl.clientWidth;
      if (scale < fitScale()) zoom(0);
      map.invalidateSize();
    });
  }

  // ---------- translation ----------
  // Lays the translated words over the English data, matched by id, so dates,
  // map shapes and references are only kept once (see scripts/telugu-overlay.py)
  function translate(timeline, places, territories, tr) {
    var tl = tr.timeline || {}, entries = tl.entries || {}, te = tr.territories || {};
    merge(timeline.meta, tl.meta);
    merge(timeline.certainty, tl.certainty);
    Object.keys(timeline).forEach(function (k) {
      if (Array.isArray(timeline[k])) timeline[k].forEach(function (d) { merge(d, entries[d.id]); });
    });
    places.forEach(function (p) { merge(p, (tr.places || {})[p.id]); });
    ['meta', 'statuses', 'routes', 'routeStyles'].forEach(function (k) { merge(territories[k], te[k]); });
    territories.snapshots.forEach(function (s) {
      merge(s, (te.snapshots || {})[s.id]);
      s.regions.forEach(function (r) { r.name = (te.regionNames || {})[r.name] || r.name; });
    });
  }
  // Copies `over` into `base`; arrays of objects are matched item by item, other values replaced
  function merge(base, over) {
    if (!base || !over) return;
    Object.keys(over).forEach(function (k) {
      var o = over[k], b = base[k];
      if (o && b && typeof o === 'object' && typeof b === 'object' && !(Array.isArray(o) && typeof o[0] !== 'object')) merge(b, o);
      else base[k] = o;
    });
  }

  var files = [cfg.timelineUrl, cfg.placesUrl, cfg.territoriesUrl];
  if (cfg.translationUrl) files.push(cfg.translationUrl);
  Promise.all(files.map(function (url) { return fetch(url).then(function (r) { return r.json(); }); }))
    .then(function (res) {
      if (res[3]) translate(res[0], res[1], res[2], res[3]);
      init(res[0], res[1], res[2]);
    })
    .catch(function (err) {
      root.textContent = t('Sorry, the Bible timeline could not be loaded.');
      console.error(err);
    });
})();
