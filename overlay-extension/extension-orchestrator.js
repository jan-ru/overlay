// Extension orchestrator
// Main coordination class that manages all extension components with separated concerns

class ExtensionOrchestrator {
  constructor() {
    this.pageValidator = new PageValidator();
    this.viewManager = new ViewManager();
    this.uiManager = new UIManager();
    this.initialized = false;
  }

  /**
   * Utility function to execute scripts in active tab
   * @param {Function} func - Function to execute
   * @param {Array} args - Arguments to pass to function
   * @returns {Promise} Promise resolving to script execution result
   */
  async executeScriptInActiveTab(func, args = []) {
    return new Promise((resolve, reject) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (chrome.runtime.lastError) {
          console.error('Tab query error:', chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
          return;
        }
        
        if (!tabs || !tabs[0]) {
          console.error('No active tab found');
          reject(new Error('No active tab found'));
          return;
        }

        console.log('Executing script in tab:', tabs[0].id);
        
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: func,
          args: args
        }).then(result => {
          console.log('Script executed successfully:', result);
          resolve(result);
        }).catch(error => {
          console.error('Script execution failed:', error);
          reject(error);
        });
      });
    });
  }

  /**
   * Main initialization method with comprehensive error handling and user feedback
   */
  async initialize() {
    if (this.initialized) {
      console.log('⚠️ Extension already initialized');
      return;
    }

    try {
      console.log('🚀 Starting extension initialization...');

      // Step 1: Page validation
      console.log('🔍 Step 1: Validating current page...');
      const pageValidationResult = await this.pageValidator.validateCurrentPage();
      
      if (!pageValidationResult.success) {
        this.pageValidator.showPageError();
        this.viewManager.showErrorFeedback(pageValidationResult);
        console.error('❌ Initialization stopped: Page validation failed');
        return;
      }
      
      this.pageValidator.showMainContent();
      console.log('✅ Step 1 complete: Page validation passed');

      // Step 2: Configure view manager
      console.log('🔧 Step 2: Configuring view manager...');
      this.viewManager.setScriptExecutor(this.executeScriptInActiveTab.bind(this));
      console.log('✅ Step 2 complete: View manager configured');

      // Step 3: View detection and switching
      console.log('🎯 Step 3: Checking view and switching if needed...');
      const viewResult = await this.viewManager.detectAndSwitchToMaandView();
      
      if (viewResult.success) {
        const viewData = viewResult.data;
        if (viewData.switched) {
          console.log(`✅ View switched successfully: ${viewData.message}`);
          this.viewManager.showViewSwitchFeedback(viewData);
        } else if (viewData.success && !viewData.switched) {
          console.log('✅ Already in correct view');
        }
      } else {
        console.warn('⚠️ View detection/switching failed, but continuing with initialization');
        // Show warning but don't stop initialization
        this.uiManager.showSuccessFeedback('⚠️ View detection failed - extension may work better in Maand view');
      }
      console.log('✅ Step 3 complete: View management handled');

      // Step 4: Load settings
      console.log('📋 Step 4: Loading settings...');
      try {
        await loadSettings();
        this.uiManager.setCachedSettings(cachedSettings);
        logger.debug('✅ Settings loaded successfully');
      } catch (settingsError) {
        const error = errorHandler.createError(
          ERROR_CODES.MISSING_SETTINGS,
          `Failed to load settings: ${settingsError.message}`,
          'loadSettings',
          settingsError
        );
        this.viewManager.showErrorFeedback(error);
        throw settingsError; // Stop initialization if settings can't load
      }
      console.log('✅ Step 4 complete: Settings loaded');

      // Step 5: UI setup
      console.log('🎨 Step 5: Setting up user interface...');
      this.uiManager.updateTitle();
      this.uiManager.populateCourseDropdown();
      this.uiManager.setupCourseChangeHandler();
      this.uiManager.setupOverlayButtonListeners();
      console.log('✅ Step 5 complete: UI setup finished');

      // Step 6: Finalization
      this.initialized = true;
      console.log('🎉 Extension initialization complete!');
      this.uiManager.showSuccessFeedback('✅ Calendar Overlay extension ready');
      
    } catch (error) {
      const initError = errorHandler.createError(
        ERROR_CODES.UI_ELEMENT_MISSING,
        `Extension initialization failed: ${error.message}`,
        'initializeExtension',
        error
      );
      
      console.error('❌ Extension initialization failed:', errorHandler.formatForUser(initError));
      this.pageValidator.showPageError();
      this.viewManager.showErrorFeedback(initError);
      
      // Attempt graceful degradation
      this.attemptGracefulDegradation(error);
    }
  }

  /**
   * Attempts to provide limited functionality when full initialization fails
   * @param {Error} initError - The initialization error
   */
  attemptGracefulDegradation(initError) {
    console.log('🔄 Attempting graceful degradation...');
    
    try {
      // Show main content even if initialization partially failed
      this.pageValidator.showMainContent();
      
      // Try to at least show the title
      this.uiManager.updateTitle();
      
      // Show a degraded mode message
      const degradedMessage = 'Extension running in limited mode due to initialization error';
      this.uiManager.showSuccessFeedback(degradedMessage);
      
      console.log('⚡ Extension running in degraded mode');
    } catch (degradationError) {
      console.error('❌ Graceful degradation also failed:', degradationError);
    }
  }

  /**
   * Reinitializes the extension (for error recovery)
   */
  async reinitialize() {
    console.log('🔄 Reinitializing extension...');
    this.initialized = false;
    
    // Clear any existing error state
    const errorNotification = document.getElementById('error-notification');
    if (errorNotification) {
      errorNotification.style.display = 'none';
    }
    
    await this.initialize();
  }

  /**
   * Gets current extension status
   * @returns {Object} Status information
   */
  getStatus() {
    return {
      initialized: this.initialized,
      components: {
        pageValidator: !!this.pageValidator,
        viewManager: !!this.viewManager,
        uiManager: !!this.uiManager
      }
    };
  }
}

// Make ExtensionOrchestrator available globally
window.ExtensionOrchestrator = ExtensionOrchestrator;