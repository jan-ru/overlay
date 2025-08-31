// Direct visual analysis - captures actual rendered appearance

function analyzeRenderedButtons() {
  console.log('🎨 Analyzing actual rendered appearance...');
  
  const viewNames = ['Dag', 'Week', 'Maand', 'Lijst'];
  const analysis = [];
  
  viewNames.forEach(viewName => {
    const xpath = `//*[text()='${viewName}']`;
    const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
    
    if (result.singleNodeValue) {
      const element = result.singleNodeValue;
      
      // Check multiple levels up the DOM tree
      const containers = [];
      let current = element;
      
      for (let i = 0; i < 4; i++) {
        if (current) {
          containers.push(current);
          current = current.parentElement;
        }
      }
      
      // Analyze each container level
      containers.forEach((container, level) => {
        const rect = container.getBoundingClientRect();
        const styles = window.getComputedStyle(container);
        
        const containerAnalysis = {
          view: viewName,
          level: level,
          element: container,
          tagName: container.tagName,
          className: container.className,
          id: container.id,
          rect: {
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            x: Math.round(rect.x),
            y: Math.round(rect.y)
          },
          styles: {
            backgroundColor: styles.backgroundColor,
            background: styles.background,
            backgroundImage: styles.backgroundImage,
            backgroundPosition: styles.backgroundPosition,
            backgroundRepeat: styles.backgroundRepeat,
            backgroundSize: styles.backgroundSize,
            border: styles.border,
            borderImage: styles.borderImage,
            borderRadius: styles.borderRadius,
            boxShadow: styles.boxShadow,
            filter: styles.filter,
            opacity: styles.opacity
          },
          // Check for state attributes
          attributes: {
            pressed: container.getAttribute('aria-pressed'),
            selected: container.getAttribute('aria-selected'),
            checked: container.checked,
            disabled: container.disabled,
            active: container.classList.contains('active') || container.classList.contains('selected')
          }
        };
        
        analysis.push(containerAnalysis);
        
        console.log(`📊 ${viewName} - Level ${level} (${container.tagName}):`, {
          className: container.className,
          backgroundColor: styles.backgroundColor,
          background: styles.background,
          backgroundImage: styles.backgroundImage,
          border: styles.border,
          boxShadow: styles.boxShadow,
          pressed: container.getAttribute('aria-pressed'),
          selected: container.getAttribute('aria-selected'),
          hasActiveClass: container.classList.contains('active')
        });
      });
    }
  });
  
  return analysis;
}

function compareVisualStates() {
  console.log('🔍 Comparing visual states systematically...');
  
  const analysis = analyzeRenderedButtons();
  
  // Group by level and compare
  const levels = {};
  analysis.forEach(item => {
    if (!levels[item.level]) levels[item.level] = [];
    levels[item.level].push(item);
  });
  
  Object.entries(levels).forEach(([level, items]) => {
    console.log(`\n📋 Level ${level} comparison:`);
    
    // Compare all style properties
    const styleProperties = ['backgroundColor', 'background', 'backgroundImage', 'border', 'boxShadow'];
    
    styleProperties.forEach(prop => {
      const values = items.map(item => ({
        view: item.view,
        value: item.styles[prop]
      }));
      
      // Check if there are different values
      const uniqueValues = [...new Set(values.map(v => v.value))];
      
      if (uniqueValues.length > 1 && !uniqueValues.every(v => !v || v === 'none' || v === 'rgba(0, 0, 0, 0)')) {
        console.log(`🎯 DIFFERENCE in ${prop}:`, values);
        
        // Find the different one
        const valueCounts = {};
        values.forEach(({ value }) => {
          valueCounts[value] = (valueCounts[value] || 0) + 1;
        });
        
        const sortedCounts = Object.entries(valueCounts).sort((a, b) => a[1] - b[1]);
        if (sortedCounts.length > 1) {
          const uniqueValue = sortedCounts[0][0];
          const uniqueView = values.find(v => v.value === uniqueValue);
          console.log(`✨ UNIQUE VALUE: "${uniqueValue}" for view: "${uniqueView.view}"`);
        }
      }
    });
    
    // Check attributes
    const attributeProperties = ['pressed', 'selected', 'checked', 'active'];
    attributeProperties.forEach(attr => {
      const values = items.map(item => ({
        view: item.view,
        value: item.attributes[attr]
      }));
      
      const uniqueValues = [...new Set(values.map(v => v.value))];
      if (uniqueValues.length > 1) {
        console.log(`🎯 DIFFERENCE in ${attr}:`, values);
      }
    });
  });
}

function detectActiveByPixelSampling() {
  console.log('🎨 Attempting pixel-based detection...');
  
  const viewNames = ['Dag', 'Week', 'Maand', 'Lijst'];
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  viewNames.forEach(viewName => {
    const xpath = `//*[text()='${viewName}']`;
    const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
    
    if (result.singleNodeValue) {
      const element = result.singleNodeValue;
      const container = element.closest('td') || element.parentElement;
      const rect = container.getBoundingClientRect();
      
      // Sample colors from different points
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      console.log(`📊 ${viewName} sampling area:`, {
        x: Math.round(centerX),
        y: Math.round(centerY),
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      });
    }
  });
}

function simpleActiveDetection() {
  console.log('🎯 Simple active detection - looking for pressed state...');
  
  const viewNames = ['Dag', 'Week', 'Maand', 'Lijst'];
  
  for (const viewName of viewNames) {
    const xpath = `//*[text()='${viewName}']`;
    const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
    
    if (result.singleNodeValue) {
      const element = result.singleNodeValue;
      
      // Check element and parents for pressed/active indicators
      let current = element;
      let found = false;
      
      for (let i = 0; i < 4 && current && !found; i++) {
        const styles = window.getComputedStyle(current);
        
        // Look for any non-transparent, non-white background
        const bg = styles.backgroundColor;
        const bgImage = styles.backgroundImage;
        
        if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'rgb(255, 255, 255)' && bg !== 'transparent') {
          console.log(`🎯 FOUND ACTIVE: "${viewName}" has background: ${bg}`);
          return viewName;
        }
        
        if (bgImage && bgImage !== 'none') {
          console.log(`🎯 FOUND ACTIVE: "${viewName}" has background image: ${bgImage}`);
          return viewName;
        }
        
        // Check for pressed/selected attributes
        if (current.getAttribute('aria-pressed') === 'true' ||
            current.getAttribute('aria-selected') === 'true' ||
            current.classList.contains('pressed') ||
            current.classList.contains('selected') ||
            current.classList.contains('active')) {
          console.log(`🎯 FOUND ACTIVE: "${viewName}" has active attribute/class`);
          return viewName;
        }
        
        current = current.parentElement;
      }
    }
  }
  
  console.log('❌ No active view detected by simple method');
  return null;
}

// Make functions available globally
window.analyzeRenderedButtons = analyzeRenderedButtons;
window.compareVisualStates = compareVisualStates;
window.detectActiveByPixelSampling = detectActiveByPixelSampling;
window.simpleActiveDetection = simpleActiveDetection;

console.log('✅ Visual detector loaded!');
console.log('🎨 Try: analyzeRenderedButtons() - detailed visual analysis');
console.log('🔍 Try: compareVisualStates() - systematic comparison');
console.log('🎯 Try: simpleActiveDetection() - quick detection method');