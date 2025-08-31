// Final view management system - combines working detection and switching

function detectActiveView() {
  console.log('🎯 Detecting active view...');
  
  const viewNames = ['Dag', 'Week', 'Maand', 'Lijst'];
  
  for (const viewName of viewNames) {
    const xpath = `//*[text()='${viewName}']`;
    const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
    
    if (result.singleNodeValue) {
      const element = result.singleNodeValue;
      
      // Check element and parents for pressed/active indicators
      let current = element;
      
      for (let i = 0; i < 4 && current; i++) {
        const styles = window.getComputedStyle(current);
        
        // Look for any non-transparent, non-white background
        const bg = styles.backgroundColor;
        const bgImage = styles.backgroundImage;
        
        if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'rgb(255, 255, 255)' && bg !== 'transparent') {
          console.log(`✅ Active view detected: "${viewName}" (background: ${bg})`);
          return viewName;
        }
        
        if (bgImage && bgImage !== 'none') {
          console.log(`✅ Active view detected: "${viewName}" (background image: ${bgImage})`);
          return viewName;
        }
        
        // Check for pressed/selected attributes
        if (current.getAttribute('aria-pressed') === 'true' ||
            current.getAttribute('aria-selected') === 'true' ||
            current.classList.contains('pressed') ||
            current.classList.contains('selected') ||
            current.classList.contains('active')) {
          console.log(`✅ Active view detected: "${viewName}" (has active attribute/class)`);
          return viewName;
        }
        
        current = current.parentElement;
      }
    }
  }
  
  console.log('❌ No active view detected');
  return null;
}

function switchToView(targetView) {
  console.log(`🔄 Switching to "${targetView}" view...`);
  
  const viewNames = ['Dag', 'Week', 'Maand', 'Lijst'];
  
  if (!viewNames.includes(targetView)) {
    console.error(`❌ Invalid view: "${targetView}". Valid views: ${viewNames.join(', ')}`);
    return false;
  }
  
  const xpath = `//*[text()='${targetView}']`;
  const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
  
  if (!result.singleNodeValue) {
    console.error(`❌ Button for "${targetView}" not found`);
    return false;
  }
  
  const element = result.singleNodeValue;
  
  // Find the clickable parent (likely a button, td, or div)
  let clickableElement = element;
  
  while (clickableElement && 
         !['BUTTON', 'TD', 'A'].includes(clickableElement.tagName) && 
         !clickableElement.onclick &&
         clickableElement.style.cursor !== 'pointer') {
    clickableElement = clickableElement.parentElement;
    if (!clickableElement) break;
  }
  
  if (!clickableElement) clickableElement = element;
  
  console.log(`🖱️  Clicking element:`, clickableElement);
  
  try {
    // Try regular click
    clickableElement.click();
    console.log(`✅ Successfully clicked "${targetView}" button`);
    return true;
  } catch (error) {
    console.error('❌ Click failed:', error);
    return false;
  }
}

function ensureMaandView() {
  console.log('🎯 Ensuring Maand view is active...');
  
  const currentView = detectActiveView();
  
  if (!currentView) {
    return {
      success: false,
      message: 'Could not detect current view',
      currentView: null,
      switched: false
    };
  }
  
  if (currentView === 'Maand') {
    console.log('✅ Already in Maand view');
    return {
      success: true,
      message: 'Already in Maand view',
      currentView: 'Maand',
      switched: false
    };
  }
  
  console.log(`🔄 Current view is "${currentView}", switching to Maand...`);
  
  const switchResult = switchToView('Maand');
  
  if (!switchResult) {
    return {
      success: false,
      message: `Failed to switch from ${currentView} to Maand`,
      currentView: currentView,
      switched: false
    };
  }
  
  // Wait a moment and verify the switch worked
  setTimeout(() => {
    const newView = detectActiveView();
    console.log('🔍 Verification after switch:', newView);
    
    if (newView === 'Maand') {
      console.log('✅ Switch to Maand view confirmed');
    } else {
      console.warn('⚠️  Switch may not have completed, detected view:', newView);
    }
  }, 500);
  
  return {
    success: true,
    message: `Switched from ${currentView} to Maand`,
    currentView: currentView,
    switched: true,
    previousView: currentView
  };
}

function waitForMaandView(maxAttempts = 5, delayMs = 200) {
  return new Promise((resolve) => {
    let attempts = 0;
    
    function checkView() {
      attempts++;
      const currentView = detectActiveView();
      
      if (currentView === 'Maand') {
        console.log(`✅ Maand view confirmed after ${attempts} attempts`);
        resolve({ success: true, attempts: attempts });
        return;
      }
      
      if (attempts >= maxAttempts) {
        console.warn(`⚠️  Maand view not confirmed after ${maxAttempts} attempts`);
        resolve({ success: false, attempts: attempts, currentView: currentView });
        return;
      }
      
      console.log(`🔄 Attempt ${attempts}: view is "${currentView}", waiting...`);
      setTimeout(checkView, delayMs);
    }
    
    checkView();
  });
}

async function ensureMaandViewAsync() {
  console.log('🎯 Ensuring Maand view (async)...');
  
  const result = ensureMaandView();
  
  if (result.switched) {
    console.log('⏳ Waiting for view transition to complete...');
    const waitResult = await waitForMaandView();
    
    return {
      ...result,
      transitionConfirmed: waitResult.success,
      finalView: waitResult.currentView
    };
  }
  
  return result;
}

// Make functions available globally
window.detectActiveView = detectActiveView;
window.switchToView = switchToView;
window.ensureMaandView = ensureMaandView;
window.ensureMaandViewAsync = ensureMaandViewAsync;

console.log('✅ View manager loaded!');
console.log('🚀 Available functions:');
console.log('  - detectActiveView() - detect current active view');
console.log('  - switchToView("ViewName") - switch to any view');
console.log('  - ensureMaandView() - ensure Maand view is active');
console.log('  - ensureMaandViewAsync() - ensure Maand view with confirmation');