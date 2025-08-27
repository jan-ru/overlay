// Multicolor overlay functions

// Multicolor banners with calendar-anchored positioning
async function createMulticolorBanners() {
  console.log('🌈 Creating multicolor banners');
  
  try {
    await executeScriptInActiveTab((config, selectors) => {
      console.log('🚀 Multicolor script executing');
      
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
      
      const existing = document.getElementById("custom-multicolor-overlay");
      if (existing) {
        console.log('🗑️ Removing existing multicolor overlay');
        existing.remove();
        
        // Remove associated resize handler
        if (window.__overlayResizeHandler_multicolor) {
          window.removeEventListener('resize', window.__overlayResizeHandler_multicolor);
          delete window.__overlayResizeHandler_multicolor;
        }
        
        return 'removed';
      }

      const calendar = findCalendarElement(selectors);
      const overlay = document.createElement("div");
      overlay.id = "custom-multicolor-overlay";
      
      if (calendar) {
        // Use calendar dimensions for anchored positioning
        const rect = calendar.getBoundingClientRect();
        
        Object.assign(overlay.style, {
          position: "fixed",
          top: `${rect.top}px`,
          left: `${rect.left}px`,
          width: `${rect.width}px`,
          height: `${rect.height}px`,
          pointerEvents: "none",
          zIndex: "999999",
          display: "flex",
          flexDirection: "column"
        });
        
        console.log('📐 Multicolor overlay positioned over calendar:', {
          width: rect.width,
          height: rect.height,
          top: rect.top,
          left: rect.left
        });
      } else {
        // Fallback to responsive positioning
        Object.assign(overlay.style, {
          position: "fixed",
          top: "152px",
          left: "0",
          width: "80vw",
          height: "calc(100vh - 152px)",
          pointerEvents: "none",
          zIndex: "999999",
          display: "flex",
          flexDirection: "column"
        });
        
        console.log('📐 Using fallback responsive positioning for multicolor');
      }
      
      document.body.appendChild(overlay);

      // Create colored banners that fill the overlay area
      config.colors.forEach((color, index) => {
        const banner = document.createElement("div");
        Object.assign(banner.style, {
          width: "100%",
          height: `${100 / config.colors.length}%`,
          background: color,
          opacity: "0.3"
        });
        overlay.appendChild(banner);
      });

      // Add resize handler for responsiveness
      function updateMulticolorOverlayOnResize() {
        const calendar = findCalendarElement(selectors);
        const currentOverlay = document.getElementById("custom-multicolor-overlay");
        if (calendar && currentOverlay) {
          const rect = calendar.getBoundingClientRect();
          Object.assign(currentOverlay.style, {
            top: `${rect.top}px`,
            left: `${rect.left}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`
          });
        }
      }
      
      // Store resize handler
      let resizeTimeout;
      window.__overlayResizeHandler_multicolor = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(updateMulticolorOverlayOnResize, 150);
      };
      window.addEventListener('resize', window.__overlayResizeHandler_multicolor);

      console.log('✅ Multicolor overlay created with calendar anchoring');
      return 'created';
    }, [MULTICOLOR_CONFIG, CALENDAR_SELECTORS]);
  } catch (error) {
    console.error('❌ Error creating multicolor banners:', error);
  }
}