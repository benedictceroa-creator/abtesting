/**
 * Asha Jyothi Employable Skill Training Centre
 * Course Catalogue & Course Details Modal Module
 * 
 * Features:
 * 1. Segmented iOS-style Category Filter Bar
 * 2. 150ms Debounced Live Course Search
 * 3. Inset Image Course Cards
 * 4. Accessible Course Details Dialog with Focus Trapping
 */

'use strict';

const catalogueState = {
  activeCategory: 'all',
  searchQuery: '',
  lastActiveModalTrigger: null,
  scrollHintDismissed: false
};

/* ==========================================================================
   1. Course Details Modal
   ========================================================================== */

function initCourseModal() {
  const modal = document.getElementById('course-details-modal');
  const closeBtn = document.getElementById('modal-close-btn');
  const modalEnquireBtn = document.getElementById('modal-enquire-btn');
  const modalBackdrop = document.querySelector('.modal-backdrop');
  const hintEl = document.getElementById('modal-scroll-hint');

  if (!modal) return;

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');

    if (hintEl) {
      hintEl.classList.remove('is-visible');
    }

    if (catalogueState.lastActiveModalTrigger && typeof catalogueState.lastActiveModalTrigger.focus === 'function') {
      catalogueState.lastActiveModalTrigger.focus();
      catalogueState.lastActiveModalTrigger = null;
    }
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);

  // Focus trapping inside modal
  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('is-open')) return;

    if (e.key === 'Escape') {
      closeModal();
      return;
    }

    if (e.key === 'Tab') {
      const focusableElements = modal.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length === 0) return;

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  });

  if (modalEnquireBtn) {
    modalEnquireBtn.addEventListener('click', () => {
      const courseId = modalEnquireBtn.getAttribute('data-course-id');
      closeModal();
      if (typeof window.selectCourseAndScrollToEnquiry === 'function') {
        window.selectCourseAndScrollToEnquiry(courseId);
      }
    });
  }

  window.closeCourseModal = closeModal;
}

function openCourseModal(courseId, triggerElement = null) {
  if (triggerElement) {
    catalogueState.lastActiveModalTrigger = triggerElement;
  }

  const courses = window.COURSES_DATA || [];
  const course = courses.find((c) => c.id === courseId);
  if (!course) return;

  const modal = document.getElementById('course-details-modal');
  const titleEl = document.getElementById('modal-course-title');
  const categoryEl = document.getElementById('modal-course-category');
  const descriptionEl = document.getElementById('modal-course-description');
  const topicsListEl = document.getElementById('modal-course-topics');
  const durationEl = document.getElementById('modal-course-duration');
  const eligibilityEl = document.getElementById('modal-course-eligibility');
  const feeEl = document.getElementById('modal-course-fee');
  const enquireBtn = document.getElementById('modal-enquire-btn');
  const imageEl = document.getElementById('modal-course-image');

  if (!modal || !titleEl) return;

  titleEl.textContent = course.name;
  if (categoryEl) categoryEl.textContent = course.category;
  if (descriptionEl) descriptionEl.textContent = course.fullDescription;
  if (durationEl) durationEl.textContent = course.duration;
  const formatEl = document.getElementById('modal-course-format');
  if (formatEl) formatEl.textContent = 'Hands-On Practical Labs';

  if (imageEl) {
    imageEl.src = course.image;
    imageEl.alt = `${course.name} practical vocational training`;
  }

  if (topicsListEl && Array.isArray(course.keyTopics)) {
    topicsListEl.innerHTML = course.keyTopics.map((topic) => `
      <li>
        <svg class="check-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D62828" stroke-width="2.5" aria-hidden="true">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>${window.escapeHTML ? window.escapeHTML(topic) : topic}</span>
      </li>
    `).join('');
  }

  if (enquireBtn) {
    enquireBtn.setAttribute('data-course-id', course.id);
  }

  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');

  const closeBtn = document.getElementById('modal-close-btn');
  if (closeBtn) closeBtn.focus();

  // Subtle Scroll-Down Hint UX: Displays mouse icon indicator once when content overflows
  const hintEl = document.getElementById('modal-scroll-hint');
  const modalBody = modal.querySelector('.modal-body');
  if (hintEl && modalBody) {
    modalBody.scrollTop = 0;

    if (!catalogueState.scrollHintDismissed) {
      hintEl.classList.remove('is-dismissed', 'is-visible');

      setTimeout(() => {
        // Only display if modal body actually has scrollable overflow
        if (modalBody.scrollHeight > modalBody.clientHeight + 25) {
          hintEl.classList.add('is-visible');

          const dismissHint = () => {
            catalogueState.scrollHintDismissed = true;
            hintEl.classList.add('is-dismissed');
            hintEl.classList.remove('is-visible');
            modalBody.removeEventListener('scroll', handleScroll);
          };

          const handleScroll = () => {
            if (modalBody.scrollTop > 15) {
              dismissHint();
            }
          };

          modalBody.addEventListener('scroll', handleScroll, { passive: true });

          // Auto-fade gently after 3.8 seconds so it never lingers
          setTimeout(() => {
            if (!catalogueState.scrollHintDismissed) {
              dismissHint();
            }
          }, 3800);
        } else {
          hintEl.classList.add('is-dismissed');
        }
      }, 80);
    } else {
      hintEl.classList.add('is-dismissed');
      hintEl.classList.remove('is-visible');
    }
  }
}

/* ==========================================================================
   2. Course Catalogue & Filtering
   ========================================================================== */

function initCourseCatalogue() {
  const courseGrid = document.getElementById('course-grid');
  const searchInput = document.getElementById('course-search-input');
  const filterPillsContainer = document.getElementById('filter-pills-container');
  const resultCounter = document.getElementById('courses-count');
  const emptyState = document.getElementById('courses-empty-state');
  const clearFiltersBtn = document.getElementById('clear-filters-btn');
  const emptyClearBtn = document.getElementById('empty-clear-btn');

  if (!courseGrid) return;

  const courses = window.COURSES_DATA || [];
  const categories = window.CATEGORIES || [];

  // Render modern filter pills with category icons & item counts
  if (filterPillsContainer) {
    filterPillsContainer.innerHTML = categories.map((cat) => {
      const isSelected = cat.id === catalogueState.activeCategory;
      const count = cat.id === 'all'
        ? courses.length
        : courses.filter((c) => c.category === cat.id).length;
      const iconHtml = cat.icon ? `<i class="${cat.icon} filter-pill-icon" aria-hidden="true"></i>` : '';
      return `
        <button type="button" 
                class="filter-pill ${isSelected ? 'is-active' : ''}" 
                data-category="${window.escapeHTML(cat.id)}"
                aria-pressed="${isSelected ? 'true' : 'false'}">
          ${iconHtml}
          <span class="filter-pill-label">${window.escapeHTML(cat.label)}</span>
          <span class="filter-pill-count">${count}</span>
        </button>
      `;
    }).join('');
  }

  // Filter computation
  function getFilteredCourses() {
    const query = catalogueState.searchQuery.trim().toLowerCase();
    return courses.filter((course) => {
      const matchesCategory =
        catalogueState.activeCategory === 'all' || course.category === catalogueState.activeCategory;
      const matchesSearch =
        !query ||
        course.name.toLowerCase().includes(query) ||
        course.category.toLowerCase().includes(query) ||
        course.shortDescription.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }

  // Render cards
  function renderCourses() {
    const filtered = getFilteredCourses();

    if (resultCounter) {
      resultCounter.textContent = `Showing ${filtered.length} of ${courses.length} courses`;
    }

    if (filtered.length === 0) {
      courseGrid.innerHTML = '';
      if (emptyState) emptyState.hidden = false;
      return;
    }

    if (emptyState) emptyState.hidden = true;

    courseGrid.innerHTML = filtered.map((course) => {
      const feeText = window.formatFeeDisplay ? window.formatFeeDisplay(course) : 'From ₹750*';
      return `
        <article class="course-card" data-course-id="${window.escapeHTML(course.id)}">
          <div class="card-media">
            <img src="${window.escapeHTML(course.image)}" 
                 alt="${window.escapeHTML(course.name)} practical vocational training"
                 width="400" 
                 height="240" 
                 loading="lazy" 
                 class="card-img">
            <span class="card-badge">${window.escapeHTML(course.category)}</span>
          </div>
          <div class="card-body">
            <h3 class="card-title">${window.escapeHTML(course.name)}</h3>
            <p class="card-description">${window.escapeHTML(course.shortDescription)}</p>
            <div class="card-meta">
              <span class="meta-tag">
                <i class="fa-regular fa-clock" style="font-size:13px; color:var(--color-navy); margin-right:3px"></i>
                ${window.escapeHTML(course.duration)}
              </span>
              <span class="meta-tag meta-badge">
                <i class="fa-solid fa-award" style="font-size:12px; color:var(--color-red); margin-right:3px"></i>
                ${window.escapeHTML(course.badge || 'Certified')}
              </span>
            </div>
          </div>
          <div class="card-footer">
            <button type="button" 
                    class="btn btn-outline btn-sm js-view-details" 
                    data-course-id="${window.escapeHTML(course.id)}"
                    aria-haspopup="dialog">
              View Details
            </button>
            <button type="button" 
                    class="btn btn-primary btn-sm js-enquire-course" 
                    data-course-id="${window.escapeHTML(course.id)}">
              Enquire
            </button>
          </div>
        </article>
      `;
    }).join('');
  }

  // Filter Pill Click Handler
  if (filterPillsContainer) {
    filterPillsContainer.addEventListener('click', (e) => {
      const pill = e.target.closest('.filter-pill');
      if (!pill) return;

      const category = pill.getAttribute('data-category');
      catalogueState.activeCategory = category;

      // Scroll selected pill into view smoothly on mobile
      pill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

      const allPills = filterPillsContainer.querySelectorAll('.filter-pill');
      allPills.forEach((p) => {
        const isActive = p.getAttribute('data-category') === category;
        p.classList.toggle('is-active', isActive);
        p.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });

      renderCourses();
    });
  }

  // Live Search with Debounce
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        catalogueState.searchQuery = e.target.value;
        renderCourses();
      }, 150);
    });
  }

  // Reset Filters
  function resetFilters() {
    catalogueState.activeCategory = 'all';
    catalogueState.searchQuery = '';
    if (searchInput) searchInput.value = '';

    if (filterPillsContainer) {
      const allPills = filterPillsContainer.querySelectorAll('.filter-pill');
      allPills.forEach((p) => {
        const isAll = p.getAttribute('data-category') === 'all';
        p.classList.toggle('is-active', isAll);
        p.setAttribute('aria-pressed', isAll ? 'true' : 'false');
      });
    }

    renderCourses();
  }

  if (clearFiltersBtn) clearFiltersBtn.addEventListener('click', resetFilters);
  if (emptyClearBtn) emptyClearBtn.addEventListener('click', resetFilters);

  // Card Action Button Delegation
  courseGrid.addEventListener('click', (e) => {
    const detailsBtn = e.target.closest('.js-view-details');
    const enquireBtn = e.target.closest('.js-enquire-course');

    if (detailsBtn) {
      const courseId = detailsBtn.getAttribute('data-course-id');
      openCourseModal(courseId, detailsBtn);
    } else if (enquireBtn) {
      const courseId = enquireBtn.getAttribute('data-course-id');
      if (typeof window.selectCourseAndScrollToEnquiry === 'function') {
        window.selectCourseAndScrollToEnquiry(courseId);
      }
    }
  });

  // Initial render
  renderCourses();
}

// Global exposure
window.initCourseCatalogue = initCourseCatalogue;
window.initCourseModal = initCourseModal;
window.openCourseModal = openCourseModal;
