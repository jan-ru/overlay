// Configuration and constants - UPDATED WITH HARDCODED SELECTORS
const OVERLAY_STYLES = {
  position: 'fixed',
  top: '152px',
  left: '0',
  width: '80%',
  height: '100%',
  zIndex: '999999',
  pointerEvents: 'none'
};

const TEXT_OVERLAY_STYLES = {
  position: "fixed",
  left: "50%",
  transform: "translate(-50%, -50%)",
  color: "white",
  fontSize: "32px",
  fontWeight: "bold",
  textShadow: "3px 3px 6px rgba(0,0,0,0.8)",
  zIndex: "1000000",
  pointerEvents: "none"
};

// CALENDAR SELECTORS - Hardcoded based on detection results
const CALENDAR_SELECTORS = [
  'table.GNKVYU1C-',                    // Primary: exact class match
  'table[class^="GNKVYU1C"]',           // Fallback 1: class starts with GNKVYU1C
  'table[class*="GNKVYU1C"]',           // Fallback 2: class contains GNKVYU1C
  '.gwt-TabLayoutPanelContent table',   // Fallback 3: table in GWT content
  'table'                               // Last resort: any table (will use largest)
];

const SPRINT_CONFIGS = [
  { id: "sprint1", color: "rgba(0,0,255,0.3)" },      // blue
  { id: "sprint2", color: "rgba(0,0,0,0.3)" },        // gray  
  { id: "sprint3", color: "rgba(0,255,0,0.3)" }       // green
];

const TEXT_CONFIGS = [
  { id: "textsprint1", text: "Text Sprint 1", position: "30%" },
  { id: "textsprint2", text: "Text Sprint 2", position: "40%" },
  { id: "textsprint3", text: "Text Sprint 3", position: "50%" },
  { id: "textvakantie", text: "Text Vakantie", position: "60%" },
  { id: "texttoets", text: "Text Toets", position: "70%" }
];

const MULTICOLOR_CONFIG = {
  colors: ["gray", "blue", "green", "red", "yellow"],
  startY: 153
};

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

// SIMPLIFIED calendar detection using hardcoded selectors
function findCalendarElement() {
  console.log('🔍 Looking for calendar using hardcoded selectors...');
  
  // Try each selector in order of preference
  for (let i = 0; i < CALENDAR_SELECTORS.length; i++) {
    const selector = CALENDAR_SELECTORS[i];
    console.log(`Trying selector ${i + 1}: ${selector}`);
    
    try {
      if (selector === 'table') {
        // Special case: find largest table
        const tables = document.querySelectorAll('table');
        if (tables.length === 0) continue;
        
        let largest = null;
        let maxArea = 0;
        
        tables.forEach(table => {
          const rect = table.getBoundingClientRect();
          const area = rect.width * rect.height;
          if (area > maxArea) {
            maxArea = area;
            largest = table;
          }
        });
        
        if (largest) {
          console.log(`✅ Found calendar using largest table fallback`);
          return largest;
        }
      } else {
        const element = document.querySelector(selector);
        if (element) {
          const rect = element.getBoundingClientRect();
          console.log(`✅ Found calendar using selector: ${selector}`, {
            width: rect.width,
            height: rect.height,
            className: element.className
          });
          return element;
        }
      }
    } catch (error) {
      console.warn(`Selector failed: ${selector}`, error);
    }
  }
  
  console.log('⚠️ No calendar element found with any selector');
  return null;
}

// SIMPLIFIED overlay creation - no complex scoring algorithm needed
async function createSimpleOverlay(color) {
  console.log('🎨 Creating simple overlay with color:', color);
  
  try {
    await executeScriptInActiveTab((overlayColor, selectors) => {
      console.log('🚀 Simple overlay script executing with color:', overlayColor);
      
      const existing = document.getElementById('custom-overlay');
      if (existing) {
        console.log('🗑️ Removing existing overlay');
        existing.remove();
        return 'removed';
      }

      // Inline simplified calendar detection
      function findCalendarElement() {
        console.log('🔍 Looking for calendar using hardcoded selectors...');
        
        for (let i = 0; i < selectors.length; i++) {
          const selector = selectors[i];
          console.log(`Trying selector ${i + 1}: ${selector}`);
          
          try {
            if (selector === 'table') {
              const tables = document.querySelectorAll('table');
              if (tables.length === 0) continue;
              
              let largest = null;
              let maxArea = 0;
              
              tables.forEach(table => {
                const rect = table.getBoundingClientRect();
                const area = rect.width * rect.height;
                if (area > maxArea) {
                  maxArea = area;
                  largest = table;
                }
              });
              
              if (largest) {
                console.log(`✅ Found calendar using largest table fallback`);
                return largest;
              }
            } else {
              const element = document.querySelector(selector);
              if (element) {
                const rect = element.getBoundingClientRect();
                console.log(`✅ Found calendar using selector: ${selector}`, {
                  width: rect.width,
                  height: rect.height,
                  className: element.className
                });
                return element;
              }
            }
          } catch (error) {
            console.warn(`Selector failed: ${selector}`, error);
          }
        }
        
        console.log('⚠️ No calendar element found with any selector');
        return null;
      }

      const calendar = findCalendarElement();
      const overlay = document.createElement('div');
      overlay.id = 'custom-overlay';
      
      if (calendar) {
        // Use calendar dimensions
        const rect = calendar.getBoundingClientRect();
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        Object.assign(overlay.style, {
          position: 'fixed',
          top: `${rect.top}px`,
          left: `${rect.left}px`,
          width: `${rect.width}px`,
          height: `${rect.height}px`,
          background: overlayColor,
          zIndex: '999999',
          pointerEvents: 'none',
          boxSizing: 'border-box'
        });
        
        console.log('📐 Overlay positioned exactly over calendar:', {
          width: rect.width,
          height: rect.height,
          top: rect.top,
          left: rect.left
        });
      } else {
        // Fallback to responsive positioning
        Object.assign(overlay.style, {
          position: 'fixed',
          top: '152px',
          left: '0',
          width: '80vw',
          height: 'calc(100vh - 152px)',
          background: overlayColor,
          zIndex: '999999',
          pointerEvents: 'none',
          boxSizing: 'border-box'
        });
        
        console.log('📐 Using fallback responsive overlay');
      }
      
      document.body.appendChild(overlay);
      
      // Add resize handler for responsiveness
      function updateOverlayOnResize() {
        const calendar = findCalendarElement();
        if (calendar) {
          const rect = calendar.getBoundingClientRect();
          Object.assign(overlay.style, {
            top: `${rect.top}px`,
            left: `${rect.left}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`
          });
        }
      }
      
      // Remove old resize handler if exists
      if (window.__overlayResizeHandler) {
        window.removeEventListener('resize', window.__overlayResizeHandler);
      }
      
      // Add new resize handler with debouncing
      let resizeTimeout;
      window.__overlayResizeHandler = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(updateOverlayOnResize, 150);
      };
      window.addEventListener('resize', window.__overlayResizeHandler);
      
      console.log('✅ Simple overlay created with resize handling');
      return 'created';
    }, [color, CALENDAR_SELECTORS]);
  } catch (error) {
    console.error('❌ Error creating simple overlay:', error);
    await createStandardOverlay(color);
  }
}

// Standard overlay for ultimate fallback
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

// Text overlay function
async function createTextOverlay(text, topPosition) {
  console.log('📝 Creating text overlay:', text, 'at position:', topPosition);
  
  try {
    await executeScriptInActiveTab((overlayText, top, styles) => {
      const existing = document.getElementById("custom-text-overlay");
      if (existing) {
        existing.remove();
        return 'removed';
      }

      const textOverlay = document.createElement("div");
      textOverlay.id = "custom-text-overlay";
      Object.assign(textOverlay.style, {
        ...styles,
        top: top
      });
      textOverlay.textContent = overlayText;
      document.body.appendChild(textOverlay);
      console.log('✅ Text overlay created');
      return 'created';
    }, [text, topPosition, TEXT_OVERLAY_STYLES]);
  } catch (error) {
    console.error('❌ Error creating text overlay:', error);
  }
}

// Multicolor banners using simplified calendar detection
async function createMulticolorBanners() {
  console.log('🌈 Creating multicolor banners');
  
  try {
    await executeScriptInActiveTab((config, selectors) => {
      console.log('🚀 Multicolor script executing');
      
      const existing = document.getElementById("custom-multicolor-overlay");
      if (existing) {
        console.log('🗑️ Removing existing multicolor overlay');
        existing.remove();
        return 'removed';
      }

      // Inline simplified calendar detection for multicolor
      function findCalendarElement() {
        for (let i = 0; i < selectors.length; i++) {
          const selector = selectors[i];
          try {
            if (selector === 'table') {
              const tables = document.querySelectorAll('table');
              if (tables.length === 0) continue;
              
              let largest = null;
              let maxArea = 0;
              
              tables.forEach(table => {
                const rect = table.getBoundingClientRect();
                const area = rect.width * rect.height;
                if (area > maxArea) {
                  maxArea = area;
                  largest = table;
                }
              });
              
              if (largest) return largest;
            } else {
              const element = document.querySelector(selector);
              if (element) return element;
            }
          } catch (error) {
            console.warn(`Selector failed: ${selector}`, error);
          }
        }
        return null;
      }

      // Calculate smart width for multicolor overlay
      function calculateOverlayWidth() {
        const calendar = findCalendarElement();
        if (calendar) {
          const rect = calendar.getBoundingClientRect();
          return `${rect.width}px`;
        }
        
        const viewportWidth = window.innerWidth;
        if (viewportWidth < 768) return '100%';
        if (viewportWidth < 1024) return '85%';
        if (viewportWidth < 1400) return '75%';
        return '70%';
      }

      const overlayWidth = calculateOverlayWidth();
      console.log('📐 Multicolor overlay width:', overlayWidth);

      const overlay = document.createElement("div");
      overlay.id = "custom-multicolor-overlay";
      Object.assign(overlay.style, {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: "999999",
        display: "flex",
        flexDirection: "column"
      });
      document.body.appendChild(overlay);

      // Spacer until startY
      const spacer = document.createElement("div");
      spacer.style.height = `${config.startY}px`;
      spacer.style.width = "100%";
      overlay.appendChild(spacer);

      // Colored banners with smart width
      config.colors.forEach((color) => {
        const banner = document.createElement("div");
        Object.assign(banner.style, {
          width: overlayWidth,
          height: "20%",
          background: color,
          opacity: "0.3"
        });
        overlay.appendChild(banner);
      });

      console.log('✅ Multicolor overlay created');
      return 'created';
    }, [MULTICOLOR_CONFIG, CALENDAR_SELECTORS]);
  } catch (error) {
    console.error('❌ Error creating multicolor banners:', error);
  }
}

// Debug function
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

// COMPLETE event listeners setup
function setupEventListeners() {
  console.log('⚙️ Setting up event listeners...');
  
  let isProcessing = false;
  
  // Sprint overlay buttons
  SPRINT_CONFIGS.forEach(config => {
    const button = document.getElementById(config.id);
    console.log(`Looking for button "${config.id}":`, button ? '✅ found' : '❌ not found');
    
    if (button) {
      button.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        
        if (isProcessing) return;
        isProcessing = true;
        console.log(`🎯 ${config.id} button clicked!`);
        
        try {
          await createSimpleOverlay(config.color);
          console.log(`✅ ${config.id} overlay processed`);
        } catch (error) {
          console.error(`❌ Error with ${config.id}:`, error);
        } finally {
          setTimeout(() => { isProcessing = false; }, 500);
        }
      });
    }
  });

  // Text overlay buttons
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
          await createTextOverlay(config.text, config.position);
          console.log(`✅ ${config.id} text overlay processed`);
        } catch (error) {
          console.error(`❌ Error with text ${config.id}:`, error);
        } finally {
          setTimeout(() => { isProcessing = false; }, 500);
        }
      });
    }
  });

  // Other buttons
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
  console.log('🔄 DOM Content Loaded - initializing...');
  setupEventListeners();
});

// Fallback initialization
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupEventListeners);
} else {
  console.log('🔄 DOM already loaded - initializing immediately...');
  setupEventListeners();
}