// Main popup orchestration file
// This file coordinates all overlay functionality

// URL validation function using standardized error handling
async function validateCurrentPage() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) {
        const error = errorHandler.createError(
          ERROR_CODES.CHROME_API_ERROR,
          chrome.runtime.lastError.message,
          'validateCurrentPage'
        );
        console.error('Tab query error:', error);
        resolve(error);
        return;
      }
      
      if (!tabs || !tabs[0]) {
        const error = errorHandler.createError(
          ERROR_CODES.TAB_ACCESS_DENIED,
          'No active tab found',
          'validateCurrentPage'
        );
        console.error('No active tab found:', error);
        resolve(error);
        return;
      }

      const currentUrl = tabs[0].url;
      console.log('🔍 Extension checking URL:', currentUrl);
      console.log('🔍 Expected URL pattern: https://rooster.hva.nl/schedule');
      console.log('🔍 URL starts with pattern:', currentUrl ? currentUrl.startsWith('https://rooster.hva.nl/schedule') : 'null');
      
      // Check if URL matches the required pattern
      const isValidPage = currentUrl && currentUrl.startsWith('https://rooster.hva.nl/schedule');
      
      console.log('🔍 Page validation result:', isValidPage ? '✅ Valid' : '❌ Invalid');
      
      if (isValidPage) {
        resolve(errorHandler.createSuccess(true, 'Page validation passed', 'validateCurrentPage'));
      } else {
        resolve(errorHandler.createError(
          ERROR_CODES.INVALID_URL,
          'Extension only works on https://rooster.hva.nl/schedule pages',
          'validateCurrentPage'
        ));
      }
    });
  });
}

// View detection and switching using shared utility
async function detectAndSwitchToMaandView() {
  console.log('🎯 Detecting current view and switching to Maand if needed...');
  
  try {
    // Inject view detection utility and perform async detection/switching
    const result = await executeScriptInActiveTab(async () => {
      // Ensure ViewDetectionCore is available in the page context
      if (typeof ViewDetectionCore === 'undefined') {
        console.error('❌ ViewDetectionCore not available in page context');
        return {
          success: false,
          error: 'VIEW_DETECTION_CORE_MISSING',
          message: 'ViewDetectionCore utility not loaded'
        };
      }
      
      const detector = new ViewDetectionCore();
      return await detector.ensureMaandViewAsync();
    });

    // Extract result from Chrome extension API response
    const viewResult = result[0]?.result;
    
    if (!viewResult) {
      return errorHandler.createError(
        ERROR_CODES.SCRIPT_INJECTION_DENIED,
        'Failed to execute view detection script',
        'detectAndSwitchToMaandView'
      );
    }

    // Check if the result indicates an error
    if (!viewResult.success) {
      return errorHandler.createError(
        ERROR_CODES.VIEW_NOT_DETECTED,
        viewResult.message || 'View detection failed',
        'detectAndSwitchToMaandView',
        viewResult.error
      );
    }

    return errorHandler.createSuccess(viewResult, 'View detection completed', 'detectAndSwitchToMaandView');

  } catch (error) {
    return errorHandler.createError(
      ERROR_CODES.SCRIPT_INJECTION_DENIED,
      `Error during view detection/switching: ${error.message}`,
      'detectAndSwitchToMaandView',
      error
    );
  }
}

// Show error message and hide main content
function showPageError() {
  const errorContainer = document.getElementById('error-container');
  const mainContent = document.getElementById('main-content');
  
  if (errorContainer) {
    errorContainer.style.display = 'block';
  }
  
  if (mainContent) {
    mainContent.style.display = 'none';
  }
  
  console.log('🚫 Extension deactivated - Invalid page');
}

// Show main content and hide error message
function showMainContent() {
  const errorContainer = document.getElementById('error-container');
  const mainContent = document.getElementById('main-content');
  
  if (errorContainer) {
    errorContainer.style.display = 'none';
  }
  
  if (mainContent) {
    mainContent.style.display = 'block';
  }
  
  console.log('✅ Extension activated - Valid page');
}

// Show user feedback when view is switched
function showViewSwitchFeedback(viewResult) {
  try {
    // Create or update a temporary notification element
    let notification = document.getElementById('view-switch-notification');
    
    if (!notification) {
      notification = document.createElement('div');
      notification.id = 'view-switch-notification';
      notification.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: #4CAF50;
        color: white;
        padding: 10px 15px;
        border-radius: 5px;
        font-size: 12px;
        z-index: 10000;
        max-width: 250px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      `;
      document.body.appendChild(notification);
    }
    
    const message = viewResult.verified 
      ? `✅ Switched to Maand view from ${viewResult.previousView}`
      : `🔄 Attempted to switch to Maand view from ${viewResult.previousView}`;
    
    notification.textContent = message;
    notification.style.display = 'block';
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      if (notification && notification.parentNode) {
        notification.style.display = 'none';
      }
    }, 3000);
    
    console.log('📢 View switch feedback shown:', message);
  } catch (error) {
    console.error('❌ Error showing view switch feedback:', error);
  }
}

// Utility functions
function executeScriptInActiveTab(func, args = []) {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) {
        console.error('Tab query error:', chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
        return;
      }
      
      if (!tabs || !tabs[0]) {
        console.error('No active tab found');
        reject(new Error('No active tab found'));
        return;
      }

      console.log('Executing script in tab:', tabs[0].id);
      
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: func,
        args: args
      }).then(result => {
        console.log('Script executed successfully:', result);
        resolve(result);
      }).catch(error => {
        console.error('Script execution failed:', error);
        reject(error);
      });
    });
  });
}

// Standard overlay for ultimate fallback (kept for compatibility)
async function createStandardOverlay(color) {
  console.log('🎨 Creating standard overlay with color:', color);
  
  try {
    await executeScriptInActiveTab((overlayColor, styles) => {
      console.log('🚀 Standard overlay script executing');
      
      const existing = document.getElementById('custom-overlay');
      if (existing) {
        console.log('🗑️ Removing existing overlay');
        existing.remove();
        return 'removed';
      }

      const overlay = document.createElement('div');
      overlay.id = 'custom-overlay';
      Object.assign(overlay.style, {
        ...styles,
        background: overlayColor
      });
      document.body.appendChild(overlay);
      console.log('✅ Standard overlay created');
      return 'created';
    }, [color, OVERLAY_STYLES]);
  } catch (error) {
    console.error('❌ Error creating standard overlay:', error);
  }
}

// Debug function (unchanged)
async function debugCalendarElements() {
  console.log('🔍 Running debug for calendar elements');
  
  try {
    await executeScriptInActiveTab(() => {
      console.log('=== 🔍 DEBUG: Looking for calendar elements ===');
      
      const tables = document.querySelectorAll('table');
      console.log('📊 Tables found:', tables.length);
      tables.forEach((table, i) => {
        const rect = table.getBoundingClientRect();
        console.log(`Table ${i}:`, {
          width: rect.width,
          height: rect.height,
          left: rect.left,
          top: rect.top,
          classes: table.className,
          id: table.id
        });
      });
      
      return 'debug complete';
    });
  } catch (error) {
    console.error('❌ Error running debug:', error);
  }
}

// Event listeners setup
function setupEventListeners() {
  logger.debug('⚙️ Setting up event listeners...');
  
  let isProcessing = false;
  
  // Calendar overlay buttons - Day, Week, Month
  const CALENDAR_CONFIGS = window.OVERLAY_CORE_CONFIG?.CALENDAR_CONFIGS || [];
  CALENDAR_CONFIGS.forEach(config => {
    const button = document.getElementById(config.id);
    console.log(`Looking for calendar button "${config.id}":`, button ? '✅ found' : '❌ not found');
    
    if (button) {
      button.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        
        if (isProcessing) return;
        isProcessing = true;
        console.log(`🎯 ${config.id} button clicked!`);
        
        try {
          let result;
          
          // Call the appropriate function based on button ID
          if (config.id === 'select_blok') {
            result = await select_blok(config);
          } else if (config.id === 'select_sprint1') {
            result = await select_sprint1(config);
          } else if (config.id === 'select_sprint2') {
            result = await select_sprint2(config);
          } else if (config.id === 'select_sprint3') {
            result = await select_sprint3(config);
          } else if (config.id === 'select_rooster_vrij') {
            result = await select_rooster_vrij(config);
          } else if (config.id === 'select_toets') {
            result = await select_toets(config);
          } else if (config.id === 'select_assessment') {
            result = await select_assessment(config);
          }
          
          console.log(`✅ ${config.id} overlay ${result}`);
          
          // Update button appearance based on state
          if (result === 'created') {
            button.style.backgroundColor = config.color.replace('0.3', '0.8'); // Make button more opaque when active
            button.style.color = 'white';
          } else if (result === 'removed') {
            button.style.backgroundColor = ''; // Reset to default
            button.style.color = '';
          }
        } catch (error) {
          console.error(`❌ Error with ${config.id}:`, error);
        } finally {
          setTimeout(() => { isProcessing = false; }, 500);
        }
      });
    }
  });

  // Text overlay buttons removed - text now integrated into main overlays


  
  console.log('✅ Event listeners setup complete');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('📄 DOM Content Loaded - initializing...');
  initializeExtension();
});

// Fallback initialization
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeExtension);
} else {
  console.log('📄 DOM already loaded - initializing immediately...');
  initializeExtension();
}

// Update title with consistent naming
function updateTitle() {
  try {
    const titleElement = document.getElementById('calendar-overlays-title');
    if (titleElement) {
      // Use consistent title across both extension and bookmarklet
      const titleText = 'Calendar Overlays';
      titleElement.textContent = titleText;
      logger.debug('✅ Title updated to:', titleElement.textContent);
    }
  } catch (error) {
    console.error('❌ Error updating title:', error);
  }
}

// Populate course dropdown
function populateCourseDropdown() {
  try {
    const courseSelect = document.getElementById('course-select');
    if (!courseSelect || !cachedSettings) return;
    
    // Clear existing options
    courseSelect.innerHTML = '';
    
    // Get available courses
    const courses = getAvailableCourses(cachedSettings);
    
    // Add course options
    courses.forEach(course => {
      const option = document.createElement('option');
      option.value = course.key;
      option.textContent = course.name;
      courseSelect.appendChild(option);
    });
    
    // Set current course selection
    const currentCourseKey = getCurrentCourse();
    if (currentCourseKey) {
      courseSelect.value = currentCourseKey;
    }
    
    logger.debug('✅ Course dropdown populated with', courses.length, 'courses');
  } catch (error) {
    console.error('❌ Error populating course dropdown:', error);
  }
}

// Handle course selection change
function handleCourseChange() {
  const courseSelect = document.getElementById('course-select');
  if (!courseSelect) return;
  
  courseSelect.addEventListener('change', (e) => {
    try {
      const selectedCourse = e.target.value;
      if (selectedCourse) {
        setCurrentCourse(selectedCourse);
        logger.debug('✅ Course changed to:', selectedCourse);
        
        // Clear any existing overlays when switching courses
        clearAllOverlays();
      }
    } catch (error) {
      console.error('❌ Error changing course:', error);
    }
  });
}

// Clear all overlays (helper function)
function clearAllOverlays() {
  // This function would remove all existing overlays
  // Implementation depends on how overlays are tracked
  logger.debug('🧹 Clearing all overlays on course change');
}

// Main initialization function with standardized error handling
async function initializeExtension() {
  try {
    // First validate that we're on the correct page
    console.log('🔍 Validating current page...');
    const pageValidationResult = await validateCurrentPage();
    
    if (!pageValidationResult.success) {
      // Show error message and deactivate extension
      showPageError();
      console.error('❌ Page validation failed:', errorHandler.formatForUser(pageValidationResult));
      return; // Stop initialization - extension is deactivated
    }
    
    // Page is valid, show main content and continue initialization
    showMainContent();
    
    // Check current view and switch to Maand if needed
    console.log('🎯 Checking view and switching to Maand if needed...');
    const viewResult = await detectAndSwitchToMaandView();
    
    if (viewResult.success) {
      const viewData = viewResult.data;
      if (viewData.switched) {
        console.log(`✅ View switched successfully: ${viewData.message}`);
        // Show user feedback about view switching
        showViewSwitchFeedback(viewData);
      } else if (viewData.success && !viewData.switched) {
        console.log('✅ Already in correct view');
      }
    } else {
      console.warn('⚠️ View detection/switching failed, but continuing with initialization');
      console.warn('View detection error:', errorHandler.formatForUser(viewResult));
    }
    
    // Load settings first
    logger.debug('📋 Loading settings...');
    await loadSettings();
    logger.debug('✅ Settings loaded successfully');
    
    // Update title with module name
    updateTitle();
    
    // Populate course dropdown
    populateCourseDropdown();
    
    // Set up course change handler
    handleCourseChange();
    
    // Set up event listeners
    setupEventListeners();
    
  } catch (error) {
    const initError = errorHandler.createError(
      ERROR_CODES.UI_ELEMENT_MISSING,
      `Failed to initialize extension: ${error.message}`,
      'initializeExtension',
      error
    );
    console.error('❌ Initialization failed:', errorHandler.formatForUser(initError));
    // Show error and deactivate extension
    showPageError();
  }
}