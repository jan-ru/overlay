// Page validation module
// Handles URL validation and page state management

class PageValidator {
  constructor() {
    this.validUrlPattern = 'https://rooster.hva.nl/schedule';
  }

  /**
   * Validates if the current tab is on a supported HvA rooster page
   * @returns {Promise<Object>} Validation result with success/error
   */
  async validateCurrentPage() {
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (chrome.runtime.lastError) {
          const error = errorHandler.createError(
            ERROR_CODES.CHROME_API_ERROR,
            chrome.runtime.lastError.message,
            'validateCurrentPage'
          );
          resolve(error);
          return;
        }
        
        if (!tabs || !tabs[0]) {
          const error = errorHandler.createError(
            ERROR_CODES.TAB_ACCESS_DENIED,
            'No active tab found',
            'validateCurrentPage'
          );
          resolve(error);
          return;
        }

        const currentUrl = tabs[0].url;
        console.log('🔍 Extension checking URL:', currentUrl);
        console.log('🔍 Expected URL pattern:', this.validUrlPattern);
        console.log('🔍 URL starts with pattern:', currentUrl ? currentUrl.startsWith(this.validUrlPattern) : 'null');
        
        const isValidPage = currentUrl && currentUrl.startsWith(this.validUrlPattern);
        
        console.log('🔍 Page validation result:', isValidPage ? '✅ Valid' : '❌ Invalid');
        
        if (isValidPage) {
          resolve(errorHandler.createSuccess(
            { url: currentUrl, valid: true }, 
            'Page validation passed', 
            'validateCurrentPage'
          ));
        } else {
          resolve(errorHandler.createError(
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
    
    console.log('🚫 Extension deactivated - Invalid page');
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
    
    console.log('✅ Extension activated - Valid page');
  }
}

// Make PageValidator available globally
window.PageValidator = PageValidator;