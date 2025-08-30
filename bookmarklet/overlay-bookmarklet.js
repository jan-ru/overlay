// Calendar Overlay Bookmarklet
// Single-file implementation for managed PC environments
(function() {
  'use strict';

  // Only run once
  if (window.overlayBookmarkletLoaded) {
    console.log('Overlay bookmarklet already loaded');
    return;
  }
  window.overlayBookmarkletLoaded = true;

  // Embed overlay-core.js functionality
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
      'table.GNKVYU1C-',
      'table[class^="GNKVYU1C"]',
      'table[class*="GNKVYU1C"]',
      '.gwt-TabLayoutPanelContent table',
      'table'
    ],

    CALENDAR_CONFIGS: [
      { id: "select_blok", color: "rgba(128,128,128,0.3)", overlayId: "custom-overlay-blok" },
      { id: "select_sprint1", color: "rgba(0,255,0,0.3)", overlayId: "custom-overlay-sprint1" },
      { id: "select_sprint2", color: "rgba(255,165,0,0.3)", overlayId: "custom-overlay-sprint2" },
      { id: "select_sprint3", color: "rgba(0,0,255,0.3)", overlayId: "custom-overlay-sprint3" },
      { id: "select_toets", color: "rgba(255,255,0,0.3)", overlayId: "custom-overlay-toets" },
      { id: "select_assessment", color: "rgba(255,0,255,0.3)", overlayId: "custom-overlay-assessment" }
    ]
  };

  // Core overlay functionality (embedded from overlay-core.js)
  if (!window.OverlayCore) {
    window.OverlayCore = class OverlayCore {
    constructor() {
      this.settings = null;
    }

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

    findCalendarElement(selectors = OVERLAY_CORE_CONFIG.CALENDAR_SELECTORS) {
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
      const today = new Date();
      const todayDate = today.getDate();
      
      const cells = calendar.querySelectorAll('td');
      const dayCells = Array.from(cells).filter(cell => {
        const text = cell.textContent && cell.textContent.trim();
        const hasNumeric = /^\d+$/.test(text);
        const hasDateClass = cell.className && (cell.className.includes('date') || 
                             cell.className.includes('day') ||
                             cell.className.includes('cell'));
        
        return hasNumeric || hasDateClass;
      });
      
      const todayCell = dayCells.find(cell => {
        const text = cell.textContent && cell.textContent.trim();
        const cellDate = parseInt(text);
        return cellDate === todayDate;
      });
      
      return todayCell || null;
    }

    findSprintWeekCells(calendar, startWeek, endWeek) {
      const cells = calendar.querySelectorAll('td');
      const weekCells = [];
      const foundWeeks = new Set();
      
      // Look for "week X" patterns first
      cells.forEach(cell => {
        const text = cell.textContent?.trim().toLowerCase();
        const weekMatch = text.match(/week\s*(\d{1,2})/);
        if (weekMatch) {
          const weekNum = parseInt(weekMatch[1]);
          if (weekNum >= startWeek && weekNum <= endWeek && !foundWeeks.has(weekNum)) {
            weekCells.push(cell);
            foundWeeks.add(weekNum);
          }
        }
      });
      
      // Broader search if needed
      if (foundWeeks.size < (endWeek - startWeek + 1)) {
        cells.forEach(cell => {
          const text = cell.textContent?.trim();
          
          if (/^\d+$/.test(text)) {
            const num = parseInt(text);
            
            if (num >= startWeek && num <= endWeek && !foundWeeks.has(num)) {
              const parent = cell.parentElement;
              const row = parent ? parent : null;
              let hasWeekContext = false;
              
              if (row) {
                const rowCells = Array.from(row.children);
                hasWeekContext = rowCells.some(sibling => 
                  sibling.textContent?.toLowerCase().includes('week')
                );
                
                if (!hasWeekContext && row.parentElement) {
                  const allRows = Array.from(row.parentElement.children);
                  const rowIndex = allRows.indexOf(row);
                  
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
                weekCells.push(cell);
                foundWeeks.add(num);
              }
            }
          }
        });
      }
      
      return weekCells;
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

    createSprintOverlay(sprintNumber, startWeek, endWeek, calendarConfig) {
      const existing = document.getElementById(calendarConfig.overlayId);
      const existingDay = document.getElementById(calendarConfig.overlayId + '-day');
      const existingText = document.getElementById(calendarConfig.overlayId + '-text');
      
      if (existing || existingDay || existingText) {
        if (existing) existing.remove();
        if (existingDay) existingDay.remove();
        if (existingText) existingText.remove();
        
        if (window[`__overlayResizeHandler_${calendarConfig.id}`]) {
          window.removeEventListener('resize', window[`__overlayResizeHandler_${calendarConfig.id}`]);
          delete window[`__overlayResizeHandler_${calendarConfig.id}`];
        }
        
        return 'removed';
      }

      const calendar = this.findCalendarElement();
      if (!calendar) {
        console.log('❌ No calendar found');
        return 'not_found';
      }

      const sprintCells = this.findSprintWeekCells(calendar, startWeek, endWeek);
      if (sprintCells.length === 0) {
        console.log(`❌ No sprint week cells found for weeks ${startWeek}-${endWeek}`);
        return 'not_found';
      }

      const overlay = document.createElement('div');
      overlay.id = calendarConfig.overlayId;
      
      const sprintBounds = this.calculateCellBounds(sprintCells);
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

      document.body.appendChild(overlay);

      // Create text overlay
      const sprintText = sprintNumber === 0 ? 'Blok 1' : `Sprint ${sprintNumber}`;
      const overlayBounds = {
        left: calendarRect.left,
        top: sprintBounds.top,
        width: calendarRect.width,
        height: sprintBounds.height
      };
      this.createTextOverlay(sprintText, calendarConfig.overlayId, overlayBounds);

      // Add day emphasis if today is in range
      if (this.isTodayInSelectedRange(startWeek, endWeek)) {
        const todayCell = this.findTodayCell(calendar);
        if (todayCell) {
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
            zIndex: '1000000',
            pointerEvents: 'none',
            boxSizing: 'border-box'
          });
          
          document.body.appendChild(dayOverlay);
        }
      }

      return 'created';
    }
    };
  }

  // Settings for bookmarklet (matches current Chrome extension settings)
  const bookmarkletSettings = {
    academicYear: "25-26",
    moduleCode: "2000PRR_22",
    moduleName: "Process & Risk",
    roosterVrij: {
      name: "Rooster Vrij",
      startWeek: 43,
      endWeek: 43
    },
    bloks: {
      blok1: {
        name: "Blok 1",
        startWeek: 36,
        endWeek: 44,
        modules: {
          "2000PRR_22": {
            name: "Process & Risk",
            moduleCode: "2000PRR_22",
            startWeek: 36,
            endWeek: 44,
            courses: {
              Operations: {
                name: "Operations",
                sprint1: { startWeek: 36, endWeek: 37 },
                sprint2: { startWeek: 38, endWeek: 39 },
                sprint3: { startWeek: 40, endWeek: 42 }
              },
              GRC: {
                name: "GRC",
                sprint1: { startWeek: 36, endWeek: 37 },
                sprint2: { startWeek: 38, endWeek: 39 },
                sprint3: { startWeek: 40, endWeek: 42 }
              },
              Toets: {
                name: "Toets",
                weekNumber: 45,
                dayNumber: 5
              },
              Assessment: {
                name: "Assessment",
                weekNumber: 45,
                dayNumber: 6
              }
            }
          }
        }
      }
    },
    defaultBlok: "blok1",
    defaultModule: "2000PRR_22",
    defaultCourse: "Operations"
  };

  // Initialize overlay core
  const overlayCore = new window.OverlayCore();

  // Current selections (for bookmarklet, we'll use defaults)
  let currentBlok = bookmarkletSettings.defaultBlok;
  let currentModule = bookmarkletSettings.defaultModule;
  let currentCourse = bookmarkletSettings.defaultCourse;

  // Helper functions
  function getSprintConfig(sprintNumber) {
    const blok = bookmarkletSettings.bloks[currentBlok];
    const module = blok.modules[currentModule];
    const course = module.courses[currentCourse];
    return course[`sprint${sprintNumber}`];
  }

  function getCurrentBlokConfig() {
    return bookmarkletSettings.bloks[currentBlok];
  }

  // Main overlay functions
  function createOverlay(type, number, calendarConfig) {
    let startWeek, endWeek, sprintNumber;
    
    if (type === 'blok') {
      const blokConfig = getCurrentBlokConfig();
      startWeek = blokConfig.startWeek;
      endWeek = blokConfig.endWeek;
      sprintNumber = 0;
    } else if (type === 'sprint') {
      const sprintConfig = getSprintConfig(number);
      startWeek = sprintConfig.startWeek;
      endWeek = sprintConfig.endWeek;
      sprintNumber = number;
    } else if (type === 'rooster_vrij') {
      const roosterVrijConfig = bookmarkletSettings.roosterVrij;
      startWeek = roosterVrijConfig.startWeek;
      endWeek = roosterVrijConfig.endWeek;
      sprintNumber = -1; // Use -1 for rooster_vrij
    }
    
    return overlayCore.createSprintOverlay(sprintNumber, startWeek, endWeek, calendarConfig);
  }

  // Day-specific overlay function for Toets and Assessment
  function createDayOverlay(courseKey, calendarConfig) {
    const blok = bookmarkletSettings.bloks[currentBlok];
    const module = blok.modules[currentModule];
    const course = module.courses[courseKey];
    
    if (!course || typeof course.weekNumber === 'undefined' || typeof course.dayNumber === 'undefined') {
      console.error(`Invalid day-specific course configuration for ${courseKey}`);
      return 'error';
    }

    // For simplicity, create a basic day overlay (could be enhanced to match full extension functionality)
    const existing = document.getElementById(calendarConfig.overlayId);
    
    if (existing) {
      existing.remove();
      return 'removed';
    }

    // Create a simple overlay for the day (basic implementation)
    const overlay = document.createElement('div');
    overlay.id = calendarConfig.overlayId;
    overlay.style.cssText = `
      position: fixed;
      top: 200px;
      right: 10px;
      background: ${calendarConfig.color};
      padding: 10px;
      border-radius: 5px;
      color: white;
      font-weight: bold;
      z-index: 1000000;
      pointer-events: none;
    `;
    overlay.textContent = `${course.name} - Week ${course.weekNumber}, Day ${course.dayNumber}`;
    document.body.appendChild(overlay);
    
    return 'created';
  }

  // Create UI
  function createBookmarkletUI() {
    // Remove existing UI if present
    const existingUI = document.getElementById('overlay-bookmarklet-ui');
    if (existingUI) {
      existingUI.remove();
    }

    const ui = document.createElement('div');
    ui.id = 'overlay-bookmarklet-ui';
    ui.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: white;
      border: 2px solid #ccc;
      border-radius: 8px;
      padding: 15px;
      font-family: Arial, sans-serif;
      font-size: 12px;
      z-index: 2000000;
      box-shadow: 0 4px 8px rgba(0,0,0,0.3);
      min-width: 120px;
    `;

    ui.innerHTML = `
      <div style="margin-bottom: 10px; font-weight: bold; text-align: center; color: #333;">
        ${bookmarkletSettings.moduleName}
      </div>
      <div style="margin-bottom: 10px;">
        <select id="bookmarklet-course" style="width: 100%; padding: 3px;">
          <option value="Operations">Operations</option>
          <option value="GRC">GRC</option>
          <option value="Toets">Toets</option>
          <option value="Assessment">Assessment</option>
        </select>
      </div>
      <div style="display: flex; flex-direction: column; gap: 5px;">
        <button id="bookmarklet-blok" style="padding: 5px; border: 1px solid #ddd; background: #f9f9f9; cursor: pointer; border-radius: 3px;">Blok</button>
        <button id="bookmarklet-sprint1" style="padding: 5px; border: 1px solid #ddd; background: #f9f9f9; cursor: pointer; border-radius: 3px;">Sprint 1</button>
        <button id="bookmarklet-sprint2" style="padding: 5px; border: 1px solid #ddd; background: #f9f9f9; cursor: pointer; border-radius: 3px;">Sprint 2</button>
        <button id="bookmarklet-sprint3" style="padding: 5px; border: 1px solid #ddd; background: #f9f9f9; cursor: pointer; border-radius: 3px;">Sprint 3</button>
        <button id="bookmarklet-rooster-vrij" style="padding: 5px; border: 1px solid #ddd; background: #f9f9f9; cursor: pointer; border-radius: 3px;">Rooster Vrij</button>
        <button id="bookmarklet-toets" style="padding: 5px; border: 1px solid #ddd; background: #f9f9f9; cursor: pointer; border-radius: 3px;">Toets</button>
        <button id="bookmarklet-assessment" style="padding: 5px; border: 1px solid #ddd; background: #f9f9f9; cursor: pointer; border-radius: 3px;">Assessment</button>
        <button id="bookmarklet-close" style="padding: 5px; border: 1px solid #ddd; background: #ffdddd; cursor: pointer; border-radius: 3px; margin-top: 5px;">Close</button>
      </div>
    `;

    document.body.appendChild(ui);

    // Course selector
    const courseSelect = ui.querySelector('#bookmarklet-course');
    courseSelect.value = currentCourse;
    courseSelect.addEventListener('change', (e) => {
      currentCourse = e.target.value;
      console.log('Course changed to:', currentCourse);
    });

    // Button handlers
    const configs = window.OVERLAY_CORE_CONFIG.CALENDAR_CONFIGS;
    
    ui.querySelector('#bookmarklet-blok').addEventListener('click', () => {
      const result = createOverlay('blok', null, configs[0]);
      console.log('Blok overlay:', result);
    });

    ui.querySelector('#bookmarklet-sprint1').addEventListener('click', () => {
      const result = createOverlay('sprint', 1, configs[1]);
      console.log('Sprint 1 overlay:', result);
    });

    ui.querySelector('#bookmarklet-sprint2').addEventListener('click', () => {
      const result = createOverlay('sprint', 2, configs[2]);
      console.log('Sprint 2 overlay:', result);
    });

    ui.querySelector('#bookmarklet-sprint3').addEventListener('click', () => {
      const result = createOverlay('sprint', 3, configs[3]);
      console.log('Sprint 3 overlay:', result);
    });

    ui.querySelector('#bookmarklet-rooster-vrij').addEventListener('click', () => {
      const roosterVrijConfig = { id: "select_rooster_vrij", color: "rgba(128,0,128,0.3)", overlayId: "custom-overlay-rooster-vrij" };
      const result = createOverlay('rooster_vrij', null, roosterVrijConfig);
      console.log('Rooster Vrij overlay:', result);
    });

    ui.querySelector('#bookmarklet-toets').addEventListener('click', () => {
      const toetsConfig = { id: "select_toets", color: "rgba(255,255,0,0.3)", overlayId: "custom-overlay-toets" };
      const result = createDayOverlay('Toets', toetsConfig);
      console.log('Toets overlay:', result);
    });

    ui.querySelector('#bookmarklet-assessment').addEventListener('click', () => {
      const assessmentConfig = { id: "select_assessment", color: "rgba(255,0,255,0.3)", overlayId: "custom-overlay-assessment" };
      const result = createDayOverlay('Assessment', assessmentConfig);
      console.log('Assessment overlay:', result);
    });

    ui.querySelector('#bookmarklet-close').addEventListener('click', () => {
      ui.remove();
      window.overlayBookmarkletLoaded = false;
    });
  }

  // Initialize the bookmarklet UI
  createBookmarkletUI();
  console.log('📅 Calendar Overlay Bookmarklet loaded successfully!');

})();