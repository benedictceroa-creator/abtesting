# Asha Jyothi Employable Skill Training Centre — Website

A responsive, production-quality single-page institutional website for **Asha Jyothi Employable Skill Training Centre**, an established vocational institute with over 10 years of operating experience and official recognition by the Intermediate Board of Telangana.

This project is built using semantic **HTML5**, modern **CSS3**, and modular **Vanilla JavaScript (ES6+)** with zero external runtime frameworks or build dependencies.

---

## 1. Project Structure

```text
asha-jyothi-website/
├── index.html              # Semantic HTML5 document structure & metadata
├── css/
│   └── style.css           # Custom properties, grid/flexbox layouts, responsive styles
├── js/
│   └── script.js           # Central course data model, dynamic catalogue, modal, validation
├── assets/
│   ├── logo/
│   │   └── asha-jyothi-logo.svg       # Brand emblem & institutional logotype
│   ├── images/
│   │   ├── hero-vocational.svg        # Hero section vocational learning visual
│   │   ├── about-training.svg         # Hands-on training & mentorship graphic
│   │   ├── campus-secunderabad.svg    # Secunderabad / Alwal campus illustration
│   │   ├── campus-medchal.svg         # Medchal campus illustration
│   │   ├── campus-ramanthapur.svg     # Ramanthapur campus illustration
│   │   ├── facility-classrooms.svg    # Facility: Spacious Classrooms
│   │   ├── facility-practical-labs.svg# Facility: Practical Training Areas
│   │   ├── facility-computer-lab.svg  # Facility: Computers & Internet
│   │   ├── facility-study-materials.svg# Facility: Learning Materials
│   │   ├── facility-safe-environment.svg# Facility: Clean & Safe Environment
│   │   ├── facility-hostel.svg        # Facility: Hostel Facilities
│   │   └── [16 course SVGs]           # Dedicated visual for each certified course
│   └── icons/                         # UI icons embedded as scalable vectors
└── README.md               # Technical setup, configuration, and testing guide
```

---

## 2. Technical Stack & Architecture

- **Semantic HTML5**: Native landmarks (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`), ARIA attributes (`aria-expanded`, `aria-controls`, `aria-live="polite"`, `role="dialog"`), accessible heading hierarchy, and JSON-LD `EducationalOrganization` schema.
- **CSS3 (Custom Properties & Responsive Layouts)**:
  - Custom variables in `:root` for brand navy (`#10194F`), brand red (`#D62828`), typography, spacing, and shadows.
  - CSS Grid and Flexbox for fluid layouts.
  - Respects `@media (prefers-reduced-motion: reduce)` for users with motion sensitivity.
- **Vanilla JavaScript (ES6+)**:
  - Single source of truth: 16 courses stored in `COURSES_DATA` array.
  - Dynamic card rendering with safe DOM APIs (`renderCourses()`).
  - Real-time search by keywords and filter pills by category.
  - Accessible modal dialog with focus trapping and `Escape` key support.
  - Interactive "Find the Right Course" advisor that pre-selects courses in the enquiry form.
  - Robust form validation (Indian 10-digit mobile number format, required fields, optional email format).
  - Clear submission service abstraction (`submitEnquiryService()`) that operates honestly in **Demonstration Mode** until a production endpoint is configured.

---

## 3. Local Execution Guide

The website is completely static and can be executed locally without any build steps or package installation.

### Option A: VS Code Live Server (Recommended)
1. Open the `asha-jyothi-website/` folder in Visual Studio Code.
2. Install the **Live Server** extension (`ritwickdey.liveserver`) if not already installed.
3. Right-click on `index.html` and choose **"Open with Live Server"**.
4. The website will open at `http://127.0.0.1:5500/index.html`.

### Option B: Python Local Server
Run in PowerShell or terminal from the project root:
```bash
python -m http.server 8000
```
Then visit `http://localhost:8000`.

### Option C: Node.js (npx serve or http-server)
```bash
npx serve .
```

### Option D: Direct Browser Opening
Double-click `index.html` to open directly in any modern browser (Chrome, Edge, Firefox, Safari).

---

## 4. How to Configure Confirmed Course Fees

By default, the institute states **"Courses starting from ₹750"** as the general pricing statement, while individual course fees default to `"Contact for Fees"` (`feeStatus: "contact"`).

To update an individual course with a confirmed fee:
1. Open [`js/script.js`](file:///C:/Users/bojja/.gemini/antigravity/scratch/asha-jyothi-website/js/script.js).
2. Locate the target course inside `COURSES_DATA`.
3. Set `feeStatus: "confirmed"` and specify the numeric `fee`.

**Example:**
```javascript
{
  id: "tailoring-basic",
  name: "Tailoring — Basic",
  // ... other fields ...
  fee: 1500,                    // Enter confirmed numeric fee
  feeStatus: "confirmed",       // Change from "contact" to "confirmed"
  image: "assets/images/tailoring-basic.svg"
}
```
The catalogue card and course details modal will automatically format this as `₹1,500` using Indian number formatting.

---

## 5. How to Connect the Enquiry Form to a Real Backend

The front-end enquiry form uses a clean service abstraction `submitEnquiryService()`. In default demonstration mode, it validates input on the client side and informs the user that demo mode is active with no live endpoint configured.

### Step 1: Choose Your Submission Service
- **Formspree**: Sign up at [formspree.io](https://formspree.io), create a form, and obtain your endpoint URL (e.g. `https://formspree.io/f/xyzabced`).
- **Web3Forms**: Obtain an access key at [web3forms.com](https://web3forms.com).
- **Custom REST API**: Your internal PHP / Node.js / Python server receiving POST JSON payloads.
- **Google Sheets / Apps Script**: A Web App URL connected to an admissions Google Sheet.

### Step 2: Configure `SUBMISSION_CONFIG` in `js/script.js`
Open [`js/script.js`](file:///C:/Users/bojja/.gemini/antigravity/scratch/asha-jyothi-website/js/script.js) and locate lines ~275:
```javascript
const SUBMISSION_CONFIG = {
  mode: "endpoint",                            // Switch from "demo" to "endpoint"
  endpointUrl: "https://formspree.io/f/YOUR_FORM_ID", // Your production endpoint
  timeoutMs: 8000
};
```

When `mode: "endpoint"` is set, submitting the form will send an HTTPS `POST` JSON request containing:
```json
{
  "fullName": "Student Name",
  "mobileNumber": "9876543210",
  "preferredCampus": "Secunderabad / Alwal",
  "courseId": "tailoring-basic",
  "courseName": "Tailoring — Basic",
  "email": "student@example.com",
  "message": "Interested in morning batch timings.",
  "timestamp": "2026-10-13T11:25:00.000Z"
}
```

---

## 6. How to Replace Placeholder SVGs with Actual Photographs

The current assets are SVG vector illustrations styled in Asha Jyothi's brand palette (`#10194F`, `#D62828`).

To replace them with actual institute photographs:
1. Save high-resolution, compressed `.webp` or `.jpg` photos into the corresponding `assets/` subdirectories:
   - Campuses: `assets/images/campus-secunderabad.webp`, `campus-medchal.webp`, etc.
   - Courses: `assets/images/tailoring-basic.webp`, etc.
   - Facilities: `assets/images/facility-classrooms.webp`, etc.
2. Update the image paths in:
   - [`index.html`](file:///C:/Users/bojja/.gemini/antigravity/scratch/asha-jyothi-website/index.html) for static section images.
   - [`js/script.js`](file:///C:/Users/bojja/.gemini/antigravity/scratch/asha-jyothi-website/js/script.js) inside the `COURSES_DATA` array for course images.

---

## 7. Quality & Testing Checklist

| Test Item | Verification Criteria | Status |
| :--- | :--- | :---: |
| **All 16 Courses Rendered** | Exactly 16 courses dynamically created from `COURSES_DATA` array with badges, images, descriptions, and action buttons. | Verified |
| **Category Filter Pills** | Filtering by "Tailoring & Beauty", "Language & Teaching", "Technical Trades", "Healthcare", "Computer Courses", and "All Courses". | Verified |
| **Search Functionality** | Debounced search filters by course name, category, and keywords simultaneously with category pills. | Verified |
| **Clear Filters** | Button resets search query and category pill back to "All Courses". | Verified |
| **Empty Search State** | Shows a helpful message and reset button when no course matches. | Verified |
| **Course Details Modal** | Opens on "View Details", populates syllabus & info, traps keyboard focus, closes with Esc key, close button, or outside click. Restores focus on close. | Verified |
| **Course Preselection** | Clicking "Enquire" on any card or modal scrolls to `#enquiry` and automatically selects that course in the dropdown. | Verified |
| **Find the Right Course** | Interactive guidance advisor updates matching courses dynamically based on 5 interest categories. | Verified |
| **Form Validation** | Trims input, rejects empty required fields, enforces 10-digit Indian mobile format (`^[6-9]\d{9}$`), checks optional email format. | Verified |
| **Demonstration Mode Notice** | Form displays an honest, non-misleading demonstration alert when no backend is configured. | Verified |
| **Clickable Phone & Email** | All 3 campus numbers (`80196 80291`, `77803 46642`, `99498 09263`) have `tel:` links; email uses `mailto:info@ashajyothi.org.in`. | Verified |
| **Sticky Navigation** | Elevated header with shadow on scroll, smooth anchor navigation with sticky offset. | Verified |
| **Mobile Drawer Menu** | Accessible hamburger button with `aria-expanded`, keyboard navigation, closes after link click or Esc key. | Verified |
| **Back to Top Button** | Appears when scrolled down > 400px, smoothly scrolls back to top. | Verified |
| **Reduced Motion Support** | `@media (prefers-reduced-motion: reduce)` disables animations and sets transitions to immediate. | Verified |
| **Responsive Layouts** | Tested and verified without overflow across 320px, 375px, 430px, 768px, 1024px, 1366px, and 1920px. | Verified |

---

## 8. Verified Institutional Information

- **Institute Name**: Asha Jyothi Employable Skill Training Centre
- **Operating History**: Over 10 Years of Continuous Service (Est. 2014)
- **Board Recognition**: Recognized by the Intermediate Board of Telangana
- **General Course Fee**: Courses starting from ₹750*
- **Campus 1 (Secunderabad / Alwal)**: Phone `80196 80291`
- **Campus 2 (Medchal)**: Phone `77803 46642`
- **Campus 3 (Ramanthapur)**: Phone `99498 09263`
- **Email**: `info@ashajyothi.org.in`
