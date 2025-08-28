// Calendar overlay functions (Day, Week, Month)

// select_day function - overlays only today's date
async function select_day(calendarConfig) {
  logger.debug('📅 Toggling select_day overlay:', calendarConfig.id);
  
  try {
    const result = await executeScriptInActiveTab((config, selectors) => {
      console.log('🚀 select_day script executing for:', config.id);
      
      // Inject utility functions into the page context
      function findCalendarElement(selectors) {
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

      function findTodayCell(calendar) {
        console.log('📅 Finding today\'s date cell');
        
        const today = new Date();
        const todayDate = today.getDate();
        console.log(`Looking for today's date: ${todayDate}`);
        
        const cells = calendar.querySelectorAll('td');
        console.log(`Found ${cells.length} calendar cells`);
        
        const dayCells = Array.from(cells).filter(cell => {
          const text = cell.textContent?.trim();
          const hasNumeric = /^\d+$/.test(text);
          const hasDateClass = cell.className?.includes('date') || 
                               cell.className?.includes('day') ||
                               cell.className?.includes('cell');
          
          return hasNumeric || hasDateClass;
        });
        
        console.log(`Found ${dayCells.length} potential day cells`);
        
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

      const calendar = findCalendarElement(selectors);
      
      if (calendar) {
        const todayCell = findTodayCell(calendar);
        
        if (todayCell) {
          // Create and position overlay exactly over today's cell
          const overlay = document.createElement('div');
          overlay.id = config.overlayId;
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
          
          document.body.appendChild(overlay);
          
          console.log('📐 Day overlay positioned over today:', {
            overlayId: config.overlayId,
            date: todayCell.textContent?.trim(),
            bounds: { width: rect.width, height: rect.height, top: rect.top, left: rect.left }
          });
        } else {
          // When today's date cannot be found, don't create any overlay
          console.log('❌ Today\'s date not found in calendar - no overlay will be displayed');
          return 'not_found';
        }
      } else {
        // When calendar cannot be found, don't create any overlay
        console.log('❌ Calendar not found - no day overlay will be displayed');
        return 'not_found';
      }
      
      // Add resize handler
      function updateDayOverlayOnResize() {
        const calendar = findCalendarElement(selectors);
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

// Generic select_sprint function - overlays specified weeks
async function select_sprint(sprintNumber, startWeek, endWeek, calendarConfig) {
  console.log(`📅 Toggling select_sprint${sprintNumber} overlay:`, calendarConfig.id, `weeks ${startWeek}-${endWeek}`);
  
  try {
    const result = await executeScriptInActiveTab((config, selectors, sprintNum, start, end) => {
      console.log(`🚀 select_sprint${sprintNum} script executing for:`, config.id, `weeks ${start}-${end}`);
      
      // Inject utility functions into the page context
      function findCalendarElement(selectors) {
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

      function findSprintWeekCells(calendar, startWeek, endWeek) {
        console.log(`📅 Finding sprint week cells for weeks ${startWeek}-${endWeek}`);
        
        const cells = calendar.querySelectorAll('td');
        console.log(`Found ${cells.length} calendar cells`);
        
        // Look for cells containing week numbers
        const weekCells = [];
        const foundWeeks = new Set(); // Track which weeks we've found
        
        cells.forEach(cell => {
          const text = cell.textContent?.trim().toLowerCase();
          console.log(`Checking cell text: "${text}"`);
          
          // Look for "week X" patterns - capture only first 1-2 digits after "week"
          const weekMatch = text.match(/week\s*(\d{1,2})/);
          if (weekMatch) {
            const weekNum = parseInt(weekMatch[1]);
            console.log(`Found week pattern: week ${weekNum} in "${text}"`);
            if (weekNum >= startWeek && weekNum <= endWeek && !foundWeeks.has(weekNum)) {
              console.log(`✅ Added week ${weekNum} cell:`, text);
              weekCells.push(cell);
              foundWeeks.add(weekNum);
            } else if (foundWeeks.has(weekNum)) {
              console.log(`⚠️ Week ${weekNum} already found, skipping`);
            } else {
              console.log(`⚠️ Week ${weekNum} outside range ${startWeek}-${endWeek}, skipping`);
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
              console.log(`Checking standalone number: ${num} (looking for ${startWeek}-${endWeek})`);
              
              if (num >= startWeek && num <= endWeek && !foundWeeks.has(num)) {
                console.log(`Number ${num} is in range and not already found`);
                
                // Check context - look for week-related content in surrounding cells
                const parent = cell.parentElement;
                const row = parent ? parent : null;
                let hasWeekContext = false;
                
                if (row) {
                  // Check all cells in the same row
                  const rowCells = Array.from(row.children);
                  const rowTexts = rowCells.map(c => c.textContent?.trim()).join(', ');
                  console.log(`Row texts: [${rowTexts}]`);
                  
                  hasWeekContext = rowCells.some(sibling => 
                    sibling.textContent?.toLowerCase().includes('week')
                  );
                  console.log(`Has week context in same row: ${hasWeekContext}`);
                  
                  // Also check adjacent rows
                  if (!hasWeekContext && row.parentElement) {
                    const allRows = Array.from(row.parentElement.children);
                    const rowIndex = allRows.indexOf(row);
                    console.log(`Checking adjacent rows around index ${rowIndex}`);
                    
                    // Check row above and below
                    for (let i = Math.max(0, rowIndex - 1); i <= Math.min(allRows.length - 1, rowIndex + 1); i++) {
                      const adjacentRow = allRows[i];
                      const adjacentCells = Array.from(adjacentRow.children);
                      const adjacentTexts = adjacentCells.map(c => c.textContent?.trim()).join(', ');
                      console.log(`Adjacent row ${i} texts: [${adjacentTexts}]`);
                      
                      if (adjacentCells.some(cell => cell.textContent?.toLowerCase().includes('week'))) {
                        hasWeekContext = true;
                        console.log(`Found week context in adjacent row ${i}`);
                        break;
                      }
                    }
                  }
                }
                
                console.log(`Final week context check for ${num}: ${hasWeekContext}`);
                if (hasWeekContext) {
                  console.log(`Found week ${num} cell (by context):`, text);
                  weekCells.push(cell);
                  foundWeeks.add(num);
                } else {
                  console.log(`Week ${num} rejected - no week context found`);
                }
              } else if (foundWeeks.has(num)) {
                console.log(`Number ${num} already found, skipping`);
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
        
        // If still no week cells found, try date-based approach
        if (weekCells.length === 0) {
          console.log(`No week numbers found, looking for date cells`);
          
          // Look for day cells that might correspond to the weeks
          const dayCells = Array.from(cells).filter(cell => {
            const text = cell.textContent?.trim();
            const hasDatePattern = /^(ma|di|wo|do|vr|za|zo)\s*\d+/.test(text.toLowerCase()) ||
                                  /^\d+$/.test(text);
            const hasDateClass = cell.className?.includes('date') || 
                                 cell.className?.includes('day') ||
                                 cell.className?.includes('cell');
            
            return hasDatePattern || hasDateClass;
          });
          
          console.log(`Found ${dayCells.length} potential date cells`);
          return [];
        }
        
        return weekCells;
      }
      
      function calculateCellBounds(cells) {
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
      
      // Check if this specific overlay exists
      const existing = document.getElementById(config.overlayId);
      if (existing) {
        console.log(`🗑️ Removing existing sprint${sprintNum} overlay:`, config.overlayId);
        existing.remove();
        
        // Remove associated resize handler
        if (window[`__overlayResizeHandler_${config.id}`]) {
          window.removeEventListener('resize', window[`__overlayResizeHandler_${config.id}`]);
          delete window[`__overlayResizeHandler_${config.id}`];
        }
        
        return 'removed';
      }

      const calendar = findCalendarElement(selectors);
      const overlay = document.createElement('div');
      overlay.id = config.overlayId;
      
      if (calendar) {
        const sprintCells = findSprintWeekCells(calendar, start, end);
        
        if (sprintCells.length > 0) {
          // Calculate bounds for sprint week cells (height only)
          const sprintBounds = calculateCellBounds(sprintCells);
          // Use full calendar width like Week does
          const calendarRect = calendar.getBoundingClientRect();
          
          Object.assign(overlay.style, {
            position: 'fixed',
            top: `${sprintBounds.top}px`,
            left: `${calendarRect.left}px`,
            width: `${calendarRect.width}px`,
            height: `${sprintBounds.height}px`,
            background: config.color,
            zIndex: '999999',
            pointerEvents: 'none',
            boxSizing: 'border-box'
          });
          
          console.log(`📐 Sprint${sprintNum} overlay positioned over weeks ${start}-${end}:`, {
            overlayId: config.overlayId,
            cells: sprintCells.length,
            bounds: sprintBounds
          });
        } else {
          // No week numbers found - don't create overlay
          console.log(`❌ No sprint week cells found for weeks ${start}-${end}, skipping overlay creation`);
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
          background: config.color,
          zIndex: '999999',
          pointerEvents: 'none',
          boxSizing: 'border-box'
        });
        
        console.log(`📐 Using ultimate fallback for sprint${sprintNum} overlay`);
      }
      
      document.body.appendChild(overlay);
      
      // Add resize handler
      function updateSprintOverlayOnResize() {
        const calendar = findCalendarElement(selectors);
        const currentOverlay = document.getElementById(config.overlayId);
        
        if (calendar && currentOverlay) {
          const sprintCells = findSprintWeekCells(calendar, start, end);
          
          if (sprintCells.length > 0) {
            const sprintBounds = calculateCellBounds(sprintCells);
            const calendarRect = calendar.getBoundingClientRect();
            Object.assign(currentOverlay.style, {
              top: `${sprintBounds.top}px`,
              left: `${calendarRect.left}px`,
              width: `${calendarRect.width}px`,
              height: `${sprintBounds.height}px`
            });
          }
        }
      }
      
      // Store resize handler
      let resizeTimeout;
      window[`__overlayResizeHandler_${config.id}`] = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(updateSprintOverlayOnResize, 150);
      };
      window.addEventListener('resize', window[`__overlayResizeHandler_${config.id}`]);
      
      console.log(`✅ select_sprint${sprintNum} overlay created:`, config.overlayId);
      return 'created';
    }, [calendarConfig, CALENDAR_SELECTORS, sprintNumber, startWeek, endWeek]);

    return result[0]?.result || result;
  } catch (error) {
    console.error(`❌ Error toggling select_sprint${sprintNumber} overlay:`, error);
    return 'error';
  }
}

// Blok function - overlays entire blok period
async function select_blok(calendarConfig) {
  try {
    const settings = await loadSettings();
    const blokConfig = getCurrentBlokConfig();
    if (!blokConfig) {
      throw new Error('No blok configuration found');
    }
    return await select_sprint(0, blokConfig.startWeek, blokConfig.endWeek, calendarConfig);
  } catch (error) {
    console.error('❌ Error in select_blok:', error);
    return 'error';
  }
}

// Sprint wrapper functions that use settings and call generic select_sprint
async function select_sprint1(calendarConfig) {
  try {
    const settings = await loadSettings();
    const sprint1Config = getSprintConfig(1, settings);
    return await select_sprint(1, sprint1Config.startWeek, sprint1Config.endWeek, calendarConfig);
  } catch (error) {
    console.error('❌ Error in select_sprint1:', error);
    return 'error';
  }
}

async function select_sprint2(calendarConfig) {
  try {
    const settings = await loadSettings();
    const sprint2Config = getSprintConfig(2, settings);
    return await select_sprint(2, sprint2Config.startWeek, sprint2Config.endWeek, calendarConfig);
  } catch (error) {
    console.error('❌ Error in select_sprint2:', error);
    return 'error';
  }
}

async function select_sprint3(calendarConfig) {
  try {
    const settings = await loadSettings();
    const sprint3Config = getSprintConfig(3, settings);
    return await select_sprint(3, sprint3Config.startWeek, sprint3Config.endWeek, calendarConfig);
  } catch (error) {
    console.error('❌ Error in select_sprint3:', error);
    return 'error';
  }
}

// Toets function - placeholder for future implementation
async function select_toets(calendarConfig) {
  try {
    console.log('📝 Toets overlay - placeholder function');
    // TODO: Implement toets-specific overlay logic
    return 'placeholder';
  } catch (error) {
    console.error('❌ Error in select_toets:', error);
    return 'error';
  }
}

// Assessment function - placeholder for future implementation
async function select_assessment(calendarConfig) {
  try {
    console.log('📋 Assessment overlay - placeholder function');
    // TODO: Implement assessment-specific overlay logic
    return 'placeholder';
  } catch (error) {
    console.error('❌ Error in select_assessment:', error);
    return 'error';
  }
}

