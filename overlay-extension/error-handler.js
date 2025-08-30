// Centralized error handling and logging utility

class ErrorHandler {
  constructor() {
    this.errorCount = 0;
  }

  // Standardized error handling with context
  handleError(error, context = {}, operation = 'unknown') {
    this.errorCount++;
    
    const errorInfo = {
      message: error.message || 'Unknown error',
      name: error.name || 'Error',
      stack: error.stack,
      operation,
      timestamp: new Date().toISOString(),
      ...context
    };

    console.error(`❌ Error in ${operation}:`, errorInfo.message, errorInfo);
    
    return {
      success: false,
      error: errorInfo,
      result: 'error'
    };
  }

  // Async operation wrapper with standard error handling
  async safeAsync(operation, asyncFn, context = {}) {
    try {
      const result = await asyncFn();
      return { success: true, result, error: null };
    } catch (error) {
      return this.handleError(error, context, operation);
    }
  }

  // Sync operation wrapper with standard error handling
  safeSync(operation, syncFn, context = {}) {
    try {
      const result = syncFn();
      return { success: true, result, error: null };
    } catch (error) {
      return this.handleError(error, context, operation);
    }
  }

  // Chrome API wrapper with standard error handling
  async chromeApiCall(operation, apiCall, context = {}) {
    try {
      const result = await apiCall();
      
      if (chrome.runtime.lastError) {
        throw new Error(`Chrome API error: ${chrome.runtime.lastError.message}`);
      }
      
      return { success: true, result, error: null };
    } catch (error) {
      return this.handleError(error, { ...context, api: 'chrome' }, operation);
    }
  }

  // DOM operation wrapper
  domOperation(operation, domFn, context = {}) {
    return this.safeSync(operation, domFn, { ...context, type: 'dom' });
  }

  // Settings operation wrapper  
  settingsOperation(operation, settingsFn, context = {}) {
    return this.safeSync(operation, settingsFn, { ...context, type: 'settings' });
  }

  // Get error statistics
  getErrorStats() {
    return {
      totalErrors: this.errorCount,
      lastError: this.lastError
    };
  }

  // Reset error count
  reset() {
    this.errorCount = 0;
    this.lastError = null;
  }
}

// Export singleton instance
const errorHandler = new ErrorHandler();

// Global error handlers
window.addEventListener('error', (event) => {
  errorHandler.handleError(event.error, {
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  }, 'global_error');
});

window.addEventListener('unhandledrejection', (event) => {
  errorHandler.handleError(event.reason, {
    type: 'unhandled_promise_rejection'
  }, 'global_promise_rejection');
});

// Make available globally
window.errorHandler = errorHandler;