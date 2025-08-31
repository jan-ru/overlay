// Simplified view detector - focuses on most reliable detection methods

function detectActiveViewSimple() {
  console.log('🎯 Simple active view detection...');
  
  const viewNames = ['Dag', 'Week', 'Maand', 'Lijst'];
  const buttonData = [];
  
  // Get all buttons with detailed visual analysis
  viewNames.forEach(viewName => {
    const xpath = `//*[text()='${viewName}']`;
    const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
    
    if (result.singleNodeValue) {
      const element = result.singleNodeValue;
      const container = element.closest('td') || element.parentElement;
      const styles = window.getComputedStyle(container);
      
      const data = {
        name: viewName,
        element: element,
        container: container,
        styles: {
          backgroundColor: styles.backgroundColor,
          borderWidth: styles.borderWidth,
          borderStyle: styles.borderStyle,
          borderColor: styles.borderColor,
          borderTop: styles.borderTop,
          borderBottom: styles.borderBottom,
          borderLeft: styles.borderLeft,
          borderRight: styles.borderRight,
          boxShadow: styles.boxShadow,
          background: styles.background,
          backgroundImage: styles.backgroundImage,
          opacity: styles.opacity,
          zIndex: styles.zIndex
        }
      };
      
      buttonData.push(data);
      console.log(`📋 "${viewName}" detailed styles:`, data.styles);
    }
  });
  
  if (buttonData.length === 0) {
    console.error('❌ No buttons found');
    return null;
  }
  
  // Strategy 1: Look for unique background or border patterns
  console.log('🔍 Strategy 1: Analyzing background differences...');
  const activeByBackground = findUniqueProperty(buttonData, 'backgroundColor');
  if (activeByBackground) {
    console.log('✅ Active view detected by background:', activeByBackground);
    return activeByBackground;
  }
  
  // Strategy 2: Border analysis
  console.log('🔍 Strategy 2: Analyzing border differences...');
  const borderProperties = ['borderTop', 'borderBottom', 'borderLeft', 'borderRight', 'borderColor'];
  
  for (const prop of borderProperties) {
    const activeByBorder = findUniqueProperty(buttonData, prop);
    if (activeByBorder) {
      console.log(`✅ Active view detected by ${prop}:`, activeByBorder);
      return activeByBorder;
    }
  }
  
  // Strategy 3: Box shadow or background image
  console.log('🔍 Strategy 3: Analyzing shadow/background image...');
  const shadowProperties = ['boxShadow', 'backgroundImage'];
  
  for (const prop of shadowProperties) {
    const activeByShadow = findUniqueProperty(buttonData, prop);
    if (activeByShadow) {
      console.log(`✅ Active view detected by ${prop}:`, activeByShadow);
      return activeByShadow;
    }
  }
  
  // Strategy 4: Manual visual comparison - show all styles for manual inspection
  console.log('🔍 Strategy 4: Manual comparison needed');
  console.log('Please visually compare these styles:');
  
  buttonData.forEach(button => {
    console.group(`🎨 ${button.name} styles:`);
    Object.entries(button.styles).forEach(([key, value]) => {
      if (value && value !== 'none' && value !== 'normal' && value !== 'rgba(0, 0, 0, 0)') {
        console.log(`${key}: ${value}`);
      }
    });
    console.groupEnd();
  });
  
  return null;
}

function findUniqueProperty(buttonData, propertyPath) {
  const values = buttonData.map(button => {
    const value = propertyPath.includes('.') 
      ? propertyPath.split('.').reduce((obj, key) => obj?.[key], button)
      : button.styles[propertyPath];
    return { name: button.name, value: value };
  });
  
  console.log(`Comparing ${propertyPath}:`, values);
  
  // Find values that appear only once (unique)
  const valueCounts = {};
  values.forEach(({ value }) => {
    valueCounts[value] = (valueCounts[value] || 0) + 1;
  });
  
  // Look for a value that appears exactly once
  const uniqueValue = Object.entries(valueCounts).find(([value, count]) => count === 1);
  
  if (uniqueValue) {
    const [value] = uniqueValue;
    const uniqueButton = values.find(item => item.value === value);
    console.log(`Found unique ${propertyPath}: "${value}" for "${uniqueButton.name}"`);
    return uniqueButton.name;
  }
  
  return null;
}

// Alternative: Try to detect based on DOM position or class differences
function detectByDOMAnalysis() {
  console.log('🔍 DOM-based detection...');
  
  const viewNames = ['Dag', 'Week', 'Maand', 'Lijst'];
  
  viewNames.forEach(viewName => {
    const xpath = `//*[text()='${viewName}']`;
    const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
    
    if (result.singleNodeValue) {
      const element = result.singleNodeValue;
      let current = element;
      
      // Walk up the DOM tree and analyze each parent
      let level = 0;
      while (current && level < 5) {
        console.log(`${viewName} - Level ${level}:`, {
          tagName: current.tagName,
          className: current.className,
          id: current.id,
          attributes: Array.from(current.attributes || []).map(attr => `${attr.name}="${attr.value}"`),
          innerHTML: current.innerHTML?.substring(0, 100) + '...'
        });
        
        current = current.parentElement;
        level++;
      }
    }
  });
}

// Quick test function that tries to switch and detect
function testDetection() {
  console.log('🧪 Testing detection by switching views...');
  
  const viewNames = ['Dag', 'Week', 'Maand', 'Lijst'];
  
  // Switch to each view and see what changes
  viewNames.forEach(viewName => {
    console.log(`\n🔄 Switching to ${viewName}...`);
    switchToView(viewName);
    
    setTimeout(() => {
      console.log(`📊 After switching to ${viewName}:`);
      detectActiveViewSimple();
    }, 300);
  });
}

// Make functions available globally
window.detectActiveViewSimple = detectActiveViewSimple;
window.detectByDOMAnalysis = detectByDOMAnalysis;
window.testDetection = testDetection;

console.log('✅ Simple view detector loaded!');
console.log('🚀 Try: detectActiveViewSimple()');
console.log('🔍 Try: detectByDOMAnalysis() for detailed DOM analysis');
console.log('🧪 Try: testDetection() to test by switching views');