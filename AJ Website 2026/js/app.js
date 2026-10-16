/**
 * Asha Jyothi Employable Skill Training Centre
 * Master Application & Admission Form Controller
 * 
 * Features:
 * 1. Admission Form Validation (Indian mobile regex, campus, course)
 * 2. Infinite-loading-proof submission via mail.js
 * 3. Pre-select course helper & smooth scrolling
 * 4. Back-to-Top button controller
 * 5. Dynamic copyright year & AOS initialization
 */

'use strict';

/**
 * Preselect course in enquiry dropdown and smoothly scroll to it
 * @param {string} courseId 
 */
function selectCourseAndScrollToEnquiry(courseId) {
  const courseSelect = document.getElementById('enquiry-course');
  const enquirySection = document.getElementById('enquiry') || document.getElementById('contact');
  const nameInput = document.getElementById('enquiry-name');

  if (courseSelect && courseId) {
    const option = courseSelect.querySelector(`option[value="${courseId}"]`);
    if (option) {
      courseSelect.value = courseId;
      courseSelect.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  if (enquirySection) {
    enquirySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => {
      if (nameInput) nameInput.focus();
    }, 600);
  }
}

/**
 * Admission Enquiry Form Initializer
 */
function initEnquiryForm() {
  const form = document.getElementById('enquiry-form');
  const courseSelect = document.getElementById('enquiry-course');
  const statusMessage = document.getElementById('enquiry-status-message');
  const submitBtn = document.getElementById('enquiry-submit-btn');

  if (!form) return;

  const courses = window.COURSES_DATA || [];

  // Populate course dropdown with optgroups
  if (courseSelect) {
    const placeholder = courseSelect.firstElementChild;
    courseSelect.innerHTML = '';
    if (placeholder) courseSelect.appendChild(placeholder);

    const grouped = courses.reduce((acc, course) => {
      if (!acc[course.category]) acc[course.category] = [];
      acc[course.category].push(course);
      return acc;
    }, {});

    Object.keys(grouped).forEach((cat) => {
      const optgroup = document.createElement('optgroup');
      optgroup.label = cat;
      grouped[cat].forEach((course) => {
        const option = document.createElement('option');
        option.value = course.id;
        option.textContent = course.name;
        optgroup.appendChild(option);
      });
      courseSelect.appendChild(optgroup);
    });
  }

  // Validation rules
  const validators = {
    'enquiry-name': (val) => {
      const trimmed = val.trim();
      if (!trimmed) return 'Please enter your full name.';
      if (trimmed.length < 2) return 'Name must be at least 2 characters.';
      if (!/^[a-zA-Z\s.'-]+$/.test(trimmed)) return 'Name contains invalid characters.';
      return '';
    },
    'enquiry-phone': (val) => {
      const trimmed = val.trim();
      if (!trimmed) return 'Please enter your 10-digit mobile number.';
      const cleaned = trimmed.replace(/[\s-]/g, '');
      if (!/^[6-9]\d{9}$/.test(cleaned)) {
        return 'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).';
      }
      return '';
    },
    'enquiry-campus': (val) => {
      if (!val || val === '') return 'Please select your preferred campus location.';
      return '';
    },
    'enquiry-course': (val) => {
      if (!val || val === '') return 'Please choose a course you are interested in.';
      return '';
    },
    'enquiry-email': (val) => {
      const trimmed = val.trim();
      if (!trimmed) return ''; // Optional
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmed)) {
        return 'Please enter a valid email address (or leave blank).';
      }
      return '';
    }
  };

  function validateField(fieldId) {
    const input = document.getElementById(fieldId);
    const errorEl = document.getElementById(`${fieldId}-error`);
    if (!input || !validators[fieldId]) return true;

    const errorMessage = validators[fieldId](input.value);

    if (errorMessage) {
      input.classList.add('is-invalid');
      input.setAttribute('aria-invalid', 'true');
      if (errorEl) {
        errorEl.textContent = errorMessage;
        errorEl.hidden = false;
      }
      return false;
    } else {
      input.classList.remove('is-invalid');
      input.removeAttribute('aria-invalid');
      if (errorEl) {
        errorEl.textContent = '';
        errorEl.hidden = true;
      }
      return true;
    }
  }

  // Real-time blur and input listeners
  Object.keys(validators).forEach((fieldId) => {
    const input = document.getElementById(fieldId);
    if (!input) return;

    input.addEventListener('blur', () => validateField(fieldId));
    input.addEventListener('input', () => {
      if (input.classList.contains('is-invalid')) {
        validateField(fieldId);
      }
    });
    if (input.tagName === 'SELECT') {
      input.addEventListener('change', () => validateField(fieldId));
    }
  });

  // Loading state controller
  function setFormLoading(isLoading) {
    if (!submitBtn) return;
    submitBtn.disabled = isLoading;

    const btnText = submitBtn.querySelector('.btn-text');
    const spinner = submitBtn.querySelector('.btn-spinner');

    if (btnText) {
      btnText.innerHTML = isLoading
        ? '<i class="fa-solid fa-spinner fa-spin" style="margin-right:8px"></i>Sending Enquiry...'
        : '<i class="fa-solid fa-paper-plane" style="margin-right:6px;font-size:14px"></i>Submit Enquiry';
    }

    if (spinner) {
      spinner.hidden = !isLoading;
      spinner.classList.toggle('is-spinning', isLoading);
    }
  }

  // Display status result banner
  function displaySubmissionResult(result) {
    if (!statusMessage) return;

    statusMessage.hidden = false;
    statusMessage.className = 'enquiry-status';

    const safeName = window.escapeHTML ? window.escapeHTML(result.fullName) : result.fullName;
    const safeCourse = window.escapeHTML ? window.escapeHTML(result.courseName) : result.courseName;
    const safeMessage = window.escapeHTML ? window.escapeHTML(result.message) : result.message;

    if (result.isDemo) {
      statusMessage.classList.add('status-demo');
      statusMessage.innerHTML = `
        <div class="status-box">
          <div class="status-icon-wrapper" aria-hidden="true" style="font-size:22px; color:var(--color-red); margin-top:2px">
            <i class="fa-solid fa-circle-info"></i>
          </div>
          <div class="status-body">
            <h4 class="status-title">Demonstration Notice</h4>
            <p class="status-copy">
              Client-side verification passed for <strong>${safeName}</strong> (Course: <em>${safeCourse}</em>).
            </p>
            <p class="status-copy">${safeMessage}</p>
            <p class="status-action">
              You can contact Asha Jyothi directly at <a href="tel:8019680291" class="status-link">80196 80291</a> (Alwal), <a href="tel:7703466642" class="status-link">77034 66642</a> (Medchal), or <a href="tel:9949809263" class="status-link">99498 09263</a> (Ramanthapur).
            </p>
          </div>
        </div>
      `;
    } else if (result.success) {
      statusMessage.classList.add('status-success');
      statusMessage.innerHTML = `
        <div class="status-box">
          <div class="status-icon-wrapper" aria-hidden="true" style="font-size:22px; color:var(--color-success); margin-top:2px">
            <i class="fa-solid fa-circle-check"></i>
          </div>
          <div class="status-body">
            <h4 class="status-title">Enquiry Transmitted Successfully</h4>
            <p class="status-copy">${safeMessage}</p>
          </div>
        </div>
      `;
    } else {
      statusMessage.classList.add('status-error');
      statusMessage.innerHTML = `
        <div class="status-box">
          <div class="status-icon-wrapper" aria-hidden="true" style="font-size:22px; color:var(--color-error); margin-top:2px">
            <i class="fa-solid fa-circle-exclamation"></i>
          </div>
          <div class="status-body">
            <h4 class="status-title">Submission Error</h4>
            <p class="status-copy">${safeMessage}</p>
          </div>
        </div>
      `;
    }

    statusMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // Form submit handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    let isValid = true;
    let firstInvalidInput = null;

    Object.keys(validators).forEach((fieldId) => {
      const fieldValid = validateField(fieldId);
      if (!fieldValid) {
        isValid = false;
        if (!firstInvalidInput) {
          firstInvalidInput = document.getElementById(fieldId);
        }
      }
    });

    if (!isValid) {
      if (firstInvalidInput) firstInvalidInput.focus();
      return;
    }

    const courseId = document.getElementById('enquiry-course').value;
    const courseObj = courses.find((c) => c.id === courseId);

    const formData = {
      fullName: document.getElementById('enquiry-name').value.trim(),
      mobileNumber: document.getElementById('enquiry-phone').value.trim().replace(/[\s-]/g, ''),
      preferredCampus: document.getElementById('enquiry-campus').value,
      courseId: courseId,
      courseName: courseObj ? courseObj.name : courseId,
      email: document.getElementById('enquiry-email').value.trim(),
      message: (document.getElementById('enquiry-message')?.value || '').trim()
    };

    setFormLoading(true);

    try {
      const mailSender = window.sendEnquiryMail || (window.MailService && window.MailService.sendEnquiryMail);
      if (typeof mailSender !== 'function') {
        throw new Error('Mail sending service not initialized.');
      }

      const result = await mailSender(formData);
      displaySubmissionResult(result);

      if (result.success) {
        form.reset();
      }
    } catch (err) {
      console.error('Enquiry Submission caught:', err);
      displaySubmissionResult({
        success: false,
        isDemo: false,
        fullName: formData.fullName,
        courseName: formData.courseName,
        message: 'A network error occurred while attempting to send your enquiry. Please reach our admissions team directly at 80196 80291.'
      });
    } finally {
      // NEVER leaves button in infinite loading state!
      setFormLoading(false);
    }
  });
}

/**
 * Back to Top Button Initializer
 */
function initBackToTop() {
  const backToTopBtn = document.getElementById('back-to-top');
  if (!backToTopBtn) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 380) {
      backToTopBtn.classList.add('is-visible');
    } else {
      backToTopBtn.classList.remove('is-visible');
    }
  }, { passive: true });

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth'
    });
    const topTarget = document.getElementById('top') || document.querySelector('header');
    if (topTarget) topTarget.focus();
  });
}

/**
 * Dynamic Footer Year
 */
function updateCopyrightYear() {
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

/**
 * Interactive Number Counting Animation for Stats Strip
 */
function initStatsCounter() {
  const statNumbers = document.querySelectorAll('.stat-number[data-count]');
  if (statNumbers.length === 0) return;

  const animateNumber = (el) => {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const suffix = el.getAttribute('data-suffix') || '';
    if (isNaN(target)) return;

    const duration = target > 500 ? 1800 : 1200;
    const startTime = performance.now();

    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Smooth cubic ease out
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(target * ease);

      el.textContent = current.toLocaleString('en-IN') + suffix;

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        el.textContent = target.toLocaleString('en-IN') + suffix;
      }
    };

    requestAnimationFrame(updateCounter);
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateNumber(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.25 });

    statNumbers.forEach((el) => observer.observe(el));
  } else {
    statNumbers.forEach((el) => animateNumber(el));
  }
}

/**
 * Master Application Bootstrap
 */
document.addEventListener('DOMContentLoaded', () => {
  // 1. Navigation
  if (typeof window.initNavigation === 'function') {
    window.initNavigation();
  }

  // 2. Catalogue & Filter Bar
  if (typeof window.initCourseCatalogue === 'function') {
    window.initCourseCatalogue();
  }

  // 3. Course Details Modal
  if (typeof window.initCourseModal === 'function') {
    window.initCourseModal();
  }

  // 4. Admission Enquiry Form
  initEnquiryForm();

  // 5. Animated Number Counter for Stats
  initStatsCounter();

  // 6. Back to Top Floating Button
  initBackToTop();

  // 7. Dynamic Copyright Year
  updateCopyrightYear();

  // 8. AOS (Animate On Scroll)
  if (typeof AOS !== 'undefined') {
    AOS.init({
      once: true,
      offset: 50,
      duration: 600,
      easing: 'ease-out-cubic'
    });
  }
});

// Global exposure
window.selectCourseAndScrollToEnquiry = selectCourseAndScrollToEnquiry;
window.initEnquiryForm = initEnquiryForm;
