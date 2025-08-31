// Shared view detection and switching utility
// Used by both Chrome extension and bookmarklet for consistent behavior

(function(global) {
  'use strict';

  // Configuration constants
  const VIEW_DETECTION_CONFIG = {
    VIEW_NAMES: ['Dag', 'Week', 'Maand', 'Lijst'],
    DOM_TRAVERSAL_LEVELS: 4,
    SWITCH_VERIFICATION_DELAY: 800,
    NOTIFICATION_DISPLAY_DURATION: 3000,
    TARGET_VIEW: 'Maand'
  };

  // Error result constants
  const VIEW_DETECTION_ERRORS = {
    NO_VIEW_DETECTED: 'NO_VIEW_DETECTED',
    VIEW_BUTTON_NOT_FOUND: 'VIEW_BUTTON_NOT_FOUND',
    SWITCH_CLICK_FAILED: 'SWITCH_CLICK_FAILED',
    VERIFICATION_FAILED: 'VERIFICATION_FAILED'
  };

  class ViewDetectionCore {
    constructor() {
      this.config = VIEW_DETECTION_CONFIG;
      this.errors = VIEW_DETECTION_ERRORS;
      this.fallbackStrategies = [
        this._detectByVisualAnalysis.bind(this),
        this._detectByDOMPosition.bind(this),
        this._detectByClassNames.bind(this),
        this._detectByTextContent.bind(this)
      ];
    }

    /**
     * Detects the currently active view using multiple fallback strategies
     * @returns {Object} Result object with success status and detected view
     */
    detectActiveView() {
      console.log('🎯 Detecting active view with fallback strategies...');
      
      // Try each fallback strategy in order
      for (let i = 0; i < this.fallbackStrategies.length; i++) {
        const strategy = this.fallbackStrategies[i];
        const strategyName = strategy.name.replace('bound ', '');
        
        console.log(`🔍 Strategy ${i + 1}: ${strategyName}`);
        
        try {
          const result = strategy();
          if (result.success) {
            console.log(`✅ Strategy ${i + 1} succeeded: ${result.view}`);
            return result;
          } else {
            console.log(`⚠️ Strategy ${i + 1} failed: ${result.error || 'Unknown error'}`);
          }
        } catch (error) {
          console.log(`❌ Strategy ${i + 1} threw error: ${error.message}`);
        }
      }
      
      console.log('❌ All detection strategies failed');
      return {
        success: false,
        view: null,
        error: this.errors.NO_VIEW_DETECTED,
        strategiesAttempted: this.fallbackStrategies.length
      };
    }

    /**
     * Switches to the specified target view
     * @param {string} targetView - The view to switch to
     * @returns {Object} Result object with success status and details
     */
    switchToView(targetView) {
      console.log(`🔄 Switching to "${targetView}" view...`);
      
      if (!this.config.VIEW_NAMES.includes(targetView)) {
        return {
          success: false,
          error: 'INVALID_VIEW',
          message: `Invalid view: "${targetView}". Valid views: ${this.config.VIEW_NAMES.join(', ')}`
        };
      }
      
      const xpath = `//*[text()='${targetView}']`;
      const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
      
      if (!result.singleNodeValue) {
        console.error(`❌ Button for "${targetView}" not found`);
        return {
          success: false,
          error: this.errors.VIEW_BUTTON_NOT_FOUND,
          message: `Button for "${targetView}" not found`
        };
      }
      
      const element = result.singleNodeValue;
      const clickableElement = this._findClickableParent(element);
      
      console.log(`🖱️ Clicking element:`, clickableElement);
      
      try {
        clickableElement.click();
        console.log(`✅ Successfully clicked "${targetView}" button`);
        return {
          success: true,
          targetView: targetView,
          clickedElement: clickableElement
        };
      } catch (error) {
        console.error('❌ Click failed:', error);
        return {
          success: false,
          error: this.errors.SWITCH_CLICK_FAILED,
          message: `Click failed: ${error.message}`
        };
      }
    }

    /**
     * Detects current view and switches to Maand if needed
     * @returns {Object} Complete result with detection and switching status
     */
    ensureMaandView() {
      console.log('🎯 Ensuring Maand view is active...');
      
      const detectionResult = this.detectActiveView();
      
      if (!detectionResult.success) {
        console.warn('⚠️ Could not detect current view - proceeding anyway');
        return {
          success: false,
          message: 'Could not detect current view',
          currentView: null,
          switched: false,
          error: detectionResult.error
        };
      }

      const currentView = detectionResult.view;

      if (currentView === this.config.TARGET_VIEW) {
        console.log('✅ Already in Maand view');
        return {
          success: true,
          message: 'Already in Maand view',
          currentView: this.config.TARGET_VIEW,
          switched: false
        };
      }

      console.log(`🔄 Current view is "${currentView}", switching to Maand...`);
      const switchResult = this.switchToView(this.config.TARGET_VIEW);

      if (!switchResult.success) {
        return {
          success: false,
          message: `Failed to switch from ${currentView} to Maand`,
          currentView: currentView,
          switched: false,
          error: switchResult.error
        };
      }

      return {
        success: true,
        message: `Switched from ${currentView} to Maand`,
        currentView: currentView,
        switched: true,
        previousView: currentView
      };
    }

    /**
     * Verifies that the view switch was successful
     * @returns {Promise<Object>} Verification result
     */
    async verifyMaandView() {
      return new Promise((resolve) => {
        setTimeout(() => {
          const verificationResult = this.detectActiveView();
          
          if (verificationResult.success && verificationResult.view === this.config.TARGET_VIEW) {
            console.log('✅ Switch to Maand view confirmed');
            resolve({ 
              success: true, 
              verified: true,
              currentView: this.config.TARGET_VIEW 
            });
          } else {
            console.warn('⚠️ Switch may not have completed');
            resolve({ 
              success: false, 
              verified: false,
              currentView: verificationResult.view,
              error: this.errors.VERIFICATION_FAILED 
            });
          }
        }, this.config.SWITCH_VERIFICATION_DELAY);
      });
    }

    /**
     * Complete async flow: detect, switch if needed, and verify
     * @returns {Promise<Object>} Complete result with verification
     */
    async ensureMaandViewAsync() {
      console.log('🎯 Ensuring Maand view (async)...');
      
      const result = this.ensureMaandView();
      
      if (result.switched) {
        console.log('⏳ Waiting for view transition to complete...');
        const verificationResult = await this.verifyMaandView();
        
        return {
          ...result,
          transitionConfirmed: verificationResult.verified,
          finalView: verificationResult.currentView,
          verificationError: verificationResult.error
        };
      }
      
      return result;
    }

    // Private helper methods
    
    /**
     * Checks if an element or its parents indicate active state
     * @private
     */
    _checkElementForActiveState(element, viewName) {
      let current = element;
      
      for (let i = 0; i < this.config.DOM_TRAVERSAL_LEVELS && current; i++) {
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
      
      return null;
    }

    /**
     * Finds the clickable parent element for view switching
     * @private
     */
    _findClickableParent(element) {
      let clickableElement = element;
      
      while (clickableElement && 
             !['BUTTON', 'TD', 'A'].includes(clickableElement.tagName) && 
             !clickableElement.onclick &&
             clickableElement.style.cursor !== 'pointer') {
        clickableElement = clickableElement.parentElement;
        if (!clickableElement) break;
      }
      
      return clickableElement || element;
    }

    // Fallback detection strategies

    /**
     * Strategy 1: Visual analysis (original working method)
     * @private
     */
    _detectByVisualAnalysis() {
      for (const viewName of this.config.VIEW_NAMES) {
        const xpath = `//*[text()='${viewName}']`;
        const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        
        if (result.singleNodeValue) {
          const element = result.singleNodeValue;
          const detectedView = this._checkElementForActiveState(element, viewName);
          
          if (detectedView) {
            return {
              success: true,
              view: detectedView,
              strategy: 'visual-analysis'
            };
          }
        }
      }
      
      return {
        success: false,
        error: 'No visual indicators found',
        strategy: 'visual-analysis'
      };
    }

    /**
     * Strategy 2: DOM position analysis
     * @private  
     */
    _detectByDOMPosition() {
      const buttons = [];
      
      for (const viewName of this.config.VIEW_NAMES) {
        const xpath = `//*[text()='${viewName}']`;
        const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        
        if (result.singleNodeValue) {
          const element = result.singleNodeValue;
          const container = element.closest('td, button, div');
          
          if (container) {
            const rect = container.getBoundingClientRect();
            buttons.push({
              name: viewName,
              element: container,
              rect: rect,
              zIndex: window.getComputedStyle(container).zIndex
            });
          }
        }
      }
      
      if (buttons.length === 0) {
        return { success: false, error: 'No buttons found for position analysis', strategy: 'dom-position' };
      }
      
      // Look for button with highest z-index or different position
      const sortedByZIndex = buttons.sort((a, b) => parseInt(b.zIndex || 0) - parseInt(a.zIndex || 0));
      const highestZIndex = sortedByZIndex[0];
      
      if (parseInt(highestZIndex.zIndex || 0) > 0) {
        return {
          success: true,
          view: highestZIndex.name,
          strategy: 'dom-position'
        };
      }
      
      return { success: false, error: 'No position indicators found', strategy: 'dom-position' };
    }

    /**
     * Strategy 3: CSS class name analysis
     * @private
     */
    _detectByClassNames() {
      const activeClassPatterns = [
        /active/i, /selected/i, /current/i, /pressed/i, /focused/i, /highlight/i
      ];
      
      for (const viewName of this.config.VIEW_NAMES) {
        const xpath = `//*[text()='${viewName}']`;
        const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        
        if (result.singleNodeValue) {
          const element = result.singleNodeValue;
          let current = element;
          
          // Check element and parents for active class patterns
          for (let i = 0; i < this.config.DOM_TRAVERSAL_LEVELS && current; i++) {
            const className = current.className || '';
            const classList = className.split(' ');
            
            const hasActiveClass = classList.some(cls => 
              activeClassPatterns.some(pattern => pattern.test(cls))
            );
            
            if (hasActiveClass) {
              return {
                success: true,
                view: viewName,
                strategy: 'class-names',
                detectedClass: className
              };
            }
            
            current = current.parentElement;
          }
        }
      }
      
      return { success: false, error: 'No active class patterns found', strategy: 'class-names' };
    }

    /**
     * Strategy 4: Text content and font analysis
     * @private
     */
    _detectByTextContent() {
      const buttons = [];
      
      for (const viewName of this.config.VIEW_NAMES) {
        const xpath = `//*[text()='${viewName}']`;
        const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        
        if (result.singleNodeValue) {
          const element = result.singleNodeValue;
          const styles = window.getComputedStyle(element);
          
          buttons.push({
            name: viewName,
            element: element,
            fontWeight: styles.fontWeight,
            color: styles.color,
            textDecoration: styles.textDecoration,
            fontSize: styles.fontSize
          });
        }
      }
      
      if (buttons.length === 0) {
        return { success: false, error: 'No buttons found for text analysis', strategy: 'text-content' };
      }
      
      // Look for button with bold font or different color
      const boldButton = buttons.find(btn => 
        btn.fontWeight === 'bold' || 
        parseInt(btn.fontWeight) >= 600 ||
        btn.textDecoration.includes('underline')
      );
      
      if (boldButton) {
        return {
          success: true,
          view: boldButton.name,
          strategy: 'text-content',
          indicator: 'bold-font'
        };
      }
      
      // Look for unique color
      const colors = buttons.map(btn => btn.color);
      const uniqueColors = colors.filter((color, index) => colors.indexOf(color) === index);
      
      if (uniqueColors.length > 1) {
        // Find the less common color (might be active state)
        const colorCounts = {};
        colors.forEach(color => {
          colorCounts[color] = (colorCounts[color] || 0) + 1;
        });
        
        const sortedColors = Object.entries(colorCounts).sort((a, b) => a[1] - b[1]);
        const rareColor = sortedColors[0][0];
        const rareColorButton = buttons.find(btn => btn.color === rareColor);
        
        if (rareColorButton) {
          return {
            success: true,
            view: rareColorButton.name,
            strategy: 'text-content',
            indicator: 'unique-color'
          };
        }
      }
      
      return { success: false, error: 'No text styling indicators found', strategy: 'text-content' };
    }
  }

  // Make ViewDetectionCore available globally
  global.ViewDetectionCore = ViewDetectionCore;
  global.VIEW_DETECTION_CONFIG = VIEW_DETECTION_CONFIG;
  global.VIEW_DETECTION_ERRORS = VIEW_DETECTION_ERRORS;

  // Convenience instance for immediate use
  global.viewDetection = new ViewDetectionCore();

  console.log('✅ View Detection Core loaded!');

})(typeof window !== 'undefined' ? window : this);