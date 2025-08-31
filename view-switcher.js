// Simple and focused view detector and switcher for HvA rooster
// Detects active view and provides switching functionality

function getViewButtons() {
  console.log('🔍 Finding view buttons...');
  
  const viewNames = ['Dag', 'Week', 'Maand', 'Lijst'];
  const buttons = {};
  
  viewNames.forEach(viewName => {
    // Find element containing exact view name
    const xpath = `//*[text()='${viewName}']`;
    const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
    
    if (result.singleNodeValue) {
      const element = result.singleNodeValue;
      
      // Get the clickable parent (likely a button, td, or div)
      let clickableElement = element;
      
      // Walk up the DOM tree to find the clickable container
      while (clickableElement && 
             !['BUTTON', 'TD', 'A'].includes(clickableElement.tagName) && 
             !clickableElement.onclick &&
             !clickableElement.style.cursor === 'pointer') {
        clickableElement = clickableElement.parentElement;
        if (!clickableElement) break;
      }
      
      // If no specific clickable found, use the text element itself
      if (!clickableElement) clickableElement = element;
      
      buttons[viewName] = {
        textElement: element,
        clickableElement: clickableElement,
        container: element.closest('td') || element.parentElement
      };
      
      console.log(`📋 Found "${viewName}" button:`, buttons[viewName]);
    } else {
      console.warn(`⚠️  Could not find button for "${viewName}"`);
    }
  });
  
  return buttons;
}

function detectActiveView() {
  console.log('🎯 Detecting active view...');
  
  const buttons = getViewButtons();
  const viewNames = Object.keys(buttons);
  
  if (viewNames.length === 0) {
    console.error('❌ No view buttons found');
    return null;
  }
  
  console.log('🔍 Analyzing visual differences...');
  
  const visualData = {};
  
  viewNames.forEach(viewName => {
    const button = buttons[viewName];
    if (!button) return;
    
    const container = button.container;
    const styles = window.getComputedStyle(container);
    
    visualData[viewName] = {
      backgroundColor: styles.backgroundColor,
      border: styles.border,
      borderTop: styles.borderTop,
      borderBottom: styles.borderBottom,
      borderLeft: styles.borderLeft,
      borderRight: styles.borderRight,
      borderColor: styles.borderColor,
      boxShadow: styles.boxShadow,
      opacity: styles.opacity,
      fontWeight: styles.fontWeight,
      color: styles.color
    };
    
    console.log(`🎨 "${viewName}" styling:`, visualData[viewName]);
  });
  
  // Compare visual properties to find the different one (likely active)
  const activeView = findVisuallyDifferent(visualData);
  
  console.log('🎯 Active view detected:', activeView || 'Unknown');
  return activeView;
}

function findVisuallyDifferent(visualData) {
  const viewNames = Object.keys(visualData);
  
  if (viewNames.length < 2) return null;
  
  // Check each visual property to find differences
  const properties = ['backgroundColor', 'borderTop', 'borderBottom', 'borderColor', 'boxShadow', 'fontWeight'];
  
  for (const prop of properties) {
    const values = viewNames.map(view => visualData[view][prop]);
    const uniqueValues = [...new Set(values)];
    
    console.log(`🔍 Checking ${prop}:`, values);
    
    if (uniqueValues.length > 1) {
      // Found a visual difference - identify which one is different
      const valueCounts = {};
      values.forEach(value => {
        valueCounts[value] = (valueCounts[value] || 0) + 1;
      });
      
      // Find the value that appears least often (likely the active state)
      const sortedValues = Object.entries(valueCounts).sort((a, b) => a[1] - b[1]);
      const differentValue = sortedValues[0][0];
      
      const differentView = viewNames.find(view => visualData[view][prop] === differentValue);
      
      console.log(`✨ Found visual difference in ${prop}:`);
      console.log(`   Different value: "${differentValue}"`);
      console.log(`   View with different value: "${differentView}"`);
      
      return differentView;
    }
  }
  
  console.log('⚠️  No clear visual differences found');
  return null;
}

function switchToView(targetView) {
  console.log(`🔄 Switching to "${targetView}" view...`);
  
  const buttons = getViewButtons();
  const targetButton = buttons[targetView];
  
  if (!targetButton) {
    console.error(`❌ Button for "${targetView}" not found`);
    return false;
  }
  
  // Try clicking the clickable element
  const element = targetButton.clickableElement;
  
  console.log(`🖱️  Clicking element:`, element);
  
  // Try multiple click methods
  try {
    // Method 1: Regular click
    element.click();
    console.log('✅ Click method 1 attempted');
    
    // Method 2: Mouse event
    const mouseEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    });
    element.dispatchEvent(mouseEvent);
    console.log('✅ Click method 2 attempted');
    
    return true;
  } catch (error) {
    console.error('❌ Click failed:', error);
    return false;
  }
}

function checkAndSwitchToMaand() {
  console.log('🎯 Checking current view and switching to Maand if needed...');
  
  const currentView = detectActiveView();
  
  if (!currentView) {
    console.error('❌ Could not detect current view');
    return { success: false, message: 'Could not detect current view' };
  }
  
  if (currentView === 'Maand') {
    console.log('✅ Already in Maand view');
    return { success: true, message: 'Already in Maand view', switched: false };
  }
  
  console.log(`🔄 Current view is "${currentView}", switching to Maand...`);
  const switchResult = switchToView('Maand');
  
  if (switchResult) {
    // Wait a moment and verify the switch worked
    setTimeout(() => {
      const newView = detectActiveView();
      console.log('🔍 Verification - new active view:', newView);
    }, 500);
    
    return { 
      success: true, 
      message: `Switched from ${currentView} to Maand`, 
      switched: true,
      previousView: currentView 
    };
  } else {
    return { 
      success: false, 
      message: `Failed to switch from ${currentView} to Maand` 
    };
  }
}

// Make functions available globally
window.getViewButtons = getViewButtons;
window.detectActiveView = detectActiveView;
window.switchToView = switchToView;
window.checkAndSwitchToMaand = checkAndSwitchToMaand;

console.log('✅ View switcher loaded!');
console.log('🚀 Available functions:');
console.log('  - detectActiveView() - detect current view');
console.log('  - switchToView("Maand") - switch to specific view');
console.log('  - checkAndSwitchToMaand() - auto-switch to Maand if needed');