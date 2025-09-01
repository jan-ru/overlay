// Page validation module
// Handles URL validation and page state management

class PageValidator {
  constructor() {
    this.validUrlPattern = 'https://rooster.hva.nl/schedule';
    
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
   * Validates if the current tab is on a supported HvA rooster page
   * @returns {Promise<Object>} Validation result with success/error
   */
  async validateCurrentPage() {
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (chrome.runtime.lastError) {
          const error = this.errorHandler.createError(
            ERROR_CODES.CHROME_API_ERROR,
            chrome.runtime.lastError.message,
            'validateCurrentPage'
          );
          resolve(error);
          return;
        }
        
        if (!tabs || !tabs[0]) {
          const error = this.errorHandler.createError(
            ERROR_CODES.TAB_ACCESS_DENIED,
            'No active tab found',
            'validateCurrentPage'
          );
          resolve(error);
          return;
        }

        const currentUrl = tabs[0].url;
        
        this.logger.debug && this.logger.debug(
          this.logger.categories?.VALIDATION || 'VALIDATION',
          `Checking URL: ${currentUrl}`,
          'page-validation'
        );
        
        const isValidPage = currentUrl && currentUrl.startsWith(this.validUrlPattern);
        
        if (isValidPage) {
          this.logger.info && this.logger.info(
            this.logger.categories?.VALIDATION || 'VALIDATION',
            'Page validation passed',
            'page-validation'
          );
        } else {
          this.logger.warn && this.logger.warn(
            this.logger.categories?.VALIDATION || 'VALIDATION',
            `Invalid page - expected pattern: ${this.validUrlPattern}`,
            'page-validation'
          );
        }
        
        if (isValidPage) {
          resolve(this.errorHandler.createSuccess(
            { url: currentUrl, valid: true }, 
            'Page validation passed', 
            'validateCurrentPage'
          ));
        } else {
          resolve(this.errorHandler.createError(
            ERROR_CODES.INVALID_URL,
            `Extension only works on ${this.validUrlPattern} pages`,
            'validateCurrentPage'
          ));
        }
      });
    });
  }

  /**
   * Shows error state in the UI
   */
  showPageError() {
    const errorContainer = document.getElementById('error-container');
    const mainContent = document.getElementById('main-content');
    
    if (errorContainer) {
      errorContainer.style.display = 'block';
    }
    
    if (mainContent) {
      mainContent.style.display = 'none';
    }
    
    this.logger.warn && this.logger.warn(
      this.logger.categories?.UI || 'UI',
      'Extension deactivated - Invalid page',
      'page-error-display'
    );
  }

  /**
   * Shows main content and hides error state
   */
  showMainContent() {
    const errorContainer = document.getElementById('error-container');
    const mainContent = document.getElementById('main-content');
    
    if (errorContainer) {
      errorContainer.style.display = 'none';
    }
    
    if (mainContent) {
      mainContent.style.display = 'block';
    }
    
    this.logger.info && this.logger.info(
      this.logger.categories?.UI || 'UI',
      'Extension activated - Valid page',
      'page-content-display'
    );
  }
}

// Make PageValidator available globally
window.PageValidator = PageValidator;