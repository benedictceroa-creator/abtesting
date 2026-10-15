// ── SETUP ────────────────────────────────────────────────────────────────────
// Paste your Google Apps Script proxy URL here after deploying ChatProxy.gs.
// Leave empty to disable the AI chat feature.
const CHAT_PROXY_URL = '';

// ── CAREER DATA ───────────────────────────────────────────────────────────────
const CAREERS = {
  ENG: {
    id: 'ENG', title: 'Engineering & Technology', emoji: '⚙️',
    color: '#2b6cb0', colorLight: '#ebf8ff',
    tagline: 'Design and build the systems that power the world',
    description: 'Engineers apply mathematics and science to design, build, and maintain machines, structures, and systems. India has an enormous demand for engineers — from bridges and power plants to aerospace, pharmaceuticals, and manufacturing.',
    stream: 'Science with PCM',
    streamNote: 'Physics, Chemistry, and Mathematics are essential for all engineering entrance exams.',
    class11: ['Physics', 'Chemistry', 'Mathematics', 'English', 'Computer Science (optional)'],
    exams: [
      { name: 'JEE Main', level: 'national', desc: 'Gateway to NITs, IIITs, and government engineering colleges nationwide. Two attempts per year (Jan & April).' },
      { name: 'JEE Advanced', level: 'national', desc: 'For IITs — one of the world\'s hardest exams. Top 2.5 lakh JEE Main scorers qualify to attempt.' },
      { name: 'TS EAMCET', level: 'state', desc: 'Telangana entrance for 200+ engineering colleges in Hyderabad, Warangal, and across the state.' },
      { name: 'BITSAT', level: 'private', desc: 'BITS Pilani – Hyderabad Campus entrance. Excellent placements at top companies.' },
    ],
    colleges: ['IIT Hyderabad (Sangareddy)', 'BITS Pilani – Hyderabad Campus', 'IIIT Hyderabad', 'JNTU College of Engineering, Hyderabad', 'Osmania University (Engineering)', 'Vasavi College of Engineering, Hyderabad', 'Chaitanya Bharathi Institute of Technology'],
    timeline: [
      { phase: 'Class 9–10', action: 'Build strong Maths & Science foundation. Practise NTSE and Olympiad problems. Identify a preferred branch early.' },
      { phase: 'Class 11–12', action: 'PCM stream. Start JEE/EAMCET coaching early. Balance board preparation with entrance exam practice.' },
      { phase: 'After Class 12', action: 'Appear for JEE Main (Jan & April), JEE Advanced, TS EAMCET, and BITSAT. 75%+ in PCM needed for IIT/NIT.' },
      { phase: 'B.Tech (4 years)', action: 'Engineering degree in your chosen branch: Civil, Mechanical, Electrical, Chemical, or others.' },
      { phase: 'After Graduation', action: 'Campus placements, GATE exam for M.Tech/PSU jobs (BHEL, ONGC, DRDO), entrepreneurship, or MBA.' },
    ],
    salary: '₹4–8 LPA (fresher) → ₹15–40+ LPA (5+ years experience)',
    hyderabad: 'Hyderabad is home to DRDO, HAL, BDL (defence aerospace), BHEL (power), and hundreds of pharma manufacturing plants. Engineering graduates from Hyderabad colleges have very strong local and national placement pipelines.',
    branches: ['Civil Engineering', 'Mechanical Engineering', 'Electrical & Electronics', 'Chemical Engineering', 'Electronics & Communication (ECE)'],
  },

  CS: {
    id: 'CS', title: 'Computer Science & IT', emoji: '💻',
    color: '#553c9a', colorLight: '#faf5ff',
    tagline: 'Write code that changes how the world works',
    description: 'Computer Science graduates build software, apps, AI systems, and digital infrastructure. Hyderabad is India\'s second-largest IT hub — Google, Microsoft, Amazon, TCS, Infosys, Wipro, and hundreds of startups are headquartered or have major offices here.',
    stream: 'Science with PCM',
    streamNote: 'Taking Computer Science as an elective in Class 11 gives a strong head start for college coding.',
    class11: ['Physics', 'Chemistry', 'Mathematics', 'English', 'Computer Science (strongly recommended)'],
    exams: [
      { name: 'JEE Main / Advanced', level: 'national', desc: 'CS/IT at IITs and NITs — the top pathway for India\'s most competitive CS placements.' },
      { name: 'TS EAMCET', level: 'state', desc: 'CS and IT seats at all Telangana state engineering colleges including JNTU campuses.' },
      { name: 'IIIT Hyderabad (UGEE/CLD)', level: 'private', desc: 'Direct entry to IIIT-H — one of India\'s very best CS institutions with exceptional placement records.' },
      { name: 'BITSAT', level: 'private', desc: 'CS/IT at BITS Pilani Hyderabad campus. Top recruiters: Google, Microsoft, Goldman Sachs.' },
      { name: 'CUET', level: 'national', desc: 'For BSc Computer Science at central universities, if not targeting engineering.' },
    ],
    colleges: ['IIIT Hyderabad — India\'s top CS institute outside IITs', 'IIT Hyderabad', 'BITS Pilani – Hyderabad Campus', 'JNTU Hyderabad (CS/IT/AI branches)', 'Osmania University (CS/IT)', 'Woxsen University, Hyderabad'],
    timeline: [
      { phase: 'Class 9–10', action: 'Learn basic programming (Python). Explore platforms like CodeChef, HackerRank. Excel in Maths.' },
      { phase: 'Class 11–12', action: 'PCM + Computer Science. Build small projects. Start JEE/EAMCET/IIIT-H entrance prep alongside boards.' },
      { phase: 'After Class 12', action: 'Appear for JEE, EAMCET, IIIT-H UGEE, and BITSAT. Focus on B.Tech in CS, IT, or AI.' },
      { phase: 'B.Tech (4 years)', action: 'Deep CS fundamentals + internships + competitive coding + open-source projects. Build your profile.' },
      { phase: 'After Graduation', action: 'Software Engineer, Data Scientist, or Product Manager at campus placements (₹8–25 LPA average at IIIT-H/IIT-H).' },
    ],
    salary: '₹6–12 LPA (fresher in Hyderabad IT) → ₹25–80+ LPA (senior/specialist with 7–10 years)',
    hyderabad: 'HITEC City and Gachibowli employ 6+ lakh IT professionals. All FAANG companies (Google, Microsoft, Amazon, Meta, Apple) have major Hyderabad offices. CS graduates from good Hyderabad colleges are extremely well-placed in this city.',
    branches: ['Computer Science Engineering', 'Information Technology', 'Data Science & AI', 'Machine Learning Engineering', 'Cybersecurity'],
  },

  MED: {
    id: 'MED', title: 'Medicine & Healthcare', emoji: '🩺',
    color: '#c53030', colorLight: '#fff5f5',
    tagline: 'Heal people and make the difference between life and death',
    description: 'Medical careers are among India\'s most respected. Doctors, nurses, pharmacists, and physiotherapists have direct impact on people\'s lives every day. NEET-UG is the single national gateway to MBBS admissions across India.',
    stream: 'Science with PCB',
    streamNote: 'Biology is mandatory for NEET. Physics and Chemistry are equally important and must be studied seriously.',
    class11: ['Physics', 'Chemistry', 'Biology', 'English', 'Maths or Biotechnology (optional)'],
    exams: [
      { name: 'NEET-UG', level: 'national', desc: 'The only exam for MBBS and BDS in India. ~20 lakh students compete for ~1 lakh MBBS seats annually. NCERT is the primary study material.' },
      { name: 'NEET-UG (BDS)', level: 'national', desc: 'Bachelor of Dental Surgery — 5-year program. Same exam, different cutoff than MBBS.' },
      { name: 'TS EAMCET (Medical)', level: 'state', desc: 'For BAMS, BHMS, B.Pharm, BPT, and B.Sc Nursing in Telangana colleges.' },
      { name: 'AIIMS (via NEET)', level: 'national', desc: 'AIIMS now uses NEET scores. Very top rankers → AIIMS Delhi, AIIMS Bibinagar (near Hyderabad).' },
    ],
    colleges: ['Gandhi Medical College, Hyderabad (oldest in TS, est. 1846)', 'Osmania Medical College, Hyderabad', 'NIMS – Nizam\'s Institute of Medical Sciences', 'Deccan College of Medical Sciences', 'AIIMS Bibinagar (Hyderabad district)', 'MNR Medical College, Sangareddy'],
    timeline: [
      { phase: 'Class 9–10', action: 'Master NCERT Biology, Physics, Chemistry. Practise diagram labeling and long-answer writing. NEET questions are mostly NCERT-based.' },
      { phase: 'Class 11–12', action: 'PCB stream. Dedicate 3–4 hours daily to NEET prep alongside boards. Biology must be memorised thoroughly.' },
      { phase: 'After Class 12', action: 'Appear for NEET in May. Score 50%+ in PCB for eligibility. Multiple attempts allowed if needed.' },
      { phase: 'MBBS (5.5 years)', action: '4.5 years of medical education + 1 year compulsory rotatory internship in a hospital.' },
      { phase: 'After MBBS', action: 'Start as general physician, OR appear for NEET-PG for specialization (MD/MS in a specialty like Surgery, Pediatrics, etc.).' },
    ],
    salary: '₹8–15 LPA (junior doctor) → ₹30–100+ LPA (experienced specialist with private practice)',
    hyderabad: 'Hyderabad is a major medical hub — Apollo, Yashoda, KIMS, Care Hospitals, AIG, and Sunshine Hospitals are headquartered here. The city has 9+ government medical colleges and 20+ private ones. Medical graduates from Hyderabad have strong employment locally and internationally (UK, USA, Australia routes popular).',
    branches: ['MBBS (General Doctor)', 'BDS (Dental Surgery)', 'BAMS (Ayurveda)', 'BHMS (Homeopathy)', 'BPT (Physiotherapy)', 'B.Sc Nursing', 'Pharm D / B.Pharm'],
  },

  COM: {
    id: 'COM', title: 'Business, Commerce & Finance', emoji: '📊',
    color: '#b7791f', colorLight: '#fffff0',
    tagline: 'Lead companies, manage money, and drive economic growth',
    description: 'Commerce careers span accounting, banking, finance, entrepreneurship, and corporate management. India\'s growing economy constantly demands Chartered Accountants, business analysts, bankers, and managers. CA is one of India\'s most prestigious qualifications.',
    stream: 'Commerce',
    streamNote: 'Accountancy, Business Studies, and Economics form the core. Adding Maths opens more doors.',
    class11: ['Accountancy', 'Business Studies', 'Economics', 'English', 'Mathematics (strongly recommended)'],
    exams: [
      { name: 'CA Foundation', level: 'national', desc: 'First step to Chartered Accountancy — India\'s most respected finance credential. Register with ICAI after Class 12.' },
      { name: 'IPM Entrance (IIM)', level: 'national', desc: '5-year Integrated MBA directly after Class 12. IIM Indore, IIM Rohtak, IIM Ranchi — no gap year needed.' },
      { name: 'CUET', level: 'national', desc: 'For B.Com at Delhi University, Jamia Millia, and other central universities.' },
      { name: 'CMA Foundation', level: 'national', desc: 'Cost & Management Accountancy — parallel to CA, strong in manufacturing and operations finance.' },
      { name: 'State B.Com Entrance', level: 'state', desc: 'Osmania University, Kakatiya University B.Com admissions in Telangana.' },
    ],
    colleges: ['ICAI (CA — nationwide programme)', 'IIM Indore (IPM — after Class 12)', 'Osmania University — B.Com/M.Com', 'GITAM University, Hyderabad (BBA/B.Com)', 'NALSAR Business School, Hyderabad', 'Institute of Cost Accountants of India (CMA)'],
    timeline: [
      { phase: 'Class 9–10', action: 'Follow business news, stock market basics, and everyday economics. Learn mental maths and logical reasoning.' },
      { phase: 'Class 11–12', action: 'Commerce stream. Learn Accountancy perfectly — it\'s the foundation of all finance. Consider Maths for MBA/CA preparation.' },
      { phase: 'After Class 12', action: 'Register with ICAI for CA Foundation, appear for IPM at IIMs, or join CUET for B.Com at top universities.' },
      { phase: 'College (3 years)', action: 'B.Com / BBA degree. Complete CA Intermediate exams simultaneously. Internship at a CA firm.' },
      { phase: 'After Graduation', action: 'CA Final exam, MBA (CAT/GMAT), CFA, or direct placement in Big 4 firms (Deloitte, KPMG, EY, PwC), banks, or corporates.' },
    ],
    salary: '₹4–8 LPA (B.Com / BBA fresher) → ₹15–60+ LPA (CA/MBA with 5–10 years experience)',
    hyderabad: 'T-Hub (Asia\'s largest startup incubator) is in Hyderabad. The city has 500+ IT companies and 200+ BFSI (Banking, Financial Services, Insurance) companies. Chartered Accountants from Hyderabad are in exceptionally high demand in local and global firms.',
    branches: ['Chartered Accountancy (CA)', 'B.Com / M.Com', 'BBA / MBA', 'Cost & Management Accountancy (CMA)', 'Banking & Insurance', 'Financial Analysis (CFA / CPA)'],
  },

  LAW: {
    id: 'LAW', title: 'Law & Policy', emoji: '⚖️',
    color: '#2d3748', colorLight: '#f7fafc',
    tagline: 'Argue for justice and shape the laws that govern society',
    description: 'Lawyers, judges, and policymakers are the backbone of a functioning democracy. Law graduates practice in courts, advise corporations, join government, or shape public policy. NALSAR, Hyderabad, is consistently ranked among India\'s top 3 law schools.',
    stream: 'Any stream',
    streamNote: 'CLAT is open to all streams. Arts/Humanities gives a strong edge for Mains subjects. Science + Law is powerful for IP or healthcare policy.',
    class11: ['Any stream qualifies for CLAT', 'Arts: History, Political Science, Economics is the ideal combination', 'Science or Commerce stream also accepted'],
    exams: [
      { name: 'CLAT', level: 'national', desc: 'Common Law Admission Test — gateway to all National Law Universities (NLUs) including NALSAR Hyderabad. Tests English, Current Affairs, Legal Reasoning, Maths, and Logical Reasoning.' },
      { name: 'AILET', level: 'national', desc: 'National Law University Delhi entrance. ~80 seats, extremely competitive. Separate from CLAT.' },
      { name: 'LSAT India', level: 'private', desc: 'For Symbiosis Law School, O.P. Jindal Global University, and other top private law schools.' },
      { name: 'TS LAWCET', level: 'state', desc: 'Telangana state law entrance for Osmania University Law College and other TS law institutions.' },
    ],
    colleges: ['NALSAR University of Law, Hyderabad — Ranked #1 or #2 in India every year', 'Osmania University Law College', 'ICFAI Law School, Hyderabad', 'O.P. Jindal Global University, Sonipat', 'Symbiosis Law School, Pune'],
    timeline: [
      { phase: 'Class 9–10', action: 'Read newspapers daily. Join debate club. Study History, Political Science, and Civics carefully. Develop strong English writing.' },
      { phase: 'Class 11–12', action: 'Any stream. Start CLAT preparation 1.5–2 years before (English, Current Affairs, Legal Reasoning, Logical Reasoning, Maths).' },
      { phase: 'After Class 12', action: 'Appear for CLAT (May), AILET, LSAT, or TS LAWCET. 5-year integrated BA LLB / BBA LLB programme.' },
      { phase: '5-year LLB', action: 'BA LLB or BBA LLB at NALSAR or another NLU. Moot courts, internships at law firms and courts during holidays.' },
      { phase: 'After LLB', action: 'Enrolled advocate (practice at bar), judicial services exam, corporate legal team, government law officer, or policy/NGO.' },
    ],
    salary: '₹3–6 LPA (junior advocate) → ₹30–200+ LPA (senior advocate or corporate law partner with 10–15 years)',
    hyderabad: 'Telangana High Court, NALSAR University, and growing corporate legal teams (IT companies need IP and contract lawyers) make Hyderabad excellent for law careers. The IT boom has massively increased demand for tech and intellectual property lawyers from this city.',
    branches: ['Advocate / Barrister (Court Practice)', 'Corporate Lawyer', 'Judicial Services (Judge / Magistrate)', 'Legal Advisor (In-house Corporate)', 'Public Policy & NGO', 'Intellectual Property (IP) Law'],
  },

  DES: {
    id: 'DES', title: 'Design & Architecture', emoji: '🎨',
    color: '#97266d', colorLight: '#fff5f7',
    tagline: 'Create the visual world — buildings, brands, and beautiful things',
    description: 'Designers and architects shape everything around us — from buildings and city skylines to logos, fashion collections, and digital interfaces. India\'s construction boom and growing design economy offer expanding opportunities for creative careers.',
    stream: 'Science PCM (for Architecture) or Arts (for Design)',
    streamNote: 'Architecture requires PCM (Maths essential for NATA). Graphic, Fashion, and Interior Design are open to any stream.',
    class11: ['Architecture: Physics, Chemistry, Mathematics (mandatory)', 'Graphic/Fashion Design: Any stream + Fine Arts/Drawing practice', 'English important for both paths'],
    exams: [
      { name: 'NATA', level: 'national', desc: 'National Aptitude Test in Architecture — required for B.Arch admissions at all private and state colleges. Tests drawing, spatial reasoning, and mathematical thinking.' },
      { name: 'JEE Paper 2 (B.Arch)', level: 'national', desc: 'For B.Arch at IITs and NITs. Combines JEE Main score with a drawing/planning aptitude test.' },
      { name: 'NIFT Entrance Exam', level: 'national', desc: 'National Institute of Fashion Technology — India\'s top fashion design institution. Hyderabad campus available. Tests creative ability and general knowledge.' },
      { name: 'NID DAT', level: 'national', desc: 'National Institute of Design — for product design, graphic design, animation, and communication design.' },
      { name: 'CEED', level: 'national', desc: 'IIT Common Entrance Exam for Design — for M.Des at IITs after graduation.' },
    ],
    colleges: ['JNTU School of Planning & Architecture, Hyderabad', 'NIFT Hyderabad (Fashion Design)', 'NID — National Institute of Design, Ahmedabad', 'CEPT University, Ahmedabad (Architecture)', 'IIT Bombay / IIT Delhi (Industrial Design)', 'MIT Institute of Design, Pune'],
    timeline: [
      { phase: 'Class 9–10', action: 'Practise drawing and sketching regularly. Observe architecture, logos, and design around Hyderabad with a critical eye. Join art classes.' },
      { phase: 'Class 11–12', action: 'Science PCM for Architecture (mandatory). Build a strong drawing portfolio. Begin NATA/NIFT preparation.' },
      { phase: 'After Class 12', action: 'Appear for NATA (Architecture) or NIFT/NID (Design) entrance. Score well in aptitude and drawing tests.' },
      { phase: 'College (4–5 years)', action: 'B.Arch (5 years) or B.Des (4 years). Heavy studio project workload plus internships at architecture firms.' },
      { phase: 'After Graduation', action: 'Architecture firm, interior design studio, fashion house, branding agency, or independent practice.' },
    ],
    salary: '₹3–6 LPA (fresher) → ₹15–40+ LPA (established architect or design director)',
    hyderabad: 'Hyderabad\'s massive real estate construction boom in Kokapet, Gachibowli, and the Financial District creates high demand for architects and interior designers. The city also has a growing branding, UI/UX, and digital design industry serving the IT sector.',
    branches: ['Architecture (B.Arch)', 'Interior Design', 'Graphic & Communication Design', 'Fashion Design', 'Product & Industrial Design', 'UX / UI Design'],
  },

  ART: {
    id: 'ART', title: 'Media, Journalism & Communication', emoji: '📢',
    color: '#c05621', colorLight: '#fffaf0',
    tagline: 'Tell stories that inform, move, and inspire millions',
    description: 'Journalists, content creators, advertisers, PR professionals, and filmmakers shape public opinion and culture. Digital media has exploded career possibilities — YouTube, OTT platforms, podcasts, and social media have created entirely new professions in the last decade.',
    stream: 'Arts / Humanities (preferred) or any stream',
    streamNote: 'Arts/Humanities with History, Political Science, and English provides the strongest base for journalism and media careers.',
    class11: ['English (essential)', 'History or Political Science', 'Economics or Sociology', 'Psychology also valuable'],
    exams: [
      { name: 'CUET', level: 'national', desc: 'For BA Mass Communication and Journalism at Delhi University, Jamia Millia, and other central universities.' },
      { name: 'IIMC Entrance', level: 'national', desc: 'Indian Institute of Mass Communication, New Delhi — India\'s most prestigious journalism school.' },
      { name: 'Xavier\'s Communication Test (XIC)', level: 'private', desc: 'Xavier Institute of Communications, Mumbai — top-tier media industry reputation.' },
      { name: 'FTII Entrance', level: 'national', desc: 'Film & Television Institute of India, Pune — for film direction, cinematography, or editing. Graduate-level entry.' },
      { name: 'MCRC (Jamia)', level: 'national', desc: 'Jamia\'s Mass Communication Research Centre — well-placed alumni in print, digital, and broadcast media.' },
    ],
    colleges: ['Osmania University — Department of Mass Communication & Journalism (MCJ)', 'IIMC New Delhi (post-graduation)', 'Xavier Institute of Communication, Mumbai', 'Symbiosis Institute of Media & Communication, Pune', 'Manipal Institute of Communication', 'Asian College of Journalism, Chennai'],
    timeline: [
      { phase: 'Class 9–10', action: 'Read at least one newspaper daily. Write for school magazine. Start a blog or YouTube channel. Learn smartphone photography and video editing.' },
      { phase: 'Class 11–12', action: 'Arts stream preferred. Write essays consistently. Track current affairs. Intern at a local Telugu/English newspaper if possible.' },
      { phase: 'After Class 12', action: 'Appear for CUET, IIMC entrance, or XIC. BA Mass Communication / Journalism (3 years) at a good institution.' },
      { phase: 'College (3 years)', action: 'BA Mass Communication. Create real-world work — articles, videos, podcasts. Build a strong portfolio. Internship is everything in media.' },
      { phase: 'After Graduation', action: 'Reporter, digital content creator, PR executive, advertising copywriter, brand communication manager.' },
    ],
    salary: '₹2–5 LPA (junior reporter / content writer) → ₹12–35+ LPA (senior journalist, media head, or content director)',
    hyderabad: 'Hyderabad has a massive Telugu media industry — TV9, Eenadu, Sakshi TV, ABN Andhra Jyothi, NTV. The English media has significant presence too (Deccan Chronicle, The Hans India). Growing tech industry creates demand for technical writers, content marketers, and PR managers.',
    branches: ['Print & Digital Journalism', 'TV & Radio Broadcasting', 'Advertising & Public Relations', 'Digital Content Creation (YouTube, OTT)', 'Filmmaking & Screenwriting', 'Corporate Communications & Social Media'],
  },

  EDU: {
    id: 'EDU', title: 'Teaching & Social Work', emoji: '📚',
    color: '#276749', colorLight: '#f0fff4',
    tagline: 'Shape the next generation and build a better society',
    description: 'Teachers, counselors, social workers, and NGO professionals make India\'s future. Teaching offers stability, deep respect, and genuine satisfaction. Social work lets you fight poverty and injustice directly at the ground level.',
    stream: 'Any stream',
    streamNote: 'Choose your stream based on the subjects you want to teach or the social sector you want to work in.',
    class11: ['Any stream works', 'Strong English and regional language communication is the key foundation', 'Arts/Humanities for social work; Science for teaching science subjects'],
    exams: [
      { name: 'CTET', level: 'national', desc: 'Central Teacher Eligibility Test — required to teach in KVS, NVS, and central government schools. Valid for life (lifetime validity from 2021).' },
      { name: 'TS TET', level: 'state', desc: 'Telangana Teacher Eligibility Test — required for all Telangana government school teaching positions.' },
      { name: 'B.Ed Entrance', level: 'state', desc: '2-year B.Ed programme for teaching certification after any graduation. Integrated 4-year B.Ed also available now.' },
      { name: 'TISS Entrance (NET)', level: 'national', desc: 'Tata Institute of Social Sciences — India\'s top institution for MSW (Master of Social Work). HAS Hyderabad campus.' },
      { name: 'CUET (BA Education)', level: 'national', desc: 'For BA Education programmes at central universities leading to teaching or counselling careers.' },
    ],
    colleges: ['Osmania University — B.Ed and M.Ed programmes', 'TISS Hyderabad Campus (Social Work)', 'Azim Premji University, Bangalore (Education-focused)', 'Regional Institute of Education (NCERT-affiliated)', 'University of Hyderabad — Education and Social Sciences dept.', 'XISS Ranchi (Social Work)'],
    timeline: [
      { phase: 'Class 9–10', action: 'Tutor younger classmates or siblings. Join NSS or NCC. Develop patience, public speaking, and listening skills.' },
      { phase: 'Class 11–12', action: 'Any stream. Focus on subjects you want to teach long-term. Arts/Humanities for social work pathway.' },
      { phase: 'After Class 12', action: '3-year degree in your subject (BA/B.Sc/B.Com). OR enroll in the new 4-year integrated B.Ed programme.' },
      { phase: 'B.Ed / MSW (2 years)', action: '2-year B.Ed for teaching, or apply to TISS for MSW. Both open strong doors in their respective sectors.' },
      { phase: 'Career', action: 'Govt. school teacher (via TET/CTET → TSPSC recruitment), private school, counselor, NGO field worker, or development sector manager.' },
    ],
    salary: '₹2–6 LPA (govt. school teacher) → ₹5–12 LPA (private/international school) → ₹6–18 LPA (NGO senior manager or TISS alumnus)',
    hyderabad: 'Hyderabad has 3,000+ schools and a large NGO ecosystem — Pratham, Childline, CRY, CARE India, and Akshara Foundation all have Hyderabad offices. Government teacher vacancies in Telangana are regularly announced through TSPSC (Group IV / SGT / Secondary Grade). A secure, respected career.',
    branches: ['Primary & Secondary School Teaching', 'Special Education', 'Educational Counseling & Guidance', 'NGO & Development Work', 'Child Rights & Protection', 'Community Development & Social Work'],
  },

  GOV: {
    id: 'GOV', title: 'Government & Civil Services', emoji: '🏛️',
    color: '#2b6cb0', colorLight: '#ebf4ff',
    tagline: 'Lead the nation — administer districts, shape policy, serve crores',
    description: 'Civil servants — IAS, IPS, IRS, and state service officers — run India\'s administrative machinery. The UPSC Civil Services exam is India\'s most prestigious competitive examination. State services (TSPSC) offer equally powerful careers in Telangana.',
    stream: 'Any stream',
    streamNote: 'Any degree qualifies for UPSC. Arts/Humanities with History, Political Science, and Geography are popular optional subjects for UPSC Mains.',
    class11: ['Any stream qualifies for UPSC', 'Arts/Humanities with History, Political Science, Geography → best UPSC optional foundation', 'Science and Engineering backgrounds also crack UPSC every year'],
    exams: [
      { name: 'UPSC Civil Services (IAS/IPS)', level: 'national', desc: 'India\'s most prestigious exam for IAS, IPS, IRS, and IFS (Foreign Service). Taken after graduation. ~1000 selections per year from 10+ lakh applicants.' },
      { name: 'TSPSC Group I / II / III', level: 'state', desc: 'Telangana state services — DSP, Tahsildar, Revenue Officer, Deputy Collector, DEO. Thousands of posts. Conducted by TSPSC.' },
      { name: 'SSC CGL', level: 'national', desc: 'Staff Selection Commission — Income Tax Inspector, CBI Sub-Inspector, Central Excise Officer, and many central government posts.' },
      { name: 'Banking PO (IBPS/SBI)', level: 'national', desc: 'Probationary Officer in public sector banks — secure career, strong salary, respected position.' },
    ],
    colleges: ['Any recognized degree college qualifies for UPSC/TSPSC', 'University of Hyderabad (strong UPSC alumni network)', 'Osmania University (Political Science, History, Economics depts.)', 'Hyderabad has 100+ UPSC coaching centres — Insights IAS, Drishti, Forum IAS, BYJU\'s IAS are popular'],
    timeline: [
      { phase: 'Class 9–10', action: 'NCERT books are the UPSC backbone — read them carefully. Follow The Hindu or Indian Express daily. Build reading habits.' },
      { phase: 'Class 11–12', action: 'Arts with History, Polity, Geography, Economics builds the strongest UPSC foundation. Science/Maths background also common among toppers.' },
      { phase: 'Graduation (3 years)', action: 'Any Bachelor\'s degree. Begin UPSC preliminary preparation seriously from 2nd year of college.' },
      { phase: 'UPSC Preparation (2–5 years)', action: 'Prelims (Objective) → Mains (Essay/Descriptive) → Personality Test (Interview). Average 3–4 attempts before selection.' },
      { phase: 'After Selection', action: 'IAS → District Collector / Secretary level. IPS → Superintendent of Police. IRS → Income Tax / Customs. TSPSC → Revenue, Education, Police departments.' },
    ],
    salary: '₹56,100/month starting for IAS/IPS + free accommodation, car, utilities (effective ₹15–20 LPA equivalent). TSPSC officers: ₹4–8 LPA. Banking PO: ₹8–12 LPA.',
    hyderabad: 'Hyderabad is Telangana\'s capital — the centre of state administration. TSPSC recruits hundreds of officers annually. The Secretariat, Collectorate, and dozens of government departments are major long-term employers. Hyderabad students have a strong track record in UPSC — multiple toppers from the city in recent years.',
    branches: ['IAS (District Administration & Secretariat)', 'IPS (Police Services)', 'IRS (Income Tax & Customs)', 'IFS (Indian Foreign Service)', 'TSPSC Group I–III (State Officers)', 'Banking PO / SSC (Central Govt.)'],
  },

  SCI: {
    id: 'SCI', title: 'Pure Sciences & Research', emoji: '🔬',
    color: '#0987a0', colorLight: '#e9fafb',
    tagline: 'Ask the deepest questions about the universe and find the answers',
    description: 'Scientists and researchers push the frontier of human knowledge. From particle physics to cancer biology to climate science, research careers offer the thrill of genuine discovery. India\'s ISRO, DRDO, CSIR, IISc, and IISERs are world-class institutions.',
    stream: 'Science (PCM for Physics/Maths research; PCB for Biology/Medicine research)',
    streamNote: 'Strong in both Physics and Biology? PCM with Biology as optional covers all bases.',
    class11: ['Physics', 'Chemistry', 'Maths (for Physics/CS/Chemistry research)', 'Biology (for Life Sciences/Biotech)', 'Computer Science also valuable'],
    exams: [
      { name: 'KVPY / INSPIRE Scholarship', level: 'national', desc: 'Kishore Vaigyanik Protsahan Yojana — fellowship for science students. Appear in Class 11 (SX category). Opens direct admission to IISc and IISERs.' },
      { name: 'IISER Aptitude Test', level: 'national', desc: 'For the 7 Indian Institutes of Science Education and Research — India\'s best pure science colleges. 5-year BS-MS integrated program.' },
      { name: 'IISc Bangalore (BS Research)', level: 'national', desc: 'India\'s top-ranked research university. Entry via KVPY or JEE Advanced rank. Extremely competitive.' },
      { name: 'IIT JAM', level: 'national', desc: 'IIT Joint Admission Test — for M.Sc in Physics, Chemistry, Maths, Biology at IITs after BSc.' },
      { name: 'JEST / GATE (Sciences)', level: 'national', desc: 'For PhD and research positions at TIFR, IMSc, ICTS, and CSIR national laboratories.' },
    ],
    colleges: ['IISc Bangalore — India\'s #1 research university', 'IISERs (Pune, Kolkata, Mohali, Bhopal, Trivandrum, Berhampur, Tirupati)', 'TIFR Mumbai — Tata Institute of Fundamental Research', 'University of Hyderabad — strong research in sciences, ranked top 10', 'CCMB / CDFD / IICT Hyderabad (CSIR labs — excellent PhD programs)', 'HCU (Hyderabad Central University) — good science departments'],
    timeline: [
      { phase: 'Class 9–10', action: 'Excel in Maths and Science. Participate in National Science Olympiad, NTSE. Read popular science books (Feynman, Carl Sagan). Curiosity is your biggest asset.' },
      { phase: 'Class 11–12', action: 'Science stream. Appear for KVPY in Class 11 (SX) — winning it opens IISc/IISER doors and provides a monthly scholarship.' },
      { phase: 'After Class 12', action: 'IISER Aptitude Test, IISc BS Research entrance, or BSc at a strong university. JEE rank can place you in IIT science departments.' },
      { phase: 'BSc / BS (3–5 years)', action: 'Deep study of your chosen science. Lab research, summer projects (SRFP — Summer Research Fellowship), and academic writing.' },
      { phase: 'MSc + PhD (5–6 years)', action: 'PhD fellowship from government: ₹31,000–37,000/month. After PhD: postdoc, faculty position, or transition to industry R&D.' },
    ],
    salary: '₹4–8 LPA (scientist in government lab) → ₹12–25 LPA (senior scientist / assistant professor) → ₹30–60+ LPA (industry R&D, biotech, data science)',
    hyderabad: 'Hyderabad has a remarkable science ecosystem: CCMB, CDFD, ICRISAT, IICT, NGRI, NFC, and multiple DRDO labs are all based here. ISRO\'s National Remote Sensing Centre is also in Hyderabad. The pharma industry (Dr. Reddy\'s, Hetero, Cipla, Divi\'s) employs hundreds of research scientists.',
    branches: ['Physics (Theoretical & Experimental)', 'Chemistry (Organic, Inorganic, Physical)', 'Biology & Biotechnology', 'Mathematics & Statistics', 'Environmental Science', 'Computational Science & Data Science'],
  },
};

// ── STREAM DATA ───────────────────────────────────────────────────────────────
const STREAMS = {
  PCM: {
    name: 'Science with Maths (PCM)',
    subjects: ['Physics', 'Chemistry', 'Mathematics', 'English', '+ 1 optional (Computer Science / Economics / Physical Education)'],
    color: '#2b6cb0',
    note: 'Opens doors to Engineering, Computer Science, Architecture, and all science and research streams. The most versatile science option.',
  },
  PCB: {
    name: 'Science with Biology (PCB)',
    subjects: ['Physics', 'Chemistry', 'Biology', 'English', '+ 1 optional (Maths / Biotechnology)'],
    color: '#c53030',
    note: 'Essential for MBBS (NEET), Dentistry, Pharmacy, Nursing, Biotechnology, and Life Sciences. Adding Maths as optional keeps engineering options open.',
  },
  COM: {
    name: 'Commerce',
    subjects: ['Accountancy', 'Business Studies', 'Economics', 'English', '+ 1 optional (Mathematics / IT / Legal Studies)'],
    color: '#b7791f',
    note: 'Foundation for Chartered Accountancy, MBA, Banking, Finance, and entrepreneurship. Adding Maths makes you eligible for some management entrance exams too.',
  },
  ARTS: {
    name: 'Arts / Humanities',
    subjects: ['History or Political Science', 'Geography or Sociology', 'English', 'Economics', '+ 1 optional (Fine Arts / Psychology / Mathematics)'],
    color: '#276749',
    note: 'Best pathway for Law (CLAT → NALSAR), Civil Services (UPSC), Journalism, Teaching, and Social Work. More flexible subject choices than Science.',
  },
};

// How well each career cluster fits each stream (0–3)
const STREAM_FIT = {
  ENG: { PCM: 3, PCB: 0, COM: 0, ARTS: 0 },
  CS:  { PCM: 3, PCB: 0, COM: 0, ARTS: 0 },
  MED: { PCM: 0, PCB: 3, COM: 0, ARTS: 0 },
  COM: { PCM: 0, PCB: 0, COM: 3, ARTS: 1 },
  LAW: { PCM: 1, PCB: 1, COM: 1, ARTS: 2 },
  DES: { PCM: 2, PCB: 0, COM: 0, ARTS: 2 },
  ART: { PCM: 0, PCB: 0, COM: 1, ARTS: 3 },
  EDU: { PCM: 0, PCB: 1, COM: 1, ARTS: 2 },
  GOV: { PCM: 1, PCB: 1, COM: 1, ARTS: 2 },
  SCI: { PCM: 3, PCB: 2, COM: 0, ARTS: 0 },
};

// ── HYDERABAD SCHOOLS (by stream) ────────────────────────────────────────────
const SCHOOLS = {
  PCM: {
    note: 'Look for junior colleges with integrated JEE/EAMCET coaching alongside board preparation. Most Hyderabad coaching colleges offer MPC (Maths, Physics, Chemistry) integrated programmes.',
    list: [
      { name: 'Sri Chaitanya Junior College', detail: 'Largest network in Telangana. Separate IIT and Engineering batches. Strong JEE Main & Advanced record.' },
      { name: 'Narayana Junior College', detail: 'Multiple Hyderabad campuses. Renowned for JEE & EAMCET results. Intensive revision programmes.' },
      { name: 'Bhashyam Junior College', detail: 'Competitive coaching with TSBIE board curriculum. Good Maths and Physics faculty.' },
      { name: 'FIITJEE / Resonance Hyderabad', detail: 'Coaching-integrated junior college model. Best suited for serious JEE Main/Advanced aspirants.' },
      { name: 'Sri Gayatri Junior College', detail: 'Strong TS EAMCET record. Multiple Hyderabad locations. Affordable fees.' },
      { name: 'Government Model Junior Colleges (TSBIE)', detail: 'Free education. MPC stream. Excellent science faculty at major campuses — good EAMCET results.' },
      { name: 'Kendriya Vidyalaya (KV) Schools, Hyderabad', detail: 'CBSE board. Multiple KV campuses. Solid academic foundation for JEE preparation.' },
    ]
  },
  PCB: {
    note: 'NEET demands deep Biology and Chemistry mastery. Choose a college that balances TSBIE board preparation with NEET coaching — they are different syllabi.',
    list: [
      { name: 'Sri Chaitanya Junior College (Medical)', detail: 'Dedicated medical batches with NEET-focused curriculum. Largest NEET coaching network in Telangana.' },
      { name: 'Narayana Junior College (Medical)', detail: 'Consistently strong NEET results. Dedicated MBiPC (Maths, Biology, Physics, Chemistry) batches.' },
      { name: 'Aakash Institute + Partner Junior Colleges', detail: 'National NEET leader. Hyderabad study centre. Some tie-ups with local junior colleges.' },
      { name: 'Bhashyam Junior College', detail: 'BiPC stream with good laboratory facilities and NEET preparation.' },
      { name: 'NTR Memorial Junior Colleges', detail: 'Government supported. MBiPC stream. Affordable and academically solid.' },
      { name: 'Government Junior Colleges (TSBIE)', detail: 'Free education. BiPC stream widely available. Dedicated Biology labs at major campuses.' },
    ]
  },
  COM: {
    note: 'Strong Accountancy and Business Studies are the foundation for CA, MBA, and banking careers. Choose a college known for its commerce department.',
    list: [
      { name: 'Badruka Junior College of Commerce', detail: 'Hyderabad\'s oldest commerce college (est. 1952). Strong B.Com and CA Foundation pathway.' },
      { name: 'St. Francis Junior College', detail: 'Reputed English-medium college. Commerce stream with strong Accountancy faculty.' },
      { name: 'Loyola Academy Junior College', detail: 'Jesuit institution. Strong academic culture. Commerce with Maths option available.' },
      { name: 'Aurora Junior College', detail: 'Popular commerce college in Hyderabad. Good industry connections.' },
      { name: 'Don Bosco Junior College', detail: 'Commerce and Science streams. Known for discipline and consistent board results.' },
      { name: 'Government Junior Colleges (TSBIE)', detail: 'Free. CEC (Commerce, Economics, Civics) stream at many Hyderabad government campuses.' },
    ]
  },
  ARTS: {
    note: 'Strong English, History, and Political Science are essential for CLAT, UPSC, Journalism, and Humanities degrees. Build your reading habit from Day 1.',
    list: [
      { name: 'Loyola Academy Junior College', detail: 'Excellent Humanities department. Strong English, History, and Economics faculty. Good debate culture.' },
      { name: 'St. Francis Junior College', detail: 'HEC (History, Economics, Civics) and MEC streams. Good language and communication training.' },
      { name: 'Osmania University-affiliated Junior Colleges', detail: 'Wide selection across Hyderabad. Strong Humanities faculty at established campuses.' },
      { name: 'The Hyderabad Public School (HPS, Begumpet)', detail: 'One of India\'s most prestigious schools. Humanities stream. Strong debate and writing culture.' },
      { name: 'Government Junior Colleges (TSBIE)', detail: 'Free. HEC (History, Economics, Civics) widely available across Hyderabad government campuses.' },
      { name: 'Chirec / Oakridge / Gitanjali International', detail: 'CBSE/IGCSE Humanities track. Good for students also considering UK or US universities.' },
    ]
  }
};

// ── QUIZ QUESTIONS ────────────────────────────────────────────────────────────
const SECTIONS = {
  A: { label: 'Section A', title: 'Academic Interests' },
  B: { label: 'Section B', title: 'Activities & Hobbies' },
  C: { label: 'Section C', title: 'Work Style' },
  D: { label: 'Section D', title: 'Future Vision' },
};

const QUESTIONS = [
  // ── SECTION A: Academic Interests ──────────────────────────────────────
  {
    id: 1, section: 'A',
    q: 'Which school subject do you enjoy the most?',
    opts: [
      { t: 'Mathematics and Physics — solving complex problems',       s: { ENG:2, CS:2, SCI:1 } },
      { t: 'Biology and Chemistry — understanding living things',       s: { MED:2, SCI:2 } },
      { t: 'History, Economics, or Civics — understanding society',    s: { GOV:2, LAW:1, COM:1 } },
      { t: 'Languages, Art, or Drawing — expressing creative ideas',   s: { ART:2, DES:2, EDU:1 } },
    ]
  },
  {
    id: 2, section: 'A',
    q: 'Your teacher assigns a project. Which one excites you most?',
    opts: [
      { t: 'Build a working model — a bridge, circuit, or small robot', s: { ENG:2, CS:1, SCI:1 } },
      { t: 'Research a disease and present findings to the class',       s: { MED:2, SCI:2 } },
      { t: 'Create a business plan and pitch it like a startup founder', s: { COM:2, LAW:1 } },
      { t: 'Write, direct, or design a creative campaign or short film', s: { ART:2, DES:2 } },
    ]
  },
  {
    id: 3, section: 'A',
    q: 'If you could choose your own timetable, which two subjects would you definitely include?',
    opts: [
      { t: 'Maths + Physics (or Computer Science)',           s: { ENG:2, CS:2, SCI:1 } },
      { t: 'Biology + Chemistry',                             s: { MED:2, SCI:2 } },
      { t: 'Economics + Business Studies (or Politics)',      s: { COM:2, GOV:1, LAW:1 } },
      { t: 'English Literature + Drawing (or Fine Arts)',     s: { ART:2, DES:2, EDU:1 } },
    ]
  },
  {
    id: 4, section: 'A',
    q: 'When you face a tough problem, what is your first instinct?',
    opts: [
      { t: 'Break it into logical steps and solve with numbers or formulas',  s: { ENG:2, CS:2, SCI:1 } },
      { t: 'Think about how it affects people and what help they need',        s: { MED:1, EDU:2, GOV:1 } },
      { t: 'Research what the rules, laws, or experts say about it',           s: { LAW:2, GOV:2 } },
      { t: 'Come up with a creative or visual solution',                        s: { DES:2, ART:2 } },
    ]
  },
  {
    id: 5, section: 'A',
    q: 'You start watching a documentary. Which topic would hold your attention longest?',
    opts: [
      { t: 'How rockets, AI systems, or machines are engineered',        s: { ENG:2, CS:2, SCI:1 } },
      { t: 'How doctors fought an epidemic or discovered a new cure',     s: { MED:2, SCI:1 } },
      { t: 'How a government handled a national crisis or election',      s: { GOV:2, LAW:1, COM:1 } },
      { t: 'How an artist, designer, or filmmaker changed culture',       s: { ART:2, DES:2 } },
    ]
  },

  // ── SECTION B: Activities & Hobbies ────────────────────────────────────
  {
    id: 6, section: 'B',
    q: 'What do you usually end up doing in your free time?',
    opts: [
      { t: 'Gaming, coding, tinkering with gadgets, or watching tech videos', s: { CS:2, ENG:2 } },
      { t: 'Helping unwell family members or watching medical shows',           s: { MED:2, EDU:1 } },
      { t: 'Reading news, following politics, or debating world events',        s: { GOV:2, LAW:2, COM:1 } },
      { t: 'Drawing, writing stories, making videos, or playing music',         s: { DES:2, ART:2 } },
    ]
  },
  {
    id: 7, section: 'B',
    q: 'Your school is hosting competitions. Which one would you enter?',
    opts: [
      { t: 'Science Olympiad, Maths Quiz, or Coding Hackathon',        s: { ENG:1, CS:1, SCI:2 } },
      { t: 'Biology Quiz, Health Awareness Drive, or First Aid event', s: { MED:2, SCI:1, EDU:1 } },
      { t: 'Debate, Mock Parliament, or Entrepreneurship Challenge',    s: { LAW:2, GOV:1, COM:2 } },
      { t: 'Art Exhibition, Creative Writing, or Short Film Contest',  s: { DES:2, ART:2 } },
    ]
  },
  {
    id: 8, section: 'B',
    q: 'A friend needs your help. Which situation would you handle best?',
    opts: [
      { t: 'Their laptop crashed before an exam — you figure out how to fix it', s: { CS:2, ENG:1 } },
      { t: 'They are scared and unwell — you calm and care for them',             s: { MED:2, EDU:2 } },
      { t: 'They are being treated unfairly — you help argue their case',         s: { LAW:2, GOV:1 } },
      { t: 'They need an eye-catching poster done fast — you design it',          s: { DES:2, ART:1 } },
    ]
  },
  {
    id: 9, section: 'B',
    q: 'If you could shadow a professional for one day, who would you choose?',
    opts: [
      { t: 'A software engineer at a tech company in Hyderabad (Google/TCS)',  s: { CS:2, ENG:1, COM:1 } },
      { t: 'A doctor doing ward rounds at a hospital',                           s: { MED:2 } },
      { t: 'A District Collector (IAS officer) or a High Court lawyer',          s: { GOV:2, LAW:2 } },
      { t: 'A fashion designer, architect, or award-winning filmmaker',          s: { DES:2, ART:2 } },
    ]
  },
  {
    id: 10, section: 'B',
    q: 'What would you most want to create in your lifetime?',
    opts: [
      { t: 'A useful app, machine, or technological invention',              s: { CS:2, ENG:2, SCI:1 } },
      { t: 'A medicine, treatment, or health programme that saves lives',    s: { MED:2, SCI:2 } },
      { t: 'A successful company or a law that helps millions of people',    s: { COM:2, LAW:2 } },
      { t: 'An artwork, film, building, or design that people remember',     s: { ART:2, DES:2 } },
    ]
  },

  // ── SECTION C: Work Style ───────────────────────────────────────────────
  {
    id: 11, section: 'C',
    q: 'How do you prefer to work most of the time?',
    opts: [
      { t: 'Alone, focused on analytical or technical problems',              s: { CS:2, ENG:2, SCI:2 } },
      { t: 'Directly with patients, students, or people who need guidance',  s: { MED:2, EDU:2 } },
      { t: 'In a group — debating, strategising, and making decisions',       s: { LAW:2, GOV:2, COM:1 } },
      { t: 'Independently on creative projects at my own pace',               s: { DES:2, ART:2 } },
    ]
  },
  {
    id: 12, section: 'C',
    q: 'Which phrase describes you best?',
    opts: [
      { t: 'I love finding the most logical and efficient solution',         s: { ENG:1, CS:2, SCI:1, COM:1 } },
      { t: 'I am naturally good at understanding and taking care of people', s: { MED:2, EDU:2 } },
      { t: 'I enjoy researching, debating, and convincing others',           s: { LAW:2, GOV:1, ART:1 } },
      { t: 'I need to create — making beautiful or original things drives me', s: { DES:2, ART:2 } },
    ]
  },
  {
    id: 13, section: 'C',
    q: 'When you succeed at something, what makes you feel most satisfied?',
    opts: [
      { t: 'A system I built works perfectly, or my code runs without errors',  s: { CS:2, ENG:2 } },
      { t: 'Someone\'s health or situation genuinely improved because of me',    s: { MED:2, EDU:2, GOV:1 } },
      { t: 'I won an argument or negotiation fair and square',                   s: { LAW:2, COM:1 } },
      { t: 'The final output is beautiful and original, and people notice it',  s: { DES:2, ART:2 } },
    ]
  },
  {
    id: 14, section: 'C',
    q: 'Which work schedule sounds most appealing to you?',
    opts: [
      { t: 'Project-based: intense problem-solving, then the satisfaction of completion', s: { ENG:1, CS:1, SCI:2, DES:1 } },
      { t: 'People-focused: different patients or students every day, always helping',    s: { MED:2, EDU:2 } },
      { t: 'Structured office hours: meetings, court sessions, or policy work',           s: { LAW:2, GOV:2, COM:2 } },
      { t: 'Flexible: manage your own time, travel for stories, or work from a studio',   s: { ART:2, DES:1, SCI:1 } },
    ]
  },

  // ── SECTION D: Future Vision ────────────────────────────────────────────
  {
    id: 15, section: 'D',
    q: 'Which headline would you most want to see about yourself in 20 years?',
    opts: [
      { t: '"[Your name]\'s engineering team builds India\'s fastest train"',        s: { ENG:2, CS:1 } },
      { t: '"Dr. [Your name] discovers breakthrough treatment for rare disease"',    s: { MED:2, SCI:2 } },
      { t: '"[Your name] listed in Forbes India 30 Under 30 for business innovation"', s: { COM:2, CS:1 } },
      { t: '"[Your name], IAS — youngest District Collector in Telangana"',          s: { GOV:2, LAW:1 } },
    ]
  },
  {
    id: 16, section: 'D',
    q: 'Where do you picture yourself working on a typical weekday?',
    opts: [
      { t: 'A tech campus or research lab — screens, whiteboards, experiments',  s: { CS:2, ENG:1, SCI:2 } },
      { t: 'A hospital, clinic, or school — people depending on you every hour', s: { MED:2, EDU:1 } },
      { t: 'A government office, courtroom, or corporate boardroom',              s: { LAW:2, GOV:2, COM:1 } },
      { t: 'A studio, newsroom, or creative agency — energy, deadlines, ideas',  s: { DES:2, ART:2 } },
    ]
  },
  {
    id: 17, section: 'D',
    q: 'What do you most want your career to give you?',
    opts: [
      { t: 'High salary, financial freedom, and long-term job security',      s: { CS:1, ENG:1, COM:2 } },
      { t: 'The feeling that I helped people and made a real difference',      s: { MED:2, EDU:2, GOV:1 } },
      { t: 'Power, prestige, and the ability to change how the system works',  s: { LAW:2, GOV:2 } },
      { t: 'Creative freedom to build, express, and pursue discovery',         s: { DES:2, ART:2, SCI:1 } },
    ]
  },
  {
    id: 18, section: 'D',
    q: 'Which story inspires you the most?',
    opts: [
      { t: 'Sundar Pichai — from Madurai to CEO of Google',                         s: { CS:2, ENG:1, COM:1 } },
      { t: 'Dr. Tessy Thomas — led India\'s Agni missile programme from DRDO',      s: { SCI:2, ENG:2, GOV:1 } },
      { t: 'Kiran Mazumdar-Shaw — built Biocon into India\'s top biotech company',  s: { MED:1, SCI:1, COM:2 } },
      { t: 'Priyanka Paul — 19-year-old whose illustrations went global',           s: { ART:2, DES:2 } },
    ]
  },
];

// Shuffle each question's options once at load — prevents any obvious A=tech, B=med pattern
;(function shuffleAllOpts() {
  QUESTIONS.forEach(q => {
    for (let i = q.opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [q.opts[i], q.opts[j]] = [q.opts[j], q.opts[i]];
    }
  });
})();

// ── APP STATE ─────────────────────────────────────────────────────────────────
const state = {
  name: '', grade: '', section: '',
  currentQ: 0,
  answers: {},
  scores: {},
  topCareers: [],
  recommendedStream: null,
  chatHistory: [],
};

// ── SCORING ───────────────────────────────────────────────────────────────────
function calculateResults() {
  const scores = { ENG:0, CS:0, MED:0, COM:0, LAW:0, DES:0, ART:0, EDU:0, GOV:0, SCI:0 };

  Object.entries(state.answers).forEach(([qId, optIdx]) => {
    const q = QUESTIONS.find(x => x.id === parseInt(qId));
    if (!q) return;
    Object.entries(q.opts[optIdx].s).forEach(([k, v]) => { scores[k] = (scores[k] || 0) + v; });
  });

  state.scores = scores;

  state.topCareers = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .map(([id, score]) => ({ id, score }));

  // Stream recommendation: weight top 3 careers
  const streamScores = { PCM:0, PCB:0, COM:0, ARTS:0 };
  state.topCareers.slice(0, 3).forEach(({ id, score }, rank) => {
    const w = rank === 0 ? 3 : rank === 1 ? 2 : 1;
    Object.entries(STREAM_FIT[id]).forEach(([stream, fit]) => {
      streamScores[stream] += fit * w;
    });
  });
  const topStreamKey = Object.entries(streamScores).sort((a, b) => b[1] - a[1])[0][0];
  state.recommendedStream = { key: topStreamKey, ...STREAMS[topStreamKey] };
}

// ── VIEW MANAGEMENT ───────────────────────────────────────────────────────────
function showView(id) {
  document.querySelectorAll('.view').forEach(v => {
    v.classList.toggle('active', v.id === id);
    v.classList.toggle('hidden', v.id !== id);
  });
}

// ── QUIZ LOGIC ────────────────────────────────────────────────────────────────
function renderQuestion() {
  const q = QUESTIONS[state.currentQ];
  const total = QUESTIONS.length;
  const sec = SECTIONS[q.section];

  document.getElementById('q-current').textContent = state.currentQ + 1;
  document.getElementById('q-total').textContent = total;
  document.getElementById('progress-bar').style.width = `${((state.currentQ) / total) * 100}%`;

  document.getElementById('quiz-section-badge').textContent = `${sec.label}: ${sec.title}`;
  document.getElementById('quiz-q-label').textContent = `Question ${state.currentQ + 1} of ${total}`;
  document.getElementById('quiz-question').textContent = q.q;

  const letters = ['A', 'B', 'C', 'D'];
  const selectedOpt = state.answers[q.id];
  const container = document.getElementById('quiz-options');
  container.innerHTML = q.opts.map((opt, i) => `
    <button class="option-card${selectedOpt === i ? ' selected' : ''}" data-index="${i}">
      <span class="option-letter">${letters[i]}</span>
      <span class="option-text">${opt.t}</span>
    </button>
  `).join('');

  container.querySelectorAll('.option-card').forEach(card => {
    card.addEventListener('click', () => selectOption(parseInt(card.dataset.index)));
  });

  document.getElementById('btn-next-q').disabled = selectedOpt === undefined;
  document.getElementById('btn-prev-q').style.visibility = state.currentQ === 0 ? 'hidden' : 'visible';
}

function selectOption(idx) {
  state.answers[QUESTIONS[state.currentQ].id] = idx;
  document.querySelectorAll('.option-card').forEach((c, i) => {
    c.classList.toggle('selected', i === idx);
  });
  document.getElementById('btn-next-q').disabled = false;
}

// ── RESULTS RENDERING ─────────────────────────────────────────────────────────
function renderResults() {
  document.getElementById('results-name').textContent = `${state.name}'s Career Report`;
  document.getElementById('results-meta').textContent =
    `Grade ${state.grade}${state.section ? ', Section ' + state.section : ''} · Johns Academy · Career Compass`;
  document.getElementById('print-date').textContent =
    new Date().toLocaleDateString('en-IN', { year:'numeric', month:'long', day:'numeric' });

  // Summary card — visible immediately above the fold
  const [top1, top2, top3] = state.topCareers.slice(0, 3).map(({ id }) => CAREERS[id]);
  const stream = state.recommendedStream;
  document.getElementById('summary-top-match').innerHTML = `
    <div class="summary-top1" style="background:${top1.color}">
      <span class="summary-top1-emoji">${top1.emoji}</span>
      <div>
        <div class="summary-top1-label">Your #1 Career Match</div>
        <div class="summary-top1-title">${top1.title}</div>
      </div>
    </div>
    <div class="summary-others">
      <div class="summary-other">
        <span>${top2.emoji}</span>
        <span class="summary-other-title">${top2.title}</span>
        <span class="summary-other-rank">#2</span>
      </div>
      <div class="summary-other">
        <span>${top3.emoji}</span>
        <span class="summary-other-title">${top3.title}</span>
        <span class="summary-other-rank">#3</span>
      </div>
    </div>
    <div class="summary-stream" style="border-color:${stream.color}">
      <div class="summary-stream-label">Recommended Class 11 Stream</div>
      <div class="summary-stream-name" style="color:${stream.color}">${stream.name}</div>
    </div>`;

  renderStep1();
  renderStep2();
  renderStep3();

  // Score chart (now at bottom)
  const maxScore = Math.max(...Object.values(state.scores), 1);
  document.getElementById('score-chart').innerHTML = state.topCareers.map(({ id, score }) => {
    const c = CAREERS[id];
    const pct = Math.round((score / maxScore) * 100);
    return `
      <div class="score-row">
        <div class="score-label"><span class="score-emoji">${c.emoji}</span><span>${c.title}</span></div>
        <div class="score-bar-bg"><div class="score-bar-fill" data-pct="${pct}" style="background:${c.color}"></div></div>
        <div class="score-pct">${pct}%</div>
      </div>`;
  }).join('');
  requestAnimationFrame(() => {
    document.querySelectorAll('.score-bar-fill').forEach(b => { b.style.width = b.dataset.pct + '%'; });
  });

  // Career explore cards
  const ranks = ['1st Match', '2nd Match', '3rd Match'];
  document.getElementById('career-cards').innerHTML = state.topCareers.slice(0, 3).map(({ id }, i) => {
    const c = CAREERS[id];
    const topExams = c.exams.slice(0, 2).map(e => e.name).join(', ');
    return `
      <div class="career-card" data-career="${id}" tabindex="0" role="button" aria-label="View details for ${c.title}">
        <div class="career-card-header" style="background:${c.color}">
          <span class="career-card-emoji">${c.emoji}</span>
          <div><h4>${c.title}</h4><div class="career-card-rank">${ranks[i]}</div></div>
        </div>
        <div class="career-card-body">
          <p class="career-card-tagline">"${c.tagline}"</p>
          <p class="career-card-stream">&#9654; Stream: ${c.stream}</p>
          <p class="career-card-exams"><strong>Key Exams:</strong> ${topExams}</p>
          <p class="career-card-cta">Tap for full details &rarr;</p>
        </div>
      </div>`;
  }).join('');

  document.querySelectorAll('.career-card').forEach(card => {
    const open = () => openModal(card.dataset.career);
    card.addEventListener('click', open);
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') open(); });
  });

  initChat();
}

function renderStep1() {
  const stream = state.recommendedStream;
  const schools = SCHOOLS[stream.key];
  document.getElementById('step1-content').innerHTML = `
    <div class="stream-card" style="margin-bottom:20px">
      <div class="stream-card-header" style="background:${stream.color}">
        <div style="flex:1">
          <h3>${stream.name}</h3>
          <p>${stream.note}</p>
        </div>
        <div class="stream-card-badge">RECOMMENDED</div>
      </div>
      <div class="stream-card-body">
        <div class="stream-subjects">${stream.subjects.map(s => `<span class="subject-chip">${s}</span>`).join('')}</div>
      </div>
    </div>
    <p class="step-note">${schools.note}</p>
    <div class="step-schools">
      ${schools.list.map(s => `
        <div class="step-school-item">
          <div class="step-school-name">${s.name}</div>
          <div class="step-school-detail">${s.detail}</div>
        </div>`).join('')}
    </div>`;
}

function renderStep2() {
  const top3 = state.topCareers.slice(0, 3).map(({ id }) => CAREERS[id]);
  const seen = new Set();
  const blocks = top3.map(c => {
    const exams = c.exams.filter(e => !seen.has(e.name) && seen.add(e.name));
    if (!exams.length) return '';
    return `
      <div class="step-career-block">
        <div class="step-career-label" style="border-left-color:${c.color}">${c.emoji} ${c.title}</div>
        <div class="exams-list">
          ${exams.map(e => `
            <div class="exam-row">
              <span class="exam-badge ${e.level}">${e.level.toUpperCase()}</span>
              <div class="exam-info"><strong>${e.name}</strong>${e.desc}</div>
            </div>`).join('')}
        </div>
      </div>`;
  }).join('');
  document.getElementById('step2-content').innerHTML = `
    <p class="step-note">Start preparing for these exams during Class 11 &amp; 12 — alongside your board exams.</p>
    ${blocks}`;
}

function renderStep3() {
  const top3 = state.topCareers.slice(0, 3).map(({ id }) => CAREERS[id]);
  const blocks = top3.map(c => `
    <div class="step-career-block">
      <div class="step-career-label" style="border-left-color:${c.color}">${c.emoji} ${c.title}</div>
      <div class="modal-section-title" style="margin-bottom:8px">Degree Options</div>
      <div class="branches-wrap" style="margin-bottom:14px">
        ${c.branches.map(b => `<span class="branch-chip">${b}</span>`).join('')}
      </div>
      <div class="modal-section-title" style="margin-bottom:8px">Colleges in Hyderabad &amp; India</div>
      <div class="colleges-list">
        ${c.colleges.map(col => `<div class="college-item">${col}</div>`).join('')}
      </div>
    </div>`).join('');
  document.getElementById('step3-content').innerHTML = `
    <p class="step-note">After finishing Class 12 and entrance exams, these are your target degree programmes and colleges.</p>
    ${blocks}`;
}

// ── CAREER DETAIL MODAL ───────────────────────────────────────────────────────
function openModal(careerId) {
  const c = CAREERS[careerId];
  const levelClass = { national: 'national', state: 'state', private: 'private' };

  document.getElementById('modal-content').innerHTML = `
    <div class="modal-hero" style="background:${c.color}">
      <span class="modal-hero-emoji">${c.emoji}</span>
      <div>
        <h2>${c.title}</h2>
        <p>${c.tagline}</p>
      </div>
    </div>
    <div class="modal-body">
      <p class="modal-desc">${c.description}</p>

      <div class="modal-section">
        <div class="modal-section-title">Class 11 Stream</div>
        <div class="modal-stream-box">
          <strong>${c.stream}</strong>
          <p class="modal-stream-note">${c.streamNote}</p>
          <div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:6px">
            ${c.class11.map(s => `<span class="subject-chip">${s}</span>`).join('')}
          </div>
        </div>
      </div>

      <div class="modal-section">
        <div class="modal-section-title">Key Entrance Exams</div>
        <div class="exams-list">
          ${c.exams.map(e => `
            <div class="exam-row">
              <span class="exam-badge ${levelClass[e.level] || 'national'}">${e.level.toUpperCase()}</span>
              <div class="exam-info"><strong>${e.name}</strong>${e.desc}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="modal-section">
        <div class="modal-section-title">Top Colleges (India &amp; Hyderabad)</div>
        <div class="colleges-list">
          ${c.colleges.map(col => `<div class="college-item">${col}</div>`).join('')}
        </div>
      </div>

      <div class="modal-section">
        <div class="modal-section-title">Roadmap: Class 10 → Career</div>
        <div class="timeline-list">
          ${c.timeline.map(t => `
            <div class="timeline-row">
              <div class="timeline-phase">${t.phase}</div>
              <div class="timeline-action">${t.action}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="modal-section">
        <div class="modal-section-title">Expected Salary in India</div>
        <div class="modal-salary"><strong>${c.salary}</strong></div>
      </div>

      <div class="modal-section">
        <div class="modal-section-title">Hyderabad Advantage</div>
        <div class="modal-hyderabad">${c.hyderabad}</div>
      </div>

      <div class="modal-section">
        <div class="modal-section-title">Branches &amp; Specialisations</div>
        <div class="branches-wrap">
          ${c.branches.map(b => `<span class="branch-chip">${b}</span>`).join('')}
        </div>
      </div>
    </div>
  `;

  document.getElementById('modal-overlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
  document.body.style.overflow = '';
}

// ── AI CHAT ───────────────────────────────────────────────────────────────────
function initChat() {
  const top3 = state.topCareers.slice(0, 3).map(({ id }) => CAREERS[id].title).join(', ');
  const noticeEl = document.getElementById('chat-not-configured');
  const boxEl = document.getElementById('chat-box');
  const nameEl = document.getElementById('chat-student-name');
  const topCareerEl = document.getElementById('chat-top-career');

  if (!CHAT_PROXY_URL) {
    noticeEl.classList.remove('hidden');
    boxEl.style.display = 'none';
    return;
  }

  nameEl.textContent = state.name;
  topCareerEl.textContent = top3;

  state.chatHistory = [{
    role: 'user',
    content: `[Context: This is ${state.name}, a Grade ${state.grade} student at Johns Academy, Hyderabad, India. Their top 3 career matches from the assessment are: ${top3}. Their recommended Class 11 stream is: ${state.recommendedStream.name}. Please answer their career questions as an expert Indian career counsellor who knows about entrance exams (JEE, NEET, CLAT, EAMCET, etc.), Hyderabad colleges, and the Indian education system.]`,
  }, {
    role: 'assistant',
    content: `Hi ${state.name}! I've reviewed your assessment results. You're a great match for ${top3}. I'm here to answer any questions about your career path, Class 11 stream choice, entrance exams, or colleges in Hyderabad and across India. What would you like to know?`,
  }];

  // Pre-render the greeting bubble
  appendChatBubble('assistant', `Hi ${state.name}! I've reviewed your assessment. You're a great match for <strong>${top3}</strong>. Ask me anything about your career path, Class 11 stream, entrance exams, or colleges in India.`);
}

function appendChatBubble(role, html) {
  const msgs = document.getElementById('chat-messages');
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${role}`;
  bubble.innerHTML = html;
  msgs.appendChild(bubble);
  msgs.scrollTop = msgs.scrollHeight;
}

async function sendChat() {
  if (!CHAT_PROXY_URL) return;
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text) return;

  input.value = '';
  appendChatBubble('user', text);
  state.chatHistory.push({ role: 'user', content: text });

  const thinkingEl = document.getElementById('chat-thinking');
  thinkingEl.classList.remove('hidden');
  document.getElementById('btn-send').disabled = true;

  try {
    const response = await fetch(CHAT_PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        system: `You are an expert career counsellor specialising in the Indian education system, with deep knowledge of Hyderabad colleges, entrance exams (JEE, NEET, CLAT, TS EAMCET, BITSAT, CUET, CA Foundation, etc.), and career pathways. You are advising ${state.name}, a Grade ${state.grade} student at Johns Academy, Hyderabad. Their top career matches are: ${state.topCareers.slice(0,3).map(({id})=>CAREERS[id].title).join(', ')}. Recommended stream: ${state.recommendedStream?.name}. Keep responses concise, practical, and encouraging. Use simple language suitable for a 14–16 year old. Always reference specific Indian exams, colleges, and timelines.`,
        messages: state.chatHistory.filter(m => m.role !== 'system').slice(-10),
      }),
    });

    const data = await response.json();
    const reply = data.content?.[0]?.text || 'Sorry, I couldn\'t get a response. Please try again.';
    state.chatHistory.push({ role: 'assistant', content: reply });
    appendChatBubble('assistant', reply);
  } catch {
    appendChatBubble('assistant', 'There was a connection error. Please check your internet and try again.');
  } finally {
    thinkingEl.classList.add('hidden');
    document.getElementById('btn-send').disabled = false;
    document.getElementById('chat-input').focus();
  }
}

// ── INIT ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Welcome grade radio card highlight
  document.querySelectorAll('input[name="welcome-grade"]').forEach(radio => {
    radio.addEventListener('change', () => {
      document.getElementById('w-grade-9-card').classList.toggle('selected', document.getElementById('w-grade-9').checked);
      document.getElementById('w-grade-10-card').classList.toggle('selected', document.getElementById('w-grade-10').checked);
    });
  });

  // Welcome → Quiz (single step)
  document.getElementById('btn-start').addEventListener('click', () => {
    const name = document.getElementById('welcome-name').value.trim();
    const grade = document.querySelector('input[name="welcome-grade"]:checked')?.value;
    const errEl = document.getElementById('welcome-error');
    if (!name || !grade) { errEl.classList.remove('hidden'); return; }
    errEl.classList.add('hidden');
    state.name = name;
    state.grade = grade;
    state.section = '';
    state.currentQ = 0;
    showView('view-quiz');
    renderQuestion();
  });

  // Quiz navigation
  document.getElementById('btn-next-q').addEventListener('click', () => {
    if (state.answers[QUESTIONS[state.currentQ].id] === undefined) return;
    if (state.currentQ < QUESTIONS.length - 1) {
      state.currentQ++;
      renderQuestion();
    } else {
      // Final question answered — show loading then results
      document.getElementById('progress-bar').style.width = '100%';
      showView('view-loading');
      setTimeout(() => {
        calculateResults();
        showView('view-results');
        renderResults();
      }, 1800);
    }
  });

  document.getElementById('btn-prev-q').addEventListener('click', () => {
    if (state.currentQ > 0) { state.currentQ--; renderQuestion(); }
  });

  // Enter key on quiz options
  document.getElementById('quiz-options').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('btn-next-q').click();
  });

  // Modal close
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-overlay').addEventListener('click', e => {
    if (e.target === document.getElementById('modal-overlay')) closeModal();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  // Chat send
  document.getElementById('btn-send').addEventListener('click', sendChat);
  document.getElementById('chat-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') sendChat();
  });
});
