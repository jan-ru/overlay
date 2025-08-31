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
    }

    /**
     * Detects the currently active view using visual background analysis
     * @returns {Object} Result object with success status and detected view
     */
    detectActiveView() {
      console.log('🎯 Detecting active view...');
      
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
              error: null
            };
          }
        }
      }
      
      console.log('❌ No active view detected');
      return {
        success: false,
        view: null,
        error: this.errors.NO_VIEW_DETECTED
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
  }

  // Make ViewDetectionCore available globally
  global.ViewDetectionCore = ViewDetectionCore;
  global.VIEW_DETECTION_CONFIG = VIEW_DETECTION_CONFIG;
  global.VIEW_DETECTION_ERRORS = VIEW_DETECTION_ERRORS;

  // Convenience instance for immediate use
  global.viewDetection = new ViewDetectionCore();

  console.log('✅ View Detection Core loaded!');

})(typeof window !== 'undefined' ? window : this);