/* Asha Books – Bible Study Resources: Telugu (తెలుగు)
 *
 * Load before assets/bible-study.js or assets/hub/hub.js on a Telugu page.
 * Names and terms follow i18n/te/glossary.tsv (the BSI Telugu Bible); the
 * book names below must match its "ref" rows, which scripts/export-telugu-glossary.py checks.
 * Scripture links open the BSI Telugu Bible (పరిశుద్ధ గ్రంథము O.V., TELUBSI) on YouVersion.
 */
(function () {
  'use strict';

  // English book name in the data -> [Telugu name used in references, YouVersion (USFM) code]
  var BOOKS = {
    'Genesis': ['ఆదికాండము', 'GEN'],
    'Exodus': ['నిర్గమకాండము', 'EXO'],
    'Leviticus': ['లేవీయకాండము', 'LEV'],
    'Numbers': ['సంఖ్యాకాండము', 'NUM'],
    'Deuteronomy': ['ద్వితీయోపదేశకాండము', 'DEU'],
    'Joshua': ['యెహోషువ', 'JOS'],
    'Judges': ['న్యాయాధిపతులు', 'JDG'],
    'Ruth': ['రూతు', 'RUT'],
    '1 Samuel': ['1 సమూయేలు', '1SA'],
    '2 Samuel': ['2 సమూయేలు', '2SA'],
    '1 Kings': ['1 రాజులు', '1KI'],
    '2 Kings': ['2 రాజులు', '2KI'],
    '1 Chronicles': ['1 దినవృత్తాంతములు', '1CH'],
    '2 Chronicles': ['2 దినవృత్తాంతములు', '2CH'],
    'Ezra': ['ఎజ్రా', 'EZR'],
    'Nehemiah': ['నెహెమ్యా', 'NEH'],
    'Esther': ['ఎస్తేరు', 'EST'],
    'Job': ['యోబు', 'JOB'],
    'Psalm': ['కీర్తనలు', 'PSA'],
    'Psalms': ['కీర్తనలు', 'PSA'],
    'Proverbs': ['సామెతలు', 'PRO'],
    'Ecclesiastes': ['ప్రసంగి', 'ECC'],
    'Song of Solomon': ['పరమగీతము', 'SNG'],
    'Isaiah': ['యెషయా', 'ISA'],
    'Jeremiah': ['యిర్మీయా', 'JER'],
    'Lamentations': ['విలాపవాక్యములు', 'LAM'],
    'Ezekiel': ['యెహెజ్కేలు', 'EZK'],
    'Daniel': ['దానియేలు', 'DAN'],
    'Hosea': ['హోషేయ', 'HOS'],
    'Joel': ['యోవేలు', 'JOL'],
    'Amos': ['ఆమోసు', 'AMO'],
    'Obadiah': ['ఓబద్యా', 'OBA'],
    'Jonah': ['యోనా', 'JON'],
    'Micah': ['మీకా', 'MIC'],
    'Nahum': ['నహూము', 'NAM'],
    'Habakkuk': ['హబక్కూకు', 'HAB'],
    'Zephaniah': ['జెఫన్యా', 'ZEP'],
    'Haggai': ['హగ్గయి', 'HAG'],
    'Zechariah': ['జెకర్యా', 'ZEC'],
    'Malachi': ['మలాకీ', 'MAL'],
    'Matthew': ['మత్తయి', 'MAT'],
    'Mark': ['మార్కు', 'MRK'],
    'Luke': ['లూకా', 'LUK'],
    'John': ['యోహాను', 'JHN'],
    'Acts': ['అపొస్తలుల కార్యములు', 'ACT'],
    'Romans': ['రోమా', 'ROM'],
    '1 Corinthians': ['1 కొరింథీ', '1CO'],
    '2 Corinthians': ['2 కొరింథీ', '2CO'],
    'Galatians': ['గలతీ', 'GAL'],
    'Ephesians': ['ఎఫెసీ', 'EPH'],
    'Philippians': ['ఫిలిప్పీ', 'PHP'],
    'Colossians': ['కొలొస్స', 'COL'],
    '1 Thessalonians': ['1 థెస్సలొనీక', '1TH'],
    '2 Thessalonians': ['2 థెస్సలొనీక', '2TH'],
    '1 Timothy': ['1 తిమోతి', '1TI'],
    '2 Timothy': ['2 తిమోతి', '2TI'],
    'Titus': ['తీతు', 'TIT'],
    'Philemon': ['ఫిలేమోను', 'PHM'],
    'Hebrews': ['హెబ్రీ', 'HEB'],
    'James': ['యాకోబు', 'JAS'],
    '1 Peter': ['1 పేతురు', '1PE'],
    '2 Peter': ['2 పేతురు', '2PE'],
    '1 John': ['1 యోహాను', '1JN'],
    '2 John': ['2 యోహాను', '2JN'],
    '3 John': ['3 యోహాను', '3JN'],
    'Jude': ['యూదా', 'JUD'],
    'Revelation': ['ప్రకటన', 'REV']
  };
  // Longest names first, so "1 John" is matched before "John"
  var NAMES = Object.keys(BOOKS).sort(function (a, b) { return b.length - a.length; });
  var BOOK_RE = new RegExp('(^|[^A-Za-z])(' + NAMES.join('|') + ')(?= \\d)', 'g');

  // "Luke 2:1-7" -> "లూకా 2:1-7"; also handles "Matthew 2:1; Luke 2:4"
  function refText(ref) {
    return ref.replace(BOOK_RE, function (m, pre, name) { return pre + BOOKS[name][0]; });
  }

  // YouVersion takes one chapter, or a verse range within a chapter:
  // "Luke 2:1-7" -> LUK.2.1-7; "Acts 13:1-14:28" -> ACT.13.1; "Luke 2" -> LUK.2
  function bibleUrl(ref) {
    var m = /^((?:[123] )?[A-Z][A-Za-z ]*?) (\d+)(?::(\d+)(?:-(\d+)(?![:\d]))?)?/.exec(ref);
    var book = m && BOOKS[m[1]];
    if (!book) return 'https://www.bible.com/bible/1787';
    var passage = book[1] + '.' + m[2] + (m[3] ? '.' + m[3] + (m[4] ? '-' + m[4] : '') : '');
    return 'https://www.bible.com/bible/1787/' + passage + '.TELUBSI';
  }

  var UI = {
    // years
    '{y} BC': 'క్రీ.పూ. {y}',
    'AD {y}': 'క్రీ.శ. {y}',
    'c. ': 'సుమారు ',
    // timeline lanes and kinds (the Kings page)
    'Empires': 'సామ్రాజ్యములు',
    'Rulers of the nations': 'జనముల పాలకులు',
    'Kings of Israel (north)': 'ఇశ్రాయేలు రాజులు (ఉత్తరం)',
    'Kings of Judah (south)': 'యూదా రాజులు (దక్షిణం)',
    'Leaders after the exile': 'చెర తర్వాతి నాయకులు',
    'Prophets': 'ప్రవక్తలు',
    'Key events': 'ముఖ్య సంఘటనలు',
    'King of Israel': 'ఇశ్రాయేలు రాజు',
    'King of Judah': 'యూదా రాజు',
    'Queen of Israel': 'ఇశ్రాయేలు రాణి',
    'Queen of Judah': 'యూదా రాణి',
    'Prophet': 'ప్రవక్త',
    'After the exile': 'చెర తర్వాత',
    'Event': 'సంఘటన',
    'Foreign ruler': 'అన్యదేశ పాలకుడు',
    'Empire': 'సామ్రాజ్యము',
    'Israel': 'ఇశ్రాయేలు',
    'Judah': 'యూదా',
    'Israel & Judah': 'ఇశ్రాయేలు & యూదా',
    'Whole region': 'మొత్తం ప్రాంతం',
    // the Bible's verdict on each king
    'Did what was right in the eyes of the LORD': 'యెహోవా దృష్టికి యథార్థముగా ప్రవర్తించెను',
    'Did some things right in the eyes of the LORD, but not wholeheartedly': 'యెహోవా దృష్టికి కొన్ని యథార్థమైన కార్యములు చేసెను, కానీ పూర్ణహృదయముతో కాదు',
    'Did evil in the eyes of the LORD': 'యెహోవా దృష్టికి చెడ్డదైనది చేసెను',
    'Scripture gives no formal verdict on this reign': 'ఈ పరిపాలనపై లేఖనము ప్రత్యేకంగా తీర్పు చెప్పలేదు',
    'Colour kings by the Bible\'s verdict': 'బైబిలు తీర్పు ప్రకారం రాజులకు రంగులు',
    'Did right': 'యథార్థముగా',
    'Mixed': 'మిశ్రమం',
    'Did evil': 'చెడుగా',
    'No verdict': 'తీర్పు లేదు',
    'Co-regency': 'సహ పరిపాలన',
    'co-regent from': 'సహ పరిపాలన ఆరంభం',
    'Reigned': 'పరిపాలన',
    'Ministry {dates}': 'పరిచర్య {dates}',
    // certainty
    'Fixed': 'నిర్ధారితం',
    'Calculated': 'లెక్కించినది',
    'Approximate': 'సుమారు',
    'Disputed': 'భిన్నాభిప్రాయాలు',
    'High': 'అధిక',
    'Moderate': 'మధ్యస్థ',
    'Low': 'తక్కువ',
    // detail panel
    'Dating basis: ': 'తేదీకి ఆధారం: ',
    'Evidence outside the Bible': 'బైబిలు వెలుపలి ఆధారం',
    'Rulers in this period': 'ఈ కాలపు పాలకులు',
    'Read the Scripture': 'లేఖనము చదవండి',
    'Places': 'స్థలములు',
    'Who was alive at the time': 'ఆ కాలంలో జీవించినవారు',
    'Contemporaries': 'సమకాలికులు',
    'Map shows the kingdoms in': 'పటంలో చూపినది:',
    'Map · the kingdoms in': 'పటం · రాజ్యాలు',
    'Dates: ': 'తేదీలు: ',
    'Go deeper: study Bibles and Bible atlases at Asha Books': 'మరింత లోతుగా: ఆశా బుక్స్‌లో స్టడీ బైబిళ్లు, బైబిలు అట్లాసులు',
    'Map: {y}': 'పటం: {y}',
    'Year shown on the kingdoms map': 'పటంలో చూపిన సంవత్సరం',
    // places
    'Place': 'స్థలము',
    'Identified with ': 'నేటి స్థలము: ',
    '{level} confidence in this identification ({pct}%)': 'ఈ గుర్తింపుపై నమ్మకం: {level} ({pct}%)',
    'Alternative: {site} ({pct}%)': 'మరో అభిప్రాయం: {site} ({pct}%)',
    'Other proposed sites': 'ప్రతిపాదించిన ఇతర స్థలములు',
    'On this timeline': 'ఈ కాలరేఖపై',
    'Mentioned in 1 verse. Location data: ': '1 వచనములో ప్రస్తావించబడింది. స్థల సమాచారం: ',
    'Mentioned in {n} verses. Location data: ': '{n} వచనములలో ప్రస్తావించబడింది. స్థల సమాచారం: ',
    'settlement': 'ఊరు',
    'body of water': 'జలాశయము',
    'campsite': 'విడిది స్థలము',
    'canal': 'కాలువ',
    'ford': 'రేవు',
    'forest': 'అడవి',
    'garden': 'తోట',
    'hill': 'కొండ',
    'island': 'ద్వీపము',
    'mine': 'గని',
    'mountain': 'పర్వతము',
    'mountain range': 'పర్వత శ్రేణి',
    'natural area': 'ప్రకృతి ప్రాంతము',
    'pool': 'కోనేరు',
    'region': 'ప్రాంతము',
    'river': 'నది',
    'spring': 'ఊట',
    'stone heap': 'రాళ్ల కుప్ప',
    'valley': 'లోయ',
    'wadi': 'వాగు',
    'well': 'బావి',
    // map
    'On this map': 'ఈ పటంలో',
    'Show kingdoms': 'రాజ్యాలను చూపించు',
    'Independent': 'స్వతంత్రం',
    'Vassal / under another power': 'సామంత రాజ్యం / ఇతరుల అధీనం',
    'Province of an empire': 'సామ్రాజ్యపు సంస్థానం',
    'Borders are approximate': 'సరిహద్దులు సుమారుగా మాత్రమే',
    'Earlier': 'ముందటి',
    'Later': 'తర్వాతి',
    'Clear': 'తుడిచివేయి',
    'Map of Bible places': 'బైబిలు స్థలముల పటం',
    // intro
    'How to use': 'ఎలా వాడాలి',
    'Explore the kings, prophets and places': 'రాజులు, ప్రవక్తలు, స్థలములను పరిశీలించండి',
    'Tap anything on the timeline to read about it, see its Scripture passages and show its places on the map.': 'కాలరేఖపై దేనినైనా నొక్కితే దాని వివరాలు, దానికి సంబంధించిన లేఖన భాగాలు కనిపిస్తాయి, దాని స్థలాలు పటంపై చూపబడతాయి.',
    'Use the buttons above the timeline ({list}) to jump to each part of the story.': 'కథలోని ఒక్కో భాగానికి వెళ్లడానికి కాలరేఖ పైనున్న బటన్లను ({list}) వాడండి.',
    'Tap a place on the map to see everything on the timeline that happened there.': 'పటంపై ఒక స్థలాన్ని నొక్కితే, అక్కడ జరిగిన సంగతులన్నీ కాలరేఖపై కనిపిస్తాయి.',
    'Use the slider under the map to watch the kingdoms and empires change over time. Choosing anything on the timeline moves the map to that time.': 'కాలక్రమంలో రాజ్యాలు, సామ్రాజ్యాలు ఎలా మారాయో చూడడానికి పటం కిందనున్న స్లైడర్‌ను వాడండి. కాలరేఖపై దేనినైనా ఎంచుకుంటే పటం ఆ కాలానికి మారుతుంది.',
    'Use + and − to zoom the timeline; drag or scroll sideways to move through time.': 'కాలరేఖను పెద్దది/చిన్నది చేయడానికి + మరియు − వాడండి; కాలంలో ముందుకు వెనుకకు వెళ్లడానికి పక్కకు లాగండి లేదా స్క్రోల్ చేయండి.',
    'How sure are the dates?': 'తేదీలు ఎంత ఖచ్చితం?',
    'How sure are the places?': 'స్థలాలు ఎంత ఖచ్చితం?',
    'Low confidence in the modern location': 'నేటి స్థలముపై నమ్మకం తక్కువ',
    // toolbar
    'Timeline': 'కాలరేఖ',
    'Zoom out': 'చిన్నదిగా',
    'Zoom in': 'పెద్దదిగా',
    'Fit': 'మొత్తం',
    'Sorry, the Bible timeline could not be loaded.': 'క్షమించండి, బైబిలు కాలరేఖ లోడ్ కాలేదు.',
    // hub: verse of the day
    'Verse of the day': 'నేటి వాక్యము',
    'Share': 'పంచుకోండి',
    'Copied': 'కాపీ అయింది'
  };

  // Pages that have a Telugu version in te/ (the rest link to the English page)
  var PAGES = ['index.html', 'jesus-and-paul.html'];

  window.BS_LANG = { code: 'te', ui: UI, books: BOOKS, refText: refText, bibleUrl: bibleUrl, pages: PAGES };
})();
