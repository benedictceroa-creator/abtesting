// ── SETUP ────────────────────────────────────────────────────────────────────
// Paste your Google Apps Script proxy URL here after deploying ChatProxy.gs.
// Leave empty to disable the AI chat feature.
const CHAT_PROXY_URL = '';

// ── CAREER DATA ───────────────────────────────────────────────────────────────
const CAREERS = {
  ENG: {
    id: 'ENG', title: 'Engineering & Technology',
    summary: 'Designing, building, and maintaining machines, structures, and systems.',
    description: 'Engineers apply mathematics and science to design, build, and maintain machines, structures, and systems. India has an enormous demand for engineers — from bridges and power plants to aerospace, pharmaceuticals, and manufacturing.',
    stream: 'Science with PCM',
    streamNote: 'Physics, Chemistry, and Mathematics are essential for all engineering entrance exams.',
    class11: ['Physics', 'Chemistry', 'Mathematics', 'English', 'Computer Science (optional)'],
    exams: [
      { name: 'JEE Main', level: 'national', desc: 'Gateway to NITs, IIITs, and government engineering colleges nationwide. Two attempts per year (Jan & April).' },
      { name: 'JEE Advanced', level: 'national', desc: 'For IITs — one of the world\'s hardest exams. Top 2.5 lakh JEE Main scorers qualify to attempt.' },
      { name: 'TG EAPCET', level: 'state', desc: 'Telangana entrance (formerly EAMCET) for 200+ engineering colleges in Hyderabad, Warangal, and across the state.' },
      { name: 'BITSAT', level: 'private', desc: 'BITS Pilani – Hyderabad Campus entrance. Excellent placements at top companies.' },
    ],
    colleges: ['IIT Hyderabad (Sangareddy)', 'BITS Pilani – Hyderabad Campus', 'IIIT Hyderabad', 'JNTU College of Engineering, Hyderabad', 'Osmania University (Engineering)', 'Vasavi College of Engineering, Hyderabad', 'Chaitanya Bharathi Institute of Technology'],
    timeline: [
      { phase: 'Class 7–10', action: 'Build strong Maths & Science foundation. Practise NTSE and Olympiad problems. Identify a preferred branch early.' },
      { phase: 'Class 11–12', action: 'PCM stream. Start JEE/EAPCET coaching early. Balance board preparation with entrance exam practice.' },
      { phase: 'After Class 12', action: 'Appear for JEE Main (Jan & April), JEE Advanced, TG EAPCET, and BITSAT. IITs/NITs need 75% in Class 12 (or a top-20-percentile board score).' },
      { phase: 'B.Tech (4 years)', action: 'Engineering degree in your chosen branch: Civil, Mechanical, Electrical, Chemical, or others.' },
      { phase: 'After Graduation', action: 'Campus placements, GATE exam for M.Tech/PSU jobs (BHEL, ONGC, DRDO), entrepreneurship, or MBA.' },
    ],
    salary: '₹4–8 LPA (fresher) → ₹15–40+ LPA (5+ years experience)',
    hyderabad: 'Hyderabad is home to DRDO, HAL, BDL (defence aerospace), BHEL (power), and hundreds of pharma manufacturing plants. Engineering graduates from Hyderabad colleges have very strong local and national placement pipelines.',
    branches: ['Civil Engineering', 'Mechanical Engineering', 'Electrical & Electronics', 'Chemical Engineering', 'Electronics & Communication (ECE)'],
  },

  CS: {
    id: 'CS', title: 'Computer Science & IT',
    summary: 'Building software, apps, and data systems, and the networks they run on.',
    description: 'Computer Science graduates build software, apps, AI systems, and digital infrastructure. Hyderabad is India\'s second-largest IT hub — Google, Microsoft, Amazon, TCS, Infosys, Wipro, and hundreds of startups are headquartered or have major offices here.',
    stream: 'Science with PCM',
    streamNote: 'Taking Computer Science as an elective in Class 11 gives a strong head start for college coding.',
    class11: ['Physics', 'Chemistry', 'Mathematics', 'English', 'Computer Science (strongly recommended)'],
    exams: [
      { name: 'JEE Main / Advanced', level: 'national', desc: 'CS/IT at IITs and NITs — the top pathway for India\'s most competitive CS placements.' },
      { name: 'TG EAPCET', level: 'state', desc: 'CS and IT seats at all Telangana state engineering colleges including JNTU campuses.' },
      { name: 'IIIT Hyderabad (UGEE)', level: 'private', desc: 'IIIT-H\'s own entrance for its dual-degree programmes (it also admits through JEE Main). Direct entry to IIIT-H — one of India\'s very best CS institutions with exceptional placement records.' },
      { name: 'BITSAT', level: 'private', desc: 'CS/IT at BITS Pilani Hyderabad campus. Top recruiters: Google, Microsoft, Goldman Sachs.' },
      { name: 'CUET', level: 'national', desc: 'For BSc Computer Science at central universities, if not targeting engineering.' },
    ],
    colleges: ['IIIT Hyderabad — India\'s top CS institute outside IITs', 'IIT Hyderabad', 'BITS Pilani – Hyderabad Campus', 'JNTU Hyderabad (CS/IT/AI branches)', 'Osmania University (CS/IT)', 'Woxsen University, Hyderabad'],
    timeline: [
      { phase: 'Class 7–10', action: 'Learn basic programming (Python). Explore platforms like CodeChef, HackerRank. Excel in Maths.' },
      { phase: 'Class 11–12', action: 'PCM + Computer Science. Build small projects. Start JEE/EAPCET/IIIT-H entrance prep alongside boards.' },
      { phase: 'After Class 12', action: 'Appear for JEE, TG EAPCET, IIIT-H UGEE, and BITSAT. Focus on B.Tech in CS, IT, or AI.' },
      { phase: 'B.Tech (4 years)', action: 'Deep CS fundamentals + internships + competitive coding + open-source projects. Build your profile.' },
      { phase: 'After Graduation', action: 'Software Engineer, Data Scientist, or Product Manager at campus placements (₹8–25 LPA average at IIIT-H/IIT-H).' },
    ],
    salary: '₹6–12 LPA (fresher in Hyderabad IT) → ₹25–80+ LPA (senior/specialist with 7–10 years)',
    hyderabad: 'Hyderabad\'s IT sector employs around 9 lakh people, centred on HITEC City and Gachibowli. All FAANG companies (Google, Microsoft, Amazon, Meta, Apple) have major Hyderabad offices. CS graduates from good Hyderabad colleges are extremely well-placed in this city.',
    branches: ['Computer Science Engineering', 'Information Technology', 'Data Science & AI', 'Machine Learning Engineering', 'Cybersecurity'],
  },

  MED: {
    id: 'MED', title: 'Medicine & Healthcare',
    summary: 'Diagnosing and treating illness and caring for patients — as a doctor, nurse, pharmacist, or therapist.',
    description: 'Medical careers are among India\'s most respected. Doctors, nurses, pharmacists, and physiotherapists have direct impact on people\'s lives every day. NEET-UG is the single national gateway to MBBS admissions across India.',
    stream: 'Science with PCB',
    streamNote: 'Biology is mandatory for NEET. Physics and Chemistry are equally important and must be studied seriously.',
    class11: ['Physics', 'Chemistry', 'Biology', 'English', 'Maths or Biotechnology (optional)'],
    exams: [
      { name: 'NEET-UG', level: 'national', desc: 'The only exam for MBBS and BDS in India. ~20 lakh students compete for ~1 lakh MBBS seats annually. NCERT is the primary study material.' },
      { name: 'NEET-UG (BDS)', level: 'national', desc: 'Bachelor of Dental Surgery — 5-year program. Same exam, different cutoff than MBBS.' },
      { name: 'TG EAPCET (Agriculture & Pharmacy)', level: 'state', desc: 'For B.Pharm, Pharm D, and B.Sc Agriculture in Telangana. (BAMS, BHMS, and BDS seats go through NEET.)' },
      { name: 'AIIMS (via NEET)', level: 'national', desc: 'AIIMS now uses NEET scores. Very top rankers → AIIMS Delhi, AIIMS Bibinagar (about 40 km from Hyderabad).' },
    ],
    colleges: ['Osmania Medical College, Hyderabad (oldest in Telangana, est. 1846)', 'Gandhi Medical College, Secunderabad', 'NIMS – Nizam\'s Institute of Medical Sciences', 'Deccan College of Medical Sciences', 'AIIMS Bibinagar (Yadadri Bhuvanagiri district)', 'MNR Medical College, Sangareddy'],
    timeline: [
      { phase: 'Class 7–10', action: 'Master NCERT Biology, Physics, Chemistry. Practise diagram labeling and long-answer writing. NEET questions are mostly NCERT-based.' },
      { phase: 'Class 11–12', action: 'PCB stream. Dedicate 3–4 hours daily to NEET prep alongside boards. Biology must be memorised thoroughly.' },
      { phase: 'After Class 12', action: 'Appear for NEET in May. Score 50%+ in PCB for eligibility. Multiple attempts allowed if needed.' },
      { phase: 'MBBS (5.5 years)', action: '4.5 years of medical education + 1 year compulsory rotatory internship in a hospital.' },
      { phase: 'After MBBS', action: 'Start as general physician, OR appear for NEET-PG for specialization (MD/MS in a specialty like Surgery, Pediatrics, etc.).' },
    ],
    salary: '₹8–15 LPA (junior doctor) → ₹30–100+ LPA (experienced specialist with private practice)',
    hyderabad: 'Hyderabad is a major medical hub — Apollo, Yashoda, KIMS, Care Hospitals, AIG, and Sunshine Hospitals are headquartered here. Telangana has opened many new government medical colleges in recent years, alongside well-established private ones. Medical graduates from Hyderabad have strong employment locally and internationally (UK, USA, Australia routes popular).',
    branches: ['MBBS (General Doctor)', 'BDS (Dental Surgery)', 'BAMS (Ayurveda)', 'BHMS (Homeopathy)', 'BPT (Physiotherapy)', 'B.Sc Nursing', 'Pharm D / B.Pharm'],
  },

  COM: {
    id: 'COM', title: 'Business, Commerce & Finance',
    summary: 'Managing money, accounts, and businesses — in companies, banks, or a venture of your own.',
    description: 'Commerce careers span accounting, banking, finance, entrepreneurship, and corporate management. India\'s growing economy constantly demands Chartered Accountants, business analysts, bankers, and managers. CA is one of India\'s most prestigious qualifications.',
    stream: 'Commerce',
    streamNote: 'Accountancy, Business Studies, and Economics form the core. Adding Maths opens more doors.',
    class11: ['Accountancy', 'Business Studies', 'Economics', 'English', 'Mathematics (strongly recommended)'],
    exams: [
      { name: 'CA Foundation', level: 'national', desc: 'First step to Chartered Accountancy — India\'s most respected finance credential. Register with ICAI after Class 12.' },
      { name: 'IPM Entrance (IIM)', level: 'national', desc: '5-year Integrated MBA directly after Class 12. IIM Indore, IIM Rohtak, IIM Ranchi — no gap year needed.' },
      { name: 'CUET', level: 'national', desc: 'For B.Com at Delhi University, Jamia Millia, and other central universities.' },
      { name: 'CMA Foundation', level: 'national', desc: 'Cost & Management Accountancy — parallel to CA, strong in manufacturing and operations finance.' },
      { name: 'DOST (Telangana Degree Admissions)', level: 'state', desc: 'Online admission for B.Com, BA, and B.Sc at Osmania, Kakatiya, and other Telangana universities — based on Intermediate marks, no entrance exam.' },
    ],
    colleges: ['ICAI (CA — nationwide programme)', 'IIM Indore (IPM — after Class 12)', 'Osmania University — B.Com/M.Com', 'GITAM University, Hyderabad (BBA/B.Com)', 'NALSAR — Department of Management Studies (MBA)', 'Institute of Cost Accountants of India (CMA)'],
    timeline: [
      { phase: 'Class 7–10', action: 'Follow business news, stock market basics, and everyday economics. Learn mental maths and logical reasoning.' },
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
    id: 'LAW', title: 'Law & Policy',
    summary: 'Advising people and organisations on the law, and representing them in court.',
    description: 'Lawyers, judges, and policymakers are the backbone of a functioning democracy. Law graduates practice in courts, advise corporations, join government, or shape public policy. NALSAR, Hyderabad, is consistently ranked among India\'s top 3 law schools.',
    stream: 'Any stream',
    streamNote: 'CLAT is open to all streams. Arts/Humanities gives a strong edge for Mains subjects. Science + Law is powerful for IP or healthcare policy.',
    class11: ['Any stream qualifies for CLAT', 'Arts: History, Political Science, Economics is the ideal combination', 'Science or Commerce stream also accepted'],
    exams: [
      { name: 'CLAT', level: 'national', desc: 'Common Law Admission Test — gateway to all National Law Universities (NLUs) including NALSAR Hyderabad. Tests English, Current Affairs, Legal Reasoning, Maths, and Logical Reasoning.' },
      { name: 'AILET', level: 'national', desc: 'National Law University Delhi entrance. Only about 100–120 seats, extremely competitive. Separate from CLAT.' },
      { name: 'SLAT & University Tests', level: 'private', desc: 'Symbiosis Law Admission Test (SLAT) and each private university\'s own entrance — e.g. O.P. Jindal Global University.' },
      { name: 'TG LAWCET', level: 'state', desc: 'Telangana state law entrance for Osmania University Law College and other Telangana law colleges.' },
    ],
    colleges: ['NALSAR University of Law, Hyderabad — consistently in India\'s top 3 (NIRF)', 'Osmania University Law College', 'ICFAI Law School, Hyderabad', 'O.P. Jindal Global University, Sonipat', 'Symbiosis Law School, Pune'],
    timeline: [
      { phase: 'Class 7–10', action: 'Read newspapers daily. Join debate club. Study Social Studies carefully. Develop strong English writing.' },
      { phase: 'Class 11–12', action: 'Any stream. Start CLAT preparation 1.5–2 years before (English, Current Affairs, Legal Reasoning, Logical Reasoning, Maths).' },
      { phase: 'After Class 12', action: 'Appear for CLAT (held in December), AILET, SLAT, or TG LAWCET. 5-year integrated BA LLB / BBA LLB programme.' },
      { phase: '5-year LLB', action: 'BA LLB or BBA LLB at NALSAR or another NLU. Moot courts, internships at law firms and courts during holidays.' },
      { phase: 'After LLB', action: 'Enrolled advocate (practice at bar), judicial services exam, corporate legal team, government law officer, or policy/NGO.' },
    ],
    salary: '₹3–6 LPA (junior advocate) → ₹30–200+ LPA (senior advocate or corporate law partner with 10–15 years)',
    hyderabad: 'Telangana High Court, NALSAR University, and growing corporate legal teams (IT companies need IP and contract lawyers) make Hyderabad excellent for law careers. The IT boom has massively increased demand for tech and intellectual property lawyers from this city.',
    branches: ['Advocate / Barrister (Court Practice)', 'Corporate Lawyer', 'Judicial Services (Judge / Magistrate)', 'Legal Advisor (In-house Corporate)', 'Public Policy & NGO', 'Intellectual Property (IP) Law'],
  },

  DES: {
    id: 'DES', title: 'Design & Architecture',
    summary: 'Designing buildings, interiors, products, clothing, and visual communication.',
    description: 'Designers and architects shape everything around us — from buildings and city skylines to logos, fashion collections, and digital interfaces. India\'s construction boom and growing design economy offer expanding opportunities for creative careers.',
    stream: 'Science PCM (for Architecture) or Arts (for Design)',
    streamNote: 'Architecture requires PCM (Maths essential for NATA). Graphic, Fashion, and Interior Design are open to any stream.',
    class11: ['Architecture: Physics, Chemistry, Mathematics (mandatory)', 'Graphic/Fashion Design: Any stream + Fine Arts/Drawing practice', 'English important for both paths'],
    exams: [
      { name: 'NATA', level: 'national', desc: 'National Aptitude Test in Architecture — required for B.Arch admissions at all private and state colleges. Tests drawing, spatial reasoning, and mathematical thinking.' },
      { name: 'JEE Paper 2 (B.Arch)', level: 'national', desc: 'For B.Arch at IITs and NITs. Combines JEE Main score with a drawing/planning aptitude test.' },
      { name: 'NIFT Entrance Exam', level: 'national', desc: 'National Institute of Fashion Technology — India\'s top fashion design institution. Hyderabad campus available. Tests creative ability and general knowledge.' },
      { name: 'NID DAT', level: 'national', desc: 'National Institute of Design — for product design, graphic design, animation, and communication design.' },
      { name: 'UCEED', level: 'national', desc: 'IIT entrance for B.Des after Class 12 — IIT Bombay, Delhi, Guwahati, Hyderabad, and others.' },
    ],
    colleges: ['JNAFAU — Jawaharlal Nehru Architecture & Fine Arts University, Hyderabad', 'NIFT Hyderabad (Fashion Design)', 'NID — National Institute of Design, Ahmedabad', 'CEPT University, Ahmedabad (Architecture)', 'IIT Bombay / IIT Hyderabad (B.Des via UCEED)', 'MIT Institute of Design, Pune'],
    timeline: [
      { phase: 'Class 7–10', action: 'Practise drawing and sketching regularly. Observe architecture, logos, and design around Hyderabad with a critical eye. Join art classes.' },
      { phase: 'Class 11–12', action: 'Science PCM for Architecture (mandatory). Build a strong drawing portfolio. Begin NATA/NIFT/UCEED preparation.' },
      { phase: 'After Class 12', action: 'Appear for NATA (Architecture) or NIFT/NID (Design) entrance. Score well in aptitude and drawing tests.' },
      { phase: 'College (4–5 years)', action: 'B.Arch (5 years) or B.Des (4 years). Heavy studio project workload plus internships at architecture firms.' },
      { phase: 'After Graduation', action: 'Architecture firm, interior design studio, fashion house, branding agency, or independent practice.' },
    ],
    salary: '₹3–6 LPA (fresher) → ₹15–40+ LPA (established architect or design director)',
    hyderabad: 'Hyderabad\'s massive real estate construction boom in Kokapet, Gachibowli, and the Financial District creates high demand for architects and interior designers. The city also has a growing branding, UI/UX, and digital design industry serving the IT sector.',
    branches: ['Architecture (B.Arch)', 'Interior Design', 'Graphic & Communication Design', 'Fashion Design', 'Product & Industrial Design', 'UX / UI Design'],
  },

  ART: {
    id: 'ART', title: 'Media, Journalism & Communication',
    summary: 'Reporting, writing, filming, and communicating for news organisations, media, and brands.',
    description: 'Journalists, content creators, advertisers, PR professionals, and filmmakers shape public opinion and culture. Digital media has exploded career possibilities — YouTube, OTT platforms, podcasts, and social media have created entirely new professions in the last decade.',
    stream: 'Arts / Humanities (preferred) or any stream',
    streamNote: 'Arts/Humanities with History, Political Science, and English provides the strongest base for journalism and media careers.',
    class11: ['English (essential)', 'History or Political Science', 'Economics or Sociology', 'Psychology also valuable'],
    exams: [
      { name: 'CUET', level: 'national', desc: 'For BA Mass Communication and Journalism at Delhi University, Jamia Millia, and other central universities.' },
      { name: 'SET / IPU CET', level: 'private', desc: 'After Class 12: Symbiosis Entrance Test (BA Mass Communication) and IP University CET (BJMC, Delhi).' },
      { name: 'IIMC Entrance', level: 'national', desc: 'Indian Institute of Mass Communication, New Delhi — India\'s most prestigious journalism school. Post-graduate diploma, after your degree.' },
      { name: 'Xavier\'s Communication Test (XIC)', level: 'private', desc: 'Xavier Institute of Communications, Mumbai — top-tier media industry reputation. After graduation.' },
      { name: 'FTII Entrance', level: 'national', desc: 'Film & Television Institute of India, Pune — for film direction, cinematography, or editing. Graduate-level entry.' },
      { name: 'MCRC (Jamia)', level: 'national', desc: 'Jamia\'s Mass Communication Research Centre — MA after graduation; well-placed alumni in print, digital, and broadcast media.' },
    ],
    colleges: ['Osmania University — Department of Mass Communication & Journalism (MCJ)', 'IIMC New Delhi (post-graduation)', 'Xavier Institute of Communication, Mumbai', 'Symbiosis Institute of Media & Communication, Pune', 'Manipal Institute of Communication', 'Asian College of Journalism, Chennai'],
    timeline: [
      { phase: 'Class 7–10', action: 'Read at least one newspaper daily. Write for school magazine. Start a blog or YouTube channel. Learn smartphone photography and video editing.' },
      { phase: 'Class 11–12', action: 'Arts stream preferred. Write essays consistently. Track current affairs. Intern at a local Telugu/English newspaper if possible.' },
      { phase: 'After Class 12', action: 'Appear for CUET, SET, or IPU CET. BA Mass Communication / Journalism (3 years) — then IIMC, XIC, or MCRC for a post-graduate diploma.' },
      { phase: 'College (3 years)', action: 'BA Mass Communication. Create real-world work — articles, videos, podcasts. Build a strong portfolio. Internship is everything in media.' },
      { phase: 'After Graduation', action: 'Reporter, digital content creator, PR executive, advertising copywriter, brand communication manager.' },
    ],
    salary: '₹2–5 LPA (junior reporter / content writer) → ₹12–35+ LPA (senior journalist, media head, or content director)',
    hyderabad: 'Hyderabad has a massive Telugu media industry — TV9, Eenadu, Sakshi TV, ABN Andhra Jyothi, NTV. The English media has significant presence too (Deccan Chronicle, The Hans India). Growing tech industry creates demand for technical writers, content marketers, and PR managers.',
    branches: ['Print & Digital Journalism', 'TV & Radio Broadcasting', 'Advertising & Public Relations', 'Digital Content Creation (YouTube, OTT)', 'Filmmaking & Screenwriting', 'Corporate Communications & Social Media'],
  },

  EDU: {
    id: 'EDU', title: 'Teaching & Education',
    summary: 'Teaching children and young people, and helping schools run well.',
    description: 'Teachers make India\'s future, one class at a time. Teaching offers stability, deep respect, and the daily satisfaction of watching students understand something new. Good teachers are needed at every level — from early years to senior secondary and beyond.',
    stream: 'Any stream',
    streamNote: 'Choose your stream based on the subjects you want to teach — Science to teach Science, Commerce to teach Accountancy, and so on.',
    class11: ['Any stream works', 'Strong English and regional language communication is the key foundation', 'Pick the subjects you would enjoy teaching for years'],
    exams: [
      { name: 'CTET', level: 'national', desc: 'Central Teacher Eligibility Test — required to teach in KVS, NVS, and central government schools. Valid for life (lifetime validity from 2021).' },
      { name: 'TG TET', level: 'state', desc: 'Telangana Teacher Eligibility Test — required for all Telangana government school teaching positions.' },
      { name: 'TG EdCET', level: 'state', desc: 'Telangana entrance for the 2-year B.Ed, taken after any degree.' },
      { name: 'NCET (ITEP)', level: 'national', desc: 'National entrance for the 4-year Integrated Teacher Education Programme — become a teacher straight after Class 12.' },
      { name: 'CUET (BA Education)', level: 'national', desc: 'For BA Education programmes at central universities leading to teaching careers.' },
    ],
    colleges: ['Osmania University — B.Ed and M.Ed programmes', 'Azim Premji University, Bangalore (Education-focused)', 'Regional Institute of Education (NCERT-affiliated)', 'University of Hyderabad — School of Education'],
    timeline: [
      { phase: 'Class 7–10', action: 'Tutor younger classmates or siblings. Develop patience, public speaking, and listening skills.' },
      { phase: 'Class 11–12', action: 'Any stream. Focus on the subjects you want to teach long-term.' },
      { phase: 'After Class 12', action: '3-year degree in your subject (BA/B.Sc/B.Com). OR enroll in the new 4-year integrated B.Ed programme.' },
      { phase: 'B.Ed (2 years)', action: '2-year B.Ed for teaching certification, with practice teaching in real schools.' },
      { phase: 'Career', action: 'Govt. school teacher (via TET/CTET → Telangana DSC recruitment), private or international school teacher, special educator, or school leader.' },
    ],
    salary: '₹2–6 LPA (govt. school teacher) → ₹5–12 LPA (private/international school) → ₹12–20 LPA (senior teacher / school leadership)',
    hyderabad: 'Hyderabad has 3,000+ schools, from government and KV schools to large international school chains. Government teacher posts in Telangana are filled through the DSC (District Selection Committee) recruitment exam. A secure, respected career.',
    branches: ['Primary & Secondary School Teaching', 'Subject Specialist (Senior Secondary)', 'Special Education', 'Early Childhood Education', 'Educational Technology', 'School Leadership'],
  },

  CMN: {
    id: 'CMN', title: 'Community & Counselling',
    summary: 'Counselling, social work, youth work, and pastoral ministry — supporting people and communities.',
    description: 'Counsellors, psychologists, social workers, NGO leaders, youth workers, and pastors and other faith leaders all help people through hard moments and hold communities together. These careers suit people who listen well, speak with conviction, and want their work to serve a bigger purpose.',
    stream: 'Arts / Humanities (preferred) or any stream',
    streamNote: 'Psychology, Sociology, and English are the best base. Science (PCB) helps if you want to become a clinical psychologist.',
    class11: ['Psychology', 'Sociology or Political Science', 'English', 'Any stream is accepted for most degrees'],
    pathwayNote: 'Community & Counselling careers are open to any stream. What counts most is experience: volunteering, leading a youth group, and helping in your community or faith group.',
    exams: [
      { name: 'CUET', level: 'national', desc: 'For BA Psychology, Sociology, or Social Work (BSW) at central universities.' },
      { name: 'TISS (MSW / MA Counselling)', level: 'national', desc: 'Tata Institute of Social Sciences — India\'s top institution for social work, with a Hyderabad campus. Admission is after graduation, now through CUET-PG.' },
      { name: 'Seminary / Theology Admission', level: 'private', desc: 'For pastoral ministry: Bachelor of Theology (B.Th) or B.D. at a seminary, usually after Class 12 or a degree, often with a recommendation from your church.' },
      { name: 'M.Phil Clinical Psychology (RCI)', level: 'national', desc: 'Rehabilitation Council of India–recognised route to become a licensed clinical psychologist, after an MA in Psychology.' },
    ],
    colleges: ['TISS Hyderabad Campus (Social Work)', 'University of Hyderabad (Psychology, Sociology)', 'Osmania University (Psychology, Social Work)', 'St. Francis College for Women, Begumpet (Psychology)', 'Andhra Christian Theological College, Hyderabad (Theology)', 'Union Biblical Seminary, Pune / SAIACS, Bangalore (Theology)'],
    timeline: [
      { phase: 'Class 7–10', action: 'Volunteer — NSS, youth groups, community or faith activities. Practise listening carefully and speaking in front of groups.' },
      { phase: 'Class 11–12', action: 'Psychology, Sociology, English. Lead a club, youth group, or service project.' },
      { phase: 'After Class 12', action: 'BA Psychology / Sociology / Social Work (BSW), or B.Th at a seminary for ministry.' },
      { phase: 'College (3–4 years)', action: 'Fieldwork with NGOs, counselling centres, or your faith community. Find a mentor already doing the work you want to do.' },
      { phase: 'Career', action: 'MSW / MA Counselling / M.Div or ordination → counsellor, social worker, NGO manager, youth pastor, pastor, or chaplain.' },
    ],
    salary: '₹2.5–5 LPA (early-career social worker, counsellor, or youth worker) → ₹8–18 LPA (clinical psychologist, NGO manager, senior counsellor). Pastoral pay varies widely by church or organisation.',
    hyderabad: 'Hyderabad has a large NGO and CSR sector (Pratham, CRY, CARE India, Akshara Foundation), counselling roles in schools, hospitals, and IT companies, and long-established churches, seminaries, and faith-based organisations across Secunderabad and the city.',
    branches: ['School & Career Counselling', 'Clinical / Counselling Psychology', 'Social Work & NGO Leadership', 'Youth Work & Mentoring', 'Pastoral Ministry & Chaplaincy', 'Community Development'],
  },

  DEF: {
    id: 'DEF', title: 'Defence & Uniformed Services',
    summary: 'Serving in the Army, Navy, Air Force, police, or emergency services.',
    description: 'Officers and personnel in the armed forces, central armed police (CRPF, BSF, CISF), state police, and fire and disaster response. The work is physically demanding and highly respected, with clear ranks, structured training, and long-term security.',
    stream: 'Any stream (PCM for Navy & Air Force)',
    streamNote: 'Army entry through NDA is open to any stream. The Navy and Air Force wings of NDA require Physics and Maths in Class 12.',
    class11: ['PCM keeps every NDA wing open (Army, Navy, Air Force)', 'Any stream qualifies for the Army wing, CDS (after graduation), and police', 'NCC in school or college is a big advantage'],
    pathwayNote: 'Defence: Army entry through NDA is open to any stream, but the Navy and Air Force wings need Physics and Maths in Class 12. Fitness and NCC matter as much as marks.',
    exams: [
      { name: 'NDA & NA (UPSC)', level: 'national', desc: 'After Class 12 (age about 16½–19½). Written exam + 5-day SSB interview + medical. Leads to officer training at NDA Khadakwasla, Pune. Held twice a year.' },
      { name: 'CDS (UPSC)', level: 'national', desc: 'For graduates — entry to Indian Military Academy, Naval Academy, Air Force Academy, and OTA Chennai.' },
      { name: 'AFCAT', level: 'national', desc: 'Air Force Common Admission Test — for graduates joining flying, technical, and ground duty branches.' },
      { name: 'Agniveer (Agnipath)', level: 'national', desc: '4-year enlistment in the Army, Navy, or Air Force after Class 10/12; up to 25% are retained for regular service.' },
      { name: 'Telangana Police Recruitment', level: 'state', desc: 'State police Sub-Inspector (graduates) and Constable (Class 12) posts, with written, physical, and medical tests.' },
    ],
    colleges: ['National Defence Academy, Khadakwasla (Pune)', 'Indian Military Academy, Dehradun', 'Indian Naval Academy, Ezhimala', 'Air Force Academy, Dundigal (Hyderabad)', 'Officers Training Academy, Chennai', 'Sainik Schools / RIMC (entry from Class 6 or 9)'],
    timeline: [
      { phase: 'Class 7–10', action: 'Build fitness — running, swimming, push-ups. Join NCC or Scouts. Read the newspaper and practise spoken English and general knowledge.' },
      { phase: 'Class 11–12', action: 'PCM if you want the Navy or Air Force. Prepare for the NDA written exam (Maths + General Ability) alongside boards.' },
      { phase: 'After Class 12', action: 'NDA written exam → SSB interview (psychology tests, group tasks, interview) → medical exam.' },
      { phase: 'Training (4 years)', action: '3 years at NDA + 1 year at the Indian Military, Naval, or Air Force Academy.' },
      { phase: 'Career', action: 'Commissioned officer (Lieutenant / Sub-Lieutenant / Flying Officer), promoted by rank, with the option to serve 20+ years with pension.' },
    ],
    salary: 'Lieutenant: about ₹56,100/month basic + Military Service Pay + allowances (roughly ₹10–12 LPA early on) → ₹25+ LPA at senior ranks, plus housing, medical care, and pension.',
    hyderabad: 'Hyderabad has the Air Force Academy (Dundigal), the College of Defence Management and the Military College of Electronics & Mechanical Engineering (both Secunderabad), and a large Army presence in Secunderabad Cantonment. Telangana Police recruits regularly.',
    branches: ['Army (Infantry, Artillery, Engineers, Signals)', 'Navy (Executive, Engineering, Naval Aviation)', 'Air Force (Flying, Technical, Ground Duty)', 'Police (IPS via UPSC, State Sub-Inspector)', 'Central Armed Police (CRPF, BSF, CISF)', 'Fire & Disaster Response (NDRF)'],
  },

  SPT: {
    id: 'SPT', title: 'Sports, Fitness & Coaching',
    summary: 'Playing, coaching, and teaching sport, and keeping athletes fit and healthy.',
    description: 'Professional athletes, coaches, PE teachers, physiotherapists, fitness trainers, sports scientists, and sports managers. Becoming a professional athlete takes talent plus years of training, so most successful sportspeople also build a backup path in coaching, teaching, or sports science.',
    stream: 'Any stream',
    streamNote: 'Your training schedule matters more than your stream. Pick a school and stream that leave time for daily practice. PCB helps if you want physiotherapy or sports science.',
    class11: ['Any stream works for athletes and coaches', 'Physical Education as an elective (offered by CBSE)', 'PCB for physiotherapy or sports science'],
    pathwayNote: 'Sports: no stream is required. Choose a school whose timetable lets you train every day, and keep your marks steady as a backup. PCB helps if you want physiotherapy or sports science.',
    exams: [
      { name: 'Khelo India / SAI Selection', level: 'national', desc: 'Sports Authority of India talent identification and the Khelo India Youth Games — selection into training centres with coaching, hostel, and stipend.' },
      { name: 'TG PECET (B.P.Ed)', level: 'state', desc: 'Telangana Physical Education entrance for B.P.Ed — the route to becoming a PE teacher or coach.' },
      { name: 'NEET-UG / State CET (Physiotherapy)', level: 'national', desc: 'For BPT (Bachelor of Physiotherapy) — the base for sports physio and rehabilitation work.' },
      { name: 'Sports Quota', level: 'national', desc: 'Reserved seats in colleges and jobs (Railways, Army, banks, police) for district, state, and national level medal winners.' },
    ],
    colleges: ['Pullela Gopichand Badminton Academy, Gachibowli', 'Telangana State Sports School, Hakimpet', 'Osmania University — College of Physical Education', 'Lakshmibai National Institute of Physical Education (LNIPE), Gwalior', 'Netaji Subhas National Institute of Sports (NIS), Patiala — coaching courses'],
    timeline: [
      { phase: 'Class 7–10', action: 'Pick one or two sports and train with a coach. Play inter-school, district, and state tournaments — results here open doors.' },
      { phase: 'Class 11–12', action: 'Choose a school schedule that allows training. Aim for state or national selection while keeping academics steady.' },
      { phase: 'After Class 12', action: 'Full-time sport at an academy or SAI centre, or a degree that keeps you in sport: B.P.Ed, BPT, B.Sc Sports Science, BBA Sports Management.' },
      { phase: 'College (3–4 years)', action: 'Represent your university at the Khelo India University Games. Earn coaching certificates (NIS).' },
      { phase: 'Career', action: 'Professional athlete, coach, PE teacher, physiotherapist, strength & conditioning coach, sports analyst, or a sports-quota government job.' },
    ],
    salary: '₹2.5–5 LPA (PE teacher / fitness trainer fresher) → ₹8–20 LPA (experienced coach, physio, or sports scientist). Top professional athletes earn far more, but very few reach that level.',
    hyderabad: 'Hyderabad is one of India\'s top badminton centres (Pullela Gopichand Academy trained P.V. Sindhu and Saina Nehwal), with the Gachibowli stadium complex, the Hakimpet sports school, and a strong cricket and kabaddi scene (Sunrisers Hyderabad, Telugu Titans).',
    branches: ['Professional Athlete', 'Coach / PE Teacher', 'Physiotherapy & Sports Medicine', 'Strength & Conditioning / Fitness', 'Sports Science & Performance Analysis', 'Sports Management'],
  },

  PER: {
    id: 'PER', title: 'Performing Arts',
    summary: 'Performing and teaching music, dance, theatre, and acting.',
    description: 'Musicians, singers, dancers, actors, theatre artists, voice artists, and music producers. It is a competitive field built on years of practice and a record of performances. Many performers also teach, compose, or work behind the scenes for a steady income.',
    stream: 'Arts / Humanities (preferred) or any stream',
    streamNote: 'No stream is required. Arts leaves more time and offers electives like Music or Dance — but regular training with a teacher or institute matters most.',
    class11: ['Any stream', 'Music / Dance electives where offered (CBSE has Hindustani & Carnatic Music and Dance)', 'English and a regional language — useful for theatre and voice work'],
    pathwayNote: 'Performing arts: no stream is required. Keep training with a teacher, perform often, and build a recording or video portfolio.',
    exams: [
      { name: 'CUET (Music, Dance, Theatre)', level: 'national', desc: 'For performing-arts degrees at central universities, including the University of Hyderabad\'s Sarojini Naidu School of Arts & Communication.' },
      { name: 'National School of Drama', level: 'national', desc: 'India\'s top drama school — 3-year diploma after graduation. Selection by audition and workshop.' },
      { name: 'FTII (Acting)', level: 'national', desc: 'Film & Television Institute of India acting course — after graduation.' },
      { name: 'Graded Music Exams', level: 'private', desc: 'Trinity, ABRSM, or Gandharva Mahavidyalaya grades (Western or Indian classical) — a recognised record of your skill.' },
    ],
    colleges: ['University of Hyderabad — S.N. School of Arts & Communication', 'Potti Sreeramulu Telugu University, Hyderabad (Music, Dance, Theatre)', 'National School of Drama, New Delhi', 'FTII Pune (Acting)', 'KM Music Conservatory, Chennai', 'Kalakshetra Foundation, Chennai (Bharatanatyam, Carnatic music)'],
    timeline: [
      { phase: 'Class 7–10', action: 'Train regularly with a teacher. Perform at school events, competitions, and local programmes; take graded music or dance exams.' },
      { phase: 'Class 11–12', action: 'Keep training seriously. Build a recording or video portfolio. Join a theatre group or choir.' },
      { phase: 'After Class 12', action: 'BPA / BA in Music, Dance, or Theatre — or continue professional training alongside any degree.' },
      { phase: 'College (3–4 years)', action: 'Perform as often as possible, assist on productions, and record and publish your work.' },
      { phase: 'Career', action: 'Performer, session musician, playback or voice artist, choreographer, music producer, actor, or performing-arts teacher.' },
    ],
    salary: 'Highly variable: ₹2–5 LPA (early-career performer or teacher) → ₹10–30+ LPA for established artists; a few earn much more. Teaching and studio work give steady income.',
    hyderabad: 'Hyderabad is home to the Telugu film industry — Ramoji Film City and Annapurna Studios employ actors, dancers, musicians, and dubbing artists. The city also has a strong Carnatic, Kuchipudi, and theatre scene (Ravindra Bharathi, Lamakaan).',
    branches: ['Music (Vocal / Instrumental)', 'Dance (Classical & Contemporary)', 'Theatre & Film Acting', 'Music Production & Sound', 'Voice & Dubbing', 'Choreography & Performing-Arts Teaching'],
  },

  GOV: {
    id: 'GOV', title: 'Government & Civil Services',
    summary: 'Running government departments and districts through the civil services.',
    description: 'Civil servants — IAS, IPS, IRS, and state service officers — run India\'s administrative machinery. The UPSC Civil Services exam is India\'s most prestigious competitive examination. State services (TGPSC) offer equally powerful careers in Telangana.',
    stream: 'Any stream',
    streamNote: 'Any degree qualifies for UPSC. Arts/Humanities with History, Political Science, and Geography are popular optional subjects for UPSC Mains.',
    class11: ['Any stream qualifies for UPSC', 'Arts/Humanities with History, Political Science, Geography → best UPSC optional foundation', 'Science and Engineering backgrounds also crack UPSC every year'],
    exams: [
      { name: 'UPSC Civil Services (IAS/IPS)', level: 'national', desc: 'India\'s most prestigious exam for IAS, IPS, IRS, and IFS (Foreign Service). Taken after graduation. ~1000 selections per year from 10+ lakh applicants.' },
      { name: 'TGPSC Group I / II / III', level: 'state', desc: 'Telangana state services — DSP, Tahsildar, Revenue Officer, Deputy Collector, DEO. Thousands of posts. Conducted by TGPSC (formerly TSPSC).' },
      { name: 'SSC CGL', level: 'national', desc: 'Staff Selection Commission — Income Tax Inspector, CBI Sub-Inspector, Central Excise Officer, and many central government posts.' },
      { name: 'Banking PO (IBPS/SBI)', level: 'national', desc: 'Probationary Officer in public sector banks — secure career, strong salary, respected position.' },
    ],
    colleges: ['Any recognized degree college qualifies for UPSC/TGPSC', 'University of Hyderabad (strong UPSC alumni network)', 'Osmania University (Political Science, History, Economics depts.)', 'Hyderabad has many UPSC coaching centres — Ashok Nagar is the city\'s main coaching hub'],
    timeline: [
      { phase: 'Class 7–10', action: 'NCERT books are the UPSC backbone — read them carefully. Follow The Hindu or Indian Express daily. Build reading habits.' },
      { phase: 'Class 11–12', action: 'Arts with History, Polity, Geography, Economics builds the strongest UPSC foundation. Science/Maths background also common among toppers.' },
      { phase: 'Graduation (3 years)', action: 'Any Bachelor\'s degree. Begin UPSC preliminary preparation seriously from 2nd year of college.' },
      { phase: 'UPSC Preparation (2–5 years)', action: 'Prelims (Objective) → Mains (Essay/Descriptive) → Personality Test (Interview). Many successful candidates need 2–4 attempts.' },
      { phase: 'After Selection', action: 'IAS → District Collector / Secretary level. IPS → Superintendent of Police. IRS → Income Tax / Customs. TGPSC → Revenue, Education, Police departments.' },
    ],
    salary: '₹56,100/month starting for IAS/IPS + free accommodation, car, utilities (effective ₹15–20 LPA equivalent). TGPSC officers: ₹4–8 LPA. Banking PO: ₹8–12 LPA.',
    hyderabad: 'Hyderabad is Telangana\'s capital — the centre of state administration. TGPSC recruits hundreds of officers annually. The Secretariat, Collectorate, and dozens of government departments are major long-term employers. Hyderabad students have a strong track record in UPSC — multiple toppers from the city in recent years.',
    branches: ['IAS (District Administration & Secretariat)', 'IPS (Police Services)', 'IRS (Income Tax & Customs)', 'IFS (Indian Foreign Service)', 'TGPSC Group I–III (State Officers)', 'Banking PO / SSC (Central Govt.)'],
  },

  SCI: {
    id: 'SCI', title: 'Pure Sciences & Research',
    summary: 'Researching how the natural world works, in universities and laboratories.',
    description: 'Scientists and researchers push the frontier of human knowledge. From particle physics to cancer biology to climate science, research careers offer the thrill of genuine discovery. India\'s ISRO, DRDO, CSIR, IISc, and IISERs are world-class institutions.',
    stream: 'Science (PCM for Physics/Maths research; PCB for Biology/Medicine research)',
    streamNote: 'Strong in both Physics and Biology? PCM with Biology as optional covers all bases.',
    class11: ['Physics', 'Chemistry', 'Maths (for Physics/CS/Chemistry research)', 'Biology (for Life Sciences/Biotech)', 'Computer Science also valuable'],
    exams: [
      { name: 'INSPIRE-SHE Scholarship', level: 'national', desc: 'Government scholarship for top Class 12 students who study natural sciences at BSc/BS-MS level. (It replaced KVPY, which ended in 2022.)' },
      { name: 'IISER Aptitude Test (IAT)', level: 'national', desc: 'For the 7 Indian Institutes of Science Education and Research — India\'s best pure science colleges. 5-year BS-MS integrated program.' },
      { name: 'IISc Bangalore (BS Research)', level: 'national', desc: 'India\'s top-ranked research university. Entry using JEE Main/Advanced, NEET-UG, or IAT scores. Extremely competitive.' },
      { name: 'IIT JAM', level: 'national', desc: 'IIT Joint Admission Test — for M.Sc in Physics, Chemistry, Maths, Biology at IITs after BSc.' },
      { name: 'JEST / GATE (Sciences)', level: 'national', desc: 'For PhD and research positions at TIFR, IMSc, ICTS, and CSIR national laboratories.' },
    ],
    colleges: ['IISc Bangalore — India\'s #1 research university', 'IISERs (Pune, Kolkata, Mohali, Bhopal, Trivandrum, Berhampur, Tirupati)', 'TIFR Mumbai — Tata Institute of Fundamental Research', 'University of Hyderabad — strong science research departments', 'CCMB / CDFD / IICT Hyderabad (CSIR labs — excellent PhD programs)'],
    timeline: [
      { phase: 'Class 7–10', action: 'Excel in Maths and Science. Participate in National Science Olympiad, NTSE. Read popular science books (Feynman, Carl Sagan). Curiosity is your biggest asset.' },
      { phase: 'Class 11–12', action: 'Science stream. Prepare for the IISER Aptitude Test and JEE alongside boards. Strong Class 12 marks can win an INSPIRE-SHE scholarship.' },
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
    note: 'Opens doors to Engineering, Computer Science, Architecture, and all science and research streams. The most versatile science option.',
  },
  PCB: {
    name: 'Science with Biology (PCB)',
    subjects: ['Physics', 'Chemistry', 'Biology', 'English', '+ 1 optional (Maths / Biotechnology)'],
    note: 'Essential for MBBS (NEET), Dentistry, Pharmacy, Nursing, Biotechnology, and Life Sciences. Adding Maths as optional keeps engineering options open.',
  },
  COM: {
    name: 'Commerce',
    subjects: ['Accountancy', 'Business Studies', 'Economics', 'English', '+ 1 optional (Mathematics / IT / Legal Studies)'],
    note: 'Foundation for Chartered Accountancy, MBA, Banking, Finance, and entrepreneurship. Adding Maths makes you eligible for some management entrance exams too.',
  },
  ARTS: {
    name: 'Arts / Humanities',
    subjects: ['History or Political Science', 'Geography or Sociology', 'English', 'Economics', '+ 1 optional (Fine Arts / Psychology / Mathematics)'],
    note: 'Best pathway for Law (CLAT → NALSAR), Civil Services (UPSC), Journalism, Teaching, and Social Work. More flexible subject choices than Science.',
  },
};

// How well each career cluster fits each stream (0–3).
// A 3 means the stream is effectively required; clusters without a 3 are stream-flexible.
const STREAM_FIT = {
  ENG: { PCM: 3, PCB: 0, COM: 0, ARTS: 0 },
  CS:  { PCM: 3, PCB: 0, COM: 0, ARTS: 0 },
  MED: { PCM: 0, PCB: 3, COM: 0, ARTS: 0 },
  COM: { PCM: 0, PCB: 0, COM: 3, ARTS: 1 },
  LAW: { PCM: 1, PCB: 1, COM: 1, ARTS: 2 },
  DES: { PCM: 2, PCB: 0, COM: 0, ARTS: 2 },
  ART: { PCM: 0, PCB: 0, COM: 1, ARTS: 2 },
  EDU: { PCM: 1, PCB: 1, COM: 1, ARTS: 2 },
  CMN: { PCM: 0, PCB: 1, COM: 1, ARTS: 2 },
  GOV: { PCM: 1, PCB: 1, COM: 1, ARTS: 2 },
  SCI: { PCM: 3, PCB: 2, COM: 0, ARTS: 0 },
  DEF: { PCM: 2, PCB: 1, COM: 1, ARTS: 1 },
  SPT: { PCM: 1, PCB: 1, COM: 1, ARTS: 1 },
  PER: { PCM: 0, PCB: 0, COM: 1, ARTS: 2 },
};

// ── RIASEC MODEL ──────────────────────────────────────────────────────────────
// Holland's six interest types — the standard framework used by career counsellors.
const RIASEC = ['R', 'I', 'A', 'S', 'E', 'C'];
const RIASEC_INFO = {
  R: { name: 'Realistic',     short: 'Doer',      desc: 'hands-on, physical, practical work — tools, machines, sport, the outdoors' },
  I: { name: 'Investigative', short: 'Thinker',   desc: 'figuring out how and why things work — puzzles, science, research' },
  A: { name: 'Artistic',      short: 'Creator',   desc: 'expressing ideas through art, writing, music, or performance' },
  S: { name: 'Social',        short: 'Helper',    desc: 'teaching, caring for, and guiding other people' },
  E: { name: 'Enterprising',  short: 'Persuader', desc: 'leading, convincing, and taking charge' },
  C: { name: 'Conventional',  short: 'Organiser', desc: 'order, accuracy, and clear systems' },
};

// What students want from work, beyond interests
const VALUES = ['active', 'outdoor', 'structure', 'service', 'team', 'security', 'spotlight'];

// Each cluster's interest profile (RIASEC weights 0–3) and work values
// (+1 = this career offers it, −1 = this career usually lacks it; omitted = neutral)
const CLUSTER_PROFILES = {
  ENG: { riasec: { R:3, I:2, C:1 },      values: { team:1, security:1 } },
  CS:  { riasec: { I:3, C:2, R:1 },      values: { active:-1, outdoor:-1, security:1 } },
  MED: { riasec: { I:3, S:3, R:1 },      values: { service:1, structure:1, security:1, team:1 } },
  COM: { riasec: { E:3, C:3 },           values: { active:-1, outdoor:-1 } },
  LAW: { riasec: { E:3, I:2, S:1 },      values: { active:-1 } },
  DES: { riasec: { A:3, R:2, I:1 },      values: { structure:-1 } },
  ART: { riasec: { A:3, E:2, I:1 },      values: { structure:-1, security:-1 } },
  EDU: { riasec: { S:3, E:1, A:1 },      values: { service:1, security:1 } },
  CMN: { riasec: { S:3, E:2, A:1 },      values: { service:1, team:1 } },
  GOV: { riasec: { E:3, C:2, S:2 },      values: { structure:1, security:1, service:1 } },
  SCI: { riasec: { I:3, R:1, A:1 },      values: { active:-1, structure:-1, spotlight:-1 } },
  DEF: { riasec: { R:3, C:2, E:1, S:1 }, values: { active:1, outdoor:1, structure:1, service:1, team:1, security:1 } },
  SPT: { riasec: { R:3, E:2, S:1 },      values: { active:1, outdoor:1, team:1, spotlight:1, security:-1 } },
  PER: { riasec: { A:3, E:2, S:1 },      values: { spotlight:1, security:-1, structure:-1 } },
};

// ── HYDERABAD SCHOOLS (by stream) ────────────────────────────────────────────
const SCHOOLS = {
  PCM: {
    note: 'Look for junior colleges with integrated JEE/EAPCET coaching alongside board preparation. Most Hyderabad coaching colleges offer MPC (Maths, Physics, Chemistry) integrated programmes.',
    list: [
      { name: 'Sri Chaitanya Junior College', fee: '₹1.2–3.5 L', detail: 'Largest network in Telangana. Separate IIT and Engineering batches. Strong JEE Main & Advanced record.' },
      { name: 'Narayana Junior College', fee: '₹1.2–3.5 L', detail: 'Multiple Hyderabad campuses. Renowned for JEE & EAPCET results. Intensive revision programmes.' },
      { name: 'Bhashyam Junior College', fee: '₹80K–2 L', detail: 'Competitive coaching with TGBIE board curriculum. Good Maths and Physics faculty.' },
      { name: 'FIITJEE / Resonance Hyderabad', fee: '₹2–4 L', detail: 'Coaching-integrated junior college model. Best suited for serious JEE Main/Advanced aspirants.' },
      { name: 'Sri Gayatri Junior College', fee: '₹60K–1.5 L', detail: 'Strong TG EAPCET record. Multiple Hyderabad locations. Affordable fees.' },
      { name: 'Government Junior Colleges (TGBIE)', fee: 'Free', detail: 'Free education. MPC stream. Good science faculty at major campuses.' },
      { name: 'Kendriya Vidyalaya (KV) Schools, Hyderabad', fee: '₹3K–10K', detail: 'CBSE board. Multiple KV campuses. Solid academic foundation for JEE preparation.' },
    ]
  },
  PCB: {
    note: 'NEET demands deep Biology and Chemistry mastery. Choose a college that balances TGBIE board preparation with NEET coaching — they are different syllabi.',
    list: [
      { name: 'Sri Chaitanya Junior College (Medical)', fee: '₹1.5–3.5 L', detail: 'Dedicated medical batches with NEET-focused curriculum. Largest NEET coaching network in Telangana.' },
      { name: 'Narayana Junior College (Medical)', fee: '₹1.5–3.5 L', detail: 'Consistently strong NEET results. Dedicated MBiPC (Maths, Biology, Physics, Chemistry) batches.' },
      { name: 'Aakash Institute + Partner Junior Colleges', fee: '₹1.5–3 L', detail: 'National NEET leader. Hyderabad study centre. Some tie-ups with local junior colleges.' },
      { name: 'Bhashyam Junior College', fee: '₹80K–2 L', detail: 'BiPC stream with good laboratory facilities and NEET preparation.' },
      { name: 'Government Junior Colleges (TGBIE)', fee: 'Free', detail: 'Free education. BiPC stream widely available. Dedicated Biology labs at major campuses.' },
    ]
  },
  COM: {
    note: 'Strong Accountancy and Business Studies are the foundation for CA, MBA, and banking careers. Choose a college known for its commerce department.',
    list: [
      { name: 'Badruka Junior College of Commerce', fee: '₹30K–60K', detail: 'Hyderabad\'s oldest commerce college (est. 1952). Strong B.Com and CA Foundation pathway.' },
      { name: 'St. Francis Junior College', fee: '₹30K–60K', detail: 'Reputed English-medium college. Commerce stream with strong Accountancy faculty.' },
      { name: 'Loyola Academy Junior College', fee: '₹30K–60K', detail: 'Jesuit institution. Strong academic culture. Commerce with Maths option available.' },
      { name: 'Aurora Junior College', fee: '₹40K–80K', detail: 'Popular commerce college in Hyderabad. Good industry connections.' },
      { name: 'Don Bosco Junior College', fee: '₹30K–60K', detail: 'Commerce and Science streams. Known for discipline and consistent board results.' },
      { name: 'Government Junior Colleges (TGBIE)', fee: 'Free', detail: 'Free. CEC (Commerce, Economics, Civics) stream at many Hyderabad government campuses.' },
    ]
  },
  ARTS: {
    note: 'Strong English, History, and Political Science are essential for CLAT, UPSC, Journalism, and Humanities degrees. Build your reading habit from Day 1.',
    list: [
      { name: 'Loyola Academy Junior College', fee: '₹30K–60K', detail: 'Excellent Humanities department. Strong English, History, and Economics faculty. Good debate culture.' },
      { name: 'St. Francis Junior College', fee: '₹30K–60K', detail: 'HEC (History, Economics, Civics) and MEC streams. Good language and communication training.' },
      { name: 'Osmania University-affiliated Junior Colleges', fee: '₹15K–40K', detail: 'Wide selection across Hyderabad. Strong Humanities faculty at established campuses.' },
      { name: 'The Hyderabad Public School (HPS, Begumpet)', fee: '₹2.5–4 L', detail: 'One of India\'s most prestigious schools. Humanities stream. Strong debate and writing culture.' },
      { name: 'Government Junior Colleges (TGBIE)', fee: 'Free', detail: 'Free. HEC (History, Economics, Civics) widely available across Hyderabad government campuses.' },
      { name: 'Chirec / Oakridge / Gitanjali International', fee: '₹3–8 L+', detail: 'CBSE/IGCSE Humanities track. Good for students also considering UK or US universities.' },
    ]
  }
};

// ── ASSESSMENT ITEMS ──────────────────────────────────────────────────────────
// Statements describe activities, never jobs, so students rate what they enjoy rather than
// which careers they already admire. `d` is the RIASEC type (or work value) the item measures;
// `h` gives a small subject-matter hint toward specific clusters.
const PARTS = {
  1: {
    title: 'Things you might enjoy',
    prompt: 'How would you feel about doing each of these?',
    scale: [{ v: 1, t: 'I\'d enjoy it', cls: 'like' }, { v: 0, t: 'Not sure', cls: 'unsure' }, { v: -1, t: 'Not for me', cls: 'dislike' }],
  },
  2: {
    title: 'What you want from work',
    prompt: 'Is each of these true for you?',
    scale: [{ v: 1, t: 'Yes', cls: 'like' }, { v: 0, t: 'Not sure', cls: 'unsure' }, { v: -1, t: 'No', cls: 'dislike' }],
  },
};

const INTEREST_ITEMS = {
  R: [
    { t: 'Fix a broken bicycle, fan, or gadget at home',                      h: { ENG:1 } },
    { t: 'Train hard every day to get better at a sport',                      h: { SPT:1 } },
    { t: 'Go trekking or camping and set up the tent yourself',                h: { DEF:1 } },
    { t: 'Build something with tools — wood, wires, or metal',                 h: { ENG:1, DES:1 } },
    { t: 'Do tough physical work that leaves you tired but proud',             h: { DEF:1, SPT:1 } },
    { t: 'Learn to drive, steer, or operate a machine or vehicle',             h: { DEF:1, ENG:1 } },
  ],
  I: [
    { t: 'Work out why a science experiment gave a strange result',            h: { SCI:1 } },
    { t: 'Solve a tricky maths puzzle or logic problem',                        h: { CS:1, SCI:1 } },
    { t: 'Read about how the human body or brain works',                        h: { MED:1 } },
    { t: 'Spot patterns hidden in a big table of numbers',                      h: { CS:1 } },
    { t: 'Keep digging into a question until you find the real answer',         h: { SCI:1, LAW:1, ART:1 } },
    { t: 'Write code to make a game, app, or website',                          h: { CS:1 } },
  ],
  A: [
    { t: 'Draw, paint, or design something original',                           h: { DES:1 } },
    { t: 'Act, sing, dance, or play an instrument on stage',                    h: { PER:1 } },
    { t: 'Write a story, poem, or article',                                     h: { ART:1 } },
    { t: 'Shoot and edit a short video',                                        h: { ART:1 } },
    { t: 'Rearrange and decorate a room so it looks great',                     h: { DES:1 } },
    { t: 'Make up a new dance routine or piece of music',                       h: { PER:1 } },
  ],
  S: [
    { t: 'Explain a topic to a classmate who is struggling with it',            h: { EDU:1 } },
    { t: 'Listen to a friend\'s problem and help them feel better',             h: { CMN:1 } },
    { t: 'Look after younger children or elderly relatives',                    h: { EDU:1, MED:1 } },
    { t: 'Volunteer at a shelter, hospital, or community service drive',        h: { CMN:1 } },
    { t: 'Help organise a festival, prayer meeting, or community gathering',    h: { CMN:1 } },
    { t: 'Give first aid or care for someone who is unwell',                    h: { MED:1 } },
  ],
  E: [
    { t: 'Be the captain or leader of a team',                                  h: { GOV:1, DEF:1, SPT:1 } },
    { t: 'Persuade people to support your idea',                                h: { LAW:1, COM:1 } },
    { t: 'Sell things or run a stall at a school fair',                         h: { COM:1 } },
    { t: 'Speak in front of a large group of people',                           h: { CMN:1, GOV:1, EDU:1 } },
    { t: 'Debate what the government or courts should do about an issue',       h: { LAW:1, GOV:1, ART:1 } },
    { t: 'Start your own small business or project',                            h: { COM:1 } },
  ],
  C: [
    { t: 'Keep track of the money collected for a class event',                 h: { COM:1 } },
    { t: 'Organise notes, files, or a timetable so everything is in order',     h: { GOV:1 } },
    { t: 'Follow a clear set of rules to get a job done exactly right',         h: { GOV:1, DEF:1 } },
    { t: 'Check work carefully for mistakes before it is handed in',            h: { LAW:1 } },
    { t: 'Plan a trip step by step — timings, tickets, and budget',             h: {} },
    { t: 'Enter information neatly into a spreadsheet or register',             h: { COM:1, CS:1 } },
  ],
};

const VALUE_ITEMS = [
  { t: 'I\'d like a job where I\'m on my feet and active most of the day',             d: 'active' },
  { t: 'I\'d like to spend a lot of my working day outdoors',                           d: 'outdoor' },
  { t: 'I\'d be comfortable wearing a uniform and following a chain of command',        d: 'structure' },
  { t: 'I want my work to serve people or a bigger cause, even if it pays less',        d: 'service' },
  { t: 'I\'d rather be part of a close team than work on my own',                       d: 'team' },
  { t: 'A steady, secure income matters more to me than fame or taking big risks',      d: 'security' },
  { t: 'I\'d enjoy being in the spotlight — performing or competing in front of crowds', d: 'spotlight' },
  { t: 'Daily exercise or training would be part of my ideal job',                      d: 'active' },
  { t: 'I like clear rules, routines, and knowing exactly what is expected of me',      d: 'structure' },
  { t: 'I want my work to be guided by my faith or my values',                          d: 'service' },
];

// Interest items are interleaved so each page mixes all six types (no themed pages)
const ITEMS = [];
for (let p = 0; p < 6; p++) {
  for (let k = 0; k < 6; k++) {
    const d = RIASEC[(k + p) % 6];
    ITEMS.push({ ...INTEREST_ITEMS[d][p], d, part: 1 });
  }
}
VALUE_ITEMS.forEach(v => ITEMS.push({ ...v, h: {}, part: 2 }));

// Page layout: 6 interest pages of 6, then 2 value pages of 5
const PAGES = [];
for (let i = 0; i < 36; i += 6) PAGES.push({ part: 1, items: [0,1,2,3,4,5].map(n => i + n) });
PAGES.push({ part: 2, items: [36, 37, 38, 39, 40] });
PAGES.push({ part: 2, items: [41, 42, 43, 44, 45] });

// Validation mode (?validate) — adults record their actual career to test the quiz's accuracy
const VALIDATE = new URLSearchParams(location.search).has('validate');

// ── APP STATE ─────────────────────────────────────────────────────────────────
const state = {
  name: '', grade: '', section: '',
  actualCareer: '',
  currentPage: 0,
  answers: {},        // item index → 1 (yes), 0 (not sure), -1 (no)
  scores: {},
  profile: null,
  topCareers: [],
  recommendedStream: null,
  chatHistory: [],
};

// ── SCORING ───────────────────────────────────────────────────────────────────
const avg = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

function calculateResults() {
  // Level for each RIASEC type and value: share of answered items rated "yes" (0–1).
  // "Not sure" is treated as a skip, so it never drags a score down.
  const yes = {}, answered = {};
  let unsure = 0;
  ITEMS.forEach((item, i) => {
    const r = state.answers[i];
    if (!r) { unsure++; return; }
    answered[item.d] = (answered[item.d] || 0) + 1;
    yes[item.d] = (yes[item.d] || 0) + (r > 0 ? 1 : 0);
  });
  const level = d => answered[d] ? yes[d] / answered[d] : 0.5;

  const interest = Object.fromEntries(RIASEC.map(d => [d, level(d)]));
  const values = Object.fromEntries(VALUES.map(v => [v, level(v)]));

  // Profile shape matters more than overall enthusiasm, so centre interests on the student's own mean
  const meanInterest = avg(Object.values(interest));
  const centred = Object.fromEntries(RIASEC.map(d => [d, interest[d] - meanInterest]));

  const scores = {};
  Object.entries(CLUSTER_PROFILES).forEach(([id, prof]) => {
    const weights = Object.entries(prof.riasec);
    const totalW = weights.reduce((s, [, w]) => s + w, 0);
    const interestFit = clamp(2 * weights.reduce((s, [d, w]) => s + w * centred[d], 0) / totalW, -1, 1);

    const prefs = Object.entries(prof.values);
    const valueFit = avg(prefs.map(([v, p]) => p * (values[v] - 0.5) * 2));

    const hinted = ITEMS.map((item, i) => item.h[id] ? (state.answers[i] || 0) : null).filter(x => x !== null);
    const domainFit = avg(hinted);

    scores[id] = 0.5 * interestFit + 0.3 * domainFit + 0.2 * valueFit;
  });

  state.scores = scores;
  state.topCareers = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .map(([id, score]) => ({ id, score }));

  // Holland code: the student's three strongest interest types
  const code = RIASEC.slice().sort((a, b) => interest[b] - interest[a]).slice(0, 3);
  const spread = Math.max(...Object.values(interest)) - Math.min(...Object.values(interest));
  const unsureShare = unsure / ITEMS.length;
  let caution = '';
  if (unsureShare > 0.4) caution = 'You chose "Not sure" for many statements, so these results are a rough starting point.';
  else if (spread < 0.2) caution = 'Your answers were quite even across very different kinds of work, so no single area stands out strongly yet.';
  state.profile = { interest, values, code, caution, unsure };

  // Stream: weight the top 3 clusters. Only call it a firm recommendation when the #1 area depends on a stream.
  const streamScores = { PCM:0, PCB:0, COM:0, ARTS:0 };
  state.topCareers.slice(0, 3).forEach(({ id }, rank) => {
    const w = rank === 0 ? 3 : rank === 1 ? 2 : 1;
    Object.entries(STREAM_FIT[id]).forEach(([stream, fit]) => { streamScores[stream] += fit * w; });
  });
  const topStreamKey = Object.entries(streamScores).sort((a, b) => b[1] - a[1])[0][0];
  const top1Fit = STREAM_FIT[state.topCareers[0].id];
  const flexible = Math.max(...Object.values(top1Fit)) < 3;
  state.recommendedStream = { key: topStreamKey, flexible, ...STREAMS[topStreamKey] };
}

// Plain-language fit band for a cluster score (−1 to 1)
function fitBand(score) {
  if (score >= 0.4) return 'Strong fit';
  if (score >= 0.15) return 'Good fit';
  if (score >= -0.1) return 'Some fit';
  return 'Less likely';
}

// ── VIEW MANAGEMENT ───────────────────────────────────────────────────────────
function showView(id) {
  document.querySelectorAll('.view').forEach(v => {
    v.classList.toggle('active', v.id === id);
    v.classList.toggle('hidden', v.id !== id);
  });
  const el = document.getElementById(id);
  if (el) el.scrollTop = 0;
}

// ── QUIZ LOGIC ────────────────────────────────────────────────────────────────
const pageComplete = () => PAGES[state.currentPage].items.every(i => i in state.answers);

function updateQuizProgress() {
  const done = Object.keys(state.answers).length;
  document.getElementById('progress-bar').style.width = `${(done / ITEMS.length) * 100}%`;
  document.getElementById('btn-next-q').disabled = !pageComplete();
}

function renderPage() {
  const page = PAGES[state.currentPage];
  const part = PARTS[page.part];

  document.getElementById('q-current').textContent = state.currentPage + 1;
  document.getElementById('q-total').textContent = PAGES.length;
  document.getElementById('quiz-section-badge').textContent = `Part ${page.part} of 2: ${part.title}`;
  document.getElementById('quiz-q-label').textContent = `Page ${state.currentPage + 1} of ${PAGES.length}`;
  document.getElementById('quiz-question').textContent = part.prompt;

  const container = document.getElementById('quiz-options');
  container.innerHTML = page.items.map(i => {
    const r = state.answers[i];
    return `
      <div class="statement${i in state.answers ? ' answered' : ''}" role="radiogroup" aria-label="${ITEMS[i].t}">
        <p class="statement-text">${ITEMS[i].t}</p>
        <div class="rating-row">
          ${part.scale.map(s => `
            <button class="rating-btn ${s.cls}${r === s.v ? ' selected' : ''}" data-item="${i}" data-value="${s.v}"
              role="radio" aria-checked="${r === s.v}">${s.t}</button>`).join('')}
        </div>
      </div>`;
  }).join('');

  container.querySelectorAll('.rating-btn').forEach(btn => {
    btn.addEventListener('click', () => rateItem(parseInt(btn.dataset.item), parseInt(btn.dataset.value), btn));
  });

  document.getElementById('btn-next-q').textContent = state.currentPage === PAGES.length - 1 ? 'See my results' : 'Next';
  document.getElementById('btn-prev-q').style.visibility = state.currentPage === 0 ? 'hidden' : 'visible';
  document.getElementById('view-quiz').scrollTop = 0;
  updateQuizProgress();
}

function rateItem(idx, value, btn) {
  state.answers[idx] = value;
  const row = btn.closest('.statement');
  row.classList.add('answered');
  row.querySelectorAll('.rating-btn').forEach(b => {
    const on = b === btn;
    b.classList.toggle('selected', on);
    b.setAttribute('aria-checked', on);
  });
  updateQuizProgress();
}

// ── RESULTS RENDERING ─────────────────────────────────────────────────────────
function renderResults() {
  const today = new Date().toLocaleDateString('en-IN', { year:'numeric', month:'long', day:'numeric' });
  document.getElementById('results-name').textContent = state.name;
  document.getElementById('results-meta').textContent = VALIDATE
    ? `Validation run · ${today}`
    : `Grade ${state.grade}${state.section ? ', Section ' + state.section : ''} · ${today}`;

  // Summary — interest code beside the three areas worth exploring
  const top3 = state.topCareers.slice(0, 3).map(({ id }) => CAREERS[id]);
  const stream = state.recommendedStream;
  const { code, caution } = state.profile;
  document.getElementById('summary-top-match').innerHTML = `
    <div class="summary-grid">
      <div class="summary-code">
        <p class="label">Your interest code</p>
        <p class="code-letters">${code.join('')}</p>
        <dl class="code-list">
          ${code.map(d => `<dt>${d} — ${RIASEC_INFO[d].name}</dt><dd>Enjoys ${RIASEC_INFO[d].desc}.</dd>`).join('')}
        </dl>
      </div>
      <div class="summary-areas">
        <p class="label">Areas worth exploring</p>
        <ol class="area-list">
          ${top3.map(c => `<li><strong>${c.title}</strong><span>${c.summary}</span></li>`).join('')}
        </ol>
        <div class="summary-stream">
          <p class="label">${stream.flexible ? 'Class 11 stream (flexible for your top area)' : 'Recommended Class 11 stream'}</p>
          <p class="stream-name">${stream.flexible ? `Suggested: ${stream.name}` : stream.name}</p>
        </div>
      </div>
    </div>
    ${caution ? `<p class="summary-caution">${caution} Talk it through with your teacher, or take it again in a few months.</p>` : ''}`;

  renderValidation();
  renderStep1();
  renderStep2();
  renderStep3();

  // Score chart — bars use a fixed scale (not relative to the top score), labelled with plain-language bands
  document.getElementById('score-chart').innerHTML = state.topCareers.map(({ id, score }, i) => {
    const pct = Math.round(clamp((score + 1) / 2, 0.03, 1) * 100);
    return `
      <div class="score-row${i < 3 ? ' is-top' : ''}">
        <div class="score-label">${CAREERS[id].title}</div>
        <div class="score-bar-bg"><div class="score-bar-fill" style="width:${pct}%"></div></div>
        <div class="score-pct">${fitBand(score)}</div>
      </div>`;
  }).join('');

  // Career detail cards
  document.getElementById('career-cards').innerHTML = top3.map((c, i) => `
    <article class="career-card">
      <p class="career-card-rank">${['First', 'Second', 'Third'][i]} area</p>
      <h3>${c.title}</h3>
      <p class="career-card-summary">${c.summary}</p>
      <dl class="career-card-facts">
        <dt>Stream</dt><dd>${c.stream}</dd>
        <dt>Key exams</dt><dd>${c.exams.slice(0, 2).map(e => e.name).join(', ')}</dd>
      </dl>
      <button class="link-btn" data-career="${c.id}">Read the full guide</button>
    </article>`).join('');

  document.querySelectorAll('.career-card .link-btn').forEach(btn => {
    btn.addEventListener('click', () => openModal(btn.dataset.career));
  });

  initChat();
}

// Validation mode: show where the person's real career landed and give a row to paste into a spreadsheet
function renderValidation() {
  const box = document.getElementById('validate-result');
  if (!VALIDATE) { box.classList.add('hidden'); return; }
  const rank = state.topCareers.findIndex(c => c.id === state.actualCareer) + 1;
  const hit = rank > 0 && rank <= 3;
  const row = [
    new Date().toISOString().slice(0, 10), state.name, state.actualCareer, rank,
    hit ? 'HIT' : 'MISS', state.topCareers.slice(0, 3).map(c => c.id).join(' '),
    state.profile.code.join(''), state.profile.unsure,
  ].join('\t');
  box.innerHTML = `
    <h2 class="section-heading">Validation result</h2>
    <p class="validate-line">Actual area: <strong>${CAREERS[state.actualCareer].title}</strong> — ranked
      <strong>#${rank} of ${state.topCareers.length}</strong> <span class="validate-${hit ? 'hit' : 'miss'}">${hit ? 'Top-3 hit' : 'Outside top 3'}</span></p>
    <p class="section-note">Spreadsheet row (date, name, actual, rank, hit, top 3, code, not-sure count):</p>
    <code class="validate-row" id="validate-row">${row}</code>
    <button class="btn-nav" id="btn-copy-row">Copy row</button>`;
  document.getElementById('btn-copy-row').addEventListener('click', e => {
    navigator.clipboard?.writeText(row).then(() => { e.target.textContent = 'Copied'; }, () => {});
  });
  box.classList.remove('hidden');
}

const examRows = exams => exams.map(e => `
  <div class="exam-row">
    <span class="exam-badge">${e.level}</span>
    <div class="exam-info"><strong>${e.name}</strong>${e.desc}</div>
  </div>`).join('');

function renderStep1() {
  const stream = state.recommendedStream;
  const schools = SCHOOLS[stream.key];
  // Clusters that don't follow the usual stream route explain their own pathway
  const pathwayNotes = state.topCareers.slice(0, 3).map(({ id }) => CAREERS[id].pathwayNote).filter(Boolean);
  document.getElementById('step1-content').innerHTML = `
    ${stream.flexible ? `<p class="callout">Your top area doesn't depend on one particular stream. The stream below suits your overall profile, but choosing subjects you genuinely enjoy matters more.</p>` : ''}
    ${pathwayNotes.map(n => `<p class="callout">${n}</p>`).join('')}
    <div class="stream-card">
      <p class="label">${stream.flexible ? 'Suggested stream' : 'Recommended stream'}</p>
      <h3>${stream.name}</h3>
      <p>${stream.note}</p>
      <div class="chip-row">${stream.subjects.map(s => `<span class="subject-chip">${s}</span>`).join('')}</div>
    </div>
    <p class="step-note">${schools.note}</p>
    <div class="step-schools">
      ${schools.list.map(s => `
        <div class="step-school-item">
          <div class="step-school-head">
            <div class="step-school-name">${s.name}</div>
            <div class="step-school-fee">${s.fee === 'Free' ? 'Free' : `${s.fee} / yr`}</div>
          </div>
          <div class="step-school-detail">${s.detail}</div>
        </div>`).join('')}
    </div>
    <p class="step-fee-note">Fees are approximate annual tuition and vary by campus, batch (e.g. IIT/NEET integrated) and year. Hostel, transport, books and uniform are extra. Always confirm with the college directly.</p>`;
}

function renderStep2() {
  const top3 = state.topCareers.slice(0, 3).map(({ id }) => CAREERS[id]);
  const seen = new Set();
  const blocks = top3.map(c => {
    const exams = c.exams.filter(e => !seen.has(e.name) && seen.add(e.name));
    if (!exams.length) return '';
    return `
      <div class="step-career-block">
        <h3 class="step-career-label">${c.title}</h3>
        <div class="exams-list">${examRows(exams)}</div>
      </div>`;
  }).join('');
  document.getElementById('step2-content').innerHTML = `
    <p class="step-note">Start preparing for these exams during Class 11 and 12, alongside your board exams.</p>
    ${blocks}`;
}

function renderStep3() {
  const top3 = state.topCareers.slice(0, 3).map(({ id }) => CAREERS[id]);
  const blocks = top3.map(c => `
    <div class="step-career-block">
      <h3 class="step-career-label">${c.title}</h3>
      <p class="sub-label">Degree options</p>
      <div class="chip-row">${c.branches.map(b => `<span class="branch-chip">${b}</span>`).join('')}</div>
      <p class="sub-label">Colleges in Hyderabad and India</p>
      <ul class="colleges-list">${c.colleges.map(col => `<li>${col}</li>`).join('')}</ul>
    </div>`).join('');
  document.getElementById('step3-content').innerHTML = `
    <p class="step-note">After Class 12 and your entrance exams, these are the degree programmes and colleges to aim for.</p>
    ${blocks}`;
}

// ── CAREER DETAIL MODAL ───────────────────────────────────────────────────────
function openModal(careerId) {
  const c = CAREERS[careerId];

  document.getElementById('modal-content').innerHTML = `
    <header class="modal-hero">
      <p class="label">Career guide</p>
      <h2 id="modal-title">${c.title}</h2>
      <p>${c.summary}</p>
    </header>
    <div class="modal-body">
      <p class="modal-desc">${c.description}</p>

      <section class="modal-section">
        <h3 class="modal-section-title">Class 11 stream</h3>
        <p><strong>${c.stream}</strong></p>
        <p class="modal-stream-note">${c.streamNote}</p>
        <div class="chip-row">${c.class11.map(s => `<span class="subject-chip">${s}</span>`).join('')}</div>
      </section>

      <section class="modal-section">
        <h3 class="modal-section-title">Entrance exams</h3>
        <div class="exams-list">${examRows(c.exams)}</div>
      </section>

      <section class="modal-section">
        <h3 class="modal-section-title">Colleges</h3>
        <ul class="colleges-list">${c.colleges.map(col => `<li>${col}</li>`).join('')}</ul>
      </section>

      <section class="modal-section">
        <h3 class="modal-section-title">From school to career</h3>
        <ol class="timeline-list">
          ${c.timeline.map(t => `
            <li class="timeline-row">
              <div class="timeline-phase">${t.phase}</div>
              <div class="timeline-action">${t.action}</div>
            </li>`).join('')}
        </ol>
      </section>

      <section class="modal-section">
        <h3 class="modal-section-title">Typical pay in India</h3>
        <p>${c.salary}</p>
      </section>

      <section class="modal-section">
        <h3 class="modal-section-title">In and around Hyderabad</h3>
        <p>${c.hyderabad}</p>
      </section>

      <section class="modal-section">
        <h3 class="modal-section-title">Specialisations</h3>
        <div class="chip-row">${c.branches.map(b => `<span class="branch-chip">${b}</span>`).join('')}</div>
      </section>
    </div>
  `;

  document.getElementById('modal-overlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  document.getElementById('modal-close').focus();
}

function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
  document.body.style.overflow = '';
}

// ── AI CHAT ───────────────────────────────────────────────────────────────────
function initChat() {
  const top3 = state.topCareers.slice(0, 3).map(({ id }) => CAREERS[id].title).join(', ');
  const nameEl = document.getElementById('chat-student-name');
  const topCareerEl = document.getElementById('chat-top-career');

  // Students never see the chat (or setup instructions) until the proxy is configured
  if (!CHAT_PROXY_URL) return;
  document.getElementById('chat-section').classList.remove('hidden');

  nameEl.textContent = state.name;
  topCareerEl.textContent = top3;

  state.chatHistory = [{
    role: 'user',
    content: `[Context: This is ${state.name}, a Grade ${state.grade} student at Johns Academy, Hyderabad, India. Their top 3 career matches from the assessment are: ${top3}. Their recommended Class 11 stream is: ${state.recommendedStream.name}. Please answer their career questions as an expert Indian career counsellor who knows about entrance exams (JEE, NEET, CLAT, TG EAPCET, etc.), Hyderabad colleges, and the Indian education system.]`,
  }, {
    role: 'assistant',
    content: `Hi ${state.name}! I've reviewed your assessment results. Your top areas to explore are ${top3}. I'm here to answer any questions about your career path, Class 11 stream choice, entrance exams, or colleges in Hyderabad and across India. What would you like to know?`,
  }];

  // Pre-render the greeting bubble
  appendChatBubble('assistant', `Hi ${state.name}! I've reviewed your assessment. Your top areas to explore are <strong>${top3}</strong>. Ask me anything about your career path, Class 11 stream, entrance exams, or colleges in India.`);
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
        system: `You are an expert career counsellor specialising in the Indian education system, with deep knowledge of Hyderabad colleges, entrance exams (JEE, NEET, CLAT, TG EAPCET, BITSAT, CUET, CA Foundation, etc.), and career pathways. You are advising ${state.name}, a Grade ${state.grade} student at Johns Academy, Hyderabad. Their top career matches are: ${state.topCareers.slice(0,3).map(({id})=>CAREERS[id].title).join(', ')}. Recommended stream: ${state.recommendedStream?.name}. Keep responses concise, practical, and encouraging. Use simple language suitable for a 12–16 year old. Always reference specific Indian exams, colleges, and timelines.`,
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
      document.querySelectorAll('.welcome-radio-card').forEach(card => {
        card.classList.toggle('selected', card.querySelector('input').checked);
      });
    });
  });

  // Validation mode swaps the grade picker for an "actual career" picker
  if (VALIDATE) {
    document.getElementById('grade-field').classList.add('hidden');
    document.getElementById('validate-field').classList.remove('hidden');
    document.getElementById('validate-career').innerHTML = '<option value="">Choose…</option>' +
      Object.values(CAREERS).map(c => `<option value="${c.id}">${c.title}</option>`).join('');
    document.getElementById('welcome-error').textContent = 'Please enter your name and choose your career area.';
  }

  // Welcome → Quiz (single step)
  document.getElementById('btn-start').addEventListener('click', () => {
    const name = document.getElementById('welcome-name').value.trim();
    const grade = VALIDATE ? 'Adult' : document.querySelector('input[name="welcome-grade"]:checked')?.value;
    const actual = VALIDATE ? document.getElementById('validate-career').value : '';
    const errEl = document.getElementById('welcome-error');
    if (!name || !grade || (VALIDATE && !actual)) { errEl.classList.remove('hidden'); return; }
    errEl.classList.add('hidden');
    state.name = name;
    state.grade = grade;
    state.actualCareer = actual;
    state.section = '';
    state.currentPage = 0;
    showView('view-quiz');
    renderPage();
  });

  // Quiz navigation
  document.getElementById('btn-next-q').addEventListener('click', () => {
    if (!pageComplete()) return;
    if (state.currentPage < PAGES.length - 1) {
      state.currentPage++;
      renderPage();
    } else {
      // Final page answered — show results
      calculateResults();
      showView('view-results');
      renderResults();
    }
  });

  document.getElementById('btn-prev-q').addEventListener('click', () => {
    if (state.currentPage > 0) { state.currentPage--; renderPage(); }
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
