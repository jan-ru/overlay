// Configuration and constants - UPDATED WITH INDIVIDUAL TOGGLES
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

const CALENDAR_CONFIGS = [
  { id: "select_day", color: "rgba(255,0,0,0.3)", overlayId: "custom-overlay-day" },        // red
  { id: "select_week", color: "rgba(0,0,255,0.3)", overlayId: "custom-overlay-week" },      // blue
  { id: "select_month", color: "rgba(0,255,0,0.3)", overlayId: "custom-overlay-month" }     // green
];

const TEXT_CONFIGS = [
  { id: "textsprint1", text: "Text Sprint 1", position: "30%", overlayId: "custom-text-overlay-sprint1" },
  { id: "textsprint2", text: "Text Sprint 2", position: "40%", overlayId: "custom-text-overlay-sprint2" },
  { id: "textsprint3", text: "Text Sprint 3", position: "50%", overlayId: "custom-text-overlay-sprint3" },
  { id: "textvakantie", text: "Text Vakantie", position: "60%", overlayId: "custom-text-overlay-vakantie" },
  { id: "texttoets", text: "Text Toets", position: "70%", overlayId: "custom-text-overlay-toets" }
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

// select_day function - overlays only today's date
async function select_day(calendarConfig) {
  console.log('📅 Toggling select_day overlay:', calendarConfig.id);
  
  try {
    const result = await executeScriptInActiveTab((config, selectors) => {
      console.log('🚀 select_day script executing for:', config.id);
      
      // Check if this specific overlay exists
      const existing = document.getElementById(config.overlayId);
      if (existing) {
        console.log('🗑️ Removing existing day overlay:', config.overlayId);
        existing.remove();
        
        // Remove associated resize handler
        if (window[`__overlayResizeHandler_${config.id}`]) {
          window.removeEventListener('resize', window[`__overlayResizeHandler_${config.id}`]);
          delete window[`__overlayResizeHandler_${config.id}`];
        }
        
        return 'removed';
      }

      // Find calendar element
      function findCalendarElement() {
        console.log('🔍 Looking for calendar using hardcoded selectors...');
        
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

      // Find today's date cell
      function findTodayCell(calendar) {
        console.log('📅 Finding today\'s date cell');
        
        const today = new Date();
        const todayDate = today.getDate();
        console.log(`Looking for today's date: ${todayDate}`);
        
        // Look for calendar cells
        const cells = calendar.querySelectorAll('td');
        console.log(`Found ${cells.length} calendar cells`);
        
        // Find cells that look like calendar days
        const dayCells = Array.from(cells).filter(cell => {
          const text = cell.textContent?.trim();
          const hasNumeric = /^\d+$/.test(text);
          const hasDateClass = cell.className?.includes('date') || 
                               cell.className?.includes('day') ||
                               cell.className?.includes('cell');
          
          return hasNumeric || hasDateClass;
        });
        
        console.log(`Found ${dayCells.length} potential day cells`);
        
        // Find cell with today's date
        const todayCell = dayCells.find(cell => {
          const text = cell.textContent?.trim();
          const cellDate = parseInt(text);
          return cellDate === todayDate;
        });
        
        if (todayCell) {
          console.log(`Found today's cell: ${todayCell.textContent?.trim()}`);
          return todayCell;
        } else {
          console.log(`Today's date ${todayDate} not found in calendar`);
          return null;
        }
      }

      const calendar = findCalendarElement();
      const overlay = document.createElement('div');
      overlay.id = config.overlayId;
      
      if (calendar) {
        const todayCell = findTodayCell(calendar);
        
        if (todayCell) {
          // Position overlay exactly over today's cell
          const rect = todayCell.getBoundingClientRect();
          
          Object.assign(overlay.style, {
            position: 'fixed',
            top: `${rect.top}px`,
            left: `${rect.left}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`,
            background: config.color,
            zIndex: '999999',
            pointerEvents: 'none',
            boxSizing: 'border-box'
          });
          
          console.log('📐 Day overlay positioned over today:', {
            overlayId: config.overlayId,
            date: todayCell.textContent?.trim(),
            bounds: { width: rect.width, height: rect.height, top: rect.top, left: rect.left }
          });
        } else {
          // Fallback: small overlay in top-left of calendar
          const rect = calendar.getBoundingClientRect();
          
          Object.assign(overlay.style, {
            position: 'fixed',
            top: `${rect.top}px`,
            left: `${rect.left}px`,
            width: '50px',
            height: '30px',
            background: config.color,
            zIndex: '999999',
            pointerEvents: 'none',
            boxSizing: 'border-box'
          });
          
          console.log('📐 Fallback: small day overlay at calendar top-left');
        }
      } else {
        // Ultimate fallback
        Object.assign(overlay.style, {
          position: 'fixed',
          top: '152px',
          left: '0',
          width: '50px',
          height: '30px',
          background: config.color,
          zIndex: '999999',
          pointerEvents: 'none',
          boxSizing: 'border-box'
        });
        
        console.log('📐 Using ultimate fallback for day overlay');
      }
      
      document.body.appendChild(overlay);
      
      // Add resize handler
      function updateDayOverlayOnResize() {
        const calendar = findCalendarElement();
        const currentOverlay = document.getElementById(config.overlayId);
        
        if (calendar && currentOverlay) {
          const todayCell = findTodayCell(calendar);
          
          if (todayCell) {
            const rect = todayCell.getBoundingClientRect();
            Object.assign(currentOverlay.style, {
              top: `${rect.top}px`,
              left: `${rect.left}px`,
              width: `${rect.width}px`,
              height: `${rect.height}px`
            });
          }
        }
      }
      
      // Store resize handler
      let resizeTimeout;
      window[`__overlayResizeHandler_${config.id}`] = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(updateDayOverlayOnResize, 150);
      };
      window.addEventListener('resize', window[`__overlayResizeHandler_${config.id}`]);
      
      console.log('✅ select_day overlay created:', config.overlayId);
      return 'created';
    }, [calendarConfig, CALENDAR_SELECTORS]);

    return result[0]?.result || result;
  } catch (error) {
    console.error('❌ Error toggling select_day overlay:', error);
    return 'error';
  }
}

// select_month function - overlays all September cells
async function select_month(calendarConfig) {
  console.log('📅 Toggling select_month overlay:', calendarConfig.id);
  
  try {
    const result = await executeScriptInActiveTab((config, selectors) => {
      console.log('🚀 select_month script executing for:', config.id);
      
      // Check if this specific overlay exists
      const existing = document.getElementById(config.overlayId);
      if (existing) {
        console.log('🗑️ Removing existing month overlay:', config.overlayId);
        existing.remove();
        
        // Remove associated resize handler
        if (window[`__overlayResizeHandler_${config.id}`]) {
          window.removeEventListener('resize', window[`__overlayResizeHandler_${config.id}`]);
          delete window[`__overlayResizeHandler_${config.id}`];
        }
        
        return 'removed';
      }

      // Find calendar element
      function findCalendarElement() {
        console.log('🔍 Looking for calendar using hardcoded selectors...');
        
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

      // Find all September cells (days 1-30)
      function findSeptemberCells(calendar) {
        console.log('📅 Finding September cells (1-30)');
        
        // Look for calendar cells
        const cells = calendar.querySelectorAll('td');
        console.log(`Found ${cells.length} calendar cells`);
        
        // Find cells that look like calendar days
        const dayCells = Array.from(cells).filter(cell => {
          const text = cell.textContent?.trim();
          const hasNumeric = /^\d+$/.test(text);
          const hasDateClass = cell.className?.includes('date') || 
                               cell.className?.includes('day') ||
                               cell.className?.includes('cell');
          
          return hasNumeric || hasDateClass;
        });
        
        console.log(`Found ${dayCells.length} potential day cells`);
        
        // Find September cells (days 1-30)
        const septemberCells = dayCells.filter(cell => {
          const text = cell.textContent?.trim();
          const dayNumber = parseInt(text);
          return !isNaN(dayNumber) && dayNumber >= 1 && dayNumber <= 30;
        });
        
        console.log(`Found ${septemberCells.length} September cells`);
        console.log('September cell contents:', septemberCells.map(cell => cell.textContent?.trim()));
        
        return septemberCells;
      }
      
      // Calculate bounds for all September cells
      function calculateSeptemberBounds(septemberCells) {
        if (septemberCells.length === 0) return null;
        
        let minLeft = Infinity;
        let maxRight = 0;
        let minTop = Infinity;
        let maxBottom = 0;
        
        septemberCells.forEach(cell => {
          const rect = cell.getBoundingClientRect();
          minLeft = Math.min(minLeft, rect.left);
          maxRight = Math.max(maxRight, rect.right);
          minTop = Math.min(minTop, rect.top);
          maxBottom = Math.max(maxBottom, rect.bottom);
        });
        
        return {
          top: minTop,
          left: minLeft,
          width: maxRight - minLeft,
          height: maxBottom - minTop
        };
      }

      const calendar = findCalendarElement();
      const overlay = document.createElement('div');
      overlay.id = config.overlayId;
      
      if (calendar) {
        const septemberCells = findSeptemberCells(calendar);
        
        if (septemberCells.length > 0) {
          // Calculate bounds for all September cells
          const monthBounds = calculateSeptemberBounds(septemberCells);
          
          Object.assign(overlay.style, {
            position: 'fixed',
            top: `${monthBounds.top}px`,
            left: `${monthBounds.left}px`,
            width: `${monthBounds.width}px`,
            height: `${monthBounds.height}px`,
            background: config.color,
            zIndex: '999999',
            pointerEvents: 'none',
            boxSizing: 'border-box'
          });
          
          console.log('📐 Month overlay positioned over September:', {
            overlayId: config.overlayId,
            cells: septemberCells.length,
            bounds: monthBounds
          });
        } else {
          // Fallback: use full calendar if can't find September cells
          const rect = calendar.getBoundingClientRect();
          
          Object.assign(overlay.style, {
            position: 'fixed',
            top: `${rect.top}px`,
            left: `${rect.left}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`,
            background: config.color,
            zIndex: '999999',
            pointerEvents: 'none',
            boxSizing: 'border-box'
          });
          
          console.log('📐 Fallback: month overlay positioned over full calendar');
        }
      } else {
        // Ultimate fallback
        Object.assign(overlay.style, {
          position: 'fixed',
          top: '152px',
          left: '0',
          width: '80vw',
          height: '200px',
          background: config.color,
          zIndex: '999999',
          pointerEvents: 'none',
          boxSizing: 'border-box'
        });
        
        console.log('📐 Using ultimate fallback for month overlay');
      }
      
      document.body.appendChild(overlay);
      
      // Add resize handler
      function updateMonthOverlayOnResize() {
        const calendar = findCalendarElement();
        const currentOverlay = document.getElementById(config.overlayId);
        
        if (calendar && currentOverlay) {
          const septemberCells = findSeptemberCells(calendar);
          
          if (septemberCells.length > 0) {
            const monthBounds = calculateSeptemberBounds(septemberCells);
            Object.assign(currentOverlay.style, {
              top: `${monthBounds.top}px`,
              left: `${monthBounds.left}px`,
              width: `${monthBounds.width}px`,
              height: `${monthBounds.height}px`
            });
          }
        }
      }
      
      // Store resize handler
      let resizeTimeout;
      window[`__overlayResizeHandler_${config.id}`] = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(updateMonthOverlayOnResize, 150);
      };
      window.addEventListener('resize', window[`__overlayResizeHandler_${config.id}`]);
      
      console.log('✅ select_month overlay created:', config.overlayId);
      return 'created';
    }, [calendarConfig, CALENDAR_SELECTORS]);

    return result[0]?.result || result;
  } catch (error) {
    console.error('❌ Error toggling select_month overlay:', error);
    return 'error';
  }
}

// select_week function - overlays only the first week (Monday-Friday)
async function select_week(calendarConfig) {
  console.log('📅 Toggling select_week overlay:', calendarConfig.id);
  
  try {
    const result = await executeScriptInActiveTab((config, selectors) => {
      console.log('🚀 select_week script executing for:', config.id);
      
      // Check if this specific overlay exists
      const existing = document.getElementById(config.overlayId);
      if (existing) {
        console.log('🗑️ Removing existing overlay:', config.overlayId);
        existing.remove();
        
        // Remove associated resize handler
        if (window[`__overlayResizeHandler_${config.id}`]) {
          window.removeEventListener('resize', window[`__overlayResizeHandler_${config.id}`]);
          delete window[`__overlayResizeHandler_${config.id}`];
        }
        
        return 'removed';
      }

      // Find calendar element
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

      // Find first week cells (Monday through Friday)
      function findFirstWeekCells(calendar) {
        console.log('📅 Finding first week cells (Monday-Friday)');
        
        // Look for calendar cells - typically td elements in a table
        const cells = calendar.querySelectorAll('td');
        console.log(`Found ${cells.length} calendar cells`);
        
        if (cells.length === 0) return [];
        
        // Strategy: Find cells that look like calendar days
        // They usually have numeric content or date-like classes
        const dayCells = Array.from(cells).filter(cell => {
          const text = cell.textContent?.trim();
          const hasNumeric = /^\d+$/.test(text);
          const hasDateClass = cell.className?.includes('date') || 
                               cell.className?.includes('day') ||
                               cell.className?.includes('cell');
          
          return hasNumeric || hasDateClass;
        });
        
        console.log(`Found ${dayCells.length} potential day cells`);
        
        // Find the first week - Monday through Friday (5 working days)
        let firstWeekCells = [];
        
        if (dayCells.length >= 5) {
          // Strategy: Find Monday and the next 4 consecutive weekday cells
          console.log('All day cells:', dayCells.map((cell, i) => `${i}: ${cell.textContent?.trim()}`));
          
          // Look for a pattern that indicates Monday-Friday sequence
          // This could be cells 8,9,10,11,12 or similar numeric sequence
          let mondayIndex = -1;
          
          // Try to find Monday by looking for a sequence of 5 consecutive day numbers
          for (let i = 0; i <= dayCells.length - 5; i++) {
            const currentCell = dayCells[i];
            const currentText = currentCell.textContent?.trim();
            const currentNum = parseInt(currentText);
            
            // Check if this could be start of a 5-day sequence
            if (!isNaN(currentNum)) {
              let isConsecutive = true;
              for (let j = 1; j < 5; j++) {
                const nextCell = dayCells[i + j];
                const nextText = nextCell?.textContent?.trim();
                const nextNum = parseInt(nextText);
                
                if (isNaN(nextNum) || nextNum !== currentNum + j) {
                  isConsecutive = false;
                  break;
                }
              }
              
              if (isConsecutive) {
                mondayIndex = i;
                console.log(`Found Monday-Friday sequence starting at index ${i} (cell: ${currentText})`);
                break;
              }
            }
          }
          
          // If we found a Monday-Friday sequence, use it
          if (mondayIndex >= 0) {
            firstWeekCells = dayCells.slice(mondayIndex, mondayIndex + 5);
            console.log(`Using consecutive sequence: cells ${mondayIndex} to ${mondayIndex + 4}`);
          } else {
            // Fallback: use the first 5 cells that are in the same row
            const firstCell = dayCells[0];
            const firstCellRect = firstCell.getBoundingClientRect();
            
            const rowCells = dayCells.filter(cell => {
              const rect = cell.getBoundingClientRect();
              return Math.abs(rect.top - firstCellRect.top) < 10;
            });
            
            // Sort by X position and take 5 cells
            rowCells.sort((a, b) => {
              const rectA = a.getBoundingClientRect();
              const rectB = b.getBoundingClientRect();
              return rectA.left - rectB.left;
            });
            
            firstWeekCells = rowCells.slice(0, 5);
            console.log(`Fallback: using first 5 cells from first row`);
          }
          
          console.log(`Selected ${firstWeekCells.length} cells for Monday-Friday`);
          console.log('Selected cell contents:', firstWeekCells.map((cell, i) => `${i}: ${cell.textContent?.trim()}`));
        }
        
        return firstWeekCells;
      }
      
      // Calculate bounds for first week cells
      function calculateFirstWeekBounds(weekCells) {
        if (weekCells.length === 0) return null;
        
        let minLeft = Infinity;
        let maxRight = 0;
        let minTop = Infinity;
        let maxBottom = 0;
        
        weekCells.forEach(cell => {
          const rect = cell.getBoundingClientRect();
          minLeft = Math.min(minLeft, rect.left);
          maxRight = Math.max(maxRight, rect.right);
          minTop = Math.min(minTop, rect.top);
          maxBottom = Math.max(maxBottom, rect.bottom);
        });
        
        return {
          top: minTop,
          left: minLeft,
          width: maxRight - minLeft,
          height: maxBottom - minTop
        };
      }

      const calendar = findCalendarElement();
      const overlay = document.createElement('div');
      overlay.id = config.overlayId;
      
      if (calendar) {
        // Find first week cells (Monday-Friday)
        const firstWeekCells = findFirstWeekCells(calendar);
        
        if (firstWeekCells.length > 0) {
          // Calculate bounds for first week area
          const weekBounds = calculateFirstWeekBounds(firstWeekCells);
          
          Object.assign(overlay.style, {
            position: 'fixed',
            top: `${weekBounds.top}px`,
            left: `${weekBounds.left}px`,
            width: `${weekBounds.width}px`,
            height: `${weekBounds.height}px`,
            background: config.color,
            zIndex: '999999',
            pointerEvents: 'none',
            boxSizing: 'border-box'
          });
          
          console.log('📐 Overlay positioned over first week:', {
            overlayId: config.overlayId,
            cells: firstWeekCells.length,
            bounds: weekBounds
          });
        } else {
          // Fallback: use full calendar if can't find week cells
          const rect = calendar.getBoundingClientRect();
          
          Object.assign(overlay.style, {
            position: 'fixed',
            top: `${rect.top}px`,
            left: `${rect.left}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`,
            background: config.color,
            zIndex: '999999',
            pointerEvents: 'none',
            boxSizing: 'border-box'
          });
          
          console.log('📐 Fallback: overlay positioned over full calendar');
        }
      } else {
        // Ultimate fallback to responsive positioning
        Object.assign(overlay.style, {
          position: 'fixed',
          top: '152px',
          left: '0',
          width: '80vw',
          height: '100px',
          background: config.color,
          zIndex: '999999',
          pointerEvents: 'none',
          boxSizing: 'border-box'
        });
        
        console.log('📐 Using ultimate fallback positioning');
      }
      
      document.body.appendChild(overlay);
      
      // Add resize handler for responsiveness
      function updateSelectWeekOnResize() {
        const calendar = findCalendarElement();
        const currentOverlay = document.getElementById(config.overlayId);
        
        if (calendar && currentOverlay) {
          const firstWeekCells = findFirstWeekCells(calendar);
          
          if (firstWeekCells.length > 0) {
            const weekBounds = calculateFirstWeekBounds(firstWeekCells);
            Object.assign(currentOverlay.style, {
              top: `${weekBounds.top}px`,
              left: `${weekBounds.left}px`,
              width: `${weekBounds.width}px`,
              height: `${weekBounds.height}px`
            });
          }
        }
      }
      
      // Store unique resize handler
      let resizeTimeout;
      window[`__overlayResizeHandler_${config.id}`] = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(updateSelectWeekOnResize, 150);
      };
      window.addEventListener('resize', window[`__overlayResizeHandler_${config.id}`]);
      
      console.log('✅ select_week overlay created:', config.overlayId);
      return 'created';
    }, [calendarConfig, CALENDAR_SELECTORS]);

    return result[0]?.result || result;
  } catch (error) {
    console.error('❌ Error toggling select_week overlay:', error);
    return 'error';
  }
}

// UPDATED: Individual Text overlay toggle function
async function toggleTextOverlay(textConfig) {
  console.log('📝 Toggling text overlay:', textConfig.id);
  
  try {
    const result = await executeScriptInActiveTab((config, styles) => {
      // Check if this specific text overlay exists
      const existing = document.getElementById(config.overlayId);
      if (existing) {
        console.log('🗑️ Removing existing text overlay:', config.overlayId);
        existing.remove();
        return 'removed';
      }

      // Create new text overlay
      const textOverlay = document.createElement("div");
      textOverlay.id = config.overlayId; // Use unique ID
      Object.assign(textOverlay.style, {
        ...styles,
        top: config.position
      });
      textOverlay.textContent = config.text;
      document.body.appendChild(textOverlay);
      console.log('✅ Text overlay created:', config.overlayId);
      return 'created';
    }, [textConfig, TEXT_OVERLAY_STYLES]);

    return result[0]?.result || result;
  } catch (error) {
    console.error('❌ Error toggling text overlay:', error);
    return 'error';
  }
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

// Multicolor banners with calendar-anchored positioning
async function createMulticolorBanners() {
  console.log('🌈 Creating multicolor banners');
  
  try {
    await executeScriptInActiveTab((config, selectors) => {
      console.log('🚀 Multicolor script executing');
      
      const existing = document.getElementById("custom-multicolor-overlay");
      if (existing) {
        console.log('🗑️ Removing existing multicolor overlay');
        existing.remove();
        
        // Remove associated resize handler
        if (window.__overlayResizeHandler_multicolor) {
          window.removeEventListener('resize', window.__overlayResizeHandler_multicolor);
          delete window.__overlayResizeHandler_multicolor;
        }
        
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

      const calendar = findCalendarElement();
      const overlay = document.createElement("div");
      overlay.id = "custom-multicolor-overlay";
      
      if (calendar) {
        // Use calendar dimensions for anchored positioning
        const rect = calendar.getBoundingClientRect();
        
        Object.assign(overlay.style, {
          position: "fixed",
          top: `${rect.top}px`,
          left: `${rect.left}px`,
          width: `${rect.width}px`,
          height: `${rect.height}px`,
          pointerEvents: "none",
          zIndex: "999999",
          display: "flex",
          flexDirection: "column"
        });
        
        console.log('📐 Multicolor overlay positioned over calendar:', {
          width: rect.width,
          height: rect.height,
          top: rect.top,
          left: rect.left
        });
      } else {
        // Fallback to responsive positioning
        Object.assign(overlay.style, {
          position: "fixed",
          top: "152px",
          left: "0",
          width: "80vw",
          height: "calc(100vh - 152px)",
          pointerEvents: "none",
          zIndex: "999999",
          display: "flex",
          flexDirection: "column"
        });
        
        console.log('📐 Using fallback responsive positioning for multicolor');
      }
      
      document.body.appendChild(overlay);

      // Create colored banners that fill the overlay area
      config.colors.forEach((color, index) => {
        const banner = document.createElement("div");
        Object.assign(banner.style, {
          width: "100%",
          height: `${100 / config.colors.length}%`,
          background: color,
          opacity: "0.3"
        });
        overlay.appendChild(banner);
      });

      // Add resize handler for responsiveness
      function updateMulticolorOverlayOnResize() {
        const calendar = findCalendarElement();
        const currentOverlay = document.getElementById("custom-multicolor-overlay");
        if (calendar && currentOverlay) {
          const rect = calendar.getBoundingClientRect();
          Object.assign(currentOverlay.style, {
            top: `${rect.top}px`,
            left: `${rect.left}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`
          });
        }
      }
      
      // Store resize handler
      let resizeTimeout;
      window.__overlayResizeHandler_multicolor = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(updateMulticolorOverlayOnResize, 150);
      };
      window.addEventListener('resize', window.__overlayResizeHandler_multicolor);

      console.log('✅ Multicolor overlay created with calendar anchoring');
      return 'created';
    }, [MULTICOLOR_CONFIG, CALENDAR_SELECTORS]);
  } catch (error) {
    console.error('❌ Error creating multicolor banners:', error);
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

// UPDATED: Event listeners setup with individual toggles
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
          } else if (config.id === 'select_week') {
            result = await select_week(config);
          } else if (config.id === 'select_month') {
            result = await select_month(config);
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

  // UPDATED: Text overlay buttons - now individual toggles
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
          
          // Optional: Update button appearance based on state
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

  // Multicolor button (unchanged - already has toggle behavior)
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

  // Debug button (unchanged)
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
  setupEventListeners();
});

// Fallback initialization
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupEventListeners);
} else {
  console.log('📄 DOM already loaded - initializing immediately...');
  setupEventListeners();
}