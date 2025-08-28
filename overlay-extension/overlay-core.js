// Overlay Core Library
// Shared functionality for both Chrome extension and bookmarklet versions

// Configuration Constants - Use window to avoid redeclaration errors
window.OVERLAY_CORE_CONFIG = window.OVERLAY_CORE_CONFIG || {
  OVERLAY_STYLES: {
    position: 'fixed',
    top: '152px',
    left: '0',
    width: '80%',
    height: '100%',
    zIndex: '999999',
    pointerEvents: 'none'
  },

  TEXT_OVERLAY_STYLES: {
    position: "fixed",
    left: "50%",
    transform: "translate(-50%, -50%)",
    color: "white",
    fontSize: "32px",
    fontWeight: "bold",
    textShadow: "3px 3px 6px rgba(0,0,0,0.8)",
    zIndex: "1000000",
    pointerEvents: "none"
  },

  CALENDAR_SELECTORS: [
    'table.GNKVYU1C-',                    // Primary: exact class match
    'table[class^="GNKVYU1C"]',           // Fallback 1: class starts with GNKVYU1C
    'table[class*="GNKVYU1C"]',           // Fallback 2: class contains GNKVYU1C
    '.gwt-TabLayoutPanelContent table',   // Fallback 3: table in GWT content
    'table'                               // Last resort: any table (will use largest)
  ],

  CALENDAR_CONFIGS: [
    { id: "select_blok", color: "rgba(128,128,128,0.3)", overlayId: "custom-overlay-blok" },     // gray
    { id: "select_sprint1", color: "rgba(0,255,0,0.3)", overlayId: "custom-overlay-sprint1" },   // green
    { id: "select_sprint2", color: "rgba(255,165,0,0.3)", overlayId: "custom-overlay-sprint2" }, // orange
    { id: "select_sprint3", color: "rgba(0,0,255,0.3)", overlayId: "custom-overlay-sprint3" },   // blue
    { id: "select_rooster_vrij", color: "rgba(128,0,128,0.3)", overlayId: "custom-overlay-rooster-vrij" }, // purple
    { id: "select_toets", color: "rgba(255,255,0,0.3)", overlayId: "custom-overlay-toets" },     // yellow
    { id: "select_assessment", color: "rgba(255,0,255,0.3)", overlayId: "custom-overlay-assessment" } // magenta
  ]
};

// Core Utility Functions - Define class and assign to window
console.log('🔧 Defining OverlayCore class...');
window.OverlayCore = class OverlayCore {
  constructor() {
    this.settings = null;
    this.isExtensionMode = typeof chrome !== 'undefined' && chrome.runtime;
  }

  // Helper functions for calendar operations
  getWeekNumber(date) {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - startOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
  }

  isTodayInSelectedRange(startWeek, endWeek) {
    const today = new Date();
    const currentWeek = this.getWeekNumber(today);
    return currentWeek >= startWeek && currentWeek <= endWeek;
  }

  getDarkerColor(originalColor) {
    return originalColor.replace('0.3)', '0.6)');
  }

  // DOM manipulation utilities
  createTextOverlay(text, overlayId, bounds) {
    const textOverlay = document.createElement('div');
    textOverlay.id = overlayId + '-text';
    
    const centerX = bounds.left + (bounds.width / 2);
    const centerY = bounds.top + (bounds.height / 2);
    
    Object.assign(textOverlay.style, {
      position: 'fixed',
      left: centerX + 'px',
      top: centerY + 'px',
      transform: 'translate(-50%, -50%)',
      color: 'white',
      fontSize: '24px',
      fontWeight: 'bold',
      textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
      zIndex: '1000001',
      pointerEvents: 'none',
      userSelect: 'none'
    });
    
    textOverlay.textContent = text;
    document.body.appendChild(textOverlay);
    return textOverlay;
  }

  findCalendarElement(selectors = window.OVERLAY_CORE_CONFIG.CALENDAR_SELECTORS) {
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
        console.warn('Selector failed: ' + selector, error);
      }
    }
    return null;
  }

  findTodayCell(calendar) {
    console.log('📅 Finding today\'s date cell');
    
    const today = new Date();
    const todayDate = today.getDate();
    console.log('Looking for today\'s date: ' + todayDate);
    
    const cells = calendar.querySelectorAll('td');
    console.log('Found ' + cells.length + ' calendar cells');
    
    const dayCells = Array.from(cells).filter(cell => {
      const text = cell.textContent && cell.textContent.trim();
      const hasNumeric = /^\d+$/.test(text);
      const hasDateClass = cell.className && (cell.className.includes('date') || 
                           cell.className.includes('day') ||
                           cell.className.includes('cell'));
      
      return hasNumeric || hasDateClass;
    });
    
    console.log('Found ' + dayCells.length + ' potential day cells');
    
    const todayCell = dayCells.find(cell => {
      const text = cell.textContent && cell.textContent.trim();
      const cellDate = parseInt(text);
      return cellDate === todayDate;
    });
    
    if (todayCell) {
      console.log('Found today\'s cell: ' + (todayCell.textContent && todayCell.textContent.trim()));
      return todayCell;
    } else {
      console.log('Today\'s date ' + todayDate + ' not found in calendar');
      return null;
    }
  }

  findSprintWeekCells(calendar, startWeek, endWeek) {
    console.log(`📅 Finding sprint week cells for weeks ${startWeek}-${endWeek}`);
    
    const cells = calendar.querySelectorAll('td');
    console.log(`Found ${cells.length} calendar cells`);
    
    // Look for cells containing week numbers
    const weekCells = [];
    const foundWeeks = new Set(); // Track which weeks we've found
    
    cells.forEach(cell => {
      const text = cell.textContent?.trim().toLowerCase();
      
      // Look for "week X" patterns - capture only first 1-2 digits after "week"
      const weekMatch = text.match(/week\s*(\d{1,2})/);
      if (weekMatch) {
        const weekNum = parseInt(weekMatch[1]);
        console.log(`Found week pattern: week ${weekNum} in "${text}"`);
        if (weekNum >= startWeek && weekNum <= endWeek && !foundWeeks.has(weekNum)) {
          console.log(`✅ Added week ${weekNum} cell:`, text);
          weekCells.push(cell);
          foundWeeks.add(weekNum);
        }
      }
    });
    
    // If we didn't find all expected weeks with "week X" format, try broader search
    if (foundWeeks.size < (endWeek - startWeek + 1)) {
      console.log(`Only found ${foundWeeks.size} of ${endWeek - startWeek + 1} expected weeks, trying broader search...`);
      
      cells.forEach(cell => {
        const text = cell.textContent?.trim();
        
        // Look for standalone numbers that might be week numbers
        if (/^\d+$/.test(text)) {
          const num = parseInt(text);
          
          if (num >= startWeek && num <= endWeek && !foundWeeks.has(num)) {
            // Check context - look for week-related content in surrounding cells
            const parent = cell.parentElement;
            const row = parent ? parent : null;
            let hasWeekContext = false;
            
            if (row) {
              // Check all cells in the same row
              const rowCells = Array.from(row.children);
              hasWeekContext = rowCells.some(sibling => 
                sibling.textContent?.toLowerCase().includes('week')
              );
              
              // Also check adjacent rows
              if (!hasWeekContext && row.parentElement) {
                const allRows = Array.from(row.parentElement.children);
                const rowIndex = allRows.indexOf(row);
                
                // Check row above and below
                for (let i = Math.max(0, rowIndex - 1); i <= Math.min(allRows.length - 1, rowIndex + 1); i++) {
                  const adjacentRow = allRows[i];
                  const adjacentCells = Array.from(adjacentRow.children);
                  
                  if (adjacentCells.some(cell => cell.textContent?.toLowerCase().includes('week'))) {
                    hasWeekContext = true;
                    break;
                  }
                }
              }
            }
            
            if (hasWeekContext) {
              console.log(`Found week ${num} cell (by context):`, text);
              weekCells.push(cell);
              foundWeeks.add(num);
            }
          }
        }
      });
    }
    
    // Sort cells by week number for consistent ordering
    weekCells.sort((a, b) => {
      const aText = a.textContent?.trim().toLowerCase();
      const bText = b.textContent?.trim().toLowerCase();
      
      const aMatch = aText.match(/week\s*(\d+)/) || aText.match(/^\d+$/);
      const bMatch = bText.match(/week\s*(\d+)/) || bText.match(/^\d+$/);
      
      const aNum = aMatch ? parseInt(aMatch[aMatch.length - 1] || aText) : 0;
      const bNum = bMatch ? parseInt(bMatch[bMatch.length - 1] || bText) : 0;
      
      return aNum - bNum;
    });
    
    console.log(`Found ${weekCells.length} sprint week cells for weeks ${Array.from(foundWeeks).sort().join(', ')}`);
    
    return weekCells;
  }

  // Find cells for Rooster Vrij or other special periods
  findWeekCells(calendar, startWeek, endWeek) {
    console.log(`📅 Finding week cells for weeks ${startWeek}-${endWeek}`);
    
    // Reuse the same logic as findSprintWeekCells since the requirements are the same
    return this.findSprintWeekCells(calendar, startWeek, endWeek);
  }

  calculateCellBounds(cells) {
    if (cells.length === 0) return null;
    
    let minLeft = Infinity;
    let maxRight = 0;
    let minTop = Infinity;
    let maxBottom = 0;
    
    cells.forEach(cell => {
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

  // Main overlay creation function
  createSprintOverlay(sprintNumber, startWeek, endWeek, calendarConfig) {
    console.log(`📅 Creating overlay for sprint ${sprintNumber}, weeks ${startWeek}-${endWeek}`);
    
    const selectors = window.OVERLAY_CORE_CONFIG.CALENDAR_SELECTORS;
    
    // Check if this specific overlay exists
    const existing = document.getElementById(calendarConfig.overlayId);
    const existingDay = document.getElementById(calendarConfig.overlayId + '-day');
    const existingText = document.getElementById(calendarConfig.overlayId + '-text');
    
    if (existing || existingDay || existingText) {
      console.log(`🗑️ Removing existing sprint${sprintNumber} overlay:`, calendarConfig.overlayId);
      
      if (existing) existing.remove();
      if (existingDay) existingDay.remove();
      if (existingText) existingText.remove();
      
      // Remove associated resize handler
      if (window[`__overlayResizeHandler_${calendarConfig.id}`]) {
        window.removeEventListener('resize', window[`__overlayResizeHandler_${calendarConfig.id}`]);
        delete window[`__overlayResizeHandler_${calendarConfig.id}`];
      }
      
      return 'removed';
    }

    const calendar = this.findCalendarElement(selectors);
    const overlay = document.createElement('div');
    overlay.id = calendarConfig.overlayId;
    
    if (calendar) {
      const sprintCells = this.findSprintWeekCells(calendar, startWeek, endWeek);
      
      if (sprintCells.length > 0) {
        // Calculate bounds for sprint week cells (height only)
        const sprintBounds = this.calculateCellBounds(sprintCells);
        // Use full calendar width like Week does
        const calendarRect = calendar.getBoundingClientRect();
        
        Object.assign(overlay.style, {
          position: 'fixed',
          top: `${sprintBounds.top}px`,
          left: `${calendarRect.left}px`,
          width: `${calendarRect.width}px`,
          height: `${sprintBounds.height}px`,
          background: calendarConfig.color,
          zIndex: '999999',
          pointerEvents: 'none',
          boxSizing: 'border-box'
        });
        
        console.log(`📐 Sprint${sprintNumber} overlay positioned over weeks ${startWeek}-${endWeek}:`, {
          overlayId: calendarConfig.overlayId,
          cells: sprintCells.length,
          bounds: sprintBounds
        });
        
        // Create text overlay in the center
        const sprintText = sprintNumber === 0 ? 'Blok 1' : `Sprint ${sprintNumber}`;
        const overlayBounds = {
          left: calendarRect.left,
          top: sprintBounds.top,
          width: calendarRect.width,
          height: sprintBounds.height
        };
        this.createTextOverlay(sprintText, calendarConfig.overlayId, overlayBounds);
        
        // Check if today is within the selected range and add day emphasis
        if (this.isTodayInSelectedRange(startWeek, endWeek)) {
          const todayCell = this.findTodayCell(calendar);
          if (todayCell) {
            console.log(`📅 Today is within sprint weeks ${startWeek}-${endWeek}, adding day emphasis`);
            
            // Create additional overlay for today's emphasis
            const dayOverlay = document.createElement('div');
            dayOverlay.id = calendarConfig.overlayId + '-day';
            const rect = todayCell.getBoundingClientRect();
            
            Object.assign(dayOverlay.style, {
              position: 'fixed',
              top: `${rect.top}px`,
              left: `${rect.left}px`,
              width: `${rect.width}px`,
              height: `${rect.height}px`,
              background: this.getDarkerColor(calendarConfig.color),
              zIndex: '1000000', // Higher z-index for emphasis
              pointerEvents: 'none',
              boxSizing: 'border-box'
            });
            
            document.body.appendChild(dayOverlay);
            console.log(`✅ Day emphasis added for today within sprint ${sprintNumber}`);
          }
        }
      } else {
        // No week numbers found - don't create overlay
        console.log(`❌ No sprint week cells found for weeks ${startWeek}-${endWeek}, skipping overlay creation`);
        return 'not_found';
      }
    } else {
      // Ultimate fallback
      Object.assign(overlay.style, {
        position: 'fixed',
        top: '152px',
        left: '0',
        width: '80vw',
        height: '200px',
        background: calendarConfig.color,
        zIndex: '999999',
        pointerEvents: 'none',
        boxSizing: 'border-box'
      });
      
      console.log(`📐 Using ultimate fallback for sprint${sprintNumber} overlay`);
    }
    
    document.body.appendChild(overlay);
    
    // Add resize handler
    const updateSprintOverlayOnResize = () => {
      const calendar = this.findCalendarElement(selectors);
      const currentOverlay = document.getElementById(calendarConfig.overlayId);
      const currentDayOverlay = document.getElementById(calendarConfig.overlayId + '-day');
      const currentTextOverlay = document.getElementById(calendarConfig.overlayId + '-text');
      
      if (calendar && currentOverlay) {
        const sprintCells = this.findSprintWeekCells(calendar, startWeek, endWeek);
        
        if (sprintCells.length > 0) {
          const sprintBounds = this.calculateCellBounds(sprintCells);
          const calendarRect = calendar.getBoundingClientRect();
          Object.assign(currentOverlay.style, {
            top: `${sprintBounds.top}px`,
            left: `${calendarRect.left}px`,
            width: `${calendarRect.width}px`,
            height: `${sprintBounds.height}px`
          });
          
          // Update text overlay position
          if (currentTextOverlay) {
            const centerX = calendarRect.left + (calendarRect.width / 2);
            const centerY = sprintBounds.top + (sprintBounds.height / 2);
            Object.assign(currentTextOverlay.style, {
              left: `${centerX}px`,
              top: `${centerY}px`
            });
          }
          
          // Update day overlay if it exists
          if (currentDayOverlay && this.isTodayInSelectedRange(startWeek, endWeek)) {
            const todayCell = this.findTodayCell(calendar);
            if (todayCell) {
              const rect = todayCell.getBoundingClientRect();
              Object.assign(currentDayOverlay.style, {
                top: `${rect.top}px`,
                left: `${rect.left}px`,
                width: `${rect.width}px`,
                height: `${rect.height}px`
              });
            }
          }
        }
      }
    };
    
    // Store resize handler
    let resizeTimeout;
    window[`__overlayResizeHandler_${calendarConfig.id}`] = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updateSprintOverlayOnResize, 150);
    };
    window.addEventListener('resize', window[`__overlayResizeHandler_${calendarConfig.id}`]);
    
    console.log(`✅ Sprint${sprintNumber} overlay created:`, calendarConfig.overlayId);
    return 'created';
  }

  // Separate overlay creation function for Rooster Vrij
  createRoosterVrijOverlay(startWeek, endWeek, calendarConfig) {
    console.log(`📅 Creating Rooster Vrij overlay for week ${startWeek}`);
    
    const selectors = window.OVERLAY_CORE_CONFIG.CALENDAR_SELECTORS;
    
    // Check if this specific overlay exists
    const existing = document.getElementById(calendarConfig.overlayId);
    const existingDay = document.getElementById(calendarConfig.overlayId + '-day');
    const existingText = document.getElementById(calendarConfig.overlayId + '-text');
    
    if (existing || existingDay || existingText) {
      console.log(`🗑️ Removing existing Rooster Vrij overlay:`, calendarConfig.overlayId);
      
      if (existing) existing.remove();
      if (existingDay) existingDay.remove();
      if (existingText) existingText.remove();
      
      // Remove associated resize handler
      if (window[`__overlayResizeHandler_${calendarConfig.id}`]) {
        window.removeEventListener('resize', window[`__overlayResizeHandler_${calendarConfig.id}`]);
        delete window[`__overlayResizeHandler_${calendarConfig.id}`];
      }
      
      return 'removed';
    }
    
    // Find calendar
    const calendar = this.findCalendarElement(selectors);
    if (!calendar) {
      console.error('❌ Calendar not found for Rooster Vrij overlay');
      return 'error';
    }
    
    const calendarRect = calendar.getBoundingClientRect();
    console.log(`📅 Calendar found for Rooster Vrij:`, {
      width: calendarRect.width,
      height: calendarRect.height,
      left: calendarRect.left,
      top: calendarRect.top
    });
    
    // Find cells for the Rooster Vrij week
    const roosterVrijCells = this.findWeekCells(calendar, startWeek, endWeek);
    
    if (roosterVrijCells.length === 0) {
      console.warn(`⚠️ No cells found for Rooster Vrij week ${startWeek}`);
      return 'no_cells';
    }
    
    const roosterVrijBounds = this.calculateCellBounds(roosterVrijCells);
    
    if (roosterVrijBounds) {
      const overlay = document.createElement('div');
      overlay.id = calendarConfig.overlayId;
      
      // Use the same positioning logic as Sprint overlays - full calendar width, cell-based height
      Object.assign(overlay.style, {
        position: 'fixed',
        left: calendarRect.left + 'px',
        top: roosterVrijBounds.top + 'px',
        width: calendarRect.width + 'px',
        height: roosterVrijBounds.height + 'px',
        background: calendarConfig.color,
        border: '2px solid ' + this.getDarkerColor(calendarConfig.color).replace('0.6)', '1)'),
        zIndex: '999999',
        pointerEvents: 'none',
        boxSizing: 'border-box'
      });
      
      console.log(`📐 Rooster Vrij overlay positioned over week ${startWeek}:`, {
        overlayId: calendarConfig.overlayId,
        cells: roosterVrijCells.length,
        bounds: roosterVrijBounds
      });
      
      // Create text overlay in the center - use full calendar width like Sprint overlays
      const overlayBounds = {
        left: calendarRect.left,
        top: roosterVrijBounds.top,
        width: calendarRect.width,
        height: roosterVrijBounds.height
      };
      
      document.body.appendChild(overlay);
      this.createTextOverlay('Rooster Vrij', calendarConfig.overlayId, overlayBounds);
      
      // Create resize handler
      const updateRoosterVrijOverlayOnResize = () => {
        const newCalendar = this.findCalendarElement(selectors);
        if (!newCalendar) return;
        
        const newCalendarRect = newCalendar.getBoundingClientRect();
        const newRoosterVrijCells = this.findWeekCells(newCalendar, startWeek, endWeek);
        
        if (newRoosterVrijCells.length > 0) {
          const newRoosterVrijBounds = this.calculateCellBounds(newRoosterVrijCells);
          const currentOverlay = document.getElementById(calendarConfig.overlayId);
          const currentText = document.getElementById(calendarConfig.overlayId + '-text');
          
          if (currentOverlay && newRoosterVrijBounds) {
            // Use same logic as Sprint overlays - full calendar width
            Object.assign(currentOverlay.style, {
              left: newCalendarRect.left + 'px',
              top: newRoosterVrijBounds.top + 'px',
              width: newCalendarRect.width + 'px',
              height: newRoosterVrijBounds.height + 'px'
            });
            
            if (currentText) {
              // Use full calendar width for text positioning like Sprint overlays
              const newOverlayBounds = {
                left: newCalendarRect.left,
                top: newRoosterVrijBounds.top,
                width: newCalendarRect.width,
                height: newRoosterVrijBounds.height
              };
              
              const centerX = newOverlayBounds.left + (newOverlayBounds.width / 2);
              const centerY = newOverlayBounds.top + (newOverlayBounds.height / 2);
              
              Object.assign(currentText.style, {
                left: centerX + 'px',
                top: centerY + 'px'
              });
            }
          }
        }
      };
      
      let resizeTimeout;
      window[`__overlayResizeHandler_${calendarConfig.id}`] = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(updateRoosterVrijOverlayOnResize, 150);
      };
      window.addEventListener('resize', window[`__overlayResizeHandler_${calendarConfig.id}`]);
      
      console.log(`✅ Rooster Vrij overlay created:`, calendarConfig.overlayId);
      return 'created';
    } else {
      console.error('❌ Could not calculate bounds for Rooster Vrij overlay');
      return 'error';
    }
  }

  // Settings-related functions (to be implemented based on context)
  async loadSettings() {
    // This will be implemented differently for extension vs bookmarklet
    throw new Error('loadSettings must be implemented by the consuming application');
  }

  getCurrentBlokConfig() {
    // This will be implemented differently for extension vs bookmarklet  
    throw new Error('getCurrentBlokConfig must be implemented by the consuming application');
  }

  getSprintConfig(number, settings) {
    // This will be implemented differently for extension vs bookmarklet
    throw new Error('getSprintConfig must be implemented by the consuming application');
  }
};

console.log('✅ OverlayCore class defined, type:', typeof window.OverlayCore);

// Export for both environments (only if not already exported)
if (typeof module !== 'undefined' && module.exports) {
  // Node.js environment
  module.exports = { OverlayCore: window.OverlayCore, OVERLAY_CORE_CONFIG: window.OVERLAY_CORE_CONFIG };
}