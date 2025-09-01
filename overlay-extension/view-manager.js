// View management module
// Handles view detection, switching, and user feedback

class ViewManager {
  constructor() {
    this.scriptExecutor = null; // Will be injected
    
    // Initialize enhanced logger if available
    this.logger = typeof enhancedLogger !== 'undefined' ? enhancedLogger : console;
    
    // Ensure errorHandler is available
    this.errorHandler = typeof errorHandler !== 'undefined' ? errorHandler : this.createFallbackErrorHandler();
  }
  
  /**
   * Creates a fallback error handler if the main one isn't available
   */
  createFallbackErrorHandler() {
    return {
      createError: (code, message, context, originalError) => ({
        success: false,
        error: { code, message, context, originalError, timestamp: new Date().toISOString() }
      }),
      createSuccess: (data, message, context) => ({
        success: true,
        data, message, context, timestamp: new Date().toISOString()
      }),
      formatForUser: (result) => result.success ? result.message : result.error.message
    };
  }

  /**
   * Sets the script executor for Chrome extension API calls
   * @param {Function} executor - Function to execute scripts in active tab
   */
  setScriptExecutor(executor) {
    this.scriptExecutor = executor;
  }

  /**
   * Detects current view and switches to Maand if needed
   * @returns {Promise<Object>} Result with view detection and switching status
   */
  async detectAndSwitchToMaandView() {
    this.logger.info && this.logger.info(
      this.logger.categories?.VIEW || 'VIEW',
      'Starting view detection and Maand switching',
      'view-detection-start'
    );
    
    if (!this.scriptExecutor) {
      this.logger.error && this.logger.error(
        this.logger.categories?.ERROR || 'ERROR',
        'Script executor not configured',
        'view-detection-error'
      );
      return this.errorHandler.createError(
        ERROR_CODES.SCRIPT_INJECTION_DENIED,
        'Script executor not configured',
        'detectAndSwitchToMaandView'
      );
    }
    
    try {
      // Inject self-contained view detection and switching logic
      const result = await this.scriptExecutor(async () => {
        // Inline view detection logic (self-contained)
        const viewNames = ['Dag', 'Week', 'Maand', 'Lijst'];
        const targetView = 'Maand';
        
        // Simple view detection function
        function detectActiveView() {
          for (const viewName of viewNames) {
            const xpath = `//*[text()='${viewName}']`;
            const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
            
            if (result.singleNodeValue) {
              const element = result.singleNodeValue;
              
              // Check if this view button is visually active
              let currentElement = element;
              for (let i = 0; i < 4 && currentElement; i++) {
                const styles = getComputedStyle(currentElement);
                const bgColor = styles.backgroundColor;
                
                if (bgColor && 
                    bgColor !== 'rgba(0, 0, 0, 0)' && 
                    bgColor !== 'rgb(255, 255, 255)' && 
                    bgColor !== 'transparent') {
                  return viewName;
                }
                
                if (styles.backgroundImage && styles.backgroundImage !== 'none') {
                  return viewName;
                }
                
                if (currentElement.getAttribute('aria-pressed') === 'true' || 
                    currentElement.classList.contains('active')) {
                  return viewName;
                }
                
                currentElement = currentElement.parentElement;
              }
            }
          }
          return null;
        }
        
        // Simple view switching function
        function switchToView(targetViewName) {
          const xpath = `//*[text()='${targetViewName}']`;
          const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
          
          if (!result.singleNodeValue) {
            return { success: false, message: `Button for ${targetViewName} not found` };
          }
          
          let clickableElement = result.singleNodeValue;
          
          // Find the actual clickable parent element
          while (clickableElement && 
                 !['BUTTON', 'TD', 'A'].includes(clickableElement.tagName) && 
                 !clickableElement.onclick) {
            clickableElement = clickableElement.parentElement;
            if (!clickableElement) break;
          }
          
          if (!clickableElement) {
            clickableElement = result.singleNodeValue;
          }
          
          try {
            clickableElement.click();
            return { success: true, message: `Clicked ${targetViewName}` };
          } catch (error) {
            return { success: false, message: `Click failed: ${error.message}` };
          }
        }
        
        // Main logic
        const currentView = detectActiveView();
        
        if (!currentView) {
          return {
            success: false,
            message: 'Could not detect current view',
            error: 'NO_VIEW_DETECTED'
          };
        }
        
        if (currentView === targetView) {
          return {
            success: true,
            data: {
              currentView: targetView,
              switched: false,
              message: 'Already in Maand view'
            }
          };
        }
        
        // Switch to target view
        const switchResult = switchToView(targetView);
        
        if (!switchResult.success) {
          return {
            success: false,
            message: `Failed to switch to ${targetView}: ${switchResult.message}`,
            error: 'SWITCH_FAILED'
          };
        }
        
        // Return success with switch information
        return {
          success: true,
          data: {
            currentView: currentView,
            switched: true,
            previousView: currentView,
            message: `Switched from ${currentView} to ${targetView}`,
            transitionConfirmed: false // Will be verified later if needed
          }
        };
      });

      // Extract result from Chrome extension API response
      const viewResult = result[0]?.result;
      
      if (!viewResult) {
        return this.errorHandler.createError(
          ERROR_CODES.SCRIPT_INJECTION_DENIED,
          'Failed to execute view detection script',
          'detectAndSwitchToMaandView'
        );
      }

      // Check if the result indicates an error
      if (!viewResult.success) {
        this.logger.warn && this.logger.warn(
          this.logger.categories?.VIEW || 'VIEW',
          `View detection failed: ${viewResult.message}`,
          'view-detection-failed'
        );
        return this.errorHandler.createError(
          ERROR_CODES.VIEW_NOT_DETECTED,
          viewResult.message || 'View detection failed',
          'detectAndSwitchToMaandView',
          viewResult.error
        );
      }

      this.logger.info && this.logger.info(
        this.logger.categories?.VIEW || 'VIEW',
        'View detection completed successfully',
        'view-detection-success'
      );
      return this.errorHandler.createSuccess(viewResult, 'View detection completed', 'detectAndSwitchToMaandView');

    } catch (error) {
      return this.errorHandler.createError(
        ERROR_CODES.SCRIPT_INJECTION_DENIED,
        `Error during view detection/switching: ${error.message}`,
        'detectAndSwitchToMaandView',
        error
      );
    }
  }

  /**
   * Shows user feedback when view is switched
   * @param {Object} viewResult - Result from view switching operation
   */
  showViewSwitchFeedback(viewResult) {
    try {
      // Create or update a temporary notification element
      let notification = document.getElementById('view-switch-notification');
      
      if (!notification) {
        notification = document.createElement('div');
        notification.id = 'view-switch-notification';
        notification.style.cssText = `
          position: fixed;
          top: 10px;
          right: 10px;
          background: #4CAF50;
          color: white;
          padding: 10px 15px;
          border-radius: 5px;
          font-size: 12px;
          z-index: 10000;
          max-width: 250px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        `;
        document.body.appendChild(notification);
      }
      
      const message = viewResult.transitionConfirmed 
        ? `✅ Switched to Maand view from ${viewResult.previousView}`
        : `🔄 Attempted to switch to Maand view from ${viewResult.previousView}`;
      
      notification.textContent = message;
      notification.style.display = 'block';
      
      // Auto-hide after 3 seconds
      setTimeout(() => {
        if (notification && notification.parentNode) {
          notification.style.display = 'none';
        }
      }, VIEW_DETECTION_CONFIG.NOTIFICATION_DISPLAY_DURATION);
      
      this.logger.info && this.logger.info(
        this.logger.categories?.UI || 'UI',
        `View switch feedback shown: ${message}`,
        'view-feedback-display'
      );
    } catch (error) {
      console.error('❌ Error showing view switch feedback:', error);
    }
  }

  /**
   * Shows error feedback to user
   * @param {Object} errorResult - Error result object
   */
  showErrorFeedback(errorResult) {
    try {
      let notification = document.getElementById('error-notification');
      
      if (!notification) {
        notification = document.createElement('div');
        notification.id = 'error-notification';
        notification.style.cssText = `
          position: fixed;
          top: 10px;
          right: 10px;
          background: #f44336;
          color: white;
          padding: 10px 15px;
          border-radius: 5px;
          font-size: 12px;
          z-index: 10000;
          max-width: 250px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        `;
        document.body.appendChild(notification);
      }
      
      const message = this.errorHandler.formatForUser(errorResult);
      notification.textContent = message;
      notification.style.display = 'block';
      
      // Auto-hide after 5 seconds for errors (longer than success messages)
      setTimeout(() => {
        if (notification && notification.parentNode) {
          notification.style.display = 'none';
        }
      }, 5000);
      
      this.logger.warn && this.logger.warn(
        this.logger.categories?.UI || 'UI',
        `Error feedback shown: ${message}`,
        'error-feedback-display'
      );
    } catch (error) {
      console.error('❌ Error showing error feedback:', error);
    }
  }
}

// Make ViewManager available globally
window.ViewManager = ViewManager;