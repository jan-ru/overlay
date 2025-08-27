// Calendar utility functions for overlay extension

// Find calendar element using configured selectors
function findCalendarElement(selectors) {
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

// Find today's date cell in the calendar
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

// Calculate bounds for a collection of cells
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

// Calculate smart width for multicolor overlay
function calculateOverlayWidth(calendar, selectors) {
  const calendarElement = findCalendarElement(selectors);
  if (calendarElement) {
    const rect = calendarElement.getBoundingClientRect();
    return `${rect.width}px`;
  }
  
  const viewportWidth = window.innerWidth;
  if (viewportWidth < 768) return '100%';
  if (viewportWidth < 1024) return '85%';
  if (viewportWidth < 1400) return '75%';
  return '70%';
}