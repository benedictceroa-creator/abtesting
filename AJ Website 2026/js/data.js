/**
 * Asha Jyothi Employable Skill Training Centre
 * Course Data & Categories Model (16 Certified Courses)
 * 
 * Clean, verified data source with zero em-dashes.
 */

'use strict';

const COURSES_DATA = [
  // Tailoring and Beauty (5 courses)
  {
    id: "tailoring-basic",
    name: "Tailoring (Basic)",
    category: "Tailoring and Beauty",
    categorySlug: "tailoring-beauty",
    shortDescription: "Foundational stitching, garment measurements, cutting, and basic sewing machine operations for beginners.",
    fullDescription: "The Basic Tailoring course is designed for beginners who want to build a solid foundation in garment construction. Students learn body measurement techniques, pattern drafting on paper, fabric cutting, and stitching of essential daily-wear clothing including blouses, simple frocks, and kurtas. Complete hands-on training with pedal and basic sewing machines.",
    keyTopics: [
      "Sewing machine parts, maintenance and troubleshooting",
      "Accurate body measurements and calculation charts",
      "Drafting and cutting paper patterns",
      "Stitching blouses, petticoats, and standard kurtas",
      "Finishing seams, hemming, and button fixing"
    ],
    duration: "3-4 Months (Flexible Lab Hours)",
    eligibility: "Open to all learners (No prior stitching experience required)",
    fee: null,
    feeStatus: "contact",
    image: "assets/images/tailoring basic.jpg",
    badge: "Popular"
  },
  {
    id: "tailoring-advanced",
    name: "Tailoring (Advanced)",
    category: "Tailoring and Beauty",
    categorySlug: "tailoring-beauty",
    shortDescription: "Specialized designer apparel, bespoke fitting, intricate necklines, wedding blouse styling, and boutique management.",
    fullDescription: "Tailoring Advanced is aimed at learners who already understand basic stitching and want to master boutique-grade designer garments. The curriculum covers princess-cut blouses, katori blouses, designer lehengas, anarkalis, western tops, piping, and modern fashion finishing. Students also receive practical guidance on starting a home boutique or commercial stitching service.",
    keyTopics: [
      "Designer blouse variations (Princess cut, Katori, Padded)",
      "Lehengas, Anarkali gowns, and modern ethnic suits",
      "Complex sleeve styling, collar variations and piping",
      "Fitting adjustments, alteration techniques and lining work",
      "Costing, fabric estimation, and home boutique setup"
    ],
    duration: "3-4 Months (Intensive Practical Training)",
    eligibility: "Basic tailoring knowledge or completion of Tailoring (Basic)",
    fee: null,
    feeStatus: "contact",
    image: "assets/images/tailoring.jpg",
    badge: "Advanced"
  },
  {
    id: "maggam-electric-machine",
    name: "Maggam and Electric Machine",
    category: "Tailoring and Beauty",
    categorySlug: "tailoring-beauty",
    shortDescription: "Traditional Aari and Maggam embroidery, zardozi needlework, beadwork, and modern electric motor sewing machine handling.",
    fullDescription: "This dual-skill course combines high-demand bridal Maggam and Aari embroidery with modern electric motor sewing machine operation. Learners master intricate zardozi, stone, thread, and bead embroidery on frames, alongside high-speed industrial electric stitching machine control to increase garment production efficiency.",
    keyTopics: [
      "Maggam frame setup, cloth mounting and needle handling",
      "Zardozi work, zari thread techniques, cut-work and bead embellishments",
      "Bridal neckline motifs, border work, and tracing methods",
      "Electric motor sewing machine operation and speed control",
      "Safety, thread tensioning, and high-speed garment stitching"
    ],
    duration: "3-4 Months",
    eligibility: "Open to all learners interested in bridal craft and modern stitching",
    fee: null,
    feeStatus: "contact",
    image: "assets/images/Maggam.jpg",
    badge: "In-Demand"
  },
  {
    id: "beautician-basic",
    name: "Beautician (Basic)",
    category: "Tailoring and Beauty",
    categorySlug: "tailoring-beauty",
    shortDescription: "Essential salon services including skin analysis, threading, waxing, basic facials, manicures, and professional hygiene.",
    fullDescription: "The Beautician Basic course prepares learners for entry-level salon employment or self-employed home beauty services. Students receive systematic practical training in eyebrow shaping and threading, body waxing, cleanup, foundational facials, manicure, pedicure, and basic hair oiling and washing with strict hygiene standards.",
    keyTopics: [
      "Threading techniques (eyebrows, forehead, upper lip)",
      "Waxing techniques and skin prep/aftercare",
      "Skin types identification and basic cleansing/facials",
      "Manicure and pedicure practical routines",
      "Client hygiene, sanitization, and salon ethics"
    ],
    duration: "3-4 Months",
    eligibility: "Open to all interested candidates",
    fee: null,
    feeStatus: "contact",
    image: "assets/images/beautician.jpg",
    badge: "Self-Employment"
  },
  {
    id: "beautician-advanced",
    name: "Beautician (Advanced)",
    category: "Tailoring and Beauty",
    categorySlug: "tailoring-beauty",
    shortDescription: "Professional makeup artistry, bridal makeover, advanced skin therapies, hair chemical treatments, and salon enterprise.",
    fullDescription: "An intensive cosmetology course training students in professional bridal makeup, saree draping, advanced skin treatments, hair styling, hair cutting, spa therapies, and salon enterprise. Designed for individuals who wish to work as senior beauticians or launch their own beauty parlour.",
    keyTopics: [
      "Bridal and party makeup application with color correction",
      "Advanced facials, thermo packs and acne treatments",
      "Professional hair cuts, coloring, and styling",
      "Traditional and modern saree draping styles",
      "Salon inventory, client management, and pricing"
    ],
    duration: "3-4 Months",
    eligibility: "Completion of Beautician (Basic) or salon experience",
    fee: null,
    feeStatus: "contact",
    image: "assets/images/beauticianadv.jpg",
    badge: "Career Builder"
  },

  // Language and Teaching (3 courses)
  {
    id: "spoken-english-l1",
    name: "Spoken English (Level 1)",
    category: "Language and Teaching",
    categorySlug: "language-teaching",
    shortDescription: "Foundational English speaking, basic grammar, everyday vocabulary, pronunciation, and overcoming fear of speaking.",
    fullDescription: "Spoken English Level 1 is crafted for learners with little or hesitant English background. The program emphasizes building active vocabulary, understanding sentence structures, correct pronunciation, and removing hesitation through daily guided conversation practice in a supportive, friendly classroom atmosphere.",
    keyTopics: [
      "Essential daily vocabulary and common phrases",
      "Basic grammar structures: Tenses, pronouns, prepositions",
      "Self-introduction and asking questions confidently",
      "Telephone etiquette and everyday conversation scenarios",
      "Listening exercises and hesitation reduction drills"
    ],
    duration: "3-4 Months",
    eligibility: "Anyone wanting to start speaking English confidently",
    fee: null,
    feeStatus: "contact",
    image: "assets/images/Spoken Engl.jpg",
    badge: "Foundational"
  },
  {
    id: "spoken-english-l2",
    name: "Spoken English (Level 2)",
    category: "Language and Teaching",
    categorySlug: "language-teaching",
    shortDescription: "Advanced communication, workplace fluency, group discussions, public speaking, and professional interview preparation.",
    fullDescription: "Spoken English Level 2 is designed for job seekers, college students, and working professionals who want to transition from basic comprehension to fluent, professional communication. Focuses on workplace etiquette, mock job interviews, presentation skills, email writing, and accent clarity.",
    keyTopics: [
      "Advanced sentence phrasing and professional vocabulary",
      "Effective group discussions and presentation techniques",
      "Job interview preparation and HR mock interview sessions",
      "Professional email drafting and telephonic communication",
      "Public speaking confidence and impromptu speech practice"
    ],
    duration: "3-4 Months",
    eligibility: "Basic spoken English ability or completion of Level 1",
    fee: null,
    feeStatus: "contact",
    image: "assets/images/Spoken English.jpg",
    badge: "Career Focused"
  },
  {
    id: "pre-primary-teachers-training",
    name: "Pre-Primary Teachers Training",
    category: "Language and Teaching",
    categorySlug: "language-teaching",
    shortDescription: "Early childhood education methods, Montessori principles, lesson planning, storytelling, and classroom activity management.",
    fullDescription: "The Pre-Primary Teachers Training program prepares individuals to teach in nursery, kindergarten, and playschool settings. The curriculum covers child psychology, Montessori teaching apparatus, rhymes and storytelling methods, phonics, lesson planning, and child safety.",
    keyTopics: [
      "Child development and early learning psychology",
      "Montessori sensory methods and manipulative aids",
      "Phonics foundation, rhymes, storytelling and puppetry",
      "Lesson plan creation and creative craft activities",
      "Classroom management and parent-teacher communication"
    ],
    duration: "3-4 Months",
    eligibility: "10th / Intermediate / Degree pass (Open to aspiring educators)",
    fee: null,
    feeStatus: "contact",
    image: "assets/images/Pre-primary teacher.jpg",
    badge: "Job Oriented"
  },

  // Technical Trades (2 courses)
  {
    id: "electrical-electronics",
    name: "Electrical and Electronics",
    category: "Technical Trades",
    categorySlug: "technical-trades",
    shortDescription: "Domestic electrical wiring, circuit safety, electronic components testing, multimeters, and switchboard servicing.",
    fullDescription: "A hands-on technical course providing comprehensive training in residential and commercial electrical systems. Students work directly in the lab with wiring benches, safety breakers (MCB/ELCB), transformers, soldering tools, multimeters, and foundational electronic components.",
    keyTopics: [
      "Electrical safety standards, earthing, and shock prevention",
      "House wiring: 1-phase and 3-phase circuits, conduits and switches",
      "MCB, ELCB, and distribution board installation",
      "Testing components (resistors, capacitors, diodes) using multimeters",
      "Soldering, desoldering, and circuit troubleshooting"
    ],
    duration: "3-4 Months (Intensive Workshop Labs)",
    eligibility: "10th standard or interest in electrical technical trades",
    fee: null,
    feeStatus: "contact",
    image: "assets/images/Electrical.jpg",
    badge: "High Demand"
  },
  {
    id: "home-appliance-repair",
    name: "Home Appliance Repair",
    category: "Technical Trades",
    categorySlug: "technical-trades",
    shortDescription: "Diagnostic servicing and repair for fans, irons, mixer-grinders, washing machines, microwaves, and domestic appliances.",
    fullDescription: "Home Appliance Repair trains technicians to diagnose and repair popular household electrical appliances. With rising domestic appliance usage, this course provides immediate wage employment in authorized service centres or self-employed on-call appliance repair businesses.",
    keyTopics: [
      "Ceiling fan rewinding, bearing replacement and capacitor testing",
      "Mixer-grinder motor repair, blade assembly and coupler replacement",
      "Electric iron, geyser, and water heater element servicing",
      "Semi-automatic and automatic washing machine diagnostics",
      "Microwave oven troubleshooting and safety protocols"
    ],
    duration: "3-4 Months",
    eligibility: "Basic technical inclination; open to all learners",
    fee: null,
    feeStatus: "contact",
    image: "assets/images/Home Appl 2.png",
    badge: "Immediate Earning"
  },

  // Healthcare (3 courses)
  {
    id: "medical-nursing-assistant",
    name: "Medical Nursing Assistant",
    category: "Healthcare",
    categorySlug: "healthcare",
    shortDescription: "Patient care essentials, vital signs monitoring, first aid, bed-side assistance, hygiene, and hospital ward routines.",
    fullDescription: "The Medical Nursing Assistant (GDA) course equips learners with practical nursing support skills required in hospitals, nursing homes, and home healthcare. Students learn vital sign recording (BP, pulse, temperature), patient mobility, wound dressing assistance, bed-making, and patient communication.",
    keyTopics: [
      "Patient care, hygiene maintenance, and bed-side assistance",
      "Monitoring vital signs (Blood pressure, temperature, pulse, SpO2)",
      "First aid protocols, emergency response and CPR basics",
      "Infection control, sterile techniques, and waste management",
      "Hospital ethics, record maintenance, and doctor assistance"
    ],
    duration: "6 Months (Practical Ward Simulation)",
    eligibility: "10th Pass or 12th Pass",
    fee: null,
    feeStatus: "contact",
    image: "assets/images/Nursing 2.jpg",
    badge: "Healthcare Hero"
  },
  {
    id: "medical-lab-phlebotomy",
    name: "Medical Lab Phlebotomy",
    category: "Healthcare",
    categorySlug: "healthcare",
    shortDescription: "Venipuncture blood collection techniques, sample handling, lab safety, vacutainers, and diagnostic lab workflows.",
    fullDescription: "Phlebotomy is a specialized clinical skill in high demand across diagnostic laboratories, blood banks, and hospitals. Trainees master correct vein identification, sterile blood sample withdrawal using vacutainer systems, sample labeling, centrifuge operation, and patient reassurance.",
    keyTopics: [
      "Anatomy of veins and vein site selection",
      "Sterile blood draw techniques (syringe and vacutainer systems)",
      "Sample storage, preservation, transportation, and barcoding",
      "Bio-safety hazards, needle-stick prevention and biomedical disposal",
      "Patient identification protocols and quality assurance"
    ],
    duration: "6 Months",
    eligibility: "10th / 12th Pass (Science stream preferred but open)",
    fee: null,
    feeStatus: "contact",
    image: "assets/images/Phlebotomy.png",
    badge: "Clinical Skill"
  },
  {
    id: "pharmacy-assistant",
    name: "Pharmacy Assistant",
    category: "Healthcare",
    categorySlug: "healthcare",
    shortDescription: "Pharmacy inventory handling, prescription reading, retail billing, medicine classification, and customer assistance.",
    fullDescription: "This course trains candidates to work effectively in retail pharmacies, hospital dispensaries, and pharmaceutical warehouses. Trainees learn medicine storage conditions, brand vs generic names, expiry management, inventory entry in pharmacy software, and ethical prescription handling.",
    keyTopics: [
      "Prescription reading and understanding medical abbreviations",
      "Dosage forms (tablets, syrups, injections) and storage criteria",
      "Inventory management, stock registers, and expiry tracking",
      "Pharmacy POS billing and computerised drug database search",
      "Customer communication and health product retail guidelines"
    ],
    duration: "6 Months",
    eligibility: "10th / 12th Pass",
    fee: null,
    feeStatus: "contact",
    image: "assets/images/Pharmacy 1.jpg",
    badge: "Retail Healthcare"
  },

  // Computer Courses (3 courses)
  {
    id: "computer-basic",
    name: "Computer Basic (MS Office)",
    category: "Computer Courses",
    categorySlug: "computer-courses",
    shortDescription: "Windows OS, MS Office (Word, Excel, PowerPoint), internet research, email communication, and typing proficiency.",
    fullDescription: "A comprehensive digital literacy course designed for complete beginners and office job aspirants. Covers computer hardware basics, operating system navigation, document creation in MS Word, spreadsheets and formulas in MS Excel, presentations in PowerPoint, and safe internet browsing and email usage.",
    keyTopics: [
      "Computer fundamentals, file management and Windows operating system",
      "MS Word: Letter typing, formatting, tables, and mail merge",
      "MS Excel: Formulas, calculation sheets, charts, and data sorting",
      "MS PowerPoint: Slide creation, formatting, and presentation tools",
      "Internet search, Google Drive, email etiquette and cyber safety"
    ],
    duration: "3-4 Months (Dedicated PC Workstation for every student)",
    eligibility: "Open to all learners desiring digital literacy",
    fee: null,
    feeStatus: "contact",
    image: "assets/images/Computers.jpg",
    badge: "Essential"
  },
  {
    id: "dtp",
    name: "Desktop Publishing (DTP)",
    category: "Computer Courses",
    categorySlug: "computer-courses",
    shortDescription: "Desktop Publishing using Adobe Photoshop, PageMaker / InDesign, and CorelDraw for print design and digital media.",
    fullDescription: "Desktop Publishing (DTP) trains learners in professional commercial graphic design for printing presses, advertising agencies, flex printing, and flex/brochure design. Students learn vector drawing, photo editing, Telugu/English typing, invitation cards, banners, and pre-press prep.",
    keyTopics: [
      "Adobe Photoshop: Photo retouching, layers, masks and color balance",
      "CorelDraw: Vector illustrations, logo design, visiting cards and flex banners",
      "PageMaker / InDesign: Multi-page layout, magazine and book formatting",
      "Telugu and regional font typing tools (Anu / ISM script)",
      "Print specifications, CMYK vs RGB, paper sizes, and output export"
    ],
    duration: "3-4 Months",
    eligibility: "Basic computer familiarity recommended",
    fee: null,
    feeStatus: "contact",
    image: "assets/images/dtp.jpeg",
    badge: "Creative"
  },
  {
    id: "tally-data-entry",
    name: "Tally Prime and Data Entry",
    category: "Computer Courses",
    categorySlug: "computer-courses",
    shortDescription: "Computerised accounting with Tally ERP/Prime, GST billing, inventory ledgers, balance sheets, and fast data entry.",
    fullDescription: "An industry-ready accounting and office administration course. Trainees learn accounting principles, ledger creation, voucher entry, bank reconciliation, inventory management, and GST returns in Tally, combined with rapid numerical data entry and verification techniques.",
    keyTopics: [
      "Accounting fundamentals: Debits, credits, ledgers and trial balance",
      "Tally Prime / ERP setup, company creation, and group management",
      "Voucher entries: Sales, purchase, payment, receipt and contra",
      "GST calculation, tax invoices, and e-way bill generation basics",
      "High-speed numerical data entry, Excel sheets and audit basics"
    ],
    duration: "3-4 Months",
    eligibility: "10th / 12th / Commerce students or general job seekers",
    fee: null,
    feeStatus: "contact",
    image: "assets/images/Tally.jpg",
    badge: "High Placement"
  }
];

/* Category configuration for filters */
const CATEGORIES = [
  { id: "all", label: "All Courses", icon: "fa-solid fa-shapes" },
  { id: "Tailoring and Beauty", label: "Tailoring & Beauty", icon: "fa-solid fa-scissors" },
  { id: "Language and Teaching", label: "Language & Teaching", icon: "fa-solid fa-comments" },
  { id: "Technical Trades", label: "Technical Trades", icon: "fa-solid fa-wrench" },
  { id: "Healthcare", label: "Healthcare", icon: "fa-solid fa-heart-pulse" },
  { id: "Computer Courses", label: "Computer Courses", icon: "fa-solid fa-laptop" }
];

/**
 * Format fee display string (subsidized training)
 */
function formatFeeDisplay(course) {
  return 'Subsidized';
}

/**
 * Escape HTML to prevent XSS injection
 */
function escapeHTML(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Global exposure for non-module script tag environment
window.COURSES_DATA = COURSES_DATA;
window.CATEGORIES = CATEGORIES;
window.formatFeeDisplay = formatFeeDisplay;
window.escapeHTML = escapeHTML;
