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
  console.log('⚙️ Setting up event listeners...');
  
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
          if (config.id === 'select_day') {
            result = await select_day(config);
          } else if (config.id === 'select_sprint1') {
            result = await select_sprint1(config);
          } else if (config.id === 'select_sprint2') {
            result = await select_sprint2(config);
          } else if (config.id === 'select_sprint3') {
            result = await select_sprint3(config);
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

  // Text overlay buttons - individual toggles
  TEXT_CONFIGS.forEach(config => {
    const button = document.getElementById(config.id);
    console.log(`Looking for text button "${config.id}":`, button ? '✅ found' : '❌ not found');
    
    if (button) {
      button.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        
        if (isProcessing) return;
        isProcessing = true;
        console.log(`📝 ${config.id} text button clicked!`);
        
        try {
          const result = await toggleTextOverlay(config);
          console.log(`✅ ${config.id} text overlay ${result}`);
          
          // Update button appearance based on state
          if (result === 'created') {
            button.style.backgroundColor = '#4CAF50'; // Green when active
            button.style.color = 'white';
          } else if (result === 'removed') {
            button.style.backgroundColor = ''; // Reset to default
            button.style.color = '';
          }
        } catch (error) {
          console.error(`❌ Error with text ${config.id}:`, error);
        } finally {
          setTimeout(() => { isProcessing = false; }, 500);
        }
      });
    }
  });

  // Multicolor button
  const multicolorButton = document.getElementById("multicolor");
  if (multicolorButton) {
    multicolorButton.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      
      if (isProcessing) return;
      isProcessing = true;
      
      console.log('🌈 Multicolor button clicked!');
      try {
        await createMulticolorBanners();
      } finally {
        setTimeout(() => { isProcessing = false; }, 500);
      }
    });
  }

  // Debug button
  const debugButton = document.getElementById("debug");
  if (debugButton) {
    debugButton.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      
      if (isProcessing) return;
      isProcessing = true;
      
      console.log('🔍 Debug button clicked!');
      try {
        await debugCalendarElements();
      } finally {
        setTimeout(() => { isProcessing = false; }, 500);
      }
    });
  }
  
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

// Main initialization function
async function initializeExtension() {
  try {
    // Load settings first
    console.log('📋 Loading settings...');
    await loadSettings();
    console.log('✅ Settings loaded successfully');
    
    // Set up event listeners
    setupEventListeners();
    
  } catch (error) {
    console.error('❌ Failed to initialize extension:', error);
    // Still set up event listeners even if settings fail
    // Functions will show individual errors when called
    setupEventListeners();
  }
}