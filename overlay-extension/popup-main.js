// Main popup orchestration file
// This file coordinates all overlay functionality

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

// Update title with module name from settings
function updateTitle() {
  try {
    const titleElement = document.getElementById('calendar-overlays-title');
    if (titleElement && cachedSettings) {
      const moduleText = cachedSettings.moduleName || 'Calendar Overlays';
      titleElement.textContent = moduleText;
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

// Main initialization function
async function initializeExtension() {
  try {
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
    console.error('❌ Failed to initialize extension:', error);
    // Still set up event listeners even if settings fail
    // Functions will show individual errors when called
    setupEventListeners();
  }
}