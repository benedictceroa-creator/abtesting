/* Asha Books – Bible Study Resources hub: verse of the day, era rail, scroll effects */
(function () {
  'use strict';
  document.documentElement.classList.add('js');

  // ---------- verse of the day ----------
  // ESV text. `link` points at the matching entry on a timeline page, where there is one.
  var VERSES = [
    { ref: 'Genesis 12:2', text: 'And I will make of you a great nation, and I will bless you and make your name great, so that you will be a blessing.', link: 'patriarchs.html#event:e-call' },
    { ref: 'Psalm 119:105', text: 'Your word is a lamp to my feet and a light to my path.' },
    { ref: 'Joshua 1:9', text: 'Have I not commanded you? Be strong and courageous. Do not be frightened, and do not be dismayed, for the LORD your God is with you wherever you go.', link: 'exodus.html#event:e-jordan' },
    { ref: 'Genesis 15:6', text: 'And he believed the LORD, and he counted it to him as righteousness.', link: 'patriarchs.html#event:e-covenant' },
    { ref: 'Proverbs 3:5-6', text: 'Trust in the LORD with all your heart, and do not lean on your own understanding. In all your ways acknowledge him, and he will make straight your paths.' },
    { ref: 'Exodus 14:14', text: 'The LORD will fight for you, and you have only to be silent.', link: 'exodus.html#event:e-red-sea' },
    { ref: 'Ruth 1:16', text: 'Where you go I will go, and where you lodge I will lodge. Your people shall be my people, and your God my God.', link: 'judges.html#event:e-ruth' },
    { ref: 'Psalm 46:1', text: 'God is our refuge and strength, a very present help in trouble.' },
    { ref: 'Genesis 50:20', text: 'As for you, you meant evil against me, but God meant it for good, to bring it about that many people should be kept alive, as they are today.', link: 'patriarchs.html#event:e-reveal' },
    { ref: 'Lamentations 3:22-23', text: 'The steadfast love of the LORD never ceases; his mercies never come to an end; they are new every morning; great is your faithfulness.', link: 'kings.html#prophet:jeremiah' },
    { ref: 'Hebrews 11:8', text: 'By faith Abraham obeyed when he was called to go out to a place that he was to receive as an inheritance. And he went out, not knowing where he was going.', link: 'patriarchs.html#event:e-call' },
    { ref: 'Isaiah 40:8', text: 'The grass withers, the flower fades, but the word of our God will stand forever.', link: 'kings.html#prophet:isaiah' },
    { ref: 'Deuteronomy 31:8', text: 'It is the LORD who goes before you. He will be with you; he will not leave you or forsake you. Do not fear or be dismayed.', link: 'exodus.html#leader:moses' },
    { ref: '1 Samuel 16:7', text: 'For the LORD sees not as man sees: man looks on the outward appearance, but the LORD looks on the heart.', link: 'judges.html#event:e-david-anointed' },
    { ref: 'Psalm 23:1', text: 'The LORD is my shepherd; I shall not want.' },
    { ref: 'Exodus 3:14', text: 'God said to Moses, “I AM WHO I AM.”', link: 'patriarchs.html#event:e-bush' },
    { ref: 'Micah 6:8', text: 'He has told you, O man, what is good; and what does the LORD require of you but to do justice, and to love kindness, and to walk humbly with your God?', link: 'kings.html#prophet:micah' },
    { ref: 'Joshua 24:15', text: 'But as for me and my house, we will serve the LORD.', link: 'exodus.html#event:e-joshua-farewell' },
    { ref: '2 Timothy 3:16-17', text: 'All Scripture is breathed out by God and profitable for teaching, for reproof, for correction, and for training in righteousness, that the man of God may be complete, equipped for every good work.', link: 'jesus-and-paul.html#event:w-2-timothy' },
    { ref: 'Numbers 6:24-26', text: 'The LORD bless you and keep you; the LORD make his face to shine upon you and be gracious to you; the LORD lift up his countenance upon you and give you peace.', link: 'exodus.html#leader:aaron' },
    { ref: 'Jeremiah 29:11', text: 'For I know the plans I have for you, declares the LORD, plans for welfare and not for evil, to give you a future and a hope.', link: 'kings.html#prophet:jeremiah' },
    { ref: '2 Chronicles 7:14', text: 'If my people who are called by my name humble themselves, and pray and seek my face and turn from their wicked ways, then I will hear from heaven and will forgive their sin and heal their land.', link: 'judges.html#event:e-dedication' },
    { ref: 'Romans 15:4', text: 'For whatever was written in former days was written for our instruction, that through endurance and through the encouragement of the Scriptures we might have hope.', link: 'jesus-and-paul.html#event:w-romans' },
    { ref: 'Nehemiah 8:10', text: 'Do not be grieved, for the joy of the LORD is your strength.', link: 'kings.html#event:e-law-read' }
  ];

  var now = new Date();
  var day = Math.floor((Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) - Date.UTC(now.getFullYear(), 0, 0)) / 864e5);
  var v = VERSES[day % VERSES.length];
  var $ = function (id) { return document.getElementById(id); };
  // On a Telugu page (assets/i18n/te.js loaded) the verse is shown in the BSI Telugu text from te.js
  var L = window.BS_LANG;
  var t = function (s) { return (L && L.ui[s]) || s; };

  if (L) {
    $('votd-text').textContent = L.verses[v.ref] || L.refText(v.ref);
    if (L.verses[v.ref]) $('votd-ref').textContent = L.refText(v.ref);
    $('votd-date').textContent = '· ' + now.toLocaleDateString('te-IN', { day: 'numeric', month: 'long' });
    $('votd-read').href = L.bibleUrl(v.ref);
  } else {
    $('votd-text').textContent = v.text;
    $('votd-ref').textContent = v.ref;
    $('votd-date').textContent = '· ' + now.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' });
    // "Read in context" opens the whole chapter
    var chapter = v.ref.replace(/:.*$/, '');
    $('votd-read').href = 'https://www.biblegateway.com/passage/?search=' + encodeURIComponent(chapter) + '&version=ESV';
  }
  // Telugu pages sit in te/: link to the Telugu timeline where there is one, else the English page
  var link = v.link && L ? (L.pages.indexOf(v.link.split('#')[0]) !== -1 ? v.link : '../' + v.link) : v.link;
  if (link) { $('votd-map').href = link; $('votd-map').hidden = false; }

  $('votd-share').addEventListener('click', function () {
    var btn = this, label = btn.querySelector('span');
    var text = L ? (L.verses[v.ref] ? '“' + L.verses[v.ref] + '” — ' : '') + L.refText(v.ref) : '“' + v.text + '” — ' + v.ref + ' (ESV)';
    var url = location.href.split('#')[0];
    if (navigator.share) {
      navigator.share({ title: t('Verse of the day'), text: text, url: url }).catch(function () {});
      return;
    }
    var done = function () { label.textContent = t('Copied'); setTimeout(function () { label.textContent = t('Share'); }, 1800); };
    if (navigator.clipboard) navigator.clipboard.writeText(text + '\n' + url).then(done, function () {});
  });

  // ---------- era rail arrows ----------
  var rail = $('rail');
  var arrows = document.querySelectorAll('[data-scroll]');
  function step() {
    var card = rail.querySelector('.era');
    return card ? card.getBoundingClientRect().width + 18 : 300;
  }
  arrows.forEach(function (b) {
    b.addEventListener('click', function () { rail.scrollBy({ left: +b.dataset.scroll * step(), behavior: 'smooth' }); });
  });
  function updateArrows() {
    var max = rail.scrollWidth - rail.clientWidth - 2;
    arrows[0].disabled = rail.scrollLeft <= 2;
    arrows[1].disabled = rail.scrollLeft >= max;
  }
  rail.addEventListener('scroll', updateArrows, { passive: true });
  window.addEventListener('resize', updateArrows);
  updateArrows();

  // ---------- header border once scrolled ----------
  var top = document.querySelector('.top');
  window.addEventListener('scroll', function () { top.classList.toggle('is-scrolled', window.scrollY > 8); }, { passive: true });

  // ---------- reveal on scroll ----------
  var items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  items.forEach(function (el, i) {
    el.style.transitionDelay = (i % 4) * 70 + 'ms';
    io.observe(el);
  });
})();
