// Settings loader for overlay extension

let cachedSettings = null;

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
    
    // Validate required fields
    if (!settings.courseCode) {
      throw new Error('Missing courseCode in settings.json');
    }
    
    if (!settings.sprint1 || !settings.sprint2 || !settings.sprint3) {
      throw new Error('Missing sprint configurations in settings.json');
    }
    
    ['sprint1', 'sprint2', 'sprint3'].forEach(sprintKey => {
      const sprint = settings[sprintKey];
      if (typeof sprint.startWeek !== 'number' || typeof sprint.endWeek !== 'number') {
        throw new Error(`Invalid week numbers in ${sprintKey}: startWeek and endWeek must be numbers`);
      }
      if (sprint.startWeek > sprint.endWeek) {
        throw new Error(`Invalid week range in ${sprintKey}: startWeek cannot be greater than endWeek`);
      }
    });
    
    // Configure logging based on debugMode setting
    if (typeof logger !== 'undefined' && logger.setDebugMode) {
      logger.setDebugMode(settings.debugMode !== false); // Default to true if not specified
    }
    
    cachedSettings = settings;
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

// Get sprint configuration by number
function getSprintConfig(sprintNumber, settings) {
  const sprintKey = `sprint${sprintNumber}`;
  if (!settings[sprintKey]) {
    throw new Error(`Sprint ${sprintNumber} not found in settings`);
  }
  return settings[sprintKey];
}