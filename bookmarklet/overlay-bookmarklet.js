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

  // Unified bookmarklet overlay creation function
  async function createBookmarkletOverlay(overlayKey, overlayConfig) {
    console.log(`🎨 Creating ${overlayKey} overlay`);
    
    try {
      let overlayData;
      const overlayId = `custom-overlay-${overlayKey}`;
      
      // Check for existing overlay first
      const existing = document.getElementById(overlayId);
      if (existing) {
        existing.remove();
        console.log('🗑️ Removed existing overlay');
        return 'removed';
      }
      
      // Determine overlay parameters based on type
      if (overlayConfig.type === 'week-range') {
        overlayData = getBookmarkletWeekRangeData(overlayKey);
        return overlayCore.createSprintOverlay(overlayData.sprintNumber, overlayData.startWeek, overlayData.endWeek, 
          { ...overlayConfig, overlayId });
      } else if (overlayConfig.type === 'day-specific') {
        overlayData = getBookmarkletDaySpecificData(overlayKey);
        return createBookmarkletDayOverlay(overlayData, { ...overlayConfig, overlayId });
      }
      
      throw new Error(`Unknown overlay type: ${overlayConfig.type}`);
    } catch (error) {
      console.error(`❌ Error creating ${overlayKey} overlay:`, error);
      return 'error';
    }
  }

  // Get week range data for bookmarklet overlays
  function getBookmarkletWeekRangeData(overlayKey) {
    switch (overlayKey) {
      case 'blok':
        const blokConfig = getCurrentBlokConfig();
        return { startWeek: blokConfig.startWeek, endWeek: blokConfig.endWeek, sprintNumber: 0 };
        
      case 'sprint1':
        const sprint1Config = getSprintConfig(1);
        return { startWeek: sprint1Config.startWeek, endWeek: sprint1Config.endWeek, sprintNumber: 1 };
        
      case 'sprint2':
        const sprint2Config = getSprintConfig(2);
        return { startWeek: sprint2Config.startWeek, endWeek: sprint2Config.endWeek, sprintNumber: 2 };
        
      case 'sprint3':
        const sprint3Config = getSprintConfig(3);
        return { startWeek: sprint3Config.startWeek, endWeek: sprint3Config.endWeek, sprintNumber: 3 };
        
      case 'rooster_vrij':
        const roosterVrijConfig = bookmarkletSettings.roosterVrij;
        return { startWeek: roosterVrijConfig.startWeek, endWeek: roosterVrijConfig.endWeek, sprintNumber: -1 };
        
      default:
        throw new Error(`Unknown week-range overlay: ${overlayKey}`);
    }
  }

  // Get day-specific data for bookmarklet overlays
  function getBookmarkletDaySpecificData(overlayKey) {
    const blok = bookmarkletSettings.bloks[currentBlok];
    const module = blok.modules[currentModule];
    const course = module.courses[overlayKey === 'toets' ? 'Toets' : 'Assessment'];
    
    if (!course || typeof course.weekNumber === 'undefined' || typeof course.dayNumber === 'undefined') {
      throw new Error(`Invalid day-specific course configuration for ${overlayKey}`);
    }
    
    return {
      name: course.name,
      weekNumber: course.weekNumber,
      dayNumber: course.dayNumber
    };
  }

  // Simple day overlay implementation for bookmarklet
  function createBookmarkletDayOverlay(dayData, config) {
    const overlay = document.createElement('div');
    overlay.id = config.overlayId;
    overlay.style.cssText = `
      position: fixed;
      top: 200px;
      right: 10px;
      background: ${config.color};
      padding: 10px;
      border-radius: 5px;
      color: white;
      font-weight: bold;
      z-index: 1000000;
      pointer-events: none;
    `;
    overlay.textContent = `${dayData.name} - Week ${dayData.weekNumber}, Day ${dayData.dayNumber}`;
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

    // Use shared UI configuration (inline for bookmarklet compatibility)
    const SHARED_UI_CONFIG = {
      title: "Calendar Overlays", 
      overlayConfigs: {
        blok: { id: "select_blok", label: "Blok", color: "rgba(128,128,128,0.3)", type: "week-range" },
        sprint1: { id: "select_sprint1", label: "Sprint 1", color: "rgba(0,255,0,0.3)", type: "week-range" },
        sprint2: { id: "select_sprint2", label: "Sprint 2", color: "rgba(255,165,0,0.3)", type: "week-range" },  
        sprint3: { id: "select_sprint3", label: "Sprint 3", color: "rgba(0,0,255,0.3)", type: "week-range" },
        rooster_vrij: { id: "select_rooster_vrij", label: "Rooster Vrij", color: "rgba(128,0,128,0.3)", type: "week-range" },
        toets: { id: "select_toets", label: "Toets", color: "rgba(255,255,0,0.3)", type: "day-specific" },
        assessment: { id: "select_assessment", label: "Assessment", color: "rgba(255,0,255,0.3)", type: "day-specific" }
      },
      courses: [
        { value: "Operations", label: "Operations" },
        { value: "GRC", label: "GRC" },
        { value: "Toets", label: "Toets" },
        { value: "Assessment", label: "Assessment" }
      ]
    };

    ui.innerHTML = `
      <div style="margin-bottom: 10px; font-weight: bold; text-align: center; color: #333;">
        ${SHARED_UI_CONFIG.title}
      </div>
      <div style="margin-bottom: 10px;">
        <label for="bookmarklet-course-select" style="display: block; margin-bottom: 5px; font-weight: bold;">Course:</label>
        <select id="bookmarklet-course-select" style="width: 120px; padding: 5px;">
          ${SHARED_UI_CONFIG.courses.map(course => 
            `<option value="${course.value}">${course.label}</option>`
          ).join('')}
        </select>
      </div>
      <div style="display: flex; flex-direction: column; gap: 5px;">
        ${Object.entries(SHARED_UI_CONFIG.overlayConfigs).map(([key, config]) => 
          `<button id="bookmarklet-${key}" style="padding: 5px; border: 1px solid #ddd; background: #f9f9f9; cursor: pointer; border-radius: 3px; width: 120px;">${config.label}</button>`
        ).join('')}
        <button id="bookmarklet-close" style="padding: 5px; border: 1px solid #ddd; background: #ffdddd; cursor: pointer; border-radius: 3px; margin-top: 5px; width: 120px;">Close</button>
      </div>
    `;

    document.body.appendChild(ui);

    // Course selector
    const courseSelect = ui.querySelector('#bookmarklet-course-select');
    courseSelect.value = currentCourse;
    courseSelect.addEventListener('change', (e) => {
      currentCourse = e.target.value;
      console.log('Course changed to:', currentCourse);
    });

    // Unified event handler setup using shared configuration
    Object.entries(SHARED_UI_CONFIG.overlayConfigs).forEach(([overlayKey, config]) => {
      const button = ui.querySelector(`#bookmarklet-${overlayKey}`);
      if (button) {
        button.addEventListener('click', async () => {
          try {
            const result = await createBookmarkletOverlay(overlayKey, config);
            console.log(`${config.label} overlay:`, result);
            
            // Update button appearance based on state
            if (result === 'created') {
              button.style.backgroundColor = config.color.replace('0.3', '0.8');
              button.style.color = 'white';
            } else if (result === 'removed') {
              button.style.backgroundColor = '#f9f9f9';
              button.style.color = '';
            }
          } catch (error) {
            console.error(`❌ Error with ${overlayKey}:`, error);
          }
        });
      }
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