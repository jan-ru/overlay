// Settings loader for overlay extension

let cachedSettings = null;
let currentBlok = null;
let currentModule = null;
let currentCourse = null;

// Load settings from JSON file with error handling
async function loadSettings() {
  if (cachedSettings) {
    return cachedSettings;
  }

  try {
    const response = await fetch(chrome.runtime.getURL('settings.json'));
    
    if (!response.ok) {
      throw new Error(`Failed to load settings.json: ${response.status} ${response.statusText}`);
    }
    
    const settings = await response.json();
    
    // Validate required fields for new hierarchical structure
    if (!settings.academicYear) {
      throw new Error('Missing academicYear in settings.json');
    }
    
    if (!settings.bloks || Object.keys(settings.bloks).length === 0) {
      throw new Error('Missing bloks configuration in settings.json');
    }
    
    // Validate each blok
    Object.entries(settings.bloks).forEach(([blokKey, blok]) => {
      if (!blok.name) {
        throw new Error(`Missing name for blok ${blokKey}`);
      }
      
      if (typeof blok.startWeek !== 'number' || typeof blok.endWeek !== 'number') {
        throw new Error(`Invalid week numbers in blok ${blokKey}: startWeek and endWeek must be numbers`);
      }
      
      if (blok.startWeek > blok.endWeek) {
        throw new Error(`Invalid week range in blok ${blokKey}: startWeek cannot be greater than endWeek`);
      }
      
      // Validate modules within blok
      if (blok.modules) {
        Object.entries(blok.modules).forEach(([moduleKey, module]) => {
          if (!module.name || !module.moduleCode) {
            throw new Error(`Missing name or moduleCode for module ${moduleKey} in blok ${blokKey}`);
          }
          
          if (typeof module.startWeek !== 'number' || typeof module.endWeek !== 'number') {
            throw new Error(`Invalid week numbers in module ${moduleKey}: startWeek and endWeek must be numbers`);
          }
          
          // Validate courses within module
          if (module.courses) {
            Object.entries(module.courses).forEach(([courseKey, course]) => {
              if (!course.name) {
                throw new Error(`Missing name for course ${courseKey} in module ${moduleKey}`);
              }
              
              // Check if this is a day-specific course (Toets/Assessment) or sprint-based course
              const isDaySpecific = course.weekNumber !== undefined && course.dayNumber !== undefined;
              const isSprintBased = course.sprint1 && course.sprint2 && course.sprint3;
              
              if (!isDaySpecific && !isSprintBased) {
                throw new Error(`Course ${courseKey} must have either sprint configurations (sprint1, sprint2, sprint3) or day-specific configuration (weekNumber, dayNumber)`);
              }
              
              if (isDaySpecific) {
                // Validate day-specific course configuration
                if (typeof course.weekNumber !== 'number' || typeof course.dayNumber !== 'number') {
                  throw new Error(`Invalid day-specific configuration in course ${courseKey}: weekNumber and dayNumber must be numbers`);
                }
              } else {
                // Validate sprint-based course configuration
                ['sprint1', 'sprint2', 'sprint3'].forEach(sprintKey => {
                  const sprint = course[sprintKey];
                  if (typeof sprint.startWeek !== 'number' || typeof sprint.endWeek !== 'number') {
                    throw new Error(`Invalid week numbers in ${courseKey}.${sprintKey}: startWeek and endWeek must be numbers`);
                  }
                  if (sprint.startWeek > sprint.endWeek) {
                    throw new Error(`Invalid week range in ${courseKey}.${sprintKey}: startWeek cannot be greater than endWeek`);
                  }
                });
              }
            });
          }
        });
      }
    });
    
    // Configure logging based on debugMode setting
    if (typeof logger !== 'undefined' && logger.setDebugMode) {
      logger.setDebugMode(settings.debugMode !== false); // Default to true if not specified
    }
    
    cachedSettings = settings;
    
    // Set default selections if not already set
    if (!currentBlok && settings.defaultBlok) {
      currentBlok = settings.defaultBlok;
    }
    if (!currentModule && settings.defaultModule) {
      currentModule = settings.defaultModule;
    }
    if (!currentCourse && settings.defaultCourse) {
      currentCourse = settings.defaultCourse;
    }
    
    console.log('✅ Settings loaded successfully:', settings);
    return settings;
    
  } catch (error) {
    console.error('❌ Error loading settings:', error);
    showSettingsError(error.message);
    throw error;
  }
}

// Show error message to user
function showSettingsError(message) {
  // Create error display in popup
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = `
    position: fixed;
    top: 10px;
    left: 10px;
    right: 10px;
    background: #ff4444;
    color: white;
    padding: 10px;
    border-radius: 4px;
    z-index: 10000;
    font-family: Arial, sans-serif;
    font-size: 12px;
  `;
  errorDiv.textContent = `Settings Error: ${message}`;
  
  document.body.appendChild(errorDiv);
  
  // Auto-remove after 10 seconds
  setTimeout(() => {
    if (errorDiv.parentNode) {
      errorDiv.parentNode.removeChild(errorDiv);
    }
  }, 10000);
}

// Get sprint configuration by number for current course
function getSprintConfig(sprintNumber, settings) {
  if (!settings) {
    throw new Error('Settings not loaded');
  }
  
  if (!currentBlok || !currentModule || !currentCourse) {
    throw new Error('No blok/module/course selected');
  }
  
  const blok = settings.bloks[currentBlok];
  if (!blok) {
    throw new Error(`Blok ${currentBlok} not found in settings`);
  }
  
  const module = blok.modules[currentModule];
  if (!module) {
    throw new Error(`Module ${currentModule} not found in blok ${currentBlok}`);
  }
  
  const course = module.courses[currentCourse];
  if (!course) {
    throw new Error(`Course ${currentCourse} not found in module ${currentModule}`);
  }
  
  const sprintKey = `sprint${sprintNumber}`;
  if (!course[sprintKey]) {
    throw new Error(`Sprint ${sprintNumber} not found in course ${currentCourse}`);
  }
  
  return course[sprintKey];
}

// Get current blok configuration
function getCurrentBlokConfig() {
  if (!cachedSettings || !currentBlok) {
    return null;
  }
  
  return cachedSettings.bloks[currentBlok];
}

// Get current module configuration
function getCurrentModuleConfig() {
  if (!cachedSettings || !currentBlok || !currentModule) {
    return null;
  }
  
  const blok = cachedSettings.bloks[currentBlok];
  return blok ? blok.modules[currentModule] : null;
}

// Get list of available bloks
function getAvailableBloks(settings) {
  if (!settings || !settings.bloks) {
    return [];
  }
  
  return Object.entries(settings.bloks).map(([key, blok]) => ({
    key: key,
    name: blok.name,
    startWeek: blok.startWeek,
    endWeek: blok.endWeek
  }));
}

// Get list of available modules for current blok
function getAvailableModules(settings) {
  if (!settings || !currentBlok) {
    return [];
  }
  
  const blok = settings.bloks[currentBlok];
  if (!blok || !blok.modules) {
    return [];
  }
  
  return Object.entries(blok.modules).map(([key, module]) => ({
    key: key,
    name: module.name,
    moduleCode: module.moduleCode
  }));
}

// Get list of available courses for current module
function getAvailableCourses(settings) {
  if (!settings || !currentBlok || !currentModule) {
    return [];
  }
  
  const blok = settings.bloks[currentBlok];
  if (!blok || !blok.modules) {
    return [];
  }
  
  const module = blok.modules[currentModule];
  if (!module || !module.courses) {
    return [];
  }
  
  return Object.entries(module.courses).map(([key, course]) => ({
    key: key,
    name: course.name
  }));
}

// Set current selections
function setCurrentBlok(blokKey) {
  if (!cachedSettings || !cachedSettings.bloks[blokKey]) {
    throw new Error(`Blok ${blokKey} not found`);
  }
  
  currentBlok = blokKey;
  // Reset module and course when blok changes
  currentModule = null;
  currentCourse = null;
  console.log('✅ Current blok set to:', blokKey);
}

function setCurrentModule(moduleKey) {
  if (!cachedSettings || !currentBlok) {
    throw new Error('No blok selected');
  }
  
  const blok = cachedSettings.bloks[currentBlok];
  if (!blok || !blok.modules[moduleKey]) {
    throw new Error(`Module ${moduleKey} not found in blok ${currentBlok}`);
  }
  
  currentModule = moduleKey;
  // Reset course when module changes
  currentCourse = null;
  console.log('✅ Current module set to:', moduleKey);
}

function setCurrentCourse(courseKey) {
  if (!cachedSettings || !currentBlok || !currentModule) {
    throw new Error('No blok/module selected');
  }
  
  const blok = cachedSettings.bloks[currentBlok];
  const module = blok ? blok.modules[currentModule] : null;
  if (!module || !module.courses[courseKey]) {
    throw new Error(`Course ${courseKey} not found in module ${currentModule}`);
  }
  
  currentCourse = courseKey;
  console.log('✅ Current course set to:', courseKey);
}

// Get current selections
function getCurrentBlok() {
  return currentBlok;
}

function getCurrentModule() {
  return currentModule;
}

function getCurrentCourse() {
  return currentCourse;
}

// Get current selection info
function getCurrentSelectionInfo() {
  if (!cachedSettings || !currentBlok || !currentModule || !currentCourse) {
    return null;
  }
  
  const blok = cachedSettings.bloks[currentBlok];
  const module = blok ? blok.modules[currentModule] : null;
  const course = module ? module.courses[currentCourse] : null;
  
  return {
    blok: { key: currentBlok, name: blok.name },
    module: { key: currentModule, name: module.name, code: module.moduleCode },
    course: { key: currentCourse, name: course.name }
  };
}