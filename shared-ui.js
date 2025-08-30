// Centralized UI generation and configuration
// Single source of truth for both Chrome extension and bookmarklet

const SHARED_UI_CONFIG = {
  title: "Calendar Overlays", 
  overlayConfigs: {
    blok: { id: "select_blok", label: "Blok", color: "rgba(128,128,128,0.3)", type: "week-range" },
    sprint1: { id: "select_sprint1", label: "Sprint 1", color: "rgba(0,255,0,0.3)", type: "week-range" },
    sprint2: { id: "select_sprint2", label: "Sprint 2", color: "rgba(255,165,0,0.3)", type: "week-range" },  
    sprint3: { id: "select_sprint3", label: "Sprint 3", color: "rgba(0,0,255,0.3)", type: "week-range" },
    rooster_vrij: { id: "select_rooster_vrij", label: "Rooster Vrij", color: "rgba(128,0,128,0.3)", type: "week-range" },
    toets: { id: "select_toets", label: "Toets", color: "rgba(255,255,0,0.3)", type: "day-specific" },
    assessment: { id: "select_assessment", label: "Assessment", color: "rgba(255,0,255,0.3)", type: "day-specific" }
  },
  courses: [
    { value: "Operations", label: "Operations" },
    { value: "GRC", label: "GRC" },
    { value: "Toets", label: "Toets" },
    { value: "Assessment", label: "Assessment" }
  ]
};

// Generate complete UI HTML for both extension and bookmarklet
function generateSharedUI(isBookmarklet = false) {
  const prefix = isBookmarklet ? 'bookmarklet-' : '';
  const closeButton = isBookmarklet ? 
    `<button id="${prefix}close" style="padding: 5px; border: 1px solid #ddd; background: #ffdddd; cursor: pointer; border-radius: 3px; margin-top: 5px; width: 120px;">Close</button>` : 
    '';

  return `
    <div style="margin-bottom: 10px; font-weight: bold; text-align: center; color: #333;">
      ${SHARED_UI_CONFIG.title}
    </div>
    <div style="margin-bottom: 10px;">
      <label for="${prefix}course-select" style="display: block; margin-bottom: 5px; font-weight: bold;">Course:</label>
      <select id="${prefix}course-select" style="width: 120px; padding: 5px;">
        ${SHARED_UI_CONFIG.courses.map(course => 
          `<option value="${course.value}">${course.label}</option>`
        ).join('')}
      </select>
    </div>
    <div style="display: flex; flex-direction: column; gap: 5px;">
      ${Object.values(SHARED_UI_CONFIG.overlayConfigs).map(config => 
        `<button id="${prefix}${config.id.replace('select_', '')}" style="padding: 5px; border: 1px solid #ddd; background: #f9f9f9; cursor: pointer; border-radius: 3px; width: 120px;">${config.label}</button>`
      ).join('')}
      ${closeButton}
    </div>
  `;
}

// Setup event handlers for shared UI
function setupSharedEventHandlers(isBookmarklet = false, handlers = {}) {
  const prefix = isBookmarklet ? 'bookmarklet-' : '';
  
  // Course selector
  const courseSelect = document.getElementById(`${prefix}course-select`);
  if (courseSelect && handlers.onCourseChange) {
    courseSelect.addEventListener('change', handlers.onCourseChange);
  }

  // Overlay buttons
  Object.keys(SHARED_UI_CONFIG.overlayConfigs).forEach(overlayKey => {
    const button = document.getElementById(`${prefix}${overlayKey}`);
    if (button && handlers.onOverlayClick) {
      button.addEventListener('click', () => {
        const config = SHARED_UI_CONFIG.overlayConfigs[overlayKey];
        handlers.onOverlayClick(overlayKey, config);
      });
    }
  });

  // Close button for bookmarklet
  if (isBookmarklet) {
    const closeButton = document.getElementById(`${prefix}close`);
    if (closeButton && handlers.onClose) {
      closeButton.addEventListener('click', handlers.onClose);
    }
  }
}

// Get overlay config by key
function getOverlayConfig(overlayKey) {
  return SHARED_UI_CONFIG.overlayConfigs[overlayKey];
}

// Export for both environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SHARED_UI_CONFIG, generateSharedUI, setupSharedEventHandlers, getOverlayConfig };
} else {
  window.SHARED_UI_CONFIG = SHARED_UI_CONFIG;
  window.generateSharedUI = generateSharedUI;
  window.setupSharedEventHandlers = setupSharedEventHandlers;
  window.getOverlayConfig = getOverlayConfig;
}