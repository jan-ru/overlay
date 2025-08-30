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

// Unified overlay creation function - handles all overlay types
async function createUnifiedOverlay(overlayKey, overlayConfig) {
  console.log(`🎨 Creating ${overlayKey} overlay:`, overlayConfig.id);
  
  try {
    // Ensure overlay core is injected
    await injectOverlayCore();
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const settings = await loadSettings();
    let overlayData;
    
    // Determine overlay parameters based on type
    if (overlayConfig.type === 'week-range') {
      overlayData = getWeekRangeData(overlayKey, settings);
    } else if (overlayConfig.type === 'day-specific') {
      overlayData = getDaySpecificData(overlayKey, settings);
    } else {
      throw new Error(`Unknown overlay type: ${overlayConfig.type}`);
    }
    
    // Execute overlay creation in active tab
    const result = await executeScriptInActiveTab((config, data, type) => {
      if (!window.OverlayCore) {
        throw new Error('OverlayCore not available in content script context');
      }
      
      if (!window.overlayCore) {
        window.overlayCore = new window.OverlayCore();
      }
      
      try {
        if (type === 'week-range') {
          return window.overlayCore.createSprintOverlay(data.sprintNumber, data.startWeek, data.endWeek, config);
        } else if (type === 'day-specific') {
          return window.overlayCore.createDayOverlay(data.overlayType, data.weekNumber, data.dayNumber, config);
        }
      } catch (error) {
        console.error('❌ Error in overlay creation:', error);
        throw error;
      }
    }, [overlayConfig, overlayData, overlayConfig.type]);

    return result[0]?.result || result;
  } catch (error) {
    console.error(`❌ Error creating ${overlayKey} overlay:`, error);
    return 'error';
  }
}

// Get week range data for sprint/blok overlays  
function getWeekRangeData(overlayKey, settings) {
  switch (overlayKey) {
    case 'blok':
      const blokConfig = getCurrentBlokConfig();
      if (!blokConfig) throw new Error('No blok configuration found');
      return { startWeek: blokConfig.startWeek, endWeek: blokConfig.endWeek, sprintNumber: 0 };
      
    case 'sprint1':
      const sprint1Config = getSprintConfig(1, settings);
      return { startWeek: sprint1Config.startWeek, endWeek: sprint1Config.endWeek, sprintNumber: 1 };
      
    case 'sprint2':
      const sprint2Config = getSprintConfig(2, settings);
      return { startWeek: sprint2Config.startWeek, endWeek: sprint2Config.endWeek, sprintNumber: 2 };
      
    case 'sprint3':
      const sprint3Config = getSprintConfig(3, settings);
      return { startWeek: sprint3Config.startWeek, endWeek: sprint3Config.endWeek, sprintNumber: 3 };
      
    case 'rooster_vrij':
      const roosterVrijConfig = settings.roosterVrij;
      if (!roosterVrijConfig) throw new Error('No Rooster Vrij configuration found');
      return { startWeek: roosterVrijConfig.startWeek, endWeek: roosterVrijConfig.endWeek, sprintNumber: -1 };
      
    default:
      throw new Error(`Unknown week-range overlay: ${overlayKey}`);
  }
}

// Get day-specific data for test/assessment overlays
function getDaySpecificData(overlayKey, settings) {
  const blok = settings.bloks[getCurrentBlok()];
  const module = blok?.modules[getCurrentModule()];
  const course = module?.courses[overlayKey === 'toets' ? 'Toets' : 'Assessment'];
  
  if (!course || typeof course.weekNumber === 'undefined' || typeof course.dayNumber === 'undefined') {
    throw new Error(`Invalid day-specific course configuration for ${overlayKey}`);
  }
  
  return {
    overlayType: course.name,
    weekNumber: course.weekNumber,
    dayNumber: course.dayNumber
  };
}

// Simplified wrapper functions for backward compatibility
async function select_blok(calendarConfig) {
  return await createUnifiedOverlay('blok', { ...calendarConfig, type: 'week-range' });
}

async function select_sprint1(calendarConfig) {
  return await createUnifiedOverlay('sprint1', { ...calendarConfig, type: 'week-range' });
}

async function select_sprint2(calendarConfig) {
  return await createUnifiedOverlay('sprint2', { ...calendarConfig, type: 'week-range' });
}

async function select_sprint3(calendarConfig) {
  return await createUnifiedOverlay('sprint3', { ...calendarConfig, type: 'week-range' });
}

async function select_rooster_vrij(calendarConfig) {
  return await createUnifiedOverlay('rooster_vrij', { ...calendarConfig, type: 'week-range' });
}

async function select_toets(calendarConfig) {
  return await createUnifiedOverlay('toets', { ...calendarConfig, type: 'day-specific' });
}

async function select_assessment(calendarConfig) {
  return await createUnifiedOverlay('assessment', { ...calendarConfig, type: 'day-specific' });
}

