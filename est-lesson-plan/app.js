// ── CONFIGURATION ─────────────────────────────────────────────────
const SCRIPT_URL = ''; // Paste your deployed Apps Script URL here

const TEACHER_PASSWORD = 'AshaJyothi2025';

// ── STATE ──────────────────────────────────────────────────────────
let currentCourse = '';
let viewYear  = new Date().getFullYear();
let viewMonth = new Date().getMonth(); // 0-indexed

// { 'YYYY-MM-DD': [{ id, lesson, topic }] }
let schedule = {};

// [{ id, lesson, startDate, endDate }]  — multi-day module bars
let spans = [];

// { 'YYYY-MM-DD': [{ id, type: 'text'|'photo', content, timestamp }] }
let feedback = {};

let dragData = null;
let modalDate = null;
let pendingPhoto = null; // { base64, mimeType } waiting to be saved

// ── LESSON COLORS ──────────────────────────────────────────────────
const PALETTE = ['#0ea5e9','#8b5cf6','#10b981','#f59e0b','#ef4444','#6366f1','#14b8a6'];
const lessonColorMap = {};
let colorIndex = 0;

function colorFor(lesson) {
  if (!lessonColorMap[lesson]) {
    lessonColorMap[lesson] = PALETTE[colorIndex % PALETTE.length];
    colorIndex++;
  }
  return lessonColorMap[lesson];
}

// ── VIEW HELPERS ───────────────────────────────────────────────────
function showView(id) {
  document.querySelectorAll('.view').forEach(v => {
    v.classList.add('hidden');
    v.classList.remove('active');
  });
  const target = document.getElementById(id);
  target.classList.remove('hidden');
  target.classList.add('active');
}

// ── LOGIN ──────────────────────────────────────────────────────────
document.getElementById('login-form').addEventListener('submit', function (e) {
  e.preventDefault();
  const pwd = document.getElementById('password').value;
  const err = document.getElementById('login-error');
  if (pwd === TEACHER_PASSWORD) {
    err.classList.add('hidden');
    sessionStorage.setItem('authenticated', 'true');
    showView('view-select');
  } else {
    err.classList.remove('hidden');
    document.getElementById('password').value = '';
  }
});

// ── LOGOUT ─────────────────────────────────────────────────────────
function logout() {
  sessionStorage.removeItem('authenticated');
  currentCourse = '';
  document.getElementById('password').value = '';
  showView('view-login');
}

document.getElementById('logout-btn').addEventListener('click', logout);
document.getElementById('logout-btn-2').addEventListener('click', logout);

// ── LESSON PLAN STATE ──────────────────────────────────────────────
// [{ id, course, module, topic, theory, practicals, assessments, updatedAt }]
let lessonPlans = [];
let editingPlanId = null;

// ── COURSE OUTLINE STATE ───────────────────────────────────────────
let courseOutline = {};

// ── COURSE SELECTION → mode screen ─────────────────────────────────
function selectCourse(course) {
  currentCourse = course;

  schedule     = {};
  spans        = loadSpansLocally(course);
  feedback     = loadFeedbackLocally(course);
  lessonPlans  = loadPlansLocally(course);
  courseOutline = loadOutlineLocally(course);
  colorIndex   = 0;
  Object.keys(lessonColorMap).forEach(k => delete lessonColorMap[k]);

  document.getElementById('mode-course-label').textContent = course;
  document.getElementById('mode-course-sub').textContent   = course;
  showView('view-mode');
}

function selectMode(mode) {
  if (mode === 'outline') {
    document.getElementById('co-course-badge').textContent = currentCourse;
    showView('view-course-outline');
    initCourseOutlineView();
  } else if (mode === 'plan') {
    document.getElementById('lp-course-badge').textContent = currentCourse;
    showView('view-lesson-plan');
    initLessonPlanView();
  } else {
    document.getElementById('planner-course-badge').textContent = currentCourse;
    const now = new Date();
    viewYear  = now.getFullYear();
    viewMonth = now.getMonth();
    showView('view-planner');
    loadCurriculum();
    renderCalendar();
    loadSchedule();
  }
}

document.getElementById('mode-back-btn').addEventListener('click', () => showView('view-select'));
document.getElementById('logout-btn-3').addEventListener('click', logout);

document.getElementById('co-back-btn').addEventListener('click', () => showView('view-mode'));
document.getElementById('logout-btn-5').addEventListener('click', logout);

document.getElementById('back-btn').addEventListener('click', () => showView('view-mode'));
document.getElementById('lp-back-btn').addEventListener('click', () => showView('view-mode'));
document.getElementById('logout-btn-4').addEventListener('click', logout);

// ── FULL COURSE OUTLINES (source of truth for Course Outline view) ─
const FULL_COURSE_OUTLINES = {
  'Spoken English Level 1': {
    meta: { title: '12-Week Spoken English Lesson Plan (Level 1)', duration: '12 Weeks', daysPerWeek: '5 Days', approach: 'Integrated Learning (Grammar + Vocabulary + Speaking + Activities)' },
    objective: "To develop learners' ability to communicate effectively in basic English by integrating grammar, vocabulary, and speaking skills, enabling them to confidently participate in everyday conversations, express ideas clearly, and handle simple real-life situations.",
    dailyFlow: ['Day 1: Concept Introduction', 'Day 2: Practice & Vocabulary', 'Day 3: Guided Speaking', 'Day 4: Application (Role Play / Conversation)', 'Day 5: Review + Weekly Speaking Task'],
    modules: [
      { name: 'Module 1 – Introduction & Basic Communication', objective: 'To build confidence and enable students to introduce themselves using simple sentences.', days: ['Importance of English communication, greetings', 'Self-introduction, basic sentence structures (I am…, My name is…)', 'Helping verbs (is, am, are) + personal vocabulary', 'Pair conversation (introductions)', 'Practice + speaking task'], weeklyTask: '"My Introduction"' },
      { name: 'Module 2 – Talking About Daily Life', objective: 'To enable students to talk about their daily routine using simple present tense.', days: ['Simple Present Tense (basic usage)', 'Daily routine vocabulary', 'WH questions (What, When, Where)', 'Pair conversation (daily routine)', 'Review + speaking'], weeklyTask: '"My Daily Routine"' },
      { name: 'Module 3 – Describing People & Things', objective: 'To develop the ability to describe people and objects using appropriate vocabulary.', days: ['Adjectives + descriptive vocabulary', 'Articles (a, an, the) + singular/plural', 'Sentence formation practice', 'Picture description activity', 'Speaking practice'], weeklyTask: '"Describe My Family / Friend"' },
      { name: 'Module 4 – Past & Future Communication', objective: 'To help students speak about past events and future plans.', days: ['Simple Past Tense (basic verbs)', 'Future expressions (will / going to)', 'Time expressions (yesterday, tomorrow) + connectors', 'Storytelling activity', 'Review + speaking'], weeklyTask: '"My Last Day / Future Plan"' },
      { name: 'Module 5 – Everyday Situations', objective: 'To enable students to communicate in basic real-life situations.', days: ['Prepositions (in, on, at) + polite expressions', 'Shopping and travel vocabulary', 'Pronunciation practice', 'Role play (market, asking directions)', 'Practice + speaking'], weeklyTask: '"At the Market / Asking for Help"' },
      { name: 'Module 6 – Fluency Development & Assessment', objective: 'To improve speaking confidence and assess progress.', days: ['Revision (grammar + vocabulary)', 'JAM (Just a Minute)', 'Picture-based speaking', 'Group discussion', 'Assessment'], weeklyTask: '', assessment: '3–5 minute speaking + role play' },
      { name: 'Module 7 – Vocabulary & Sentence Development', objective: 'To enhance vocabulary and improve sentence formation skills.', days: ['Daily-use vocabulary expansion', 'Synonyms & antonyms', 'Sentence building using new words', 'Pair conversation practice', 'Review + speaking'], weeklyTask: '"Use New Words in Sentences"' },
      { name: 'Module 8 – Pronunciation & Clarity', objective: 'To improve pronunciation and speaking clarity.', days: ['Basic pronunciation rules', 'Reading aloud practice', 'Speaking with pauses and clarity', 'Listening & repetition exercises', 'Practice + speaking'], weeklyTask: '"Read and Explain a Passage"' },
      { name: 'Module 9 – Question & Answer Communication', objective: 'To develop the ability to ask and answer questions confidently.', days: ['Question words and structure', 'Forming questions', 'Answering clearly', 'Pair Q&A activity', 'Review + speaking'], weeklyTask: '"Ask & Answer Questions"' },
      { name: 'Module 10 – Conversation Practice', objective: 'To build confidence in everyday conversations.', days: ['Conversation starters', 'Pair conversations', 'Group discussions', 'Role play activities', 'Practice + speaking'], weeklyTask: '"Talk on a Simple Topic"' },
      { name: 'Module 11 – Practical Communication', objective: 'To apply English in real-life situations effectively.', days: ['Asking for help and giving directions', 'Telephone conversation basics', 'Shopping & customer interaction', 'Situational role plays', 'Review + speaking'], weeklyTask: '"Handle a Real-Life Situation"' },
      { name: 'Module 12 – Final Fluency & Assessment', objective: 'To evaluate overall communication skills and fluency.', days: ['Revision (grammar + vocabulary)', 'Fluency activities (JAM, rapid speaking)', 'Group discussion', 'Final presentations', 'Assessment'], weeklyTask: '', assessment: '3–5 minute speaking + role play + situational conversation' },
    ],
    outcomes: ['Communicate confidently in everyday situations', 'Use basic grammar accurately in speech', 'Participate in simple conversations and discussions', 'Demonstrate improved fluency and pronunciation'],
  },

  'Spoken English Level 2': {
    meta: { title: '12-Week Spoken English Lesson Plan (Level 2)', duration: '12 Weeks', daysPerWeek: '5 Days', approach: 'Integrated Learning (Grammar + Vocabulary + Speaking + Activities)' },
    objective: "To strengthen learners' communication skills by improving grammar application, enhancing speaking confidence, and developing workplace communication abilities for effective use of English in professional and real-life situations.",
    dailyFlow: ['Day 1: Concept Introduction', 'Day 2: Practice & Vocabulary', 'Day 3: Guided Speaking', 'Day 4: Application (Role Play / Discussion)', 'Day 5: Review + Weekly Speaking Task'],
    modules: [
      { name: 'Module 1 – Advanced Communication Basics', objective: 'To develop confidence in introductions and basic conversation building.', days: ['Effective self-introduction and conversation starters', 'Vocabulary for expressing ideas', 'Asking and answering confidently', 'Pair conversation practice', 'Review and speaking'], weeklyTask: '"Professional Self-Introduction"' },
      { name: 'Module 2 – Expressing Opinions & Ideas', objective: 'To enable learners to express opinions clearly and confidently.', days: ['Sentence structures for opinions', 'Opinion-based vocabulary', 'Speaking practice (agree/disagree)', 'Group discussion activity', 'Review and speaking'], weeklyTask: '"Express My Opinion on a Topic"' },
      { name: 'Module 3 – Advanced Grammar in Speaking', objective: 'To apply advanced grammar structures in spoken communication.', days: ['Advanced sentence formation', 'Question tags and question formation', 'Irregular verbs in communication', 'Role play using grammar structures', 'Review and speaking'], weeklyTask: '"Use Grammar in Conversation"' },
      { name: 'Module 4 – Sentence Expansion & Connectors', objective: 'To improve fluency using connectors and complex sentences.', days: ['Sentence connectors (and, but, because, although)', 'Complex sentence construction', 'Sentence expansion exercises', 'Speaking activity using connectors', 'Review and speaking'], weeklyTask: '"Expand and Connect Ideas"' },
      { name: 'Module 5 – Vocabulary & Expression Skills', objective: 'To enhance vocabulary and expressive communication.', days: ['Advanced everyday vocabulary', 'Synonyms and antonyms', 'Idioms and expressions', 'Conversation using new vocabulary', 'Review and speaking'], weeklyTask: '"Use New Expressions in Speech"' },
      { name: 'Module 6 – Pronunciation & Fluency', objective: 'To improve pronunciation, clarity, and speech flow.', days: ['Pronunciation correction exercises', 'Voice clarity and stress patterns', 'Reading with expression', 'Listening and repetition practice', 'Review and speaking'], weeklyTask: '"Read and Present a Passage"' },
      { name: 'Module 7 – Practical Speaking Development', objective: 'To develop confidence in real-life speaking situations.', days: ['Speaking on everyday situations', 'Asking and giving explanations', 'Pair conversation practice', 'Situational role play', 'Review and speaking'], weeklyTask: '"Handle a Daily Situation in English"' },
      { name: 'Module 8 – Interactive Communication Activities', objective: 'To improve spontaneous speaking and thinking skills.', days: ['JAM (Just A Minute) practice', 'Picture and story description', 'Storytelling activity', 'Debate and discussion', 'Review and speaking'], weeklyTask: '"Speak Instantly on a Topic"' },
      { name: 'Module 9 – Workplace Communication Skills', objective: 'To develop communication skills required in workplace settings.', days: ['Formal communication basics', 'Telephone conversation practice', 'Customer interaction', 'Team communication role play', 'Review and speaking'], weeklyTask: '"Workplace Conversation Practice"' },
      { name: 'Module 10 – Professional English Usage', objective: 'To apply English in professional and formal situations.', days: ['Email drafting basics', 'Asking for information professionally', 'Giving instructions clearly', 'Role play (office situations)', 'Review and speaking'], weeklyTask: '"Write & Speak Professionally"' },
      { name: 'Module 11 – Interview & Career Communication', objective: 'To prepare learners for interviews and career communication.', days: ['Interview question practice', 'Professional self-introduction', 'Answering confidently', 'Mock interview activity', 'Review and speaking'], weeklyTask: '"Mock Interview Performance"' },
      { name: 'Module 12 – Fluency & Final Assessment', objective: 'To evaluate overall fluency, confidence, and communication skills.', days: ['Revision (grammar + vocabulary)', 'Fluency activities (JAM, rapid speaking)', 'Group discussion', 'Final presentations', 'Assessment'], weeklyTask: '', assessment: '5-minute speaking + role play + workplace scenario' },
    ],
    outcomes: ['Communicate confidently in professional and real-life situations', 'Use advanced grammar effectively in speech', 'Participate in discussions, debates, and workplace conversations', 'Demonstrate improved fluency, pronunciation, and confidence', 'Handle interviews and professional communication effectively'],
  },

  'Electrical': {
    meta: { title: 'Electrical Technician', institution: 'Asha Jyothi Employable Skills – Medchal Branch', creditHours: '240 Hours' },
    description: 'This course provides learners with the essential knowledge and practical skills required to perform basic electrical installation, maintenance, testing, troubleshooting, and repair of domestic electrical systems safely and effectively. Students will learn electrical fundamentals, workplace safety, wiring methods, tools and measuring instruments, earthing systems, domestic wiring installation, testing procedures, diagnosis of electrical faults, repair techniques, and professional finishing practices. Through classroom instruction and hands-on practical sessions, students will develop competency to install, inspect, maintain, troubleshoot, and repair residential electrical installations while following applicable safety standards and electrical codes.',
    courseObjectives: [
      'Explain the basic principles and fundamentals of electricity.',
      'Apply electrical safety practices and use appropriate Personal Protective Equipment (PPE).',
      'Identify and correctly use electrical tools and measuring instruments.',
      'Interpret basic electrical symbols, wiring diagrams, and circuit layouts.',
      'Perform domestic wiring installations using standard wiring methods.',
      'Install electrical fixtures, switches, sockets, lighting, and protective devices.',
      'Explain the purpose and methods of earthing and grounding systems.',
      'Conduct testing and inspection of electrical installations.',
      'Demonstrate proper finishing techniques for quality electrical work.',
      'Diagnose electrical faults using systematic troubleshooting methods.',
      'Perform maintenance and repair of domestic electrical installations.',
      'Identify root causes of electrical problems and recommend effective corrective actions.',
      'Prepare for practical examinations and demonstrate competency through project work.',
    ],
    modules: [
      { name: 'Module 1 – Electrical Safety', week: 'Week 1 (Sep 21st – Sep 25th)', days: ['Introduction, Safety Practice, Safety Precaution of our Area', 'Fire – Types & Extinguishers', 'Rescue operations – First aid treatment – Artificial respiration, PPE', 'Guidelines for cleanliness of workshop and maintenance', 'Slip test & PPE & first aid demo'] },
      { name: 'Module 2 – Fundamentals of Electricity', week: 'Week 2 (Sep 29th – Oct 2nd)', days: ['Define basic electrical quantities (current, voltage, resistance, work, power, energy); electrical circuits, conductors, insulators and semiconductors', "Ohm's law, simple electrical circuit and problems, parallel circuits and problems", 'AC & DC', 'Slip test & Activity – Wire & Cable Identification'] },
      { name: 'Module 3 – Electrical Tools and Instruments', week: 'Weeks 3–4 (Oct 5th – Oct 16th)', days: ['Fitting tools – marking tools – specification – grades – uses', 'Combination plier, long nose plier, side cutting plier etc.', 'Marking tools – steel rule – punches – calipers – try square – gauges; safe handling & maintenance', 'Activity – JAM Session on tools', 'Voltmeter, ammeter and clamp meter; speed meter, megger, frequency meter; cos Q meter, multi meter, watt meter; earth tester', 'Activity – Debate on Tools & Instruments'] },
      { name: 'Module 4 – Domestic Wiring Installation', week: 'Week 5 (Oct 19th – Oct 23rd)', days: ['Electrical wiring accessories', 'Wiring diagrams & house wiring components', 'Junction boxes, conduit installation & distribution boards', 'MCB, ELCB, cable routing & fuses', 'Activity – Debate on Tools & Instruments'] },
      { name: 'Module 5 – Wiring Types', week: 'Week 6 (Oct 26th – Oct 30th)', days: ['Cleat wiring, casing & capping wiring', 'Batten wiring', 'Conduit wiring & concealed wiring', 'Surface & flexible wiring', 'Slip test & Activity – Recognizing the wiring materials'] },
      { name: 'Module 6 – Electrical Fixtures and Fittings', week: 'Week 7 (Nov 2nd – Nov 6th)', days: ['Switches & socket outlets', 'Lamp holders & ceiling roses', 'LED lights & fans; costing, estimation of buildings', 'Regulators, bell circuits & distribution boards', 'Activity – Group Discussion'] },
      { name: 'Module 7 – Earthing', week: 'Week 8 (Nov 9th – Nov 13th)', days: ['Purpose of earthing', 'Types of earthing', 'Earth resistance', 'Earthing installation & testing earthing systems', 'Slip test'] },
      { name: 'Module 8 – Testing and Inspection', week: 'Week 9 (Nov 16th – Nov 20th)', days: ['Continuity, polarity testing', 'Insulation resistance', 'Earth continuity', 'Functional testing & documentation', 'Activity, Demo'] },
      { name: 'Module 9 – Proper Finishing', week: 'Week 10 (Nov 23rd – Nov 27th)', days: ['Cable dressing', 'Labelling & panel organization', 'Workmanship standards', 'Housekeeping & quality inspection', 'Slip test'] },
      { name: 'Module 10 – Domestic Electrical Repair and Maintenance', week: 'Week 11 (Nov 30th – Dec 4th)', days: ['Preventive & corrective maintenance', 'Replacing switches & sockets', 'Lighting repair', 'Fan servicing', 'Distribution board maintenance'] },
      { name: 'Module 11 – Fault Diagnosis and Troubleshooting', week: 'Week 12 (Dec 7th – Dec 11th)', days: ['Problem identification & root cause analysis', 'Troubleshooting process & circuit tracing', 'Testing procedures & fault isolation', 'Assignments on above topics', 'Complete house wiring project'] },
    ],
    extraWeeks: [
      { label: 'Week 13 (Dec 14th – Dec 18th)', items: ['Complete house wiring project', 'Installation testing', 'Fault diagnosis exercises', 'Viva preparation', 'Practical assessment'] },
      { label: 'Week 14 (Dec 22nd – Dec 30th)', items: ['Fault diagnosis exercises', 'Repairs', 'Board repairs', 'Analyzing the tools', 'Record writing & preparing for Final Exam'] },
    ],
    teachingMethods: ['Interactive lectures', 'Demonstrations', 'Hands-on laboratory practice', 'Group discussions', 'Case studies', 'Problem-based learning', 'Troubleshooting exercises', 'Workplace simulations', 'Project-based learning'],
    assessmentPlan: [
      { item: 'Weekly Activities', weight: '10%' },
      { item: 'Practical Laboratory Exercises', weight: '40%' },
      { item: 'Assignments', weight: '10%' },
      { item: 'Troubleshooting & Maintenance Project', weight: '15%' },
      { item: 'Final Written Examination', weight: '25%' },
    ],
    outcomes: [
      'Work safely with electrical systems using appropriate PPE and procedures.',
      'Explain and apply basic electrical principles.',
      'Use electrical tools and test instruments accurately.',
      'Install domestic wiring systems according to standards.',
      'Install and test electrical fixtures, fittings, and protective devices.',
      'Perform earthing installation and verify its effectiveness.',
      'Conduct electrical testing and inspection to ensure safety and compliance.',
      'Maintain high standards of workmanship and finishing.',
      'Perform preventive and corrective maintenance on domestic electrical installations.',
      'Diagnose electrical faults using systematic troubleshooting techniques.',
      'Determine the root cause of electrical problems and implement effective solutions.',
      'Successfully complete practical assessments and demonstrate competency in domestic electrical installation, repair, and maintenance.',
    ],
  },

  'Computer – MS-Office': {
    meta: { title: 'Computer Basic (MS Word, Excel, PowerPoint & Internet Concepts)', duration: '12 Weeks', creditHours: '240 Hours', daysPerWeek: '5 Days', approach: 'Hands-on application learning with guided practice' },
    objective: 'The MS Office course is designed to help students develop practical computer skills by learning Microsoft Word, Excel, and PowerPoint for creating documents, managing data, preparing presentations, and improving productivity for academic and professional success.',
    dailyFlow: ['Day 1 (Monday): New Topic Introduction', 'Day 2 (Tuesday): Concept & Theory', 'Day 3 (Wednesday): Related Topic', 'Day 4 (Thursday): Applied Learning', 'Day 5 (Friday): Practical / Lab Session'],
    modules: [
      { name: 'Module 1 – Introduction to Computers', objective: 'Understand computer basics and identify hardware components.', days: ['Introduction to Computers', 'Parts of a Computer', 'Hardware & Software', 'Input & Output Devices', 'Practical: Identify Computer Parts'], weeklyTask: 'Identify and label all major computer parts' },
      { name: 'Module 2 – Operating Systems', objective: 'Navigate the Windows OS and manage files and folders.', days: ['Operating Systems', 'Windows Desktop', 'Files & Folders', 'File Management', 'Practical: Create, Rename, Copy & Delete Files'], weeklyTask: 'Create, rename, copy and delete files on Windows' },
      { name: 'Module 3 – Keyboard & Mouse', objective: 'Develop keyboard and mouse skills and learn internet and email basics.', days: ['Keyboard & Mouse', 'Typing Practice', 'Internet Basics', 'Email Basics', 'Practical: Internet & Email'], weeklyTask: 'Browse the internet and send a basic email' },
      { name: 'Module 4 – Introduction to MS Word', objective: 'Get familiar with the MS Word interface and create basic documents.', days: ['Introduction to MS Word', 'Word Interface & Tools', 'Creating & Saving Documents', 'Text Formatting', 'Practical: Simple Document'], weeklyTask: 'Create and save a formatted simple document' },
      { name: 'Module 5 – Paragraph Formatting', objective: 'Apply paragraph formatting, bullets, page setup and headers & footers.', days: ['Paragraph Formatting', 'Bullets & Numbering', 'Page Setup', 'Headers & Footers', 'Practical: Formal Letter'], weeklyTask: 'Type and format a formal letter with headers and footers' },
      { name: 'Module 6 – Tables in Word', objective: 'Insert tables, images, WordArt and page design elements in Word.', days: ['Tables in Word', 'Images & Shapes', 'WordArt & Text Boxes', 'Page Borders & Watermarks', 'Practical: Create a Notice'], weeklyTask: 'Design a notice using tables, images and borders' },
      { name: 'Module 7 – Introduction to MS Excel', objective: 'Understand the Excel interface and perform basic data entry.', days: ['Introduction to MS Excel', 'Workbook & Worksheet', 'Rows, Columns & Cells', 'Data Entry', 'Practical: Student Mark Sheet'], weeklyTask: 'Create a student mark sheet with data entry' },
      { name: 'Module 8 – Basic Formulas', objective: 'Apply basic Excel formulas and format cells.', days: ['Basic Formulas', 'SUM, AVERAGE, MIN, MAX', 'COUNT & COUNTA', 'Cell Formatting', 'Practical: Mark Sheet with Formulas'], weeklyTask: 'Build a mark sheet using SUM, AVERAGE, MIN, MAX and COUNT formulas' },
      { name: 'Module 9 – Sorting & Filtering', objective: 'Sort, filter data and create charts with conditional formatting.', days: ['Sorting & Filtering', 'Charts', 'Conditional Formatting', 'Page Setup & Printing', 'Practical: Sales Report'], weeklyTask: 'Create a sales report with a chart and conditional formatting' },
      { name: 'Module 10 – Introduction to PowerPoint', objective: 'Learn the PowerPoint interface and create basic slides.', days: ['Introduction to PowerPoint', 'Creating Slides', 'Slide Layouts', 'Text & Formatting', 'Practical: 5-Slide Presentation'], weeklyTask: 'Create a 5-slide presentation with proper layouts' },
      { name: 'Module 11 – Images & Shapes', objective: 'Enhance presentations with images, charts, transitions and animations.', days: ['Images & Shapes', 'Tables & Charts', 'Transitions', 'Animations', 'Practical: Business Presentation'], weeklyTask: 'Create a business presentation with transitions and animations' },
      { name: 'Module 12 – PowerPoint Presentation Skills', objective: 'Develop presentation skills and complete final integrated projects.', days: ['PowerPoint Presentation Skills', 'Presentation Design', 'Final Project – Word', 'Final Project – Excel', 'Final Project Presentation'], weeklyTask: 'Present final integrated projects for Word, Excel and PowerPoint' },
    ],
    outcomes: ['Understand basic computer concepts and operate a computer confidently', 'Create, edit, format and print professional documents using MS Word', 'Enter, calculate, analyze and present data using MS Excel', 'Create and deliver attractive presentations using MS PowerPoint', 'Apply computer skills to practical academic and business projects'],
  },

  'Computer – Desktop Publishing': {
    meta: { title: 'Desktop Publishing (MS Publisher, Adobe Photoshop & Canva)', duration: '12 Weeks', creditHours: '240 Hours', daysPerWeek: '5 Days', approach: 'Creative and practical design-focused learning' },
    objective: 'A Desktop Publishing course teaches how to use computer software to design and format professional print and digital documents — creating books, magazines, brochures, logos, and posters by combining text, graphics, and edited photos into clean layouts.',
    dailyFlow: ['Day 1 (Monday): Theory & Demonstration', 'Day 2 (Tuesday): Guided Practical', 'Day 3 (Wednesday): Practical Exercise', 'Day 4 (Thursday): Creative Application', 'Day 5 (Friday): Assessment / Mini Project'],
    modules: [
      { name: 'Module 1 – Introduction to Desktop Publishing', objective: 'Understand DTP concepts, applications and design principles.', days: ['DTP concepts, applications and design principles', 'Page layout, typography and fonts', 'Colours and images in design', 'Creative text formatting exercise', 'Practical: Create a simple A4 document'], weeklyTask: 'Create a simple A4 document and practise text formatting' },
      { name: 'Module 2 – MS Publisher – Basics', objective: 'Navigate Publisher and set up pages using templates and guides.', days: ['Publisher interface, templates and page setup', 'Margins, guides and text boxes', 'Guided flyer creation', 'Notice design exercise', 'Practical: Create a simple flyer and notice'], weeklyTask: 'Create a simple flyer and notice in MS Publisher' },
      { name: 'Module 3 – MS Publisher – Designing', objective: 'Apply text formatting, shapes, pictures and backgrounds in Publisher.', days: ['Text formatting, WordArt and shapes', 'Pictures, tables and backgrounds', 'Business card design', 'Invitation and certificate design', 'Practical: Design a business card, invitation and certificate'], weeklyTask: 'Design a business card, invitation and certificate' },
      { name: 'Module 4 – MS Publisher – Advanced & Project', objective: 'Use master pages, headers/footers and export settings for multi-page documents.', days: ['Master pages, headers/footers and page numbering', 'Printing and export settings', 'Multi-page layout practice', 'Newsletter/brochure design', 'Practical: Create a 4-page newsletter/brochure'], weeklyTask: 'Create a 4-page newsletter/brochure' },
      { name: 'Module 5 – Adobe Photoshop – Basics', objective: 'Explore the Photoshop interface, tools, layers and basic image adjustments.', days: ['Photoshop interface, tools and layers', 'Selections, image size, resolution and colour modes', 'Crop, resize and colour correction', 'Photo adjustment exercises', 'Practical: Crop, resize and correct photographs'], weeklyTask: 'Crop, resize and correct photographs using Photoshop' },
      { name: 'Module 6 – Adobe Photoshop – Editing', objective: 'Use layers, masks, brushes and adjustment tools for photo editing.', days: ['Layers, masks and brushes', 'Text, shapes and adjustment tools', 'Retouching techniques', 'Photo collage creation', 'Practical: Create a photo collage and poster'], weeklyTask: 'Create a photo collage and poster' },
      { name: 'Module 7 – Adobe Photoshop – Design', objective: 'Apply effects, filters and typography to create design materials.', days: ['Background removal and blending effects', 'Filters and typography in Photoshop', 'Social media poster design', 'Advertisement and event poster design', 'Practical: Design a social media poster, advertisement and event poster'], weeklyTask: 'Design a social media poster, advertisement and event poster' },
      { name: 'Module 8 – Adobe Photoshop – Project', objective: 'Apply advanced composition and image manipulation for a promotional campaign.', days: ['Advanced composition techniques', 'Image manipulation methods', 'Promotional campaign planning', 'Campaign poster set creation', 'Practical: Create a complete promotional campaign/poster set'], weeklyTask: 'Create a complete promotional campaign/poster set' },
      { name: 'Module 9 – Canva – Basics', objective: 'Explore the Canva interface, templates, elements and design layouts.', days: ['Canva interface, templates and elements', 'Fonts, colours and layouts', 'Social media post design', 'Presentation creation in Canva', 'Practical: Create social media posts and a presentation'], weeklyTask: 'Create social media posts and a presentation in Canva' },
      { name: 'Module 10 – Canva – Professional Designs', objective: 'Use brand kits, animations and photo editing for professional designs.', days: ['Brand kit, grids and transparency', 'Animations and photo editing in Canva', 'Brochure and invitation design', 'Poster and social media design set', 'Practical: Create brochure, invitation, poster and social media designs'], weeklyTask: 'Create a brochure, invitation, poster and social media design set' },
      { name: 'Module 11 – Canva – Cards Designs', objective: 'Design school cards, company brand cards, restaurant menus and social media posters in Canva.', days: ['Theory: card design types, layouts and branding', 'School card design – step-by-step in Canva', 'Company brand card design', 'Restaurant menu card design', 'Practical: Create social media posters and a newsletter'], weeklyTask: 'Create a school card, company brand card, restaurant menu card and social media poster set' },
      { name: 'Module 12 – Final Project – Photoshop, Canva & Publisher', objective: 'Apply combined skills from all three software tools to create a complete DTP portfolio.', days: ['Final project planning and design review', 'Design a professional certificate in MS Publisher', 'Create a photo collage in Adobe Photoshop', 'Poster making in Canva', 'Practical: Present final DTP portfolio'], weeklyTask: 'Design a professional certificate (MS Publisher), photo collage (Photoshop) and poster (Canva) as a final portfolio' },
    ],
    outcomes: ['Understand the fundamentals of Desktop Publishing', 'Create professional documents using MS Publisher', 'Edit and manipulate images using Adobe Photoshop', 'Design creative digital content using Canva', 'Apply typography, colour, images, alignment and layout principles', 'Prepare brochures, flyers, cards, posters, invitations and newsletters', 'Export designs for print and digital use', 'Develop a professional DTP design portfolio'],
  },

  'Computer – Tally': {
    meta: { title: 'Tally Prime Course (Accounting)', duration: '12 Weeks', creditHours: '240 Hours', daysPerWeek: '5 Days', approach: 'Practical accounting and software-based learning' },
    objective: 'To develop proficiency in TallyPrime for computerized accounting, inventory management, GST compliance, banking, payroll and financial reporting, enabling learners to independently handle day-to-day business accounts.',
    dailyFlow: ['Day 1 (Monday): Theory & Demonstration', 'Day 2 (Tuesday): Guided Practical', 'Day 3 (Wednesday): Individual Practice', 'Day 4 (Thursday): Business Case Practice', 'Day 5 (Friday): Revision & Assessment'],
    modules: [
      { name: 'Module 1 – Introduction to Tally Prime', objective: 'Understand accounting basics, install Tally Prime and create a company.', days: ['Introduction to Tally Prime and accounting basics', 'Install Tally Prime and explore the interface', 'Company creation and configuration', 'Business case: Set up a sample company', 'Revision & assessment'], weeklyTask: 'Install Tally Prime, create a company and navigate the interface' },
      { name: 'Module 2 – Groups, Ledgers and Accounting Masters', objective: 'Create and manage groups, ledgers and accounting masters.', days: ['Groups and chart of accounts in Tally Prime', 'Creating and editing ledgers', 'Accounting masters setup and opening balances', 'Business case: Create ledgers for a sample business', 'Revision & assessment'], weeklyTask: 'Create groups and ledgers for a sample business' },
      { name: 'Module 3 – Accounting Vouchers', objective: 'Record business transactions using Tally vouchers.', days: ['Introduction to accounting vouchers', 'Contra and payment vouchers', 'Receipt and journal vouchers', 'Business case: Enter a complete set of vouchers', 'Revision & assessment'], weeklyTask: 'Practice Contra, Payment, Receipt and Journal vouchers' },
      { name: 'Module 4 – Sales & Purchase', objective: 'Enter purchase and sales transactions and create invoices.', days: ['Introduction to sales and purchase in Tally', 'Entering purchase transactions', 'Entering sales transactions and invoices', 'Business case: Process a full set of purchase and sales entries', 'Revision & assessment'], weeklyTask: 'Enter purchase and sales transactions and create invoices' },
      { name: 'Module 5 – Credit/Debit Notes', objective: 'Record sales returns, purchase returns and adjustments.', days: ['Understanding credit and debit notes', 'Recording sales returns', 'Recording purchase returns and adjustments', 'Business case: Enter returns for a sample business', 'Revision & assessment'], weeklyTask: 'Record sales returns, purchase returns and adjustments' },
      { name: 'Module 6 – Inventory Basics', objective: 'Set up stock groups, categories, units and stock items.', days: ['Introduction to inventory management in Tally', 'Stock groups, categories and units of measure', 'Creating stock items and opening stock', 'Business case: Set up inventory for a sample shop', 'Revision & assessment'], weeklyTask: 'Create stock groups, categories, units and stock items' },
      { name: 'Module 7 – Inventory Transactions', objective: 'Process purchase/sales with inventory, stock transfers and godowns.', days: ['Purchase and sales with inventory', 'Stock transfers between locations', 'Godown management in Tally', 'Business case: Process inventory transactions for a trading company', 'Revision & assessment'], weeklyTask: 'Enter purchase/sales with inventory, stock transfers and godown transactions' },
      { name: 'Module 8 – Inventory Reports', objective: 'Generate and interpret stock summary, movement and ageing reports.', days: ['Stock summary and movement reports', 'Stock ageing analysis', 'Reorder level and slow-moving stock reports', 'Business case: Analyse inventory reports for a sample business', 'Revision & assessment'], weeklyTask: 'Generate and interpret stock summary, movement, ageing and reorder reports' },
      { name: 'Module 9 – GST Fundamentals', objective: 'Configure GST, GSTIN, HSN/SAC codes and tax ledgers in Tally Prime.', days: ['Introduction to GST in India', 'GST configuration in Tally Prime', 'GSTIN, HSN/SAC codes and tax ledger setup', 'Business case: Configure GST for a sample company', 'Revision & assessment'], weeklyTask: 'Configure GST, GSTIN, HSN/SAC codes and tax ledgers' },
      { name: 'Module 10 – GST Transactions', objective: 'Create GST purchase/sales invoices and practice GST calculations.', days: ['GST purchase invoice entry', 'GST sales invoice entry', 'GST calculation and verification', 'Business case: Process a full month of GST transactions', 'Revision & assessment'], weeklyTask: 'Create GST purchase/sales invoices and practice GST calculations' },
      { name: 'Module 11 – GST Reports & Reconciliation', objective: 'Study GST reports, GSTR data and perform reconciliation.', days: ['GSTR-1 and GSTR-3B reports', 'GST reconciliation process', 'Input tax credit (ITC) management', 'Business case: Prepare GST reports for a sample business', 'Revision & assessment'], weeklyTask: 'Generate and study GST reports and perform reconciliation' },
      { name: 'Module 12 – Banking, Payroll & Final Project', objective: 'Perform bank reconciliation, salary processing and generate financial reports.', days: ['Bank reconciliation in Tally Prime', 'Payroll processing and salary entries', 'Financial reports: Trial Balance, P&L, Balance Sheet', 'Complete business project in Tally Prime', 'Final project presentation and assessment'], weeklyTask: 'Complete the integrated Tally Prime business project and final assessment' },
    ],
    outcomes: ['Create and manage a company in Tally Prime', 'Record day-to-day accounting transactions and vouchers', 'Manage inventory, prepare invoices and handle stock reports', 'Handle basic GST transactions and generate GSTR reports', 'Perform banking and payroll activities', 'Generate important business reports: Trial Balance, P&L and Balance Sheet'],
  },

  'Computer – Data Entry': {
    meta: { title: 'Data Entry (Typing Course)', duration: '12 Weeks', creditHours: '240 Hours', daysPerWeek: '5 Days', approach: 'Speed and accuracy-focused practical training' },
    objective: 'The Typing Master course is designed to help students develop fast and accurate typing skills using proper finger placement and keyboard techniques, building confidence for academic, office and professional computer work.',
    dailyFlow: ['Day 1 (Monday): New Topic Introduction', 'Day 2 (Tuesday): Key Practice', 'Day 3 (Wednesday): Combined Practice', 'Day 4 (Thursday): Applied Exercises', 'Day 5 (Friday): Speed / Accuracy Test'],
    modules: [
      { name: 'Module 1 – Introduction to Typing Master, keyboard layout', objective: 'Get familiar with the keyboard layout and begin home row typing.', days: ['Introduction to Typing Master, keyboard layout', 'Home row keys: A S D F J K L ;', 'Home row practice', 'Left-hand home-row drills', 'Right-hand home-row drills'], weeklyTask: 'Complete home row key drills with correct finger placement' },
      { name: 'Module 2 – F & J key positioning', objective: 'Master F and J key positioning and build home-row word speed.', days: ['F & J key positioning', 'Home-row words', 'Simple words practice', 'Short word combinations', 'Home-row speed test'], weeklyTask: 'Pass the home-row speed test with improved accuracy' },
      { name: 'Module 3 – Top row: Q W E R T Y', objective: 'Learn the top row keys and combine them with home row keys.', days: ['Top row: Q W E R T Y', 'Top-row key practice', 'Combining top & home rows', 'Words using top/home rows', 'Accuracy practice'], weeklyTask: 'Type words combining top and home row keys accurately' },
      { name: 'Module 4 – Bottom row: Z X C V B', objective: 'Learn the bottom row keys and combine all three keyboard rows.', days: ['Bottom row: Z X C V B', 'Bottom-row key practice', 'Combining all three rows', 'Common words practice', 'Weekly typing test'], weeklyTask: 'Pass the weekly typing test using all three keyboard rows' },
      { name: 'Module 5 – Capital letters using Shift', objective: 'Use Shift keys for capitals and type names, places and sentences.', days: ['Capital letters using Shift', 'Capital-letter words', 'Names and places', 'Sentences with capitals', 'Capital-letter speed test'], weeklyTask: 'Pass the capital-letter speed test with sentences' },
      { name: 'Module 6 – Number-row keys', objective: 'Learn number row keys and type numbers with words.', days: ['Number-row keys', 'Numbers 1–5', 'Numbers 6–0', 'Numbers with words', 'Number typing test'], weeklyTask: 'Pass the number typing test with accuracy' },
      { name: 'Module 7 – Punctuation: . , ? !', objective: 'Learn punctuation marks, symbols and special characters.', days: ['Punctuation: . , ? !', ': ; \' "', 'Symbols and special characters', 'Punctuation in sentences', 'Punctuation speed test'], weeklyTask: 'Pass the punctuation speed test using all punctuation marks' },
      { name: 'Module 8 – Common words practice', objective: 'Build fluency through common words, phrases and paragraph typing.', days: ['Common words practice', 'Frequently used phrases', 'Short sentences', 'Paragraph typing', 'Accuracy improvement'], weeklyTask: 'Type a paragraph with improved speed and accuracy' },
      { name: 'Module 9 – Typing from printed material', objective: 'Practise typing from printed material and without looking at the keyboard.', days: ['Typing from printed material', 'Typing without looking at keyboard', 'Paragraph practice', 'Error identification & correction', 'Timed typing test'], weeklyTask: 'Complete a timed typing test from printed material' },
      { name: 'Module 10 – Speed-building exercises', objective: 'Build typing speed through timed drills and difficult word practice.', days: ['Speed-building exercises', '5-minute typing practice', '10-minute typing practice', 'Difficult words practice', 'Speed & accuracy test'], weeklyTask: 'Pass the speed & accuracy test with improved WPM' },
      { name: 'Module 11 – Letters and applications', objective: 'Type business documents including letters, notices, tables and correspondence.', days: ['Letters and applications', 'Notices and simple documents', 'Tables and lists', 'Business correspondence', 'Timed document typing'], weeklyTask: 'Complete timed typing of a business letter and notice' },
      { name: 'Module 12 – Full paragraph practice', objective: 'Demonstrate typing confidence and speed in the final assessment.', days: ['Full paragraph practice', 'Speed improvement', 'Accuracy test', 'Final typing practice', 'Final Speed & Accuracy Test'], weeklyTask: 'Pass the Final Speed & Accuracy Test' },
    ],
    outcomes: ['Type confidently using correct finger placement', 'Maintain good accuracy across all key rows, numbers and punctuation', 'Type common documents, letters, paragraphs and business correspondence', 'Improve typing speed through regular timed practice', 'Prepare for typing tests and employment opportunities'],
  },

  'Beautician – Basic': {
    meta: { title: 'Beautician Basic Course', institution: 'Asha Jyothi Employable Skills – Medchal Branch', creditHours: '240 Hours', duration: '14 Weeks', daysPerWeek: '5 Days' },
    description: 'This course provides learners with comprehensive theoretical knowledge and practical skills in beauty care, skin care, hair care, make-up, threading, waxing, manicure and pedicure, facial treatments, massage, henna, and hairstyling. The programme combines classroom instruction, demonstrations, hands-on practice, activities, slip tests, record work, revision, and final theory and practical examinations. Emphasis is placed on professional ethics, personal hygiene, nutrition, client care, safe working practices, product knowledge, and practical beauty-care techniques.',
    courseObjectives: [
      'Understand professional ethics and basic principles of beauty and wellness.',
      'Identify the basic structure of the human body, skin, hair, and nails.',
      'Explain the relationship between nutrition, health, skin, hair, and nails.',
      'Demonstrate proper hygiene and safe working practices.',
      'Perform threading and different eyebrow-shaping techniques.',
      'Perform basic waxing, manicure, and pedicure services.',
      'Demonstrate skin-care, clean-up, massage, and facial procedures.',
      'Identify common facial and skin problems and understand appropriate care.',
      'Perform basic hair-cutting and hair-styling techniques.',
      'Apply make-up appropriately for different requirements.',
      'Understand hair care, hair types, straightening, curling, and styling.',
      'Use beauty and cosmetic products appropriately and safely.',
      'Perform henna and other beauty-care services.',
      'Develop professional communication, client-care, and service skills.',
    ],
    modules: [
      { name: 'Module 1 – Introduction, Professional Ethics, Anatomy & Hair Care', week: 'Week 1 (Sep 21st – Sep 25th)', objective: 'Introduce the course, professional ethics, body anatomy and basic hair care.', days: ['Introduction and overview of the course', 'Professional ethics', 'Structure of the human body and various body parts', 'Hair structure and basic hair care', 'Activity – Demonstration'], weeklyTask: 'Identify body parts and demonstrate basic hair care knowledge' },
      { name: 'Module 2 – Health, Nutrition & Beauty', week: 'Week 2 (Sep 29th – Oct 2nd)', objective: 'Explain the link between health, nutrition and the condition of skin, hair and nails.', days: ['Definition of health and nutrition', 'Importance and functions of food', 'Balanced diet and its significance in health', 'Food and nutrients related to healthy skin, nails and hair', 'Slip test'], weeklyTask: 'Complete a slip test on nutrition and its effect on beauty' },
      { name: 'Module 3 – Threading & Eyebrow Shaping', week: 'Week 3 (Oct 5th – Oct 9th)', objective: 'Perform threading and various eyebrow shaping techniques correctly.', days: ['Introduction to threading; types of eyebrow shapes', 'Performance of different shaped eyebrows', 'Practice – round eyebrow shape', 'Practice – arched & angular eyebrow shape', 'Activity – Identify the Shape (observe pictures and identify eyebrow types)'], weeklyTask: 'Demonstrate threading and shape at least three eyebrow styles' },
      { name: 'Module 4 – Waxing, Manicure & Pedicure', week: 'Weeks 4–5 (Oct 12th – Oct 23rd)', objective: 'Perform waxing, manicure and pedicure procedures safely and correctly.', days: ['Introduction to waxing', 'Waxing procedure and precautions', 'Waxing practice', 'Different types of waxing', "Waxing do's and don'ts quiz", 'Manicure and pedicure – introduction', 'Practical demonstration', 'Manicure practice', 'Pedicure practice', 'Manicure practice session and peer feedback'], weeklyTask: 'Complete a basic waxing, manicure and pedicure service for assessment' },
      { name: 'Module 5 – Skin Care, Clean-Up, Facial & Massage', week: 'Weeks 6–7 (Oct 26th – Nov 6th)', objective: 'Perform skin care, facial and clean-up procedures and identify common skin problems.', days: ['Skin care, facial – introduction and procedure', 'Facial demonstration', 'Facial practice', 'Facial problems and basic treatment/care', 'Skincare role-play activity', 'Clean-up procedure & practice', 'Massage strokes & practice', 'Preparation of natural clean-up kits', 'Cleanup practical', 'Steam demonstration – purpose and safe use'], weeklyTask: 'Perform a complete facial and clean-up service with peer assessment' },
      { name: 'Module 6 – Hair Cutting', week: 'Weeks 8–9 (Nov 9th – Nov 20th)', objective: 'Demonstrate basic hair-cutting techniques including straight, U and V cuts.', days: ['Introduction to hair cutting (straight, U & V cut)', 'Basic haircutting techniques', 'Hair-cutting demonstration', 'Hair-cutting practice', 'Activity / Slip Test / Demonstration', 'Hair-cutting practice on dummy', 'Hair-cutting practice', 'Face shape & haircut matching', 'Sectioning, layering & clipper practice', 'Haircut safety activity'], weeklyTask: 'Perform straight, U-cut and V-cut techniques and demonstrate scissor safety' },
      { name: 'Module 7 – Beauty Products & Natural Facial', week: 'Week 10 (Nov 23rd – Nov 27th)', objective: 'Identify beauty care products and demonstrate a natural fruit facial.', days: ['Explore the latest body and beauty care products', 'Product identification and uses', 'Practice', 'Natural fruit facial – demonstration', 'Natural fruit facial – practice'], weeklyTask: 'Identify products and perform a complete natural fruit facial' },
      { name: 'Module 8 – Make-Up', week: 'Week 11 (Nov 30th – Dec 4th)', objective: 'Apply make-up correctly using appropriate products and tools.', days: ['Introduction to make-up', 'Make-up products and tools', 'Make-up practice', 'Eye & cheek make-up', 'Activity – Pair make-up'], weeklyTask: 'Complete a full make-up application including eye and cheek make-up' },
      { name: 'Module 9 – Hair Care', week: 'Week 12 (Dec 7th – Dec 11th)', objective: 'Identify hair types, demonstrate hair care techniques and perform head massage.', days: ['Hair care – importance and identification', 'Hair types and basic care', 'Different types of oils used for head massage', 'Head massage & practice', 'Slip test'], weeklyTask: 'Perform a head massage and complete a slip test on hair care' },
      { name: 'Module 10 – Henna & Hair Styling', week: 'Week 13 (Dec 14th – Dec 18th)', objective: 'Apply henna and demonstrate basic hairstyling techniques.', days: ['Henna practice', 'Introduction to hairstyling', 'Hairstyles for straightened hair', 'Curled hairstyles', 'Activity / Slip Test / Demonstration'], weeklyTask: 'Apply henna and demonstrate a straightened and a curled hairstyle' },
      { name: 'Module 11 – Fault Finding, Client Diagnosis & Final Revision', week: 'Week 14 (Dec 22nd – Dec 30th)', objective: 'Diagnose skin, hair and nail faults, select appropriate treatments and prepare for the final examination.', days: ['Skin fault finding', 'Hair & scalp fault finding', 'Nail, eyebrow & body fault finding', 'Client diagnosis, treatment selection & revision', 'Record writing & preparing for final exam'], weeklyTask: 'Complete client diagnosis exercises and submit final record work' },
    ],
    assessmentPlan: [
      { item: 'Weekly Activities', weight: '10%' },
      { item: 'Practical Exercises', weight: '40%' },
      { item: 'Assignments', weight: '10%' },
      { item: 'Different Styles & Techniques', weight: '15%' },
      { item: 'Final Written Examination', weight: '25%' },
    ],
    outcomes: [
      'Communicate confidently with clients and demonstrate professional ethics and personal hygiene.',
      'Identify the body structure, skin types, hair types and nail conditions.',
      'Explain the importance of nutrition for healthy skin, hair and nails.',
      'Perform threading and different eyebrow-shaping techniques.',
      'Carry out waxing, manicure and pedicure services correctly.',
      'Perform skin care, clean-up, facial and massage procedures.',
      'Identify common facial and skin problems and recommend appropriate care.',
      'Perform basic hair-cutting techniques including straight, U and V cuts.',
      'Identify and use beauty and cosmetic products safely.',
      'Apply make-up for different requirements.',
      'Perform henna application and basic hairstyling.',
      'Diagnose client skin, hair and nail concerns and recommend suitable beauty services.',
    ],
  },

  'Beautician – Advanced': {
    meta: { title: 'Beautician Advanced Course', institution: 'Asha Jyothi Employable Skills – Medchal Branch', creditHours: '240 Hours', duration: '14 Weeks', daysPerWeek: '5 Days' },
    description: 'The Advanced Beautician course provides comprehensive and practical training in advanced beauty, wellness, hair, makeup, skincare, nail care, and salon management services. The course develops professional-level skills through demonstrations, hands-on practice, client consultation, assessment activities, group discussions, and practical assignments. Students are introduced to advanced facial treatments, specialized skin and hair treatments, bridal and party makeup, advanced hair cutting and care, saree draping, nail art, salon management, and professional record keeping. The course also emphasizes personal grooming, professional ethics, client communication, hygiene, safety, treatment selection, and entrepreneurial skills required for successful employment or independent salon business.',
    courseObjectives: [
      'Perform advanced facial and skincare treatments professionally.',
      'Apply party, bridal, and occasion-based makeup with confidence.',
      'Style, cut, and treat hair using appropriate professional techniques and tools.',
      'Analyse skin and hair conditions and suggest suitable treatments.',
      'Perform specialized beauty services such as nail art, waxing, and saree draping.',
      'Maintain professional hygiene, safety, and client-care standards.',
      'Understand salon management and maintain appropriate records.',
      'Develop professional communication, teamwork, creativity, and entrepreneurial skills.',
    ],
    modules: [
      { name: 'Module 1 – Introduction, Overview & Structure of Human Body', week: 'Week 1 (Sep 21st – Sep 25th)', objective: 'Introduce the advanced course, identify hair and skin types, and demonstrate hygiene and product knowledge.', days: ['Hair types, texture, density and porosity', 'Introduction to skin and its functions', 'Hygiene and sanitation demonstration', 'Product and tool identification', 'Activity – Tool & Product Identification'] },
      { name: 'Module 2 – Advanced Facials, Skin Analysis & Skin Treatments', week: 'Weeks 2–4 (Sep 29th – Oct 16th)', objective: 'Perform skin analysis, advanced facial treatments, and machine-based skin treatments; counsel clients on skin care.', days: ['Skin analysis, Patch-test awareness, Contraindications and precautions', 'Facial preparation, Massage techniques', 'High-frequency machine – introduction', 'High-frequency machine – practical', 'Client consultation role play', 'Galvanic machine – introduction', 'Galvanic machine – practical', 'Gold facial', 'Wine facial, Thermo facial', 'Activity – Case study: selecting a suitable facial', 'Pimple treatment', 'Pigmentation treatment', 'Warts awareness and treatment precautions', 'Post-treatment care', 'Client counselling – Activity'] },
      { name: 'Module 3 – Hair Care & Advanced Hair Cuts & Treatments', week: 'Weeks 5–6 (Oct 19th – Oct 30th)', objective: 'Perform scalp analysis, hair treatments and advanced hair cutting styles.', days: ['Scalp analysis, Hair consultation', 'Hair fall, Hair fall treatment', 'Dandruff, Dandruff treatment', 'Hair spa, Hair-care products', 'Activity – Hair-spa demonstration', 'Layer Cut – long, medium & short', 'Step Cut – two-step, three-step & multi-step', 'Butterfly Cut – long layered cut', 'Wolf cut – contemporary layered hair', 'Group Discussion – Finding the different types of advanced haircuts'] },
      { name: 'Module 4 – Nail Care & Nail Art', week: 'Week 7 (Nov 2nd – Nov 6th)', objective: 'Demonstrate nail care procedures and apply basic nail art designs.', days: ['Nail anatomy, Nail hygiene', 'Nail preparation, Nail tools', 'Nail products, Nail-art design planning', 'Basic nail art, Dots and lines, Patterns', 'Nail-care precaution'] },
      { name: 'Module 5 – Advanced Makeup & Bridal Makeup', week: 'Weeks 8–10 (Nov 9th – Nov 27th)', objective: 'Apply advanced makeup techniques including contouring, bridal makeup, eye makeup and long-lasting makeup styles.', days: ['Makeup tools and products, Skin preparation', 'Colour theory, Colour correction, Foundation selection', 'Face and eye shape analysis', 'Advanced hairstyles with setting spray', 'Activity – Colour-correction activity, Contouring, Highlighting', 'Eyebrow shaping and filling, Eye makeup', 'Eyeliner techniques, False-eyelash application', 'Lip shaping & Long-lasting makeup', 'Party makeup & Bridal skin preparation', 'Activity – JAM Session on makeup hygiene and brush sanitation', 'Glossy Makeup', 'HD makeup awareness', 'Bridal hairstyle & Jewellery coordination', 'Saree and makeup coordination', 'Activity – Photography ideas on makeup'] },
      { name: 'Module 6 – Saree Draping, Fashion Styling & Occasion Looks', week: 'Week 11 (Nov 30th – Dec 4th)', objective: 'Demonstrate saree draping techniques and coordinate fashion styling for different occasions.', days: ['Saree draping fundamentals', 'Basic saree draping & Pre-plating saree drape', 'Lehenga with saree', 'Saree, makeup, hairstyle & jewellery coordination', 'Demonstrate different styling options'] },
      { name: 'Module 7 – Salon Management & Record Management', week: 'Week 12 (Dec 7th – Dec 11th)', objective: 'Understand salon operations, client management, record keeping, billing and inventory management.', days: ['Salon layout, workstation organization & Reception management, Professional ethics', 'Client appointment management, Client consultation records', 'Service records, Stock records, Customer feedback, Complaint handling', 'Service pricing, Basic costing, Billing awareness, Inventory management, Product management', 'Activity – Salon-layout planning & Complaint-handling role play'] },
      { name: 'Module 8 – Digital Skills, Portfolio & Beauty Business', week: 'Week 13 (Dec 14th – Dec 18th)', objective: 'Develop a beauty portfolio, learn personal branding, digital promotion and home-salon business basics.', days: ['Beauty portfolio preparation & Personal branding', 'Home-salon business awareness & Service poster preparation', 'Basic digital promotion, Social-media awareness', 'Before-and-after photography', 'Professional presentation of work'] },
      { name: 'Module 9 – Client Consultation, Customer Service & Professional Ethics', week: 'Week 14 (Dec 22nd – Dec 30th)', objective: 'Practise professional client consultation, service recommendation, communication and customer care.', days: ['Professional greeting, Client consultation', 'Understanding client requirements, Treatment recommendation', 'Explaining procedures, Professional communication, Handling difficult clients', 'Client feedback, Follow-up', 'Activity – Professional communication exercise'] },
    ],
    extraWeeks: [
      { label: 'Final Mock Salon Day', items: ['Student roles: Receptionist, Makeup Artist, Hair Stylist, Nail Artist, Client, Salon Manager', 'Mock Salon Process: Appointment → Client Greeting → Consultation → Skin/Hair Analysis → Treatment Recommendation → Preparation → Service → Finishing → After-Care → Record Entry → Billing Awareness → Feedback → Follow-Up', 'Skills evaluated: Professional communication, Hygiene and sanitation, Tool preparation, Client consultation, Treatment selection, Technical skill, Time management, Creativity, Client comfort, Professional finishing, Record management, Customer service'] },
    ],
    assessmentPlan: [
      { item: 'Weekly Activities', weight: '10%' },
      { item: 'Practical Exercises', weight: '40%' },
      { item: 'Mock Assessment', weight: '15%' },
      { item: 'Different Styles & Techniques', weight: '10%' },
      { item: 'Final Written Examination', weight: '25%' },
    ],
    outcomes: [
      'Confidently perform advanced facial, skincare and machine-based skin treatments.',
      'Apply party, bridal and occasion-based makeup with professional technique.',
      'Style, cut and treat hair using appropriate professional techniques and tools.',
      'Analyse skin and hair conditions and recommend suitable treatments.',
      'Perform specialized beauty services including nail art, waxing and saree draping.',
      'Maintain professional hygiene, safety and client-care standards throughout all services.',
      'Demonstrate salon management skills including scheduling, records, billing and inventory.',
      'Develop a personal beauty portfolio and understand digital promotion and branding.',
      'Communicate professionally with clients, handle consultations and manage client feedback.',
      'Explore freelance, home-salon or employment opportunities in the beauty and wellness industry.',
    ],
  },

  'Tailoring – Basic': {
    meta: { title: 'Tailoring Basic Course', institution: 'Asha Jyothi Employable Skills – Alwal Branch', creditHours: '240 Hours', duration: '14 Weeks', daysPerWeek: '5 Days' },
    description: 'This course equips learners with essential tailoring skills, from using tools and taking measurements to cutting, stitching and finishing a wide range of garments including petticoats, frocks, blouses, tops, paizamas and skirts. Students build practical competency through hands-on construction of each garment from start to finish.',
    courseObjectives: [
      'Understand fabrics, tools, and sewing machine operation and safety.',
      'Read and use basic patterns and take accurate body measurements.',
      'Perform essential hand and machine stitches and seams.',
      'Cut fabric correctly and assemble simple garments.',
      'Construct petticoats, frocks, blouses, tops and other garments.',
      'Apply piping, frills, gathers, neck designs and sleeve finishes.',
      'Fit and alter garments for proper sizing and quality finish.',
      'Press and finish garments professionally and maintain sewing equipment.',
    ],
    modules: [
      { name: 'Module 1 – Introduction to Tailoring', week: 'Week 1', objective: 'Understand tailoring tools, measuring techniques and basic stitching.', days: ['Introduction to tailoring & tools', 'Measuring techniques', 'Basic body measurements', 'Fabric selection & layout', 'Basic stitching practice'], weeklyTask: 'Identify tools and take accurate basic body measurements' },
      { name: 'Module 2 – Panty & Half Petticoat', week: 'Week 2', objective: 'Construct a panty and half petticoat from measurements to finishing.', days: ['Panty – measurements & cutting', 'Panty – stitching & finishing', 'Half Petticoat – measurements & cutting', 'Half Petticoat – stitching & finishing', 'Practical & corrections'], weeklyTask: 'Complete panty and half petticoat from cutting to finishing' },
      { name: 'Module 3 – Umbrella Petticoat & Cuts Petticoat', week: 'Week 3', objective: 'Construct umbrella and cuts petticoats using gathering and finishing techniques.', days: ['Umbrella Petticoat – measurements & cutting', 'Umbrella Petticoat – stitching, gathering & finishing', 'Cuts Petticoat – measurements & cutting', 'Cuts Petticoat – stitching & finishing', 'Practical'], weeklyTask: 'Complete umbrella and cuts petticoat constructions' },
      { name: 'Module 4 – Frock Type Petticoat & Piping Frock', week: 'Week 4', objective: 'Construct a frock type petticoat and a piping frock with bodice.', days: ['Frock Type Petticoat – measurements & cutting', 'Frock Type Petticoat – stitching & finishing', 'Piping Frock – design, measurements & bodice cutting', 'Piping Frock – piping preparation & stitching', 'Practical'], weeklyTask: 'Complete frock type petticoat and piping frock' },
      { name: 'Module 5 – Neck Frills Frock & Balloon Frock', week: 'Week 5', objective: 'Create frocks with neck frills and balloon gathering techniques.', days: ['Neck Frills Frock – measurements & cutting', 'Neck Frills Frock – frill preparation & stitching', 'Balloon Frock – measurements & cutting', 'Balloon Frock – gathering technique & stitching', 'Practical & finishing'], weeklyTask: 'Complete neck frills frock and balloon frock' },
      { name: 'Module 6 – Round Neck & Square Neck Full Blouse', week: 'Week 6', objective: 'Stitch full blouses with round and square neck designs.', days: ['Round Neck Full Blouse – measurements & cutting', 'Round Neck Full Blouse – stitching & neck finishing', 'Square Neck Full Blouse – measurements & cutting', 'Square Neck Full Blouse – stitching & neck finishing', 'Practical'], weeklyTask: 'Complete round neck and square neck full blouses' },
      { name: 'Module 7 – Star Neck Blouse & Skirt & Top', week: 'Week 7', objective: 'Stitch a star neck blouse and construct a coordinated skirt & top set.', days: ['Star Neck Full Blouse – measurements & cutting', 'Star Neck Full Blouse – stitching & neck finishing', 'Skirt & Top – measurements, skirt & top cutting', 'Skirt & Top – stitching & finishing', 'Practical'], weeklyTask: 'Complete star neck blouse and skirt & top set' },
      { name: 'Module 8 – V-Shape Gagra & Gagra Frock', week: 'Week 8', objective: 'Construct V-shape gagra with vase coat and gagra frock.', days: ['V-Shape Gagra – measurements & cutting', 'V-Shape Gagra & Vase Coat – stitching & finishing', 'Gagra & Gagra Frock – measurements & cutting', 'Gagra & Gagra Frock – stitching & frock construction', 'Practical'], weeklyTask: 'Complete V-shape gagra with vase coat and gagra frock' },
      { name: 'Module 9 – School Uniform & Divider Skirt', week: 'Week 9', objective: 'Construct a complete school uniform and divider skirt.', days: ['School Uniform – measurements & cutting', 'School Uniform – shirt/top stitching', 'School Uniform – skirt/pant stitching & finishing', 'Divider Skirt – measurements, cutting & stitching', 'Practical & finishing'], weeklyTask: 'Complete school uniform and divider skirt' },
      { name: 'Module 10 – Umbrella Top & Paizama + Cuts Top & Frills Paizama', week: 'Week 10', objective: 'Construct umbrella top with paizama and cuts top with frills paizama.', days: ['Umbrella Top & Paizama – measurements & cutting', 'Umbrella Top & Paizama – stitching & finishing', 'Cuts Top – measurements & cutting', 'Frills Paizama – cutting, frill preparation & stitching', 'Practical & finishing'], weeklyTask: 'Complete umbrella top with paizama and cuts top with frills paizama' },
      { name: 'Module 11 – Short Length Top & Chudi Paizama + Ravika Blouse', week: 'Week 11', objective: 'Stitch short length top with chudi paizama and a ravika blouse.', days: ['Short Length Top – measurements & cutting', 'Chudi Paizama – cutting & stitching', 'Ravika Blouse – measurements & cutting', 'Ravika Blouse – stitching, sleeve & neck finishing', 'Practical'], weeklyTask: 'Complete short length top with chudi paizama and ravika blouse' },
      { name: 'Module 12 – 80cm Blouse & Straight Cutting Blouse', week: 'Week 12', objective: 'Practise 80cm blouse cutting and construct a straight cutting blouse.', days: ['80cm Blouse – cutting & construction', '80cm Blouse – stitching, fitting & correction', 'Straight Cutting Blouse – measurements & cutting', 'Straight Cutting Blouse – stitching & neck/sleeve finishing', 'Practical'], weeklyTask: 'Complete 80cm blouse and straight cutting blouse' },
      { name: 'Module 13 – Cross Cutting Blouse & Katora Blouse', week: 'Week 13', objective: 'Construct cross cutting blouse and katora blouse with correct fitting.', days: ['Cross Cutting Blouse – measurements & cutting', 'Cross Cutting Blouse – stitching, fitting & finishing', 'Katora Blouse – measurements & katora cutting', 'Katora Blouse – stitching & fitting', 'Practical & finishing'], weeklyTask: 'Complete cross cutting blouse and katora blouse' },
      { name: 'Module 14 – Saree Petticoat & Final Assessment', week: 'Week 14', objective: 'Construct a saree petticoat and demonstrate overall skills in the final assessment.', days: ['Saree Petticoat – measurements & cutting', 'Saree Petticoat – stitching, waistband & finishing', 'Revision & final practice', 'Final practical session', 'Final assessment & record writing'], weeklyTask: 'Complete saree petticoat and pass the final practical assessment' },
    ],
    assessmentPlan: [
      { item: 'Weekly Activities', weight: '10%' },
      { item: 'Practical Exercises', weight: '40%' },
      { item: 'Assignments', weight: '10%' },
      { item: 'Garment Construction Projects', weight: '15%' },
      { item: 'Final Written Examination', weight: '25%' },
    ],
    outcomes: [
      'Take accurate body measurements and interpret sizing charts.',
      'Select appropriate fabrics, linings and notions for basic garments.',
      'Lay out and cut fabric efficiently and accurately.',
      'Use sewing machines and hand-sewing techniques safely and effectively.',
      'Construct petticoats, frocks, blouses, tops, paizamas and skirts from start to finish.',
      'Apply piping, frills, neck designs and sleeve finishes.',
      'Apply basic fitting and alteration techniques to improve garment fit.',
      'Press and finish garments professionally for presentation.',
      'Independently prepare basic garments from measurement to final finishing.',
    ],
  },

  'Tailoring – Advanced': {
    meta: { title: 'Tailoring Advanced Course', institution: 'Asha Jyothi Employable Skills – Alwal Branch', creditHours: '240 Hours', duration: '12 Weeks', daysPerWeek: '5 Days' },
    description: 'This advanced tailoring course builds on basic stitching skills, introducing hand embroidery, fabric painting, pallu decoration and designer garment construction. Students master frocks, designer dresses, blouses and decorative techniques to develop the creativity and skill needed for boutique work and custom tailoring.',
    courseObjectives: [
      'Develop advanced tailoring and garment-making skills.',
      'Learn different types of hand embroidery and decorative designs.',
      'Create designer frocks, dresses, and fashionable garments.',
      'Learn pallu decoration, tassel designs, and fabric painting.',
      'Master advanced techniques such as piping, collars, zips, front openings, and kali patterns.',
      'Improve creativity and design skills in garment making.',
      'Gain practical experience to undertake custom tailoring and boutique work.',
    ],
    modules: [
      { name: 'Module 1 – Advanced Tailoring Introduction & Hand Embroidery', week: 'Week 1', objective: 'Understand advanced tailoring tools and practise hand embroidery stitches.', days: ['Introduction to advanced tailoring & tools', 'Hand Embroidery – Chain Stitch', 'Hand Embroidery – Back Stitch', 'Hand Embroidery – Knot Stitch', 'Double Chain & Fish Bone Work'], weeklyTask: 'Practise chain, back, knot stitch, double chain and fish bone embroidery' },
      { name: 'Module 2 – Pallu Designs', week: 'Week 2', objective: 'Create attractive pallu designs using different tassel styles and materials.', days: ['Pallu Designs – Introduction', 'Single Tassel Design', 'Double Tassel Design', 'Tassel with Different Materials', 'Pallu Design Practical'], weeklyTask: 'Complete pallu designs using single and double tassels with different materials' },
      { name: 'Module 3 – Fabric Painting', week: 'Week 3', objective: 'Apply fabric painting techniques using colour mixing and different design styles.', days: ['Fabric Painting – Basics', 'Colour Mixing & Different Shades', 'Fabric Painting – Floral Designs', 'Fabric Painting – Motifs', 'Fabric Painting Practical'], weeklyTask: 'Complete floral and motif fabric painting designs' },
      { name: 'Module 4 – Elastic Frock', week: 'Week 4', objective: 'Construct a complete elastic frock from measurements to final finishing.', days: ['Elastic Frock – Measurements', 'Elastic Frock – Cutting', 'Elastic Frock – Stitching', 'Elastic Frock – Finishing', 'Elastic Frock Practical'], weeklyTask: 'Complete an elastic frock from measurements to finishing' },
      { name: 'Module 5 – Steps Frock', week: 'Week 5', objective: 'Draft, cut and stitch a steps frock with frills and finishing.', days: ['Steps Frock – Measurements & Drafting', 'Steps Frock – Cutting', 'Steps Frock – Stitching', 'Steps Frock – Frills/Steps', 'Steps Frock Finishing'], weeklyTask: 'Complete a steps frock with frills and proper finishing' },
      { name: 'Module 6 – Umbrella Frock', week: 'Week 6', objective: 'Draft, cut and stitch an umbrella frock with proper finishing.', days: ['Umbrella Frock – Measurements', 'Umbrella Frock – Drafting', 'Umbrella Frock – Cutting', 'Umbrella Frock – Stitching', 'Umbrella Frock Finishing'], weeklyTask: 'Complete an umbrella frock from drafting to finishing' },
      { name: 'Module 7 – Designer Dress Techniques', week: 'Week 7', objective: 'Apply designer dress techniques including piping, front opening, kali patterns and collar/zip attachment.', days: ['Designer Dress – Piping', 'Front Open Designer Dress', 'Kali Dress', 'Collar & Zip Attachment', 'Designer Dress Practical'], weeklyTask: 'Complete a designer dress using piping, collar and zip techniques' },
      { name: 'Module 8 – Six-Piece Kali Dress & Patiala Paizama', week: 'Week 8', objective: 'Draft, cut and stitch a six-piece kali dress and patiala paizama.', days: ['Six-Piece Kali Dress – Drafting', 'Six-Piece Kali – Cutting', 'Six-Piece Kali – Stitching', 'Patiala Paizama – Cutting', 'Patiala Paizama – Stitching'], weeklyTask: 'Complete six-piece kali dress and patiala paizama' },
      { name: 'Module 9 – Designer Blouse Styles', week: 'Week 9', objective: 'Stitch different designer blouse styles including boat neck, frills cut and back open blouse.', days: ['Designer Blouse – Boat Neck', 'Designer Blouse – Frills Cut', 'Back Open Blouse', 'Blouse Work & Embellishment', 'Different Border Stitching'], weeklyTask: 'Complete boat neck blouse, frills cut blouse and back open blouse with embellishments' },
      { name: 'Module 10 – High Neck Blouse', week: 'Week 10', objective: 'Take measurements, draft, cut and stitch a high neck blouse to professional finish.', days: ['High Neck Blouse – Measurements', 'High Neck – Drafting', 'High Neck – Cutting', 'High Neck – Stitching', 'High Neck Finishing'], weeklyTask: 'Complete a high neck blouse from measurements to finishing' },
      { name: 'Module 11 – Double Katora Blouse', week: 'Week 11', objective: 'Construct a double katora blouse through drafting, cutting, stitching and finishing.', days: ['Double Katora – Introduction', 'Double Katora – Measurements', 'Double Katora – Drafting & Cutting', 'Double Katora – Stitching', 'Double Katora Finishing'], weeklyTask: 'Complete a double katora blouse from introduction to finishing' },
      { name: 'Module 12 – Star Neck Blouse & Final Assessment', week: 'Week 12', objective: 'Stitch a star neck blouse and complete a final designer project with assessment.', days: ['Star Neck Blouse – Drafting', 'Star Neck – Cutting', 'Star Neck – Stitching', 'Final Designer Blouse/Frock Practical', 'Final Project, Finishing & Assessment'], weeklyTask: 'Complete star neck blouse and present final designer project for assessment' },
    ],
    assessmentPlan: [
      { item: 'Weekly Activities', weight: '10%' },
      { item: 'Practical Exercises', weight: '40%' },
      { item: 'Assignments', weight: '10%' },
      { item: 'Designer Garment Projects', weight: '15%' },
      { item: 'Final Written Examination', weight: '25%' },
    ],
    outcomes: [
      'Perform different types of hand embroidery: chain stitch, back stitch, knot stitch, double chain and fishbone.',
      'Create attractive pallu designs using different tassel styles and materials.',
      'Apply fabric painting techniques using different shades and colour combinations.',
      'Stitch elastic frocks, steps frocks and umbrella frocks.',
      'Design and stitch designer dresses with piping, front openings, collars, zips and kali patterns.',
      'Stitch different designer blouse styles with embellishments and decorative borders.',
      'Take accurate measurements and prepare suitable patterns for advanced garments.',
      'Improve finishing, fitting and decorative skills in garment making.',
      'Develop creativity in dress designing and customization for customer requirements.',
      'Develop the confidence and practical skills for tailoring work, home-based orders or a small-scale tailoring business.',
    ],
  },

  'Tailoring – Maggam Work': {
    meta: { title: 'Tailoring – Maggam Work Course', institution: 'Asha Jyothi Employable Skills – Alwal Branch', creditHours: '240 Hours', duration: '13 Weeks', daysPerWeek: '5 Days' },
    description: 'This course provides learners with comprehensive Maggam embroidery skills, from basic needle handling and chain stitching through to advanced techniques including mirror work, Pani work, Chamki work and Dardozi work. Students develop the creativity and accuracy needed to decorate blouses, sarees, dresses and other garments for self-employment and boutique orders.',
    courseObjectives: [
      'Learn basic and advanced Maggam embroidery techniques.',
      'Develop skills in chain stitch, long and short stitch, Pani work, Chamki work, and Dardozi work.',
      'Create beautiful neck designs, floral motifs, leaf designs, mirror work, and decorative patterns.',
      'Improve hand embroidery, needle handling, and design accuracy.',
      'Develop creativity and confidence in designing blouses, sarees, dresses, and other garments.',
      'Gain practical skills for self-employment, tailoring businesses, and professional embroidery work.',
      'Prepare students to take custom orders and earn income through Maggam work.',
    ],
    modules: [
      { name: 'Module 1 – Introduction to Maggam Work & Needle Practice', week: 'Week 1', objective: 'Understand Maggam tools and materials and practise basic needle techniques.', days: ['Introduction to Maggam Work & Tools', 'Needle Practice – Basics', 'Needle Practice – Straight Lines', 'Needle Practice – Curves & Shapes', 'Needle Practice – Practice Design'], weeklyTask: 'Complete needle practice on straight lines, curves and a basic design' },
      { name: 'Module 2 – Single Thread Chain Stitch', week: 'Week 2', objective: 'Master single thread chain stitch for basic patterns and floral designs.', days: ['Single Thread Chain Stitch – Introduction', 'Chain Stitch – Basic Practice', 'Chain Stitch – Curved Patterns', 'Chain Stitch – Floral Designs', 'Single Thread Chain Stitch – Design Practice'], weeklyTask: 'Complete a floral design using single thread chain stitch' },
      { name: 'Module 3 – Double Thread Chain Stitch', week: 'Week 3', objective: 'Apply double thread chain stitch to motifs and design patterns.', days: ['Double Thread Chain Stitch – Introduction', 'Double Thread Chain Stitch – Practice', 'Double Thread Chain Stitch – Curves', 'Double Thread Chain Stitch – Motifs', 'Double Thread Chain Stitch – Design Practice'], weeklyTask: 'Complete a motif design using double thread chain stitch' },
      { name: 'Module 4 – Long & Short Stitch', week: 'Week 4', objective: 'Use long and short stitch with shading for floral and leaf designs.', days: ['Long & Short Stitch – Introduction', 'Long & Short Stitch – Basic Practice', 'Shading Techniques', 'Floral & Leaf Designs', 'Long & Short Stitch – Complete Design'], weeklyTask: 'Complete a shaded floral and leaf design using long and short stitch' },
      { name: 'Module 5 – Neck Loading', week: 'Week 5', objective: 'Create attractive neckline and decorative neck loading designs.', days: ['Neck Loading – Introduction', 'Neck Loading – Basic Pattern', 'Neckline Design Practice', 'Decorative Neck Designs', 'Complete Neck Loading Design'], weeklyTask: 'Complete a full decorative neck loading design' },
      { name: 'Module 6 – Pearl Loading', week: 'Week 6', objective: 'Apply pearl loading techniques for single and multiple pearl decorative patterns.', days: ['Pearl Loading – Introduction', 'Pearl Placement Techniques', 'Single Pearl Designs', 'Multiple Pearl Patterns', 'Pearl Loading – Complete Design'], weeklyTask: 'Complete a pearl loading design with single and multiple pearl patterns' },
      { name: 'Module 7 – Leaf Loading', week: 'Week 7', objective: 'Create leaf loading designs and combine with floral patterns.', days: ['Leaf Loading – Introduction', 'Leaf Shapes & Patterns', 'Leaf Loading Practice', 'Floral & Leaf Combination', 'Complete Leaf Loading Design'], weeklyTask: 'Complete a leaf loading design with a floral combination' },
      { name: 'Module 8 – Mirror Work', week: 'Week 8', objective: 'Apply mirror fixing techniques for leaf, floral and decorative mirror work designs.', days: ['Mirror Work – Introduction', 'Mirror Fixing Techniques', 'Leaf & Mirror Combination', 'Floral Mirror Work', 'Complete Mirror Work Design'], weeklyTask: 'Complete a floral mirror work design' },
      { name: 'Module 9 – Pani Work', week: 'Week 9', objective: 'Create Pani work designs including floral and motif patterns.', days: ['Pani Work – Introduction', 'Basic Pani Work Practice', 'Floral Pani Designs', 'Pani Work Motifs', 'Complete Pani Work Design'], weeklyTask: 'Complete a Pani work design with floral and motif elements' },
      { name: 'Module 10 – Chamki Work', week: 'Week 10', objective: 'Apply Chamki fixing techniques for floral and decorative Chamki patterns.', days: ['Chamki Work – Introduction', 'Chamki Fixing Techniques', 'Basic Chamki Patterns', 'Floral & Decorative Chamki Work', 'Complete Chamki Design'], weeklyTask: 'Complete a floral Chamki work design' },
      { name: 'Module 11 – Dardozi Work', week: 'Week 11', objective: 'Learn Dardozi techniques and create Dardozi motifs and border designs.', days: ['Dardozi Work – Introduction', 'Basic Dardozi Techniques', 'Dardozi Motifs', 'Floral Dardozi Designs', 'Dardozi Border Design'], weeklyTask: 'Complete a Dardozi motif and border design' },
      { name: 'Module 12 – Advanced Combination Designs', week: 'Week 12', objective: 'Combine multiple Maggam work techniques to create designer patterns.', days: ['Dardozi – Advanced Designs', 'Combination of Dardozi & Chamki', 'Combination of Pani & Mirror Work', 'Combination of Pearl & Leaf Work', 'Designer Maggam Motif'], weeklyTask: 'Create a designer Maggam motif combining multiple techniques' },
      { name: 'Module 13 – Final Design & Assessment', week: 'Week 13', objective: 'Plan, execute and present a final Maggam work design for practical assessment.', days: ['Final Design Selection & Planning', 'Final Maggam Design – Practice', 'Final Design – Main Work', 'Finishing & Corrections', 'Final Project & Practical Assessment'], weeklyTask: 'Complete and present a final Maggam work design for assessment' },
    ],
    assessmentPlan: [
      { item: 'Weekly Activities', weight: '10%' },
      { item: 'Practical Exercises', weight: '40%' },
      { item: 'Assignments', weight: '10%' },
      { item: 'Different Styles & Techniques', weight: '15%' },
      { item: 'Final Written Examination', weight: '25%' },
    ],
    outcomes: [
      'Demonstrate proper needle handling and basic embroidery techniques.',
      'Perform single-thread and double-thread chain stitches.',
      'Apply long and short stitch techniques to create neat designs.',
      'Create attractive neck-loading and decorative embroidery designs.',
      'Perform pearl loading and leaf-loading techniques.',
      'Apply mirror work, Pani work, Chamki work, and Dardozi work.',
      'Combine different Maggam Work techniques to create designer patterns.',
      'Complete Maggam Work designs with neatness, accuracy, and creativity.',
      'Develop skills to decorate sarees, blouses, dresses, and other garments.',
      'Gain confidence to undertake small-scale Maggam Work orders and explore self-employment opportunities.',
    ],
  },

  'Refrigeration & AC Technician': {
    meta: { title: 'Refrigeration & Air Conditioning Technician', institution: 'Asha Jyothi Employable Skills – Medchal Branch', creditHours: '240 Hours' },
    description: 'This course equips learners with the knowledge and practical skills required to safely install, maintain, diagnose, troubleshoot, and repair Refrigeration and Air Conditioning systems. The course covers the fundamentals of electrical safety, electronic components, measuring instruments, refrigerators, air conditioners, compressors, and refrigerants. Students will learn systematic fault diagnosis, root cause analysis, preventive maintenance, customer service, and professional repair practices through theory and extensive hands-on laboratory activities. Upon completion, learners will be prepared for entry-level employment or self-employment in Refrigeration & Air Conditioning.',
    courseObjectives: [
      'Explain the fundamentals of Refrigeration & Air Conditioner operation.',
      'Follow electrical and electronic safety procedures while servicing appliances.',
      'Identify electronic components and explain their functions.',
      'Safely use electrical and electronic tools and measuring instruments.',
      'Read basic wiring diagrams and electronic circuit diagrams.',
      'Service and repair refrigerators.',
      'Service and repair air conditioners.',
      'Perform basic maintenance of refrigerators.',
      'Perform basic maintenance of air conditioners.',
      'Diagnose appliance faults using systematic troubleshooting techniques.',
      'Identify the root cause of appliance failures.',
      'Recommend and implement suitable repair solutions.',
      'Perform preventive maintenance to improve appliance life.',
      'Demonstrate professionalism, customer communication, and documentation skills.',
    ],
    modules: [
      { name: 'Module 1 – Safety Precautions', week: 'Week 1 (Sep 21st – Sep 25th)', days: ['Electronic Hazards (explosion risk, radiation exposure)', 'Personal Protective Equipment (PPE)', 'Fire Safety, First Aid for Electric Shock', 'Safe Handling of Appliances, Safe Use of Test Equipment', 'Activity – Safety Inspection / Quiz'] },
      { name: 'Module 2 – Fundamentals of Electronics', week: 'Week 2 (Sep 29th – Oct 2nd)', days: ['Electricity Review – Voltage, Current, Resistance', "Ohm's Law", 'Power Calculations, PCB Basics', 'AC and DC, Electronic Components'] },
      { name: 'Module 3 – Tools and Measuring Instruments', week: 'Week 3 (Oct 5th – Oct 9th)', days: ['Introduction to Hand Tools, Wire Preparation Tools', 'Soldering Techniques, Insulation Testing, Circuit Testing', 'Electrical, Temperature & Current Measures', 'Measure AC/DC Current Safely – Hands-on Practice', 'Activity – Wiring, Testing, Soldering & Measurement'] },
      { name: 'Module 4 – Refrigerator', week: 'Weeks 4–5 (Oct 12th – Oct 23rd)', days: ['Introduction to Refrigeration Systems & Classification', 'Types of Refrigerators and Their Applications', 'Domestic Refrigeration Technology', 'Commercial Refrigeration Systems', 'Activity – Identification of Different Refrigerators', 'Cold Room and Cooling Chamber Refrigeration', 'Cold Storage Refrigeration Systems', 'Automotive and Mobile Refrigeration Systems', 'Industrial Refrigeration Applications', 'Group Presentation & Comparison Chart'] },
      { name: 'Module 5 – Compressor', week: 'Weeks 6–8 (Oct 26th – Nov 13th)', days: ['Introduction to Compressors & Working Principle', 'Hermetic Compressors – Construction & Applications', 'Semi-Hermetic Compressors – Construction & Applications', 'Open-Type Compressors – Working Principle & Applications', 'Activity – Videos & Comparison of Compressor Types', 'Rotary Compressors – Principle & Advantages', 'Reciprocating Compressors – Operation & Limitations', 'BLDC Compressors – Technology & Energy Efficiency', 'Inverter Compressors – Technology & Benefits', 'Activity – Compare BLDC with Conventional Compressors', 'Comparison of All Compressor Types', 'Practical Demonstration & Review', 'Practical and Viva Assessment'] },
      { name: 'Module 6 – Refrigerants (Gases)', week: 'Week 9 (Nov 16th – Nov 20th)', days: ['Introduction to Refrigerants, R-12 (CFC Refrigerant)', 'R-22 (HCFC), R-32 (HFC)', 'R-134a (HFC), R-290 (Propane)', 'R-600a (Isobutane), R-190 (Ethane)', 'Case Study on Different Refrigerants'] },
      { name: 'Module 7 – Air Conditioners', week: 'Weeks 10–12 (Nov 23rd – Dec 11th)', days: ['Definition, Components & Diagram of Air Conditioning', 'Compressor Types, Condenser, Evaporator, Expansion Valve', 'Study AC Parts & Components – Demo Practical', 'Types of AC and Applications', 'Dismantle/Reassemble Portable, Split, Window AC', 'Advanced AC Types & Testing Tools', 'Dismantle/Reassemble Floor, Smart, Hybrid AC', 'Activity – Identify AC Types, Use Tools Safely', 'Component Testing, Refrigerant Charging, Leak Detection', 'Tube Bending, Bracing & Pinching', 'Perform Testing Procedures on Components', 'Activity – Diagnose Compressor Faults & Service Project'] },
      { name: 'Module 8 – Repair and Maintenance', week: 'Week 13 (Dec 14th – Dec 18th)', days: ['General Problems – Compressor Faults & Remedies', 'Identify & Rectify No Air Flow / Compressor Run Issues', 'Compressor Will Not Start but Condenser Fan Runs', 'Practice of Bending a Refrigerant Flow Tube', 'Repair and Document Faults'] },
      { name: 'Module 9 – Fault Diagnosis and Troubleshooting', week: 'Week 14 (Dec 22nd – Dec 30th)', days: ['Refrigerant Leak Detection & Prevention Methods', 'Fault Diagnosis Exercises', 'Troubleshoot & Testing of Evaporator', 'Practical Assessment', 'Record Writing & Preparing for Final Exam'] },
    ],
    teachingMethods: ['Interactive lectures', 'Demonstrations', 'Hands-on laboratory practice', 'Appliance disassembly and reassembly', 'Troubleshooting workshops', 'Case studies', 'Group discussions', 'Project-based learning', 'Industry guest lectures (optional)'],
    assessmentPlan: [
      { item: 'Weekly Activities', weight: '10%' },
      { item: 'Practical Laboratory Exercises', weight: '40%' },
      { item: 'Assignments', weight: '10%' },
      { item: 'Troubleshooting & Maintenance Project', weight: '15%' },
      { item: 'Final Written Examination', weight: '25%' },
    ],
    outcomes: [
      'Apply workplace safety standards.',
      'Identify electronic components and appliance parts.',
      'Use diagnostic tools correctly.',
      'Replace defective components safely.',
      'Interpret service manuals and wiring diagrams.',
      'Troubleshoot electrical and electronic faults.',
      'Perform preventive maintenance.',
      'Document repair procedures.',
      'Demonstrate professional service skills.',
    ],
  },
};

// ── COURSE OUTLINE VIEW ────────────────────────────────────────────
function loadOutlineLocally(course) {
  try {
    const stored = JSON.parse(localStorage.getItem(`aj-outline-${course}`));
    // Accept only the new rich-object format; discard legacy flat arrays
    if (stored && !Array.isArray(stored) && (stored.meta || stored.modules)) return stored;
    return JSON.parse(JSON.stringify(FULL_COURSE_OUTLINES[course] || {}));
  } catch {
    return JSON.parse(JSON.stringify(FULL_COURSE_OUTLINES[course] || {}));
  }
}

function saveOutlineLocally() {
  localStorage.setItem(`aj-outline-${currentCourse}`, JSON.stringify(courseOutline));
}

function initCourseOutlineView() {
  renderOutline();
}

function renderOutline() {
  const body = document.getElementById('co-body');
  body.innerHTML = '';
  const d = courseOutline;

  body.appendChild(coHeaderCard(d));
  if (d.objective)        body.appendChild(coTextCard('Course Objective', d.objective,        v => { d.objective = v; saveOutlineLocally(); }));
  if (d.description)      body.appendChild(coTextCard('Course Description', d.description,    v => { d.description = v; saveOutlineLocally(); }));
  if (d.courseObjectives) body.appendChild(coListCard('Course Objectives', d.courseObjectives, (i,v) => { d.courseObjectives[i] = v; saveOutlineLocally(); }));
  if (d.dailyFlow)        body.appendChild(coListCard('Daily Flow', d.dailyFlow,               (i,v) => { d.dailyFlow[i] = v; saveOutlineLocally(); }));

  if (d.modules) {
    const grp = coGroupWrap('Course Modules');
    d.modules.forEach((mod, mi) => grp.appendChild(coModuleCard(mod, mi)));
    body.appendChild(grp);
  }

  if (d.extraWeeks) {
    const grp = coGroupWrap('Additional Weeks');
    d.extraWeeks.forEach(wk => grp.appendChild(coExtraWeekCard(wk)));
    body.appendChild(grp);
  }

  if (d.teachingMethods) body.appendChild(coListCard('Teaching Methods', d.teachingMethods, (i,v) => { d.teachingMethods[i] = v; saveOutlineLocally(); }));
  if (d.assessmentPlan)  body.appendChild(coAssessmentCard(d));
  if (d.outcomes)        body.appendChild(coListCard('Program Outcomes', d.outcomes,          (i,v) => { d.outcomes[i] = v; saveOutlineLocally(); }));
}

// ── Outline card helpers ───────────────────────────────────────────

function coGroupWrap(title) {
  const wrap = document.createElement('div');
  wrap.className = 'co-section-group';
  const hd = document.createElement('div');
  hd.className = 'co-section-group-title';
  hd.textContent = title;
  wrap.appendChild(hd);
  return wrap;
}

function coHeaderCard(d) {
  const card = document.createElement('div');
  card.className = 'co-card co-header-card';

  const titleEl = document.createElement('div');
  titleEl.className   = 'co-card-title co-editable';
  titleEl.textContent = d.meta.title || '';
  makeInlineEditable(titleEl, v => { d.meta.title = v; saveOutlineLocally(); });
  card.appendChild(titleEl);

  const grid = document.createElement('div');
  grid.className = 'co-meta-grid';
  Object.entries(d.meta).filter(([k]) => k !== 'title').forEach(([key, val]) => {
    const row = document.createElement('div');
    row.className = 'co-meta-row';
    const lbl = document.createElement('span');
    lbl.className   = 'co-meta-key';
    lbl.textContent = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
    const valEl = document.createElement('span');
    valEl.className   = 'co-editable co-meta-val';
    valEl.textContent = val;
    makeInlineEditable(valEl, v => { d.meta[key] = v; saveOutlineLocally(); });
    row.appendChild(lbl);
    row.appendChild(valEl);
    grid.appendChild(row);
  });
  card.appendChild(grid);
  return card;
}

function coTextCard(label, text, onSave) {
  const card = document.createElement('div');
  card.className = 'co-card';
  const lbl = document.createElement('div');
  lbl.className   = 'co-card-label';
  lbl.textContent = label;
  const el = document.createElement('div');
  el.className   = 'co-editable co-paragraph';
  el.textContent = text;
  makeBlockEditable(el, onSave);
  card.appendChild(lbl);
  card.appendChild(el);
  return card;
}

function coListCard(label, items, onSave) {
  const card = document.createElement('div');
  card.className = 'co-card';
  const lbl = document.createElement('div');
  lbl.className   = 'co-card-label';
  lbl.textContent = label;
  const list = document.createElement('div');
  list.className = 'co-list';
  items.forEach((item, i) => {
    const row = document.createElement('div');
    row.className = 'co-list-row';
    const bullet = document.createElement('span');
    bullet.className   = 'co-list-bullet';
    bullet.textContent = '•';
    const el = document.createElement('span');
    el.className   = 'co-editable co-list-text';
    el.textContent = item;
    makeInlineEditable(el, v => onSave(i, v));
    row.appendChild(bullet);
    row.appendChild(el);
    list.appendChild(row);
  });
  card.appendChild(lbl);
  card.appendChild(list);
  return card;
}

function coModuleCard(mod, mi) {
  const color = PALETTE[mi % PALETTE.length];
  const card  = document.createElement('div');
  card.className = 'co-module';

  // Header
  const header = document.createElement('div');
  header.className = 'co-module-header';
  header.style.setProperty('--module-color', color);

  const num = document.createElement('span');
  num.className   = 'co-module-num';
  num.textContent = `M${mi + 1}`;

  const nameEl = document.createElement('span');
  nameEl.className   = 'co-editable';
  nameEl.textContent = mod.name;
  makeInlineEditable(nameEl, v => { mod.name = v; saveOutlineLocally(); });

  header.appendChild(num);
  header.appendChild(nameEl);

  if (mod.week !== undefined) {
    const weekEl = document.createElement('span');
    weekEl.className   = 'co-module-week co-editable';
    weekEl.textContent = mod.week;
    makeInlineEditable(weekEl, v => { mod.week = v; saveOutlineLocally(); });
    header.appendChild(weekEl);
  }
  card.appendChild(header);

  // Body
  const body = document.createElement('div');
  body.className = 'co-module-body';

  if (mod.objective !== undefined) {
    body.appendChild(coModuleField('Objective', mod.objective, false, v => { mod.objective = v; saveOutlineLocally(); }));
  }

  // Day rows
  const daysDiv = document.createElement('div');
  daysDiv.className = 'co-topics';
  mod.days.forEach((day, di) => {
    const row = document.createElement('div');
    row.className = 'co-topic-row';
    const lbl = document.createElement('span');
    lbl.className   = 'co-day-label';
    lbl.textContent = `Day ${di + 1}`;
    const el = document.createElement('span');
    el.className   = 'co-editable';
    el.textContent = day;
    makeInlineEditable(el, v => { mod.days[di] = v; saveOutlineLocally(); });
    row.appendChild(lbl);
    row.appendChild(el);
    daysDiv.appendChild(row);
  });
  body.appendChild(daysDiv);

  if (mod.weeklyTask !== undefined) {
    body.appendChild(coModuleField('Weekly Task', mod.weeklyTask || '—', 'task', v => { mod.weeklyTask = v; saveOutlineLocally(); }));
  }
  if (mod.assessment !== undefined) {
    body.appendChild(coModuleField('Assessment', mod.assessment, 'assessment', v => { mod.assessment = v; saveOutlineLocally(); }));
  }

  card.appendChild(body);
  return card;
}

function coModuleField(labelText, value, variant, onSave) {
  const row = document.createElement('div');
  row.className = 'co-module-field' + (variant ? ` co-module-${variant}` : '');
  const lbl = document.createElement('span');
  lbl.className   = 'co-field-label';
  lbl.textContent = labelText;
  const el = document.createElement('span');
  el.className   = 'co-editable co-field-text';
  el.textContent = value;
  makeInlineEditable(el, onSave);
  row.appendChild(lbl);
  row.appendChild(el);
  return row;
}

function coExtraWeekCard(wk) {
  const card = document.createElement('div');
  card.className = 'co-module';
  const header = document.createElement('div');
  header.className = 'co-module-header';
  header.style.setProperty('--module-color', '#78716c');
  const lbl = document.createElement('span');
  lbl.className   = 'co-editable';
  lbl.style.padding = '12px 14px';
  lbl.textContent = wk.label;
  makeInlineEditable(lbl, v => { wk.label = v; saveOutlineLocally(); });
  header.appendChild(lbl);
  card.appendChild(header);
  const daysDiv = document.createElement('div');
  daysDiv.className = 'co-topics';
  wk.items.forEach((item, i) => {
    const row = document.createElement('div');
    row.className = 'co-topic-row';
    const dl = document.createElement('span');
    dl.className = 'co-day-label';
    dl.textContent = `Day ${i + 1}`;
    const el = document.createElement('span');
    el.className   = 'co-editable';
    el.textContent = item;
    makeInlineEditable(el, v => { wk.items[i] = v; saveOutlineLocally(); });
    row.appendChild(dl);
    row.appendChild(el);
    daysDiv.appendChild(row);
  });
  card.appendChild(daysDiv);
  return card;
}

function coAssessmentCard(d) {
  const card = document.createElement('div');
  card.className = 'co-card';
  const lbl = document.createElement('div');
  lbl.className   = 'co-card-label';
  lbl.textContent = 'Assessment Plan';
  const table = document.createElement('div');
  table.className = 'co-assessment-table';
  d.assessmentPlan.forEach(row => {
    const rowEl = document.createElement('div');
    rowEl.className = 'co-assessment-row';
    const itemEl = document.createElement('span');
    itemEl.className   = 'co-editable co-assessment-item';
    itemEl.textContent = row.item;
    makeInlineEditable(itemEl, v => { row.item = v; saveOutlineLocally(); });
    const wtEl = document.createElement('span');
    wtEl.className   = 'co-editable co-assessment-weight';
    wtEl.textContent = row.weight;
    makeInlineEditable(wtEl, v => { row.weight = v; saveOutlineLocally(); });
    rowEl.appendChild(itemEl);
    rowEl.appendChild(wtEl);
    table.appendChild(rowEl);
  });
  card.appendChild(lbl);
  card.appendChild(table);
  return card;
}

// ── Inline (single-line) editing ──────────────────────────────────
function makeInlineEditable(el, onSave) {
  el.addEventListener('click', () => {
    if (el.dataset.editing === 'true') return;
    el.dataset.editing = 'true';

    const original = el.textContent;
    const input    = document.createElement('input');
    input.type      = 'text';
    input.value     = original;
    input.className = 'co-edit-input';

    el.textContent = '';
    el.appendChild(input);
    input.focus();
    input.select();

    const commit = () => {
      const val = input.value.trim() || original;
      el.dataset.editing = '';
      el.textContent = val;
      if (val !== original) onSave(val);
    };

    input.addEventListener('blur', commit);
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter')  { e.preventDefault(); commit(); }
      if (e.key === 'Escape') { el.dataset.editing = ''; el.textContent = original; }
    });
  });
}

// ── Block (multi-line) editing ────────────────────────────────────
function makeBlockEditable(el, onSave) {
  el.addEventListener('click', () => {
    if (el.dataset.editing === 'true') return;
    el.dataset.editing = 'true';

    const original = el.textContent.trim();
    const ta = document.createElement('textarea');
    ta.value     = original;
    ta.className = 'co-edit-textarea';
    el.textContent = '';
    el.appendChild(ta);
    ta.style.height = Math.max(80, ta.scrollHeight) + 'px';
    ta.focus();

    const commit = () => {
      const val = ta.value.trim() || original;
      el.dataset.editing = '';
      el.textContent = val;
      if (val !== original) onSave(val);
    };

    ta.addEventListener('blur', commit);
    ta.addEventListener('input', () => { ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 'px'; });
    ta.addEventListener('keydown', e => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); commit(); }
      if (e.key === 'Escape') { el.dataset.editing = ''; el.textContent = original; }
    });
  });
}

document.getElementById('co-reset-btn').addEventListener('click', () => {
  if (!confirm(`Reset the "${currentCourse}" outline to the original document content? All edits will be lost.`)) return;
  courseOutline = JSON.parse(JSON.stringify(FULL_COURSE_OUTLINES[currentCourse] || {}));
  saveOutlineLocally();
  renderOutline();
});

// ── LESSON PLAN VIEW ───────────────────────────────────────────────
function initLessonPlanView() {
  editingPlanId = null;

  const modules = FALLBACK_CURRICULUM[currentCourse] || [];
  const sel = document.getElementById('lp-module-select');
  sel.innerHTML = '<option value="">— Choose module —</option>';
  modules.forEach(({ lesson }) => {
    const opt = document.createElement('option');
    opt.value = lesson;
    opt.textContent = lesson;
    sel.appendChild(opt);
  });

  document.getElementById('lp-topic-select').innerHTML = '<option value="">— Choose topic —</option>';
  document.getElementById('lp-placeholder').classList.remove('hidden');
  document.getElementById('lp-form').classList.add('hidden');
  renderPlansList();
}

document.getElementById('lp-module-select').addEventListener('change', () => {
  const lesson = document.getElementById('lp-module-select').value;
  const topSel = document.getElementById('lp-topic-select');
  topSel.innerHTML = '<option value="">— Choose topic —</option>';

  if (lesson) {
    const mod = (FALLBACK_CURRICULUM[currentCourse] || []).find(m => m.lesson === lesson);
    (mod?.topics || []).forEach(t => {
      const opt = document.createElement('option');
      opt.value = t; opt.textContent = t;
      topSel.appendChild(opt);
    });
  }

  document.getElementById('lp-placeholder').classList.remove('hidden');
  document.getElementById('lp-form').classList.add('hidden');
});

document.getElementById('lp-topic-select').addEventListener('change', () => {
  const module = document.getElementById('lp-module-select').value;
  const topic  = document.getElementById('lp-topic-select').value;
  if (module && topic) openLessonPlanEditor(module, topic);
});

function openLessonPlanEditor(module, topic) {
  const existing = lessonPlans.find(p => p.module === module && p.topic === topic && p.course === currentCourse);
  editingPlanId  = existing ? existing.id : null;

  document.getElementById('lp-breadcrumb').textContent = `${module}  ›  ${topic}`;
  document.getElementById('lp-theory').value       = existing?.theory       || '';
  document.getElementById('lp-practicals').value   = existing?.practicals   || '';
  document.getElementById('lp-assessments').value  = existing?.assessments  || '';

  document.getElementById('lp-placeholder').classList.add('hidden');
  document.getElementById('lp-form').classList.remove('hidden');

  // Highlight active plan in sidebar
  document.querySelectorAll('.lp-plan-item').forEach(el => {
    el.classList.toggle('active', el.dataset.id === editingPlanId);
  });
}

document.getElementById('lp-save-btn').addEventListener('click', () => {
  const module      = document.getElementById('lp-module-select').value;
  const topic       = document.getElementById('lp-topic-select').value;
  const theory      = document.getElementById('lp-theory').value.trim();
  const practicals  = document.getElementById('lp-practicals').value.trim();
  const assessments = document.getElementById('lp-assessments').value.trim();
  if (!module || !topic) return;

  const existing = lessonPlans.find(p => p.id === editingPlanId ||
    (p.module === module && p.topic === topic && p.course === currentCourse));

  if (existing) {
    existing.theory       = theory;
    existing.practicals   = practicals;
    existing.assessments  = assessments;
    existing.updatedAt    = Date.now();
    editingPlanId = existing.id;
  } else {
    const plan = { id: makeId(), course: currentCourse, module, topic, theory, practicals, assessments, updatedAt: Date.now() };
    lessonPlans.push(plan);
    editingPlanId = plan.id;
  }

  savePlansLocally();
  renderPlansList();

  const btn = document.getElementById('lp-save-btn');
  btn.textContent = 'Saved ✓';
  btn.style.background = '#10b981';
  setTimeout(() => { btn.textContent = 'Save Plan'; btn.style.background = ''; }, 2000);

  if (SCRIPT_URL) {
    fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'saveLessonPlan', id: editingPlanId,
        course: currentCourse, module, topic, theory, practicals, assessments }),
    }).catch(console.warn);
  }
});

function renderPlansList() {
  const list  = document.getElementById('lp-plans-list');
  const plans = lessonPlans.filter(p => p.course === currentCourse);

  if (!plans.length) {
    list.innerHTML = '<p class="loading-text">No saved plans yet.</p>';
    return;
  }

  // Group by module
  const byModule = {};
  plans.forEach(p => {
    if (!byModule[p.module]) byModule[p.module] = [];
    byModule[p.module].push(p);
  });

  list.innerHTML = '';
  Object.entries(byModule).forEach(([module, mPlans]) => {
    const group = document.createElement('div');
    group.className = 'lp-plan-group';

    const header = document.createElement('div');
    header.className   = 'lp-plan-group-header';
    header.textContent = module;
    group.appendChild(header);

    mPlans.forEach(plan => {
      const item  = document.createElement('div');
      item.className  = 'lp-plan-item';
      item.dataset.id = plan.id;
      if (plan.id === editingPlanId) item.classList.add('active');

      const label = document.createElement('span');
      label.className   = 'lp-plan-item-label';
      label.textContent = plan.topic;

      const del = document.createElement('button');
      del.className   = 'lp-plan-item-del';
      del.textContent = '×';
      del.title       = 'Delete plan';
      del.addEventListener('click', e => { e.stopPropagation(); deleteLessonPlan(plan.id); });

      item.appendChild(label);
      item.appendChild(del);
      item.addEventListener('click', () => {
        // Set dropdowns to match this plan
        const modSel = document.getElementById('lp-module-select');
        modSel.value = plan.module;
        modSel.dispatchEvent(new Event('change'));
        // Topic select is populated async by the change handler — set after microtask
        setTimeout(() => {
          document.getElementById('lp-topic-select').value = plan.topic;
          openLessonPlanEditor(plan.module, plan.topic);
        }, 0);
      });

      group.appendChild(item);
    });

    list.appendChild(group);
  });
}

function deleteLessonPlan(id) {
  lessonPlans = lessonPlans.filter(p => p.id !== id);
  savePlansLocally();
  renderPlansList();
  if (editingPlanId === id) {
    editingPlanId = null;
    document.getElementById('lp-placeholder').classList.remove('hidden');
    document.getElementById('lp-form').classList.add('hidden');
  }
  if (SCRIPT_URL) {
    fetch(SCRIPT_URL, { method: 'POST',
      body: JSON.stringify({ action: 'deleteLessonPlan', id, course: currentCourse }),
    }).catch(console.warn);
  }
}

function savePlansLocally() {
  localStorage.setItem(`aj-plans-${currentCourse}`, JSON.stringify(lessonPlans));
}

function loadPlansLocally(course) {
  try { return JSON.parse(localStorage.getItem(`aj-plans-${course}`)) || []; }
  catch { return []; }
}

// ── CURRICULUM (left sidebar) ───────────────────────────────────────
const FALLBACK_CURRICULUM = {
  'Computer – MS-Office': [
    { lesson: 'Introduction to Computers',       topics: ['Introduction to Computers', 'Parts of a Computer', 'Hardware & Software', 'Input & Output Devices', 'Practical: Identify Computer Parts'] },
    { lesson: 'Operating Systems',               topics: ['Operating Systems', 'Windows Desktop', 'Files & Folders', 'File Management', 'Practical: Create, Rename, Copy & Delete Files'] },
    { lesson: 'Keyboard & Mouse',                topics: ['Keyboard & Mouse', 'Typing Practice', 'Internet Basics', 'Email Basics', 'Practical: Internet & Email'] },
    { lesson: 'Introduction to MS Word',         topics: ['Introduction to MS Word', 'Word Interface & Tools', 'Creating & Saving Documents', 'Text Formatting', 'Practical: Simple Document'] },
    { lesson: 'Paragraph Formatting',            topics: ['Paragraph Formatting', 'Bullets & Numbering', 'Page Setup', 'Headers & Footers', 'Practical: Formal Letter'] },
    { lesson: 'Tables in Word',                  topics: ['Tables in Word', 'Images & Shapes', 'WordArt & Text Boxes', 'Page Borders & Watermarks', 'Practical: Create a Notice'] },
    { lesson: 'Introduction to MS Excel',        topics: ['Introduction to MS Excel', 'Workbook & Worksheet', 'Rows, Columns & Cells', 'Data Entry', 'Practical: Student Mark Sheet'] },
    { lesson: 'Basic Formulas',                  topics: ['Basic Formulas', 'SUM, AVERAGE, MIN, MAX', 'COUNT & COUNTA', 'Cell Formatting', 'Practical: Mark Sheet with Formulas'] },
    { lesson: 'Sorting & Filtering',             topics: ['Sorting & Filtering', 'Charts', 'Conditional Formatting', 'Page Setup & Printing', 'Practical: Sales Report'] },
    { lesson: 'Introduction to PowerPoint',      topics: ['Introduction to PowerPoint', 'Creating Slides', 'Slide Layouts', 'Text & Formatting', 'Practical: 5-Slide Presentation'] },
    { lesson: 'Images & Shapes',                 topics: ['Images & Shapes', 'Tables & Charts', 'Transitions', 'Animations', 'Practical: Business Presentation'] },
    { lesson: 'PowerPoint Presentation Skills',  topics: ['PowerPoint Presentation Skills', 'Presentation Design', 'Final Project – Word', 'Final Project – Excel', 'Final Project Presentation'] },
  ],
  'Computer – Desktop Publishing': [
    { lesson: 'Introduction to Desktop Publishing',        topics: ['DTP concepts, applications and design principles', 'Page layout, typography and fonts', 'Colours and images in design', 'Creative text formatting exercise', 'Practical: Create a simple A4 document'] },
    { lesson: 'MS Publisher – Basics',                     topics: ['Publisher interface, templates and page setup', 'Margins, guides and text boxes', 'Guided flyer creation', 'Notice design exercise', 'Practical: Create a simple flyer and notice'] },
    { lesson: 'MS Publisher – Designing',                  topics: ['Text formatting, WordArt and shapes', 'Pictures, tables and backgrounds', 'Business card design', 'Invitation and certificate design', 'Practical: Design a business card, invitation and certificate'] },
    { lesson: 'MS Publisher – Advanced & Project',         topics: ['Master pages, headers/footers and page numbering', 'Printing and export settings', 'Multi-page layout practice', 'Newsletter/brochure design', 'Practical: Create a 4-page newsletter/brochure'] },
    { lesson: 'Adobe Photoshop – Basics',                  topics: ['Photoshop interface, tools and layers', 'Selections, image size, resolution and colour modes', 'Crop, resize and colour correction', 'Photo adjustment exercises', 'Practical: Crop, resize and correct photographs'] },
    { lesson: 'Adobe Photoshop – Editing',                 topics: ['Layers, masks and brushes', 'Text, shapes and adjustment tools', 'Retouching techniques', 'Photo collage creation', 'Practical: Create a photo collage and poster'] },
    { lesson: 'Adobe Photoshop – Design',                  topics: ['Background removal and blending effects', 'Filters and typography in Photoshop', 'Social media poster design', 'Advertisement and event poster design', 'Practical: Design a social media poster, advertisement and event poster'] },
    { lesson: 'Adobe Photoshop – Project',                 topics: ['Advanced composition techniques', 'Image manipulation methods', 'Promotional campaign planning', 'Campaign poster set creation', 'Practical: Create a complete promotional campaign/poster set'] },
    { lesson: 'Canva – Basics',                            topics: ['Canva interface, templates and elements', 'Fonts, colours and layouts', 'Social media post design', 'Presentation creation in Canva', 'Practical: Create social media posts and a presentation'] },
    { lesson: 'Canva – Professional Designs',              topics: ['Brand kit, grids and transparency', 'Animations and photo editing in Canva', 'Brochure and invitation design', 'Poster and social media design set', 'Practical: Create brochure, invitation, poster and social media designs'] },
    { lesson: 'Canva – Cards Designs',                       topics: ['Card design types, layouts and branding', 'School card design in Canva', 'Company brand card design', 'Restaurant menu card design', 'Social media posters and newsletter'] },
    { lesson: 'Final Project – Photoshop, Canva & Publisher', topics: ['Final project planning and design review', 'Professional certificate in MS Publisher', 'Photo collage in Adobe Photoshop', 'Poster making in Canva', 'Final DTP portfolio presentation'] },
  ],
  'Computer – Tally': [
    { lesson: 'Introduction to Tally Prime',               topics: ['Introduction to Tally Prime and accounting basics', 'Install Tally Prime and explore the interface', 'Company creation and configuration', 'Business case: Set up a sample company', 'Revision & assessment'] },
    { lesson: 'Groups, Ledgers and Accounting Masters',    topics: ['Groups and chart of accounts in Tally Prime', 'Creating and editing ledgers', 'Accounting masters setup and opening balances', 'Business case: Create ledgers for a sample business', 'Revision & assessment'] },
    { lesson: 'Accounting Vouchers',                       topics: ['Introduction to accounting vouchers', 'Contra and payment vouchers', 'Receipt and journal vouchers', 'Business case: Enter a complete set of vouchers', 'Revision & assessment'] },
    { lesson: 'Sales & Purchase',                          topics: ['Introduction to sales and purchase in Tally', 'Entering purchase transactions', 'Entering sales transactions and invoices', 'Business case: Process a full set of purchase and sales entries', 'Revision & assessment'] },
    { lesson: 'Credit/Debit Notes',                        topics: ['Understanding credit and debit notes', 'Recording sales returns', 'Recording purchase returns and adjustments', 'Business case: Enter returns for a sample business', 'Revision & assessment'] },
    { lesson: 'Inventory Basics',                          topics: ['Introduction to inventory management in Tally', 'Stock groups, categories and units of measure', 'Creating stock items and opening stock', 'Business case: Set up inventory for a sample shop', 'Revision & assessment'] },
    { lesson: 'Inventory Transactions',                    topics: ['Purchase and sales with inventory', 'Stock transfers between locations', 'Godown management in Tally', 'Business case: Process inventory transactions for a trading company', 'Revision & assessment'] },
    { lesson: 'Inventory Reports',                         topics: ['Stock summary and movement reports', 'Stock ageing analysis', 'Reorder level and slow-moving stock reports', 'Business case: Analyse inventory reports for a sample business', 'Revision & assessment'] },
    { lesson: 'GST Fundamentals',                          topics: ['Introduction to GST in India', 'GST configuration in Tally Prime', 'GSTIN, HSN/SAC codes and tax ledger setup', 'Business case: Configure GST for a sample company', 'Revision & assessment'] },
    { lesson: 'GST Transactions',                          topics: ['GST purchase invoice entry', 'GST sales invoice entry', 'GST calculation and verification', 'Business case: Process a full month of GST transactions', 'Revision & assessment'] },
    { lesson: 'GST Reports & Reconciliation',              topics: ['GSTR-1 and GSTR-3B reports', 'GST reconciliation process', 'Input tax credit (ITC) management', 'Business case: Prepare GST reports for a sample business', 'Revision & assessment'] },
    { lesson: 'Banking, Payroll & Final Project',          topics: ['Bank reconciliation in Tally Prime', 'Payroll processing and salary entries', 'Financial reports: Trial Balance, P&L, Balance Sheet', 'Complete business project in Tally Prime', 'Final project presentation and assessment'] },
  ],
  'Computer – Data Entry': [
    { lesson: 'Introduction to Typing Master, keyboard layout', topics: ['Introduction to Typing Master, keyboard layout', 'Home row keys: A S D F J K L ;', 'Home row practice', 'Left-hand home-row drills', 'Right-hand home-row drills'] },
    { lesson: 'F & J key positioning',                          topics: ['F & J key positioning', 'Home-row words', 'Simple words practice', 'Short word combinations', 'Home-row speed test'] },
    { lesson: 'Top row: Q W E R T Y',                           topics: ['Top row: Q W E R T Y', 'Top-row key practice', 'Combining top & home rows', 'Words using top/home rows', 'Accuracy practice'] },
    { lesson: 'Bottom row: Z X C V B',                          topics: ['Bottom row: Z X C V B', 'Bottom-row key practice', 'Combining all three rows', 'Common words practice', 'Weekly typing test'] },
    { lesson: 'Capital letters using Shift',                    topics: ['Capital letters using Shift', 'Capital-letter words', 'Names and places', 'Sentences with capitals', 'Capital-letter speed test'] },
    { lesson: 'Number-row keys',                                topics: ['Number-row keys', 'Numbers 1–5', 'Numbers 6–0', 'Numbers with words', 'Number typing test'] },
    { lesson: 'Punctuation: . , ? !',                           topics: ['Punctuation: . , ? !', ': ; \' "', 'Symbols and special characters', 'Punctuation in sentences', 'Punctuation speed test'] },
    { lesson: 'Common words practice',                          topics: ['Common words practice', 'Frequently used phrases', 'Short sentences', 'Paragraph typing', 'Accuracy improvement'] },
    { lesson: 'Typing from printed material',                   topics: ['Typing from printed material', 'Typing without looking at keyboard', 'Paragraph practice', 'Error identification & correction', 'Timed typing test'] },
    { lesson: 'Speed-building exercises',                       topics: ['Speed-building exercises', '5-minute typing practice', '10-minute typing practice', 'Difficult words practice', 'Speed & accuracy test'] },
    { lesson: 'Letters and applications',                       topics: ['Letters and applications', 'Notices and simple documents', 'Tables and lists', 'Business correspondence', 'Timed document typing'] },
    { lesson: 'Full paragraph practice',                        topics: ['Full paragraph practice', 'Speed improvement', 'Accuracy test', 'Final typing practice', 'Final Speed & Accuracy Test'] },
  ],
  'Spoken English Level 1': [
    { lesson: 'Module 1: Introduction & Basic Communication',
      topics: ['Greetings & Communication Importance', 'Self-Introduction & Sentence Structures', 'Helping Verbs (is, am, are)', 'Pair Conversation – Introductions', 'Practice & Speaking Task'] },
    { lesson: 'Module 2: Talking About Daily Life',
      topics: ['Simple Present Tense', 'Daily Routine Vocabulary', 'WH Questions (What, When, Where)', 'Pair Conversation – Daily Routine', 'Review & Speaking'] },
    { lesson: 'Module 3: Describing People & Things',
      topics: ['Adjectives & Descriptive Vocabulary', 'Articles (a, an, the) & Singular/Plural', 'Sentence Formation Practice', 'Picture Description Activity', 'Speaking Practice'] },
    { lesson: 'Module 4: Past & Future Communication',
      topics: ['Simple Past Tense', 'Future Expressions (will / going to)', 'Time Expressions & Connectors', 'Storytelling Activity', 'Review & Speaking'] },
    { lesson: 'Module 5: Everyday Situations',
      topics: ['Prepositions & Polite Expressions', 'Shopping & Travel Vocabulary', 'Pronunciation Practice', 'Role Play (Market & Directions)', 'Practice & Speaking'] },
    { lesson: 'Module 6: Fluency Development & Assessment',
      topics: ['Revision (Grammar & Vocabulary)', 'JAM Session', 'Group Conversation Activity', 'Speaking Test', 'Feedback & Improvement'] },
    { lesson: 'Module 7: Vocabulary & Sentence Development',
      topics: ['Daily-use Vocabulary Expansion', 'Synonyms & Antonyms', 'Sentence Building with New Words', 'Pair Conversation Practice', 'Review & Speaking'] },
    { lesson: 'Module 8: Pronunciation & Clarity',
      topics: ['Basic Pronunciation Rules', 'Reading Aloud Practice', 'Speaking with Pauses & Clarity', 'Listening & Repetition Exercises', 'Practice & Speaking'] },
    { lesson: 'Module 9: Question & Answer Communication',
      topics: ['Question Words & Structure', 'Forming Questions', 'Answering Clearly & Confidently', 'Pair Q&A Activity', 'Review & Speaking'] },
    { lesson: 'Module 10: Conversation Practice',
      topics: ['Conversation Starters', 'Pair Conversations', 'Group Discussions', 'Role Play Activities', 'Practice & Speaking'] },
    { lesson: 'Module 11: Practical Communication',
      topics: ['Asking for Help & Giving Directions', 'Telephone Conversation Basics', 'Shopping & Customer Interaction', 'Situational Role Plays', 'Review & Speaking'] },
    { lesson: 'Module 12: Final Fluency & Assessment',
      topics: ['Revision (Grammar & Vocabulary)', 'Fluency Activities (JAM, Rapid Speaking)', 'Group Discussion', 'Final Presentations', 'Assessment'] },
  ],
  'Spoken English Level 2': [
    { lesson: 'Module 1: Advanced Communication Basics',
      topics: ['Effective Self-Introduction & Conversation Starters', 'Vocabulary for Expressing Ideas', 'Asking & Answering Confidently', 'Pair Conversation Practice', 'Review & Speaking'] },
    { lesson: 'Module 2: Expressing Opinions & Ideas',
      topics: ['Sentence Structures for Opinions', 'Opinion-based Vocabulary', 'Speaking Practice (Agree/Disagree)', 'Group Discussion Activity', 'Review & Speaking'] },
    { lesson: 'Module 3: Advanced Grammar in Speaking',
      topics: ['Advanced Sentence Formation', 'Question Tags & Question Formation', 'Irregular Verbs in Communication', 'Role Play Using Grammar Structures', 'Review & Speaking'] },
    { lesson: 'Module 4: Sentence Expansion & Connectors',
      topics: ['Sentence Connectors (and, but, because, although)', 'Complex Sentence Construction', 'Sentence Expansion Exercises', 'Speaking Activity Using Connectors', 'Review & Speaking'] },
    { lesson: 'Module 5: Vocabulary & Expression Skills',
      topics: ['Advanced Everyday Vocabulary', 'Synonyms & Antonyms', 'Idioms & Expressions', 'Conversation Using New Vocabulary', 'Review & Speaking'] },
    { lesson: 'Module 6: Pronunciation & Fluency',
      topics: ['Pronunciation Correction Exercises', 'Voice Clarity & Stress Patterns', 'Reading with Expression', 'Listening & Repetition Practice', 'Review & Speaking'] },
    { lesson: 'Module 7: Practical Speaking Development',
      topics: ['Speaking on Everyday Situations', 'Asking & Giving Explanations', 'Pair Conversation Practice', 'Situational Role Play', 'Review & Speaking'] },
    { lesson: 'Module 8: Interactive Communication Activities',
      topics: ['JAM Session (Just a Minute)', 'Debate Practice', 'Extempore Speaking', 'Group Discussion Activity', 'Review & Speaking'] },
    { lesson: 'Module 9: Workplace Communication Skills',
      topics: ['Formal Communication Basics', 'Telephone Conversation Practice', 'Customer Interaction', 'Team Communication Role Play', 'Review & Speaking'] },
    { lesson: 'Module 10: Professional English Usage',
      topics: ['Email Drafting Basics', 'Asking for Information Professionally', 'Giving Instructions Clearly', 'Role Play (Office Situations)', 'Review & Speaking'] },
    { lesson: 'Module 11: Interview & Career Communication',
      topics: ['Interview Question Practice', 'Professional Self-Introduction', 'Answering Confidently', 'Mock Interview Activity', 'Review & Speaking'] },
    { lesson: 'Module 12: Fluency & Final Assessment',
      topics: ['Revision (Grammar & Vocabulary)', 'Fluency Activities (JAM, Rapid Speaking)', 'Group Discussion', 'Final Presentations', 'Assessment'] },
  ],
  Electrical: [
    { lesson: 'Module 1: Electrical Safety',
      topics: ['Introduction & Safety Practices', 'Fire Types & Extinguishers', 'Rescue Operations & First Aid', 'PPE & Workshop Guidelines'] },
    { lesson: 'Module 2: Fundamentals of Electricity',
      topics: ['Current, Voltage & Resistance', "Ohm's Law & Electrical Circuits", 'Conductors, Insulators & Semiconductors', 'AC & DC'] },
    { lesson: 'Module 3: Electrical Tools & Instruments',
      topics: ['Fitting & Marking Tools', 'Pliers & Hand Tools', 'Voltmeter, Ammeter & Clamp Meter', 'Multimeter, Megger & Earth Tester'] },
    { lesson: 'Module 4: Domestic Wiring Installation',
      topics: ['Wiring Accessories & Diagrams', 'Junction Boxes & Conduit Installation', 'Distribution Boards & MCBs', 'ELCB, Cable Routing & Fuses'] },
    { lesson: 'Module 5: Wiring Types',
      topics: ['Cleat & Casing Wiring', 'Batten Wiring', 'Conduit & Concealed Wiring', 'Surface & Flexible Wiring'] },
    { lesson: 'Module 6: Electrical Fixtures & Fittings',
      topics: ['Switches & Socket Outlets', 'Lamp Holders & Ceiling Roses', 'LED Lights & Fans', 'Bell Circuits & Distribution Boards'] },
    { lesson: 'Module 7: Earthing',
      topics: ['Purpose of Earthing', 'Types of Earthing', 'Earth Resistance', 'Earthing Installation & Testing'] },
    { lesson: 'Module 8: Testing & Inspection',
      topics: ['Continuity & Polarity Testing', 'Insulation Resistance', 'Earth Continuity', 'Functional Testing & Documentation'] },
    { lesson: 'Module 9: Proper Finishing',
      topics: ['Cable Dressing', 'Labelling & Panel Organization', 'Workmanship Standards', 'Housekeeping & Quality Inspection'] },
    { lesson: 'Module 10: Repair & Maintenance',
      topics: ['Preventive & Corrective Maintenance', 'Replacing Switches & Sockets', 'Lighting Repair & Fan Servicing', 'Distribution Board Maintenance'] },
    { lesson: 'Module 11: Fault Diagnosis & Troubleshooting',
      topics: ['Problem Identification & Root Cause Analysis', 'Troubleshooting Process & Circuit Tracing', 'Testing Procedures & Fault Isolation', 'House Wiring Project'] },
  ],
  'Beautician – Basic': [
    { lesson: 'Introduction, Professional Ethics, Anatomy & Hair Care', topics: ['Introduction and overview of the course', 'Professional ethics', 'Structure of the human body and various body parts', 'Hair structure and basic hair care', 'Activity – Demonstration'] },
    { lesson: 'Health, Nutrition & Beauty',                             topics: ['Definition of health and nutrition', 'Importance and functions of food', 'Balanced diet and its significance in health', 'Food and nutrients related to healthy skin, nails and hair', 'Slip test'] },
    { lesson: 'Threading & Eyebrow Shaping',                           topics: ['Introduction to threading; types of eyebrow shapes', 'Performance of different shaped eyebrows', 'Practice – round eyebrow shape', 'Practice – arched & angular eyebrow shape', 'Activity – Identify the Shape'] },
    { lesson: 'Waxing, Manicure & Pedicure',                           topics: ['Introduction to waxing', 'Waxing procedure, precautions and practice', 'Different types of waxing', "Waxing do's and don'ts quiz", 'Manicure and pedicure – introduction', 'Practical demonstration', 'Manicure practice', 'Pedicure practice', 'Manicure practice session', 'Best manicure/pedicure peer feedback'] },
    { lesson: 'Skin Care, Clean-Up, Facial & Massage',                 topics: ['Skin care, facial – introduction and procedure', 'Facial demonstration', 'Facial practice', 'Facial problems and basic treatment/care', 'Skincare role-play activity', 'Clean-up procedure & practice', 'Massage strokes & practice', 'Preparation of natural clean-up kits', 'Cleanup practical', 'Steam demonstration'] },
    { lesson: 'Hair Cutting',                                           topics: ['Introduction to hair cutting (straight, U & V cut)', 'Basic haircutting techniques', 'Hair-cutting demonstration and practice', 'Slip test & demonstration', 'Hair-cutting practice on dummy', 'Face shape & haircut matching', 'Sectioning, layering & clipper practice', 'Haircut safety activity'] },
    { lesson: 'Beauty Products & Natural Facial',                      topics: ['Explore the latest body and beauty care products', 'Product identification and uses', 'Practice', 'Natural fruit facial – demonstration', 'Natural fruit facial – practice'] },
    { lesson: 'Make-Up',                                               topics: ['Introduction to make-up', 'Make-up products and tools', 'Make-up practice', 'Eye & cheek make-up', 'Activity – Pair make-up'] },
    { lesson: 'Hair Care',                                             topics: ['Hair care – importance and identification', 'Hair types and basic care', 'Different types of oils used for head massage', 'Head massage & practice', 'Slip test'] },
    { lesson: 'Henna & Hair Styling',                                  topics: ['Henna practice', 'Introduction to hairstyling', 'Hairstyles for straightened hair', 'Curled hairstyles', 'Activity / Slip Test / Demonstration'] },
    { lesson: 'Fault Finding, Client Diagnosis & Final Revision',      topics: ['Skin fault finding', 'Hair & scalp fault finding', 'Nail, eyebrow & body fault finding', 'Client diagnosis, treatment selection & revision', 'Record writing & preparing for final exam'] },
  ],
  'Tailoring – Basic': [
    { lesson: 'Introduction to Tailoring',                        topics: ['Introduction to tailoring & tools', 'Measuring techniques', 'Basic body measurements', 'Fabric selection & layout', 'Basic stitching practice'] },
    { lesson: 'Panty & Half Petticoat',                           topics: ['Panty – measurements & cutting', 'Panty – stitching & finishing', 'Half Petticoat – measurements & cutting', 'Half Petticoat – stitching & finishing', 'Practical & corrections'] },
    { lesson: 'Umbrella Petticoat & Cuts Petticoat',              topics: ['Umbrella Petticoat – measurements & cutting', 'Umbrella Petticoat – stitching, gathering & finishing', 'Cuts Petticoat – measurements & cutting', 'Cuts Petticoat – stitching & finishing', 'Practical'] },
    { lesson: 'Frock Type Petticoat & Piping Frock',              topics: ['Frock Type Petticoat – measurements & cutting', 'Frock Type Petticoat – stitching & finishing', 'Piping Frock – design, measurements & bodice cutting', 'Piping Frock – piping preparation & stitching', 'Practical'] },
    { lesson: 'Neck Frills Frock & Balloon Frock',                topics: ['Neck Frills Frock – measurements & cutting', 'Neck Frills Frock – frill preparation & stitching', 'Balloon Frock – measurements & cutting', 'Balloon Frock – gathering technique & stitching', 'Practical & finishing'] },
    { lesson: 'Round Neck & Square Neck Full Blouse',             topics: ['Round Neck Full Blouse – measurements & cutting', 'Round Neck Full Blouse – stitching & neck finishing', 'Square Neck Full Blouse – measurements & cutting', 'Square Neck Full Blouse – stitching & neck finishing', 'Practical'] },
    { lesson: 'Star Neck Blouse & Skirt & Top',                   topics: ['Star Neck Full Blouse – measurements & cutting', 'Star Neck Full Blouse – stitching & neck finishing', 'Skirt & Top – measurements, skirt & top cutting', 'Skirt & Top – stitching & finishing', 'Practical'] },
    { lesson: 'V-Shape Gagra & Gagra Frock',                      topics: ['V-Shape Gagra – measurements & cutting', 'V-Shape Gagra & Vase Coat – stitching & finishing', 'Gagra & Gagra Frock – measurements & cutting', 'Gagra & Gagra Frock – stitching & frock construction', 'Practical'] },
    { lesson: 'School Uniform & Divider Skirt',                   topics: ['School Uniform – measurements & cutting', 'School Uniform – shirt/top stitching', 'School Uniform – skirt/pant stitching & finishing', 'Divider Skirt – measurements, cutting & stitching', 'Practical & finishing'] },
    { lesson: 'Umbrella Top & Paizama + Cuts Top & Frills Paizama', topics: ['Umbrella Top & Paizama – measurements & cutting', 'Umbrella Top & Paizama – stitching & finishing', 'Cuts Top – measurements & cutting', 'Frills Paizama – cutting, frill preparation & stitching', 'Practical & finishing'] },
    { lesson: 'Short Length Top & Chudi Paizama + Ravika Blouse', topics: ['Short Length Top – measurements & cutting', 'Chudi Paizama – cutting & stitching', 'Ravika Blouse – measurements & cutting', 'Ravika Blouse – stitching, sleeve & neck finishing', 'Practical'] },
    { lesson: '80cm Blouse & Straight Cutting Blouse',            topics: ['80cm Blouse – cutting & construction', '80cm Blouse – stitching, fitting & correction', 'Straight Cutting Blouse – measurements & cutting', 'Straight Cutting Blouse – stitching & neck/sleeve finishing', 'Practical'] },
    { lesson: 'Cross Cutting Blouse & Katora Blouse',             topics: ['Cross Cutting Blouse – measurements & cutting', 'Cross Cutting Blouse – stitching, fitting & finishing', 'Katora Blouse – measurements & katora cutting', 'Katora Blouse – stitching & fitting', 'Practical & finishing'] },
    { lesson: 'Saree Petticoat & Final Assessment',               topics: ['Saree Petticoat – measurements & cutting', 'Saree Petticoat – stitching, waistband & finishing', 'Revision & final practice', 'Final practical session', 'Final assessment & record writing'] },
  ],
  'Tailoring – Advanced': [
    { lesson: 'Advanced Tailoring Introduction & Hand Embroidery', topics: ['Introduction to advanced tailoring & tools', 'Hand Embroidery – Chain Stitch', 'Hand Embroidery – Back Stitch', 'Hand Embroidery – Knot Stitch', 'Double Chain & Fish Bone Work'] },
    { lesson: 'Pallu Designs',                                    topics: ['Pallu Designs – Introduction', 'Single Tassel Design', 'Double Tassel Design', 'Tassel with Different Materials', 'Pallu Design Practical'] },
    { lesson: 'Fabric Painting',                                  topics: ['Fabric Painting – Basics', 'Colour Mixing & Different Shades', 'Fabric Painting – Floral Designs', 'Fabric Painting – Motifs', 'Fabric Painting Practical'] },
    { lesson: 'Elastic Frock',                                    topics: ['Elastic Frock – Measurements', 'Elastic Frock – Cutting', 'Elastic Frock – Stitching', 'Elastic Frock – Finishing', 'Elastic Frock Practical'] },
    { lesson: 'Steps Frock',                                      topics: ['Steps Frock – Measurements & Drafting', 'Steps Frock – Cutting', 'Steps Frock – Stitching', 'Steps Frock – Frills/Steps', 'Steps Frock Finishing'] },
    { lesson: 'Umbrella Frock',                                   topics: ['Umbrella Frock – Measurements', 'Umbrella Frock – Drafting', 'Umbrella Frock – Cutting', 'Umbrella Frock – Stitching', 'Umbrella Frock Finishing'] },
    { lesson: 'Designer Dress Techniques',                        topics: ['Designer Dress – Piping', 'Front Open Designer Dress', 'Kali Dress', 'Collar & Zip Attachment', 'Designer Dress Practical'] },
    { lesson: 'Six-Piece Kali Dress & Patiala Paizama',           topics: ['Six-Piece Kali Dress – Drafting', 'Six-Piece Kali – Cutting', 'Six-Piece Kali – Stitching', 'Patiala Paizama – Cutting', 'Patiala Paizama – Stitching'] },
    { lesson: 'Designer Blouse Styles',                           topics: ['Designer Blouse – Boat Neck', 'Designer Blouse – Frills Cut', 'Back Open Blouse', 'Blouse Work & Embellishment', 'Different Border Stitching'] },
    { lesson: 'High Neck Blouse',                                 topics: ['High Neck Blouse – Measurements', 'High Neck – Drafting', 'High Neck – Cutting', 'High Neck – Stitching', 'High Neck Finishing'] },
    { lesson: 'Double Katora Blouse',                             topics: ['Double Katora – Introduction', 'Double Katora – Measurements', 'Double Katora – Drafting & Cutting', 'Double Katora – Stitching', 'Double Katora Finishing'] },
    { lesson: 'Star Neck Blouse & Final Assessment',              topics: ['Star Neck Blouse – Drafting', 'Star Neck – Cutting', 'Star Neck – Stitching', 'Final Designer Blouse/Frock Practical', 'Final Project, Finishing & Assessment'] },
  ],
  'Tailoring – Maggam Work': [
    { lesson: 'Introduction to Maggam Work & Needle Practice', topics: ['Introduction to Maggam Work & Tools', 'Needle Practice – Basics', 'Needle Practice – Straight Lines', 'Needle Practice – Curves & Shapes', 'Needle Practice – Practice Design'] },
    { lesson: 'Single Thread Chain Stitch',                    topics: ['Single Thread Chain Stitch – Introduction', 'Chain Stitch – Basic Practice', 'Chain Stitch – Curved Patterns', 'Chain Stitch – Floral Designs', 'Single Thread Chain Stitch – Design Practice'] },
    { lesson: 'Double Thread Chain Stitch',                    topics: ['Double Thread Chain Stitch – Introduction', 'Double Thread Chain Stitch – Practice', 'Double Thread Chain Stitch – Curves', 'Double Thread Chain Stitch – Motifs', 'Double Thread Chain Stitch – Design Practice'] },
    { lesson: 'Long & Short Stitch',                           topics: ['Long & Short Stitch – Introduction', 'Long & Short Stitch – Basic Practice', 'Shading Techniques', 'Floral & Leaf Designs', 'Long & Short Stitch – Complete Design'] },
    { lesson: 'Neck Loading',                                  topics: ['Neck Loading – Introduction', 'Neck Loading – Basic Pattern', 'Neckline Design Practice', 'Decorative Neck Designs', 'Complete Neck Loading Design'] },
    { lesson: 'Pearl Loading',                                 topics: ['Pearl Loading – Introduction', 'Pearl Placement Techniques', 'Single Pearl Designs', 'Multiple Pearl Patterns', 'Pearl Loading – Complete Design'] },
    { lesson: 'Leaf Loading',                                  topics: ['Leaf Loading – Introduction', 'Leaf Shapes & Patterns', 'Leaf Loading Practice', 'Floral & Leaf Combination', 'Complete Leaf Loading Design'] },
    { lesson: 'Mirror Work',                                   topics: ['Mirror Work – Introduction', 'Mirror Fixing Techniques', 'Leaf & Mirror Combination', 'Floral Mirror Work', 'Complete Mirror Work Design'] },
    { lesson: 'Pani Work',                                     topics: ['Pani Work – Introduction', 'Basic Pani Work Practice', 'Floral Pani Designs', 'Pani Work Motifs', 'Complete Pani Work Design'] },
    { lesson: 'Chamki Work',                                   topics: ['Chamki Work – Introduction', 'Chamki Fixing Techniques', 'Basic Chamki Patterns', 'Floral & Decorative Chamki Work', 'Complete Chamki Design'] },
    { lesson: 'Dardozi Work',                                  topics: ['Dardozi Work – Introduction', 'Basic Dardozi Techniques', 'Dardozi Motifs', 'Floral Dardozi Designs', 'Dardozi Border Design'] },
    { lesson: 'Advanced Combination Designs',                  topics: ['Dardozi – Advanced Designs', 'Combination of Dardozi & Chamki', 'Combination of Pani & Mirror Work', 'Combination of Pearl & Leaf Work', 'Designer Maggam Motif'] },
    { lesson: 'Final Design & Assessment',                     topics: ['Final Design Selection & Planning', 'Final Maggam Design – Practice', 'Final Design – Main Work', 'Finishing & Corrections', 'Final Project & Practical Assessment'] },
  ],
  'Refrigeration & AC Technician': [
    { lesson: 'Module 1: Safety Precautions',
      topics: ['Electronic Hazards & Radiation Risks', 'Personal Protective Equipment (PPE)', 'Fire Safety & First Aid for Electric Shock', 'Safe Handling of Appliances & Test Equipment', 'Safety Inspection / Quiz'] },
    { lesson: 'Module 2: Fundamentals of Electronics',
      topics: ['Voltage, Current & Resistance', "Ohm's Law", 'Power Calculations & PCB Basics', 'AC and DC, Electronic Components'] },
    { lesson: 'Module 3: Tools and Measuring Instruments',
      topics: ['Hand Tools & Wire Preparation Tools', 'Soldering, Insulation & Circuit Testing', 'Electrical, Temperature & Current Measurements', 'Measuring AC/DC Current – Hands-on Practice', 'Wiring, Soldering & Measurement Activity'] },
    { lesson: 'Module 4: Refrigerator',
      topics: ['Refrigeration Systems & Classification', 'Types of Refrigerators & Applications', 'Domestic & Commercial Refrigeration', 'Cold Room & Cold Storage Systems', 'Automotive, Mobile & Industrial Refrigeration'] },
    { lesson: 'Module 5: Compressor',
      topics: ['Introduction to Compressors & Working Principle', 'Hermetic & Semi-Hermetic Compressors', 'Open-Type Compressors', 'Rotary & Reciprocating Compressors', 'BLDC & Inverter Compressors', 'Comparison of All Compressor Types', 'Practical Demonstration & Viva Assessment'] },
    { lesson: 'Module 6: Refrigerants (Gases)',
      topics: ['Introduction to Refrigerants', 'R-12, R-22 & R-32 Refrigerants', 'R-134a, R-290 & R-600a Refrigerants', 'R-190 (Ethane) Refrigerant', 'Case Study on Refrigerant Types'] },
    { lesson: 'Module 7: Air Conditioners',
      topics: ['AC Definition, Components & Diagram', 'Types of AC & Applications', 'Dismantle & Reassemble Split, Window, Portable AC', 'Dismantle & Reassemble Floor, Smart, Hybrid AC', 'Component Testing & Refrigerant Charging', 'Tube Bending, Bracing, Pinching & Leak Detection'] },
    { lesson: 'Module 8: Repair and Maintenance',
      topics: ['Compressor Faults & Remedies', 'No Air Flow & Compressor Run Issues', 'Compressor Start-up Problems', 'Refrigerant Flow Tube Bending', 'Repair & Documentation'] },
    { lesson: 'Module 9: Fault Diagnosis and Troubleshooting',
      topics: ['Refrigerant Leak Detection & Prevention', 'Fault Diagnosis Exercises', 'Evaporator Troubleshooting & Testing', 'Practical Assessment', 'Record Writing & Final Exam Preparation'] },
  ],
};

async function loadCurriculum() {
  const list = document.getElementById('curriculum-list');
  list.innerHTML = '<p class="loading-text">Loading…</p>';

  if (SCRIPT_URL) {
    try {
      const res  = await fetch(`${SCRIPT_URL}?action=options&course=${encodeURIComponent(currentCourse)}`);
      const data = await res.json();
      if (data.status === 'ok') { renderCurriculum(data.curriculum); return; }
    } catch { /* fall through */ }
  }

  renderCurriculum(FALLBACK_CURRICULUM[currentCourse] || []);
}

function renderCurriculum(curriculum) {
  const list = document.getElementById('curriculum-list');
  if (!curriculum.length) {
    list.innerHTML = '<p class="loading-text">No curriculum data found.</p>';
    return;
  }

  list.innerHTML = '';
  curriculum.forEach(({ lesson, topics }) => {
    const color   = colorFor(lesson);
    const section = document.createElement('div');
    section.className = 'lesson-section';

    // ── Module header (click to toggle, drag to create calendar span) ──
    const header = document.createElement('div');
    header.className = 'lesson-header-row';
    header.style.setProperty('--lesson-color', color);
    header.draggable = true;
    header.title = 'Drag to calendar to schedule this module';

    header.innerHTML = `
      <span class="toggle-icon">▼</span>
      <span class="lesson-name-text">${escHtml(lesson)}</span>
      <span class="drag-grip">⠿</span>
    `;

    // ── Topic chips ──
    const topicList = document.createElement('div');
    topicList.className = 'topic-list';

    topics.forEach(topic => {
      const chip = document.createElement('div');
      chip.className   = 'topic-chip';
      chip.draggable   = true;
      chip.textContent = topic;
      chip.style.setProperty('--lesson-color', color);
      chip.title = topic;
      chip.addEventListener('dragstart', e => {
        dragData = { type: 'new', lesson, topic };
        e.dataTransfer.effectAllowed = 'copy';
        e.dataTransfer.setData('text/plain', topic);
      });
      topicList.appendChild(chip);
    });

    // Toggle topic list on click (not drag)
    header.addEventListener('click', () => {
      const open = !topicList.classList.contains('collapsed');
      topicList.classList.toggle('collapsed', open);
      header.querySelector('.toggle-icon').textContent = open ? '▶' : '▼';
    });

    // Drag module header → create a span on calendar
    header.addEventListener('dragstart', e => {
      dragData = { type: 'new-span', lesson };
      e.dataTransfer.effectAllowed = 'copy';
      e.dataTransfer.setData('text/plain', lesson);
    });

    section.appendChild(header);
    section.appendChild(topicList);
    list.appendChild(section);
  });
}

// ── CALENDAR ───────────────────────────────────────────────────────
const MONTH_NAMES = ['January','February','March','April','May','June',
                     'July','August','September','October','November','December'];

function getWeeksForMonth(year, month) {
  const first = new Date(year, month, 1);
  const last  = new Date(year, month + 1, 0);

  // Start from Sunday of the first week
  const cur = new Date(first);
  cur.setDate(first.getDate() - first.getDay());

  const weeks = [];
  while (cur <= last) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      week.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

function renderCalendar() {
  document.getElementById('cal-month-label').textContent = `${MONTH_NAMES[viewMonth]} ${viewYear}`;

  const grid     = document.getElementById('cal-grid');
  grid.innerHTML = '';

  const weeks    = getWeeksForMonth(viewYear, viewMonth);
  const todayStr = toDateStr(new Date());

  weeks.forEach(week => {
    const weekEl = document.createElement('div');
    weekEl.className = 'cal-week';

    // ── Span row: multi-day module bars ──
    const spanRow = document.createElement('div');
    spanRow.className = 'span-row';

    // Drop on span-row: calculates which day column from mouse X — this is what
    // makes dragging resize handles LEFT or RIGHT (sideways) work naturally,
    // instead of requiring a drop on a day cell below.
    spanRow.addEventListener('dragover', e => { e.preventDefault(); });
    spanRow.addEventListener('drop', e => {
      e.preventDefault();
      const rect     = spanRow.getBoundingClientRect();
      const colWidth = rect.width / 7;
      const colIdx   = Math.max(0, Math.min(6, Math.floor((e.clientX - rect.left) / colWidth)));
      handleDrop(toDateStr(week[colIdx]));
    });

    const weekStart = toDateStr(week[0]);
    const weekEnd   = toDateStr(week[6]);

    spans
      .filter(s => s.startDate <= weekEnd && s.endDate >= weekStart)
      .forEach(span => {
        const startsHere = span.startDate >= weekStart;
        const endsHere   = span.endDate   <= weekEnd;

        const colStart = startsHere
          ? week.findIndex(d => toDateStr(d) === span.startDate) + 1
          : 1;
        const colEnd = endsHere
          ? week.findIndex(d => toDateStr(d) === span.endDate) + 2
          : 8;

        const bar = document.createElement('div');
        bar.className = 'cal-span';
        bar.style.gridColumn = `${colStart} / ${colEnd}`;
        bar.style.background = colorFor(span.lesson);
        if (!startsHere) bar.classList.add('span-cont-left');
        if (!endsHere)   bar.classList.add('span-cont-right');

        // Left resize handle (only on the week where the span starts)
        if (startsHere) {
          const rL = document.createElement('div');
          rL.className = 'span-resize span-resize-left';
          rL.draggable = true;
          rL.title     = 'Drag to change start';
          rL.addEventListener('dragstart', e => {
            dragData = { type: 'resize-start', spanId: span.id };
            e.dataTransfer.effectAllowed = 'move';
            e.stopPropagation();
          });
          bar.appendChild(rL);
        }

        const label = document.createElement('span');
        label.className   = 'span-label';
        label.textContent = span.lesson;
        bar.appendChild(label);

        const del = document.createElement('button');
        del.className   = 'span-del';
        del.textContent = '×';
        del.addEventListener('click', e => { e.stopPropagation(); removeSpan(span.id); });
        bar.appendChild(del);

        // Right resize handle (only on the week where the span ends)
        if (endsHere) {
          const rR = document.createElement('div');
          rR.className = 'span-resize span-resize-right';
          rR.draggable = true;
          rR.title     = 'Drag to change end';
          rR.addEventListener('dragstart', e => {
            dragData = { type: 'resize-end', spanId: span.id };
            e.dataTransfer.effectAllowed = 'move';
            e.stopPropagation();
          });
          bar.appendChild(rR);
        }

        spanRow.appendChild(bar);
      });

    weekEl.appendChild(spanRow);

    // ── Day cells ──
    const dayRow = document.createElement('div');
    dayRow.className = 'day-row';

    week.forEach(date => {
      const ds          = toDateStr(date);
      const thisMonth   = date.getMonth() === viewMonth;
      const isToday     = ds === todayStr;

      const cell = document.createElement('div');
      cell.className    = `cal-cell${!thisMonth ? ' cal-other-month' : ''}${isToday ? ' today' : ''}`;
      cell.dataset.date = ds;

      const num = document.createElement('span');
      num.className   = 'cal-day-num';
      num.textContent = date.getDate();
      num.title       = 'Click to add feedback or photo';
      num.addEventListener('click', () => openDayModal(ds));
      cell.appendChild(num);

      // Feedback indicator dots
      const dayFeedback = feedback[ds] || [];
      if (dayFeedback.length) {
        const dots = document.createElement('div');
        dots.className = 'cal-feedback-dot';
        const hasText  = dayFeedback.some(f => f.type === 'text');
        const hasPhoto = dayFeedback.some(f => f.type === 'photo');
        if (hasText)  dots.appendChild(Object.assign(document.createElement('span'), { textContent: '✏️' }));
        if (hasPhoto) dots.appendChild(Object.assign(document.createElement('span'), { textContent: '📷' }));
        cell.appendChild(dots);
      }

      const items = document.createElement('div');
      items.className = 'cal-items';
      items.id        = `items-${ds}`;
      cell.appendChild(items);

      // Drop handling (topics + module spans + resize)
      cell._dnd = 0;
      cell.addEventListener('dragenter', e => {
        e.preventDefault();
        cell._dnd++;
        cell.classList.add('drag-over');
      });
      cell.addEventListener('dragleave', () => {
        cell._dnd--;
        if (cell._dnd <= 0) { cell._dnd = 0; cell.classList.remove('drag-over'); }
      });
      cell.addEventListener('dragover', e => { e.preventDefault(); });
      cell.addEventListener('drop', e => {
        e.preventDefault();
        cell._dnd = 0;
        cell.classList.remove('drag-over');
        handleDrop(ds);
      });

      dayRow.appendChild(cell);
    });

    weekEl.appendChild(dayRow);
    grid.appendChild(weekEl);

    // Render topic chips for each day now that elements are in DOM
    week.forEach(date => renderCellItems(toDateStr(date)));
  });
}

function renderCellItems(ds) {
  const container = document.getElementById(`items-${ds}`);
  if (!container) return;
  container.innerHTML = '';
  (schedule[ds] || []).forEach(item => container.appendChild(makeChip(item, ds)));
}

function makeChip(item, ds) {
  const color = colorFor(item.lesson);
  const chip  = document.createElement('div');
  chip.className        = 'cal-chip';
  chip.style.background = color;
  chip.draggable        = true;
  chip.title            = `${item.lesson}: ${item.topic}`;

  const text = document.createElement('span');
  text.className   = 'cal-chip-text';
  text.textContent = item.topic;

  const del = document.createElement('button');
  del.className   = 'cal-chip-del';
  del.textContent = '×';
  del.addEventListener('click', e => { e.stopPropagation(); removeItem(item.id, ds); });

  chip.appendChild(text);
  chip.appendChild(del);

  chip.addEventListener('dragstart', e => {
    dragData = { type: 'move', item, fromDate: ds };
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', item.topic);
    e.stopPropagation();
  });

  return chip;
}

// ── DROP HANDLER ───────────────────────────────────────────────────
async function handleDrop(toDate) {
  if (!dragData) return;

  if (dragData.type === 'new') {
    // Topic chip from sidebar → single-day entry
    await addItem(toDate, dragData.lesson, dragData.topic);

  } else if (dragData.type === 'new-span') {
    // Module header from sidebar → create a span starting and ending on this day
    addSpan(dragData.lesson, toDate, toDate);

  } else if (dragData.type === 'move') {
    // Topic chip dragged between days
    if (dragData.fromDate !== toDate) await moveItem(dragData.item, dragData.fromDate, toDate);

  } else if (dragData.type === 'resize-start') {
    // Left handle dragged to new start date
    const span = spans.find(s => s.id === dragData.spanId);
    if (span && toDate <= span.endDate) {
      span.startDate = toDate;
      saveSpansLocally(currentCourse);
      renderCalendar();
    }

  } else if (dragData.type === 'resize-end') {
    // Right handle dragged to new end date
    const span = spans.find(s => s.id === dragData.spanId);
    if (span && toDate >= span.startDate) {
      span.endDate = toDate;
      saveSpansLocally(currentCourse);
      renderCalendar();
    }
  }

  dragData = null;
}

// ── SPAN CRUD ──────────────────────────────────────────────────────
function addSpan(lesson, startDate, endDate) {
  spans.push({ id: makeId(), lesson, startDate, endDate });
  saveSpansLocally(currentCourse);
  renderCalendar();
}

function removeSpan(id) {
  spans = spans.filter(s => s.id !== id);
  saveSpansLocally(currentCourse);
  renderCalendar();
}

// ── TOPIC CRUD ─────────────────────────────────────────────────────
function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

async function addItem(date, lesson, topic) {
  const id   = makeId();
  const item = { id, lesson, topic };
  if (!schedule[date]) schedule[date] = [];
  schedule[date].push(item);
  renderCellItems(date);

  if (SCRIPT_URL) {
    fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'add', course: currentCourse, date, lesson, topic, id }),
    }).catch(console.warn);
  }
}

async function moveItem(item, fromDate, toDate) {
  if (schedule[fromDate]) {
    schedule[fromDate] = schedule[fromDate].filter(i => i.id !== item.id);
    renderCellItems(fromDate);
  }
  if (!schedule[toDate]) schedule[toDate] = [];
  schedule[toDate].push(item);
  renderCellItems(toDate);

  if (SCRIPT_URL) {
    fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'move', id: item.id, newDate: toDate, course: currentCourse }),
    }).catch(console.warn);
  }
}

async function removeItem(id, date) {
  if (!schedule[date]) return;
  schedule[date] = schedule[date].filter(i => i.id !== id);
  renderCellItems(date);

  if (SCRIPT_URL) {
    fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'delete', id, course: currentCourse }),
    }).catch(console.warn);
  }
}

async function loadSchedule() {
  if (!SCRIPT_URL) return;
  try {
    const url  = `${SCRIPT_URL}?action=schedule&course=${encodeURIComponent(currentCourse)}&year=${viewYear}&month=${viewMonth + 1}`;
    const res  = await fetch(url);
    const data = await res.json();
    if (data.status === 'ok') {
      schedule = {};
      data.items.forEach(item => {
        colorFor(item.lesson);
        if (!schedule[item.date]) schedule[item.date] = [];
        schedule[item.date].push(item);
      });
      renderCalendar();
    }
  } catch { /* keep current */ }
}

// ── FEEDBACK & MODAL ───────────────────────────────────────────────
function openDayModal(ds) {
  modalDate = ds;
  pendingPhoto = null;

  const d = new Date(ds + 'T00:00:00');
  document.getElementById('modal-date-label').textContent =
    d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  document.getElementById('modal-course-badge').textContent = currentCourse;

  document.getElementById('modal-feedback-text').value = '';
  document.getElementById('modal-file-name').textContent = 'Choose a photo…';
  document.getElementById('modal-photo-preview').classList.add('hidden');
  document.getElementById('modal-submit-photo').disabled = true;
  document.getElementById('modal-photo-input').value = '';

  renderModalItems();
  document.getElementById('day-modal').classList.remove('hidden');
}

function closeDayModal() {
  document.getElementById('day-modal').classList.add('hidden');
  modalDate = null;
  pendingPhoto = null;
}

function renderModalItems() {
  const container = document.getElementById('modal-existing');
  const items = feedback[modalDate] || [];

  if (!items.length) {
    container.innerHTML = '<p class="modal-empty">No feedback yet — add a note or photo below.</p>';
    return;
  }

  container.innerHTML = '';
  items.forEach(item => {
    const el  = document.createElement('div');
    el.className = 'modal-item';
    const ts = new Date(item.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    const icon = document.createElement('div');
    icon.className   = 'modal-item-icon';
    icon.textContent = item.type === 'text' ? '✏️' : '📷';

    const body = document.createElement('div');
    body.className = 'modal-item-body';

    if (item.type === 'text') {
      const txt = document.createElement('div');
      txt.className   = 'modal-item-text';
      txt.textContent = item.content;
      body.appendChild(txt);
    } else {
      const img = document.createElement('img');
      img.className = 'modal-item-photo';
      img.src       = item.content;
      img.alt       = 'Uploaded photo';
      body.appendChild(img);
    }

    const meta = document.createElement('div');
    meta.className   = 'modal-item-meta';
    meta.textContent = ts;
    body.appendChild(meta);

    const del = document.createElement('button');
    del.className   = 'modal-item-del';
    del.textContent = '×';
    del.addEventListener('click', () => removeFeedbackItem(item.id));

    el.appendChild(icon);
    el.appendChild(body);
    el.appendChild(del);
    container.appendChild(el);
  });
}

function addFeedbackText() {
  const text = document.getElementById('modal-feedback-text').value.trim();
  if (!text || !modalDate) return;

  const item = { id: makeId(), type: 'text', content: text, timestamp: Date.now() };
  if (!feedback[modalDate]) feedback[modalDate] = [];
  feedback[modalDate].push(item);
  saveFeedbackLocally();
  renderModalItems();
  renderCalendar(); // refresh dots
  document.getElementById('modal-feedback-text').value = '';

  if (SCRIPT_URL) {
    fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'addFeedback', course: currentCourse, date: modalDate,
        id: item.id, feedbackType: 'text', content: text }),
    }).catch(console.warn);
  }
}

async function addFeedbackPhoto() {
  if (!pendingPhoto || !modalDate) return;

  const btn = document.getElementById('modal-submit-photo');
  btn.textContent = 'Saving…';
  btn.disabled = true;

  const item = { id: makeId(), type: 'photo', content: pendingPhoto.base64, timestamp: Date.now() };
  if (!feedback[modalDate]) feedback[modalDate] = [];
  feedback[modalDate].push(item);

  try {
    saveFeedbackLocally();
  } catch {
    feedback[modalDate].pop();
    btn.textContent = 'Upload Photo';
    btn.disabled = false;
    alert('Local storage is full. Please set up the Google Drive backend (add SCRIPT_URL) to save photos.');
    return;
  }

  renderModalItems();
  renderCalendar(); // refresh dots
  document.getElementById('modal-photo-preview').classList.add('hidden');
  document.getElementById('modal-file-name').textContent = 'Choose a photo…';
  document.getElementById('modal-photo-input').value = '';
  pendingPhoto = null;
  btn.textContent = 'Upload Photo';

  if (SCRIPT_URL) {
    try {
      const res  = await fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'addFeedback', course: currentCourse, date: modalDate,
          id: item.id, feedbackType: 'photo',
          content: item.content, mimeType: 'image/jpeg' }),
      });
      const data = await res.json();
      if (data.driveUrl) {
        // swap base64 for the permanent Drive thumbnail URL
        item.content = data.driveUrl;
        saveFeedbackLocally();
        renderModalItems();
      }
    } catch { /* keep base64 locally */ }
  }
}

function removeFeedbackItem(id) {
  if (!modalDate) return;
  feedback[modalDate] = (feedback[modalDate] || []).filter(i => i.id !== id);
  saveFeedbackLocally();
  renderModalItems();
  renderCalendar();

  if (SCRIPT_URL) {
    fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'deleteFeedback', id, course: currentCourse }),
    }).catch(console.warn);
  }
}

function compressImage(file, maxPx, quality) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const scale  = Math.min(1, maxPx / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width  = Math.round(img.width  * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve({ base64: canvas.toDataURL('image/jpeg', quality), mimeType: 'image/jpeg' });
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Modal event wiring
document.getElementById('modal-close').addEventListener('click', closeDayModal);
document.getElementById('day-modal').addEventListener('click', e => {
  if (e.target.id === 'day-modal') closeDayModal();
});
document.getElementById('modal-submit-text').addEventListener('click', addFeedbackText);
document.getElementById('modal-feedback-text').addEventListener('keydown', e => {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) addFeedbackText();
});
document.getElementById('modal-photo-input').addEventListener('change', async e => {
  const file = e.target.files[0];
  if (!file) return;
  document.getElementById('modal-file-name').textContent = file.name;
  pendingPhoto = await compressImage(file, 1200, 0.78);
  document.getElementById('modal-preview-img').src = pendingPhoto.base64;
  document.getElementById('modal-photo-preview').classList.remove('hidden');
  document.getElementById('modal-submit-photo').disabled = false;
});
document.getElementById('modal-submit-photo').addEventListener('click', addFeedbackPhoto);

// ── SPAN PERSISTENCE (localStorage) ───────────────────────────────
function saveSpansLocally(course) {
  localStorage.setItem(`aj-spans-${course}`, JSON.stringify(spans));
}

function loadSpansLocally(course) {
  try { return JSON.parse(localStorage.getItem(`aj-spans-${course}`)) || []; }
  catch { return []; }
}

function saveFeedbackLocally() {
  localStorage.setItem(`aj-feedback-${currentCourse}`, JSON.stringify(feedback));
}

function loadFeedbackLocally(course) {
  try { return JSON.parse(localStorage.getItem(`aj-feedback-${course}`)) || {}; }
  catch { return {}; }
}

// ── MONTH NAVIGATION ───────────────────────────────────────────────
document.getElementById('prev-month').addEventListener('click', () => {
  viewMonth--;
  if (viewMonth < 0) { viewMonth = 11; viewYear--; }
  renderCalendar();
  loadSchedule();
});

document.getElementById('next-month').addEventListener('click', () => {
  viewMonth++;
  if (viewMonth > 11) { viewMonth = 0; viewYear++; }
  renderCalendar();
  loadSchedule();
});

document.getElementById('today-btn').addEventListener('click', () => {
  const now = new Date();
  viewYear  = now.getFullYear();
  viewMonth = now.getMonth();
  renderCalendar();
  loadSchedule();
});

// ── UTILITIES ──────────────────────────────────────────────────────
function pad(n) { return String(n).padStart(2, '0'); }

function toDateStr(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── INIT ───────────────────────────────────────────────────────────
if (sessionStorage.getItem('authenticated') === 'true') {
  showView('view-select');
}
