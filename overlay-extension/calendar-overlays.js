// Calendar overlay functions (Day, Week, Month)

// select_day function - overlays only today's date
async function select_day(calendarConfig) {
  console.log('📅 Toggling select_day overlay:', calendarConfig.id);
  
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

// select_month function - overlays all September cells
async function select_month(calendarConfig) {
  console.log('📅 Toggling select_month overlay:', calendarConfig.id);
  
  try {
    const result = await executeScriptInActiveTab((config, selectors) => {
      console.log('🚀 select_month script executing for:', config.id);
      
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

      function findSeptemberCells(calendar) {
        console.log('📅 Finding September cells (1-30)');
        
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
        
        const septemberCells = dayCells.filter(cell => {
          const text = cell.textContent?.trim();
          const dayNumber = parseInt(text);
          return !isNaN(dayNumber) && dayNumber >= 1 && dayNumber <= 30;
        });
        
        console.log(`Found ${septemberCells.length} September cells`);
        console.log('September cell contents:', septemberCells.map(cell => cell.textContent?.trim()));
        
        return septemberCells;
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
        console.log('🗑️ Removing existing month overlay:', config.overlayId);
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
        const septemberCells = findSeptemberCells(calendar);
        
        if (septemberCells.length > 0) {
          // Calculate bounds for all September cells
          const monthBounds = calculateCellBounds(septemberCells);
          
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
        const calendar = findCalendarElement(selectors);
        const currentOverlay = document.getElementById(config.overlayId);
        
        if (calendar && currentOverlay) {
          const septemberCells = findSeptemberCells(calendar);
          
          if (septemberCells.length > 0) {
            const monthBounds = calculateCellBounds(septemberCells);
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

      function findFirstWeekCells(calendar) {
        console.log('📅 Finding first week cells (Monday-Friday)');
        
        const cells = calendar.querySelectorAll('td');
        console.log(`Found ${cells.length} calendar cells`);
        
        if (cells.length === 0) return [];
        
        const dayCells = Array.from(cells).filter(cell => {
          const text = cell.textContent?.trim();
          const hasNumeric = /^\d+$/.test(text);
          const hasDateClass = cell.className?.includes('date') || 
                               cell.className?.includes('day') ||
                               cell.className?.includes('cell');
          
          return hasNumeric || hasDateClass;
        });
        
        console.log(`Found ${dayCells.length} potential day cells`);
        
        let firstWeekCells = [];
        
        if (dayCells.length >= 5) {
          console.log('All day cells:', dayCells.map((cell, i) => `${i}: ${cell.textContent?.trim()}`));
          
          let mondayIndex = -1;
          
          for (let i = 0; i <= dayCells.length - 5; i++) {
            const currentCell = dayCells[i];
            const currentText = currentCell.textContent?.trim();
            const currentNum = parseInt(currentText);
            
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
          
          if (mondayIndex >= 0) {
            firstWeekCells = dayCells.slice(mondayIndex, mondayIndex + 5);
            console.log(`Using consecutive sequence: cells ${mondayIndex} to ${mondayIndex + 4}`);
          } else {
            const firstCell = dayCells[0];
            const firstCellRect = firstCell.getBoundingClientRect();
            
            const rowCells = dayCells.filter(cell => {
              const rect = cell.getBoundingClientRect();
              return Math.abs(rect.top - firstCellRect.top) < 10;
            });
            
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
        console.log('🗑️ Removing existing overlay:', config.overlayId);
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
        // Find first week cells (Monday-Friday)
        const firstWeekCells = findFirstWeekCells(calendar);
        
        if (firstWeekCells.length > 0) {
          // Calculate bounds for first week area
          const weekBounds = calculateCellBounds(firstWeekCells);
          
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
        const calendar = findCalendarElement(selectors);
        const currentOverlay = document.getElementById(config.overlayId);
        
        if (calendar && currentOverlay) {
          const firstWeekCells = findFirstWeekCells(calendar);
          
          if (firstWeekCells.length > 0) {
            const weekBounds = calculateCellBounds(firstWeekCells);
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