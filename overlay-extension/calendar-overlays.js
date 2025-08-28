// Calendar overlay functions using overlay-core.js

// Extension-specific overlay implementation
// Uses the shared overlay-core.js library injected into content context

// Load and inject overlay-core.js into the content script context using Chrome scripting API
async function injectOverlayCore() {
  try {
    console.log('🔧 Injecting OverlayCore using Chrome scripting API...');
    
    // First check if already loaded
    const checkResult = await executeScriptInActiveTab(() => {
      console.log('🔍 Checking if OverlayCore exists:', typeof window.OverlayCore);
      return typeof window.OverlayCore !== 'undefined';
    });
    
    if (checkResult[0]?.result) {
      console.log('✅ OverlayCore already available');
      return 'already_loaded';
    }
    
    // Inject the overlay-core.js file directly into the webpage context
    console.log('📥 Injecting overlay-core.js file...');
    
    return new Promise((resolve, reject) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (chrome.runtime.lastError || !tabs[0]) {
          reject(new Error('No active tab found'));
          return;
        }
        
        // Inject the script file directly
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          files: ['overlay-core.js']
        }).then((results) => {
          console.log('✅ overlay-core.js injected successfully');
          
          // Verify the injection worked
          setTimeout(() => {
            executeScriptInActiveTab(() => {
              console.log('🔍 OverlayCore check after injection:', typeof window.OverlayCore);
              console.log('🔍 OVERLAY_CORE_CONFIG check:', typeof window.OVERLAY_CORE_CONFIG);
              return {
                overlayCore: typeof window.OverlayCore,
                config: typeof window.OVERLAY_CORE_CONFIG
              };
            }).then((verifyResult) => {
              const result = verifyResult[0]?.result;
              if (result?.overlayCore === 'function') {
                console.log('✅ OverlayCore successfully available in webpage context');
                resolve('injected');
              } else {
                console.error('❌ OverlayCore not available after injection:', result);
                reject(new Error('OverlayCore not available after injection'));
              }
            }).catch(reject);
          }, 200);
          
        }).catch((error) => {
          console.error('❌ Failed to inject overlay-core.js:', error);
          reject(error);
        });
      });
    });
  } catch (error) {
    console.error('❌ Error in injectOverlayCore:', error);
    throw error;
  }
}

// Wrapper function to use core overlay creation in extension context
async function select_sprint(sprintNumber, startWeek, endWeek, calendarConfig) {
  console.log(`📅 Toggling select_sprint${sprintNumber} overlay:`, calendarConfig.id, `weeks ${startWeek}-${endWeek}`);
  
  try {
    // Ensure overlay core is injected
    await injectOverlayCore();
    
    // Brief delay since we now use proper script injection
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Execute the core overlay creation logic in the active tab
    const result = await executeScriptInActiveTab((config, sprintNum, start, end) => {
      console.log('🎯 Starting overlay creation with:', { config: config.id, sprintNum, start, end });
      
      // Wait for OverlayCore to be available (with timeout)
      // Direct execution since we should have OverlayCore available now
      console.log('🔍 Final OverlayCore check before execution:', typeof window.OverlayCore);
      
      if (!window.OverlayCore) {
        throw new Error('OverlayCore not available in content script context');
      }
      
      console.log('✅ OverlayCore found! Creating overlay...');
      
      // Initialize overlay core instance if not exists
      if (!window.overlayCore) {
        console.log('🏗️ Creating new OverlayCore instance...');
        window.overlayCore = new window.OverlayCore();
      }
      
      try {
        // Call createSprintOverlay and return result
        console.log('🎨 Calling createSprintOverlay...');
        const result = window.overlayCore.createSprintOverlay(sprintNum, start, end, config);
        console.log('🎉 Overlay creation result:', result);
        return result;
      } catch (error) {
        console.error('❌ Error in createSprintOverlay:', error);
        throw error;
      }
    }, [calendarConfig, sprintNumber, startWeek, endWeek]);

    return result[0]?.result || result;
  } catch (error) {
    console.error(`❌ Error toggling select_sprint${sprintNumber} overlay:`, error);
    return 'error';
  }
}

// Generic overlay function that handles both bloks and sprints
async function createOverlay(type, number, calendarConfig) {
  try {
    const settings = await loadSettings();
    let startWeek, endWeek, sprintNumber;
    
    if (type === 'blok') {
      const blokConfig = getCurrentBlokConfig();
      if (!blokConfig) {
        throw new Error('No blok configuration found');
      }
      startWeek = blokConfig.startWeek;
      endWeek = blokConfig.endWeek;
      sprintNumber = 0; // Use 0 for blok in display logic
    } else if (type === 'sprint') {
      const sprintConfig = getSprintConfig(number, settings);
      startWeek = sprintConfig.startWeek;
      endWeek = sprintConfig.endWeek;
      sprintNumber = number;
    } else {
      throw new Error(`Unknown overlay type: ${type}`);
    }
    
    return await select_sprint(sprintNumber, startWeek, endWeek, calendarConfig);
  } catch (error) {
    console.error(`❌ Error in ${type}${number || ''}:`, error);
    return 'error';
  }
}

// Wrapper functions using the generic overlay function
async function select_blok(calendarConfig) {
  return await createOverlay('blok', null, calendarConfig);
}

async function select_sprint1(calendarConfig) {
  return await createOverlay('sprint', 1, calendarConfig);
}

async function select_sprint2(calendarConfig) {
  return await createOverlay('sprint', 2, calendarConfig);
}

async function select_sprint3(calendarConfig) {
  return await createOverlay('sprint', 3, calendarConfig);
}

async function select_rooster_vrij(calendarConfig) {
  console.log('🟣 Toggling Rooster Vrij overlay:', calendarConfig.id);
  
  try {
    // Ensure overlay core is injected
    await injectOverlayCore();
    
    // Brief delay since we now use proper script injection
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Execute the Rooster Vrij overlay creation logic in the active tab
    const result = await executeScriptInActiveTab((config) => {
      console.log('🎯 Starting Rooster Vrij overlay creation with:', { config: config.id });
      
      if (!window.OverlayCore) {
        throw new Error('OverlayCore not available in content script context');
      }
      
      console.log('✅ OverlayCore found! Creating Rooster Vrij overlay...');
      
      // Initialize overlay core instance if not exists
      if (!window.overlayCore) {
        console.log('🏗️ Creating new OverlayCore instance...');
        window.overlayCore = new window.OverlayCore();
      }
      
      try {
        // Get Rooster Vrij configuration - hardcoded for now since settings not available in content context
        const roosterVrijConfig = {
          startWeek: 43,
          endWeek: 43
        };
        
        // Call createRoosterVrijOverlay and return result
        console.log('🎨 Calling createRoosterVrijOverlay...');
        const result = window.overlayCore.createRoosterVrijOverlay(
          roosterVrijConfig.startWeek, 
          roosterVrijConfig.endWeek, 
          config
        );
        console.log('🎉 Rooster Vrij overlay creation result:', result);
        return result;
      } catch (error) {
        console.error('❌ Error in createRoosterVrijOverlay:', error);
        throw error;
      }
    }, [calendarConfig]);

    return result[0]?.result || result;
  } catch (error) {
    console.error('❌ Error in Rooster Vrij overlay:', error);
    return 'error';
  }
}

// Placeholder functions for future implementation
async function select_toets(calendarConfig) {
  console.log('📝 Toets overlay - placeholder function');
  return 'placeholder';
}

async function select_assessment(calendarConfig) {
  console.log('📋 Assessment overlay - placeholder function');
  return 'placeholder';
}

