// Configuration and constants
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

const SPRINT_CONFIGS = [
  { id: "sprint1", color: "rgba(0,0,255,0.3)", useSmartOverlay: true },      // blue
  { id: "sprint2", color: "rgba(0,0,0,0.3)", useSmartOverlay: true },        // gray  
  { id: "sprint3", color: "rgba(0,255,0,0.3)", useSmartOverlay: true }       // green
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

// Calendar detection function (to be injected)
function findCalendarContainer() {
  console.log('🔍 Looking for calendar container...');
  
  // Strategy 1: Find the largest table that looks like a calendar
  const tables = document.querySelectorAll('table');
  console.log(`Found ${tables.length} tables`);
  
  let bestCandidate = null;
  let maxScore = 0;
  
  tables.forEach((table, index) => {
    const rect = table.getBoundingClientRect();
    console.log(`Table ${index}:`, {
      width: rect.width,
      height: rect.height,
      left: rect.left,
      top: rect.top,
      className: table.className
    });
    
    // Score based on size and position
    let score = 0;
    
    if (rect.width > 600) score += 3;
    if (rect.width > 800) score += 2;
    if (rect.height > 1000) score += 3;
    if (rect.left < 50) score += 2;
    if (rect.top > 100 && rect.top < 200) score += 2;
    
    // Bonus for GWT-style class names
    if (table.className && (
      table.className.includes('GNKVYU1C') || 
      table.className.match(/^[A-Z0-9]{8}-$/))) {
      score += 3;
    }
    
    console.log(`Table ${index} score:`, score);
    
    if (score > maxScore) {
      maxScore = score;
      bestCandidate = table;
    }
  });
  
  if (bestCandidate && maxScore > 5) {
    console.log('✅ Found calendar table with score:', maxScore, bestCandidate);
    return bestCandidate;
  }

  // Strategy 2: Look in the gwt-TabLayoutPanelContent
  const tabContent = document.querySelector('.gwt-TabLayoutPanelContent');
  if (tabContent) {
    console.log('📋 Found tab content, looking for tables...');
    const tabTables = tabContent.querySelectorAll('table');
    const largestTable = Array.from(tabTables).reduce((largest, table) => {
      const rect = table.getBoundingClientRect();
      const largestRect = largest ? largest.getBoundingClientRect() : { width: 0 };
      return rect.width > largestRect.width ? table : largest;
    }, null);
    
    if (largestTable) {
      console.log('✅ Found table in tab content:', largestTable);
      return largestTable;
    }
  }

  console.log('⚠️ No suitable calendar container found');
  return null;
}

// Function to update sprint button states
async function updateSprintButtonState(sprintId) {
  try {
    const result = await executeScriptInActiveTab(() => {
      const existing = document.getElementById('custom-overlay');
      return existing ? 'active' : 'inactive';
    });
    
    const sprintButton = document.getElementById(sprintId);
    if (sprintButton) {
      // Get the base button text without any circles
      let baseText = sprintButton.textContent;
      // Remove any existing circles and clean up the text
      baseText = baseText.replace(/[🔴⚪]\s*/g, '').trim();
      
      // Check the actual result from the script execution
      const overlayState = result && result[0] && result[0].result;
      if (overlayState === 'active') {
        sprintButton.textContent = `🔴 ${baseText}`;
      } else {
        sprintButton.textContent = `⚪ ${baseText}`;
      }
      // Reset button styling to default
      sprintButton.style.backgroundColor = '';
      sprintButton.style.color = '';
      sprintButton.style.border = '';
      sprintButton.style.fontWeight = '';
    }
  } catch (error) {
    // Silently fail - button state update is not critical
    console.log('Could not update sprint button state:', error);
  }
}

// Function to update all sprint button states
async function updateAllSprintButtonStates() {
  for (const config of SPRINT_CONFIGS) {
    await updateSprintButtonState(config.id);
  }
}

// Updated createSmartOverlay function with enhanced logging
async function createSmartOverlay(color) {
  console.log('🎨 Creating smart overlay with color:', color);
  
  try {
    await executeScriptInActiveTab((overlayColor) => {
      console.log('🚀 Smart overlay script executing with color:', overlayColor);
      
      const existing = document.getElementById('custom-overlay');
      if (existing) {
        console.log('🗑️ Removing existing overlay');
        existing.remove();
        return 'removed';
      }

      // Inline the enhanced calendar detection function
      function findCalendarContainer() {
        console.log('🔍 Looking for calendar container...');
        
        const tables = document.querySelectorAll('table');
        console.log(`Found ${tables.length} tables`);
        
        let bestCandidate = null;
        let maxScore = 0;
        
        tables.forEach((table, index) => {
          const rect = table.getBoundingClientRect();
          
          // Log basic info for each table
          console.log(`Table ${index}:`, {
            width: rect.width,
            height: rect.height,
            left: rect.left,
            top: rect.top,
            className: table.className,
            id: table.id
          });
          
          let score = 0;
          
          if (rect.width > 600) score += 3;
          if (rect.width > 800) score += 2;
          if (rect.height > 1000) score += 3;
          if (rect.left < 50) score += 2;
          if (rect.top > 100 && rect.top < 200) score += 2;
          
          if (table.className && (
            table.className.includes('GNKVYU1C') || 
            table.className.match(/^[A-Z0-9]{8}-$/))) {
            score += 3;
          }
          
          console.log(`Table ${index} score:`, score);
          
          if (score > maxScore) {
            maxScore = score;
            bestCandidate = table;
          }
        });
        
        if (bestCandidate && maxScore > 5) {
          // Enhanced logging for the selected element
          const rect = bestCandidate.getBoundingClientRect();
          console.log('✅ Found calendar table with score:', maxScore);
          console.log('🎯 Selected element details:', {
            tagName: bestCandidate.tagName,
            className: bestCandidate.className,
            id: bestCandidate.id,
            attributes: Array.from(bestCandidate.attributes).map(attr => ({
              name: attr.name,
              value: attr.value.substring(0, 50) + (attr.value.length > 50 ? '...' : '')
            })),
            parentElement: {
              tagName: bestCandidate.parentElement?.tagName,
              className: bestCandidate.parentElement?.className,
              id: bestCandidate.parentElement?.id
            },
            dimensions: {
              width: rect.width,
              height: rect.height,
              left: rect.left,
              top: rect.top
            }
          });
          
          // Generate possible CSS selectors
          let possibleSelectors = [];
          
          if (bestCandidate.id) {
            possibleSelectors.push(`#${bestCandidate.id}`);
          }
          
          if (bestCandidate.className) {
            const classes = bestCandidate.className.split(' ').filter(cls => cls.trim());
            if (classes.length > 0) {
              possibleSelectors.push(`table.${classes[0]}`);
              if (classes.length > 1) {
                possibleSelectors.push(`table.${classes.slice(0, 2).join('.')}`);
              }
            }
          }
          
          console.log('🎯 Possible CSS selectors for hardcoding:', possibleSelectors);
          
          return bestCandidate;
        }

        const tabContent = document.querySelector('.gwt-TabLayoutPanelContent');
        if (tabContent) {
          console.log('📋 Found tab content, looking for tables...');
          const tabTables = tabContent.querySelectorAll('table');
          const largestTable = Array.from(tabTables).reduce((largest, table) => {
            const rect = table.getBoundingClientRect();
            const largestRect = largest ? largest.getBoundingClientRect() : { width: 0 };
            return rect.width > largestRect.width ? table : largest;
          }, null);
          
          if (largestTable) {
            console.log('✅ Found table in tab content');
            console.log('🎯 Tab content table details:', {
              className: largestTable.className,
              id: largestTable.id,
              selector: '.gwt-TabLayoutPanelContent table'
            });
            return largestTable;
          }
        }

        console.log('⚠️ No suitable calendar container found');
        return null;
      }

      // Calculate overlay dimensions
      function calculateOverlayDimensions() {
        const calendar = findCalendarContainer();
        
        if (calendar) {
          const rect = calendar.getBoundingClientRect();
          return {
            width: `${rect.width}px`,
            left: `${rect.left}px`,
            found: true,
            element: calendar
          };
        }

        // Fallback: responsive width based on viewport
        const viewportWidth = window.innerWidth;
        let width, left = '0';
        
        if (viewportWidth < 768) {
          width = '100%';
        } else if (viewportWidth < 1024) {
          width = '85%';
        } else if (viewportWidth < 1400) {
          width = '75%';
        } else {
          width = '70%';
        }
        
        return { width, left, found: false, element: null };
      }

      const dimensions = calculateOverlayDimensions();
      console.log('📐 Overlay dimensions:', dimensions);

      const overlay = document.createElement('div');
      overlay.id = 'custom-overlay';
      Object.assign(overlay.style, {
        position: 'fixed',
        top: '152px',
        left: dimensions.left,
        width: dimensions.width,
        height: 'calc(100% - 152px)',
        background: overlayColor,
        zIndex: '999999',
        pointerEvents: 'none',
        boxSizing: 'border-box'
      });
      
      document.body.appendChild(overlay);
      console.log('✅ Overlay created successfully');
      
      if (dimensions.found) {
        console.log('✅ Calendar element found and used for overlay sizing');
      } else {
        console.log('⚠️ Using fallback responsive sizing');
      }
      
      return 'created';
    }, [color]);
  } catch (error) {
    console.error('❌ Error creating smart overlay:', error);
    await createStandardOverlay(color);
  }
}

// Standard overlay for fallback
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

// Smart multicolor banners using calendar detection
async function createMulticolorBanners() {
  console.log('🌈 Creating multicolor banners');
  
  try {
    await executeScriptInActiveTab((config) => {
      console.log('🚀 Multicolor script executing');
      
      const existing = document.getElementById("custom-multicolor-overlay");
      if (existing) {
        console.log('🗑️ Removing existing multicolor overlay');
        existing.remove();
        return 'removed';
      }

      // Inline calendar detection for multicolor
      function findCalendarContainer() {
        const tables = document.querySelectorAll('table');
        let bestCandidate = null;
        let maxScore = 0;
        
        tables.forEach(table => {
          const rect = table.getBoundingClientRect();
          let score = 0;
          
          if (rect.width > 600) score += 3;
          if (rect.width > 800) score += 2;
          if (rect.height > 1000) score += 3;
          if (rect.left < 50) score += 2;
          if (rect.top > 100 && rect.top < 200) score += 2;
          
          if (table.className && (
            table.className.includes('GNKVYU1C') || 
            table.className.match(/^[A-Z0-9]{8}-$/))) {
            score += 3;
          }
          
          if (score > maxScore) {
            maxScore = score;
            bestCandidate = table;
          }
        });
        
        if (bestCandidate && maxScore > 5) {
          return bestCandidate;
        }

        const tabContent = document.querySelector('.gwt-TabLayoutPanelContent');
        if (tabContent) {
          const tabTables = tabContent.querySelectorAll('table');
          const largestTable = Array.from(tabTables).reduce((largest, table) => {
            const rect = table.getBoundingClientRect();
            const largestRect = largest ? largest.getBoundingClientRect() : { width: 0 };
            return rect.width > largestRect.width ? table : largest;
          }, null);
          
          if (largestTable) {
            return largestTable;
          }
        }

        return null;
      }

      // Calculate smart width for multicolor overlay
      function calculateOverlayWidth() {
        const calendar = findCalendarContainer();
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
    }, [MULTICOLOR_CONFIG]);
  } catch (error) {
    console.error('❌ Error creating multicolor banners:', error);
  }
}

// Click tracker function
async function toggleClickTracker() {
  console.log('👆 Toggling click tracker');
  
  try {
    await executeScriptInActiveTab(() => {
      if (window.__coordsListener) {
        document.removeEventListener("click", window.__coordsListener);
        window.__coordsListener = null;
        alert("Click tracker removed");
        return 'removed';
      } else {
        window.__coordsListener = (e) => {
          console.log("Click at:", {
            clientX: e.clientX,
            clientY: e.clientY,
            pageX: e.pageX,
            pageY: e.pageY
          });
        };
        document.addEventListener("click", window.__coordsListener);
        alert("Click tracker active: check console for coordinates");
        return 'activated';
      }
    });
  } catch (error) {
    console.error('❌ Error toggling click tracker:', error);
  }
}

// Enhanced test overlay with toggle functionality
async function toggleTestOverlay() {
  console.log('🧪 Toggling test overlay');
  
  try {
    const result = await executeScriptInActiveTab(() => {
      console.log('🧪 Test overlay toggle script executing');
      
      // Check if overlay already exists
      const existing = document.getElementById('test-overlay');
      if (existing) {
        console.log('🗑️ Removing existing test overlay');
        existing.remove();
        return 'removed';
      }
      
      // First, let's debug the environment
      console.log('📊 Environment check:', {
        url: window.location.href,
        readyState: document.readyState,
        bodyExists: !!document.body,
        bodyChildren: document.body ? document.body.children.length : 0
      });
      
      // Create new overlay
      console.log('🎯 Creating new test overlay');
      
      // Create super simple, highly visible overlay
      const overlay = document.createElement('div');
      overlay.id = 'test-overlay';
      
      // Use the most aggressive styling possible
      overlay.style.cssText = `
        position: fixed !important;
        top: 0px !important;
        left: 0px !important;
        width: 100vw !important;
        height: 100vh !important;
        background: rgba(255, 0, 0, 0.8) !important;
        z-index: 2147483647 !important;
        pointer-events: none !important;
        border: 5px solid yellow !important;
        box-sizing: border-box !important;
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
      `;
      
      // Add obvious content
      const content = document.createElement('div');
      content.style.cssText = `
        position: absolute !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) !important;
        color: white !important;
        font-size: 48px !important;
        font-weight: bold !important;
        text-shadow: 3px 3px 6px black !important;
        background: rgba(0, 0, 0, 0.7) !important;
        padding: 20px !important;
        border-radius: 10px !important;
        text-align: center !important;
      `;
      content.innerHTML = 'TEST OVERLAY<br>🔴 RED BACKGROUND';
      overlay.appendChild(content);
      
      // Append to document body
      console.log('📝 Appending to document.body...');
      document.body.appendChild(overlay);
      
      // Verify it was added
      const verification = document.getElementById('test-overlay');
      if (verification) {
        const rect = verification.getBoundingClientRect();
        const computed = window.getComputedStyle(verification);
        
        console.log('✅ Test overlay created and verified:', {
          id: verification.id,
          rect: {
            width: rect.width,
            height: rect.height,
            top: rect.top,
            left: rect.left
          },
          computedStyles: {
            position: computed.position,
            display: computed.display,
            visibility: computed.visibility,
            opacity: computed.opacity,
            zIndex: computed.zIndex,
            backgroundColor: computed.backgroundColor
          },
          parent: verification.parentElement?.tagName,
          isConnected: verification.isConnected
        });
        
        // Force a repaint
        verification.offsetHeight;
        
        return 'created';
      } else {
        console.error('❌ Test overlay element not found after creation!');
        return 'failed';
      }
    });
    
    console.log('🎯 Test overlay result:', result);
    return result;
    
  } catch (error) {
    console.error('❌ Error toggling test overlay:', error);
    
    // Fallback: try even simpler approach
    try {
      console.log('🔄 Trying fallback approach...');
      await executeScriptInActiveTab(() => {
        const existing = document.getElementById('test-overlay-fallback');
        if (existing) {
          existing.remove();
          return 'removed fallback';
        }
        
        // Ultra-simple approach
        const div = document.createElement('div');
        div.id = 'test-overlay-fallback';
        div.innerHTML = 'FALLBACK TEST';
        div.style.cssText = 'position:fixed;top:0;left:0;width:100px;height:100px;background:red;z-index:999999;';
        document.body.appendChild(div);
        console.log('🆘 Fallback overlay created');
        return 'fallback created';
      });
    } catch (fallbackError) {
      console.error('❌ Even fallback failed:', fallbackError);
    }
  }
}

// Function to update button text based on overlay state
async function updateTestButtonState() {
  try {
    const result = await executeScriptInActiveTab(() => {
      const existing = document.getElementById('test-overlay');
      return existing ? 'active' : 'inactive';
    });
    
    const testButton = document.getElementById("test");
    if (testButton) {
      // Check the actual result from the script execution
      const overlayState = result && result[0] && result[0].result;
      if (overlayState === 'active') {
        testButton.textContent = '🔴 Test Overlay';
      } else {
        testButton.textContent = '⚪ Test Overlay';
      }
      // Reset button styling to default
      testButton.style.backgroundColor = '';
      testButton.style.color = '';
      testButton.style.border = '';
      testButton.style.fontWeight = '';
    }
  } catch (error) {
    // Silently fail - button text update is not critical
    console.log('Could not update button state:', error);
  }
}

// Debug function for calendar elements
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

      const gwtElements = document.querySelectorAll('[class*="gwt"]');
      console.log('🎯 GWT elements found:', gwtElements.length);
      gwtElements.forEach((el, i) => {
        if (el.getBoundingClientRect().width > 300) {
          const rect = el.getBoundingClientRect();
          console.log(`GWT element ${i}:`, {
            tagName: el.tagName,
            width: rect.width,
            height: rect.height,
            classes: el.className
          });
        }
      });
      
      return 'debug complete';
    });
  } catch (error) {
    console.error('❌ Error running debug:', error);
  }
}

// Alternative test function that checks permissions and tab state
async function debugOverlayIssues() {
  console.log('🔍 Starting overlay debugging...');
  
  try {
    // Check if we can access the active tab
    const tabs = await new Promise((resolve, reject) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(tabs);
        }
      });
    });
    
    console.log('📋 Active tabs:', tabs);
    
    if (!tabs || !tabs[0]) {
      console.error('❌ No active tab found');
      return;
    }
    
    const activeTab = tabs[0];
    console.log('🎯 Active tab details:', {
      id: activeTab.id,
      url: activeTab.url,
      status: activeTab.status,
      title: activeTab.title
    });
    
    // Check if the URL is scriptable
    if (activeTab.url?.startsWith('chrome://') || activeTab.url?.startsWith('chrome-extension://')) {
      console.error('❌ Cannot inject scripts into chrome:// or chrome-extension:// URLs');
      return;
    }
    
    // Test basic script injection
    const basicTest = await executeScriptInActiveTab(() => {
      return {
        url: window.location.href,
        bodyExists: !!document.body,
        documentTitle: document.title,
        readyState: document.readyState
      };
    });
    
    console.log('✅ Basic script injection test:', basicTest);
    
    // Now try the overlay toggle
    await toggleTestOverlay();
    
    // Update button text
    await updateTestButtonText();
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

// Event listener setup with debouncing to prevent double-clicks
function setupEventListeners() {
  console.log('⚙️ Setting up event listeners...');
  
  // Add debouncing to prevent rapid clicks
  let isProcessing = false;
  
  // Sprint overlay buttons
  SPRINT_CONFIGS.forEach(config => {
    const button = document.getElementById(config.id);
    console.log(`Looking for button "${config.id}":`, button ? '✅ found' : '❌ not found');
    
    if (button) {
      button.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        
        if (isProcessing) {
          console.log(`⏸️ ${config.id} already processing, ignoring click`);
          return;
        }
        
        isProcessing = true;
        console.log(`🎯 ${config.id} button clicked!`);
        
        try {
          if (config.useSmartOverlay) {
            await createSmartOverlay(config.color);
          } else {
            await createStandardOverlay(config.color);
          }
          console.log(`✅ ${config.id} overlay processed`);
          
          // Update button state after overlay action
          setTimeout(async () => {
            await updateSprintButtonState(config.id);
          }, 100);
        } catch (error) {
          console.error(`❌ Error with ${config.id}:`, error);
        } finally {
          // Reset processing flag after a delay
          setTimeout(() => {
            isProcessing = false;
          }, 500);
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
        
        if (isProcessing) {
          console.log(`⏸️ ${config.id} already processing, ignoring click`);
          return;
        }
        
        isProcessing = true;
        console.log(`📝 ${config.id} text button clicked!`);
        
        try {
          await createTextOverlay(config.text, config.position);
          console.log(`✅ ${config.id} text overlay processed`);
        } catch (error) {
          console.error(`❌ Error with text ${config.id}:`, error);
        } finally {
          setTimeout(() => {
            isProcessing = false;
          }, 500);
        }
      });
    }
  });

  // Special function buttons
  const coordsButton = document.getElementById("coords");
  console.log('Coords button:', coordsButton ? '✅ found' : '❌ not found');
  if (coordsButton) {
    coordsButton.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      
      if (isProcessing) return;
      isProcessing = true;
      
      console.log('👆 Coords button clicked!');
      try {
        await toggleClickTracker();
      } finally {
        setTimeout(() => { isProcessing = false; }, 500);
      }
    });
  }

  const multicolorButton = document.getElementById("multicolor");
  console.log('Multicolor button:', multicolorButton ? '✅ found' : '❌ not found');
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
  
  // Test button for enhanced overlay with toggle functionality
  const testButton = document.getElementById("test");
  if (testButton) {
    testButton.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      
      if (isProcessing) return;
      isProcessing = true;
      
      console.log('🧪 Test button clicked!');
      try {
        const result = await toggleTestOverlay();
        console.log('🎯 Toggle result:', result);
        
        // Wait a moment for the DOM to update before checking button state
        setTimeout(async () => {
          await updateTestButtonState();
        }, 100);
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
  
  // Initialize button states on load with a longer delay
  setTimeout(updateTestButtonState, 1000);
  setTimeout(updateAllSprintButtonStates, 1000);
});

// Fallback initialization
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    setTimeout(updateTestButtonState, 1000);
    setTimeout(updateAllSprintButtonStates, 1000);
  });
} else {
  console.log('🔄 DOM already loaded - initializing immediately...');
  setupEventListeners();
  setTimeout(updateTestButtonState, 1000);
  setTimeout(updateAllSprintButtonStates, 1000);
}