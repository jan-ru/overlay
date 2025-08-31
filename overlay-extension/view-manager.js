// View management module
// Handles view detection, switching, and user feedback

class ViewManager {
  constructor() {
    this.scriptExecutor = null; // Will be injected
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
    console.log('🎯 Detecting current view and switching to Maand if needed...');
    
    if (!this.scriptExecutor) {
      return errorHandler.createError(
        ERROR_CODES.SCRIPT_INJECTION_DENIED,
        'Script executor not configured',
        'detectAndSwitchToMaandView'
      );
    }
    
    try {
      // Inject view detection utility and perform async detection/switching
      const result = await this.scriptExecutor(async () => {
        // Ensure ViewDetectionCore is available in the page context
        if (typeof ViewDetectionCore === 'undefined') {
          console.error('❌ ViewDetectionCore not available in page context');
          return {
            success: false,
            error: 'VIEW_DETECTION_CORE_MISSING',
            message: 'ViewDetectionCore utility not loaded'
          };
        }
        
        const detector = new ViewDetectionCore();
        return await detector.ensureMaandViewAsync();
      });

      // Extract result from Chrome extension API response
      const viewResult = result[0]?.result;
      
      if (!viewResult) {
        return errorHandler.createError(
          ERROR_CODES.SCRIPT_INJECTION_DENIED,
          'Failed to execute view detection script',
          'detectAndSwitchToMaandView'
        );
      }

      // Check if the result indicates an error
      if (!viewResult.success) {
        return errorHandler.createError(
          ERROR_CODES.VIEW_NOT_DETECTED,
          viewResult.message || 'View detection failed',
          'detectAndSwitchToMaandView',
          viewResult.error
        );
      }

      return errorHandler.createSuccess(viewResult, 'View detection completed', 'detectAndSwitchToMaandView');

    } catch (error) {
      return errorHandler.createError(
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
      
      console.log('📢 View switch feedback shown:', message);
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
      
      const message = errorHandler.formatForUser(errorResult);
      notification.textContent = message;
      notification.style.display = 'block';
      
      // Auto-hide after 5 seconds for errors (longer than success messages)
      setTimeout(() => {
        if (notification && notification.parentNode) {
          notification.style.display = 'none';
        }
      }, 5000);
      
      console.log('📢 Error feedback shown:', message);
    } catch (error) {
      console.error('❌ Error showing error feedback:', error);
    }
  }
}

// Make ViewManager available globally
window.ViewManager = ViewManager;