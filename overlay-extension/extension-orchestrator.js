// Extension orchestrator
// Main coordination class that manages all extension components with separated concerns

class ExtensionOrchestrator {
  constructor() {
    this.pageValidator = new PageValidator();
    this.viewManager = new ViewManager();
    this.uiManager = new UIManager();
    this.initialized = false;
    
    // Initialize enhanced utilities if available
    this.logger = typeof enhancedLogger !== 'undefined' ? enhancedLogger : console;
    this.overlayValidator = typeof overlayValidator !== 'undefined' ? overlayValidator : null;
    
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
      this.logger.warn && this.logger.warn(this.logger.categories?.INIT || 'INIT', 'Extension already initialized');
      return;
    }

    // Start initialization timer
    if (this.logger.startTimer) {
      this.logger.startTimer('extension-init', this.logger.categories?.INIT || 'INIT');
    }

    try {
      this.logger.info && this.logger.info(this.logger.categories?.INIT || 'INIT', 'Starting extension initialization');

      // Step 1: Page validation
      this.logger.logInitStep && this.logger.logInitStep('Page validation started');
      const pageValidationResult = await this.pageValidator.validateCurrentPage();
      
      if (!pageValidationResult.success) {
        this.pageValidator.showPageError();
        this.viewManager.showErrorFeedback(pageValidationResult);
        this.logger.logInitStep && this.logger.logInitStep('Page validation', false, pageValidationResult);
        if (this.logger.endTimer) this.logger.endTimer('extension-init');
        return;
      }
      
      this.pageValidator.showMainContent();
      this.logger.logInitStep && this.logger.logInitStep('Page validation', true);

      // Step 2: Configure managers  
      this.logger.logInitStep && this.logger.logInitStep('Manager configuration started');
      this.viewManager.setScriptExecutor(this.executeScriptInActiveTab.bind(this));
      this.uiManager.setScriptExecutor(this.executeScriptInActiveTab.bind(this));
      this.logger.logInitStep && this.logger.logInitStep('Manager configuration', true);

      // Step 3: View detection and switching
      this.logger.logInitStep && this.logger.logInitStep('View detection and switching started');
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
        const error = this.errorHandler.createError(
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

      // Step 6: Enable overlay validation if available
      if (this.overlayValidator) {
        this.logger.logInitStep && this.logger.logInitStep('Overlay validation system enabled', true);
        // Set up validation hooks for overlay operations
        this.setupOverlayValidationHooks();
      }

      // Step 7: Finalization
      this.initialized = true;
      
      // Complete initialization timing
      if (this.logger.endTimer) {
        const duration = this.logger.endTimer('extension-init');
        this.logger.info && this.logger.info(
          this.logger.categories?.PERFORMANCE || 'PERF', 
          `Extension initialization completed in ${duration?.toFixed(2) || 'unknown'}ms`
        );
      }
      
      this.logger.logInitStep && this.logger.logInitStep('Complete extension initialization', true);
      this.uiManager.showSuccessFeedback('✅ Calendar Overlay extension ready');
      
    } catch (error) {
      const initError = this.errorHandler.createError(
        ERROR_CODES.UI_ELEMENT_MISSING,
        `Extension initialization failed: ${error.message}`,
        'initializeExtension',
        error
      );
      
      console.error('❌ Extension initialization failed:', this.errorHandler.formatForUser(initError));
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
   * Sets up overlay validation hooks for automatic validation
   */
  setupOverlayValidationHooks() {
    if (!this.overlayValidator) return;

    // Override the UI manager's overlay creation to include validation
    const originalUpdateButtonState = this.uiManager.updateButtonState;
    
    this.uiManager.updateButtonState = async (button, config, result) => {
      // Call original method
      originalUpdateButtonState.call(this.uiManager, button, config, result);
      
      // Add validation for created overlays
      if (result === 'created' && config.overlayId) {
        this.logger.debug && this.logger.debug(
          this.logger.categories?.OVERLAY || 'OVERLAY',
          `Starting validation for overlay: ${config.overlayId}`
        );
        
        setTimeout(async () => {
          try {
            const validationResult = await this.overlayValidator.validateOverlay(config.overlayId, {
              expectedParent: 'body',
              overlayType: config.id
            });
            
            if (validationResult.success) {
              this.logger.info && this.logger.info(
                this.logger.categories?.OVERLAY || 'OVERLAY',
                `Overlay validation passed: ${config.overlayId} (score: ${validationResult.data?.overallScore?.toFixed(2)})`
              );
            } else {
              this.logger.warn && this.logger.warn(
                this.logger.categories?.OVERLAY || 'OVERLAY', 
                `Overlay validation failed: ${config.overlayId}`,
                null,
                validationResult.error
              );
              
              // Show user feedback for validation failure
              this.uiManager.showSuccessFeedback(`⚠️ ${config.id} overlay may not be fully visible`);
            }
          } catch (error) {
            this.logger.error && this.logger.error(
              this.logger.categories?.ERROR || 'ERROR',
              `Overlay validation error: ${error.message}`,
              `validation:${config.overlayId}`,
              error
            );
          }
        }, VISIBILITY_CONFIG?.VALIDATION_DELAY_MS || 100);
      }
    };

    this.logger.debug && this.logger.debug(
      this.logger.categories?.INIT || 'INIT',
      'Overlay validation hooks installed'
    );
  }

  /**
   * Gets comprehensive extension status including performance metrics
   * @returns {Object} Status information
   */
  getStatus() {
    const status = {
      initialized: this.initialized,
      components: {
        pageValidator: !!this.pageValidator,
        viewManager: !!this.viewManager,
        uiManager: !!this.uiManager,
        enhancedLogger: !!this.logger?.startTimer,
        overlayValidator: !!this.overlayValidator
      }
    };

    // Add logger stats if available
    if (this.logger?.getHistory) {
      const logHistory = this.logger.getHistory();
      status.logging = {
        totalEntries: logHistory.length,
        errorCount: logHistory.filter(entry => entry.level === 3).length,
        warningCount: logHistory.filter(entry => entry.level === 2).length
      };
    }

    // Add overlay validation stats if available
    if (this.overlayValidator?.getValidationStats) {
      status.overlayValidation = this.overlayValidator.getValidationStats();
    }

    return status;
  }

  /**
   * Exports diagnostic information for debugging
   * @returns {Object} Diagnostic data
   */
  exportDiagnostics() {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      status: this.getStatus(),
      userAgent: navigator.userAgent,
      currentUrl: location.href
    };

    // Include log history if available
    if (this.logger?.exportLogs) {
      diagnostics.logHistory = this.logger.exportLogs();
    }

    // Include overlay validation history if available
    if (this.overlayValidator?.getValidationHistory) {
      diagnostics.validationHistory = this.overlayValidator.getValidationHistory();
    }

    return diagnostics;
  }
}

// Make ExtensionOrchestrator available globally
window.ExtensionOrchestrator = ExtensionOrchestrator;