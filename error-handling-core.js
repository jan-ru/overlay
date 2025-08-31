// Standardized error handling utility
// Provides consistent error patterns across the application

(function(global) {
  'use strict';

  // Error categories
  const ERROR_CATEGORIES = {
    VALIDATION: 'VALIDATION',
    DETECTION: 'DETECTION', 
    UI: 'UI',
    OVERLAY: 'OVERLAY',
    PERMISSION: 'PERMISSION',
    NETWORK: 'NETWORK'
  };

  // Standard error codes
  const ERROR_CODES = {
    // Validation errors
    INVALID_URL: 'INVALID_URL',
    MISSING_SETTINGS: 'MISSING_SETTINGS',
    INVALID_CONFIGURATION: 'INVALID_CONFIGURATION',
    
    // Detection errors
    VIEW_NOT_DETECTED: 'VIEW_NOT_DETECTED',
    CALENDAR_NOT_FOUND: 'CALENDAR_NOT_FOUND',
    ELEMENT_NOT_FOUND: 'ELEMENT_NOT_FOUND',
    
    // UI errors
    UI_ELEMENT_MISSING: 'UI_ELEMENT_MISSING',
    EVENT_HANDLER_FAILED: 'EVENT_HANDLER_FAILED',
    NOTIFICATION_FAILED: 'NOTIFICATION_FAILED',
    
    // Overlay errors
    OVERLAY_CREATION_FAILED: 'OVERLAY_CREATION_FAILED',
    OVERLAY_INJECTION_FAILED: 'OVERLAY_INJECTION_FAILED',
    OVERLAY_POSITIONING_FAILED: 'OVERLAY_POSITIONING_FAILED',
    
    // Permission errors
    TAB_ACCESS_DENIED: 'TAB_ACCESS_DENIED',
    SCRIPT_INJECTION_DENIED: 'SCRIPT_INJECTION_DENIED',
    
    // Network/External errors
    CHROME_API_ERROR: 'CHROME_API_ERROR',
    DOM_ACCESS_ERROR: 'DOM_ACCESS_ERROR'
  };

  class ErrorHandlingCore {
    constructor() {
      this.categories = ERROR_CATEGORIES;
      this.codes = ERROR_CODES;
    }

    /**
     * Creates a standardized error object
     * @param {string} code - Error code from ERROR_CODES
     * @param {string} message - Human readable error message
     * @param {string} context - Context where error occurred
     * @param {Error|Object} originalError - Original error object if available
     * @returns {Object} Standardized error object
     */
    createError(code, message, context, originalError = null) {
      const category = this._getCategoryForCode(code);
      const timestamp = new Date().toISOString();
      
      const standardError = {
        success: false,
        error: {
          code: code,
          category: category,
          message: message,
          context: context,
          timestamp: timestamp,
          originalError: originalError ? {
            name: originalError.name,
            message: originalError.message,
            stack: originalError.stack
          } : null
        }
      };

      // Log the error with appropriate level
      this._logError(standardError);

      return standardError;
    }

    /**
     * Creates a success result object
     * @param {*} data - Success data
     * @param {string} message - Success message
     * @param {string} context - Context where success occurred
     * @returns {Object} Standardized success object
     */
    createSuccess(data, message, context) {
      return {
        success: true,
        data: data,
        message: message,
        context: context,
        timestamp: new Date().toISOString()
      };
    }

    /**
     * Wraps a function with standardized error handling
     * @param {Function} fn - Function to wrap
     * @param {string} context - Context for error reporting
     * @param {string} fallbackErrorCode - Error code to use if wrapping fails
     * @returns {Function} Wrapped function that returns standardized results
     */
    wrapFunction(fn, context, fallbackErrorCode = ERROR_CODES.DOM_ACCESS_ERROR) {
      return async (...args) => {
        try {
          const result = await fn(...args);
          
          // If function already returns standardized format, pass through
          if (typeof result === 'object' && result !== null && 'success' in result) {
            return result;
          }
          
          // Otherwise wrap in success format
          return this.createSuccess(result, `${context} completed successfully`, context);
        } catch (error) {
          return this.createError(
            fallbackErrorCode,
            error.message || `Error in ${context}`,
            context,
            error
          );
        }
      };
    }

    /**
     * Validates a result and throws if it's an error
     * @param {Object} result - Result to validate
     * @throws {Error} If result indicates failure
     * @returns {*} The data from successful result
     */
    validateResult(result) {
      if (!result.success) {
        const error = new Error(result.error.message);
        error.code = result.error.code;
        error.category = result.error.category;
        error.context = result.error.context;
        throw error;
      }
      return result.data;
    }

    /**
     * Checks if an error is of a specific category
     * @param {Object} errorResult - Error result object
     * @param {string} category - Category to check against
     * @returns {boolean} True if error matches category
     */
    isErrorCategory(errorResult, category) {
      return !errorResult.success && errorResult.error.category === category;
    }

    /**
     * Checks if an error has a specific code
     * @param {Object} errorResult - Error result object  
     * @param {string} code - Code to check against
     * @returns {boolean} True if error matches code
     */
    isErrorCode(errorResult, code) {
      return !errorResult.success && errorResult.error.code === code;
    }

    /**
     * Formats error for user display
     * @param {Object} errorResult - Error result object
     * @returns {string} User-friendly error message
     */
    formatForUser(errorResult) {
      if (errorResult.success) {
        return errorResult.message || 'Operation completed successfully';
      }

      const error = errorResult.error;
      
      // Return user-friendly messages based on category
      switch (error.category) {
        case ERROR_CATEGORIES.VALIDATION:
          return `Configuration issue: ${error.message}`;
        case ERROR_CATEGORIES.DETECTION:
          return `Detection failed: ${error.message}`;
        case ERROR_CATEGORIES.UI:
          return `Interface error: ${error.message}`;
        case ERROR_CATEGORIES.OVERLAY:
          return `Overlay error: ${error.message}`;
        case ERROR_CATEGORIES.PERMISSION:
          return `Permission error: ${error.message}. Please check browser permissions.`;
        case ERROR_CATEGORIES.NETWORK:
          return `System error: ${error.message}`;
        default:
          return `Error: ${error.message}`;
      }
    }

    // Private helper methods

    /**
     * Determines error category based on error code
     * @private
     */
    _getCategoryForCode(code) {
      const codeToCategory = {
        [ERROR_CODES.INVALID_URL]: ERROR_CATEGORIES.VALIDATION,
        [ERROR_CODES.MISSING_SETTINGS]: ERROR_CATEGORIES.VALIDATION,
        [ERROR_CODES.INVALID_CONFIGURATION]: ERROR_CATEGORIES.VALIDATION,
        
        [ERROR_CODES.VIEW_NOT_DETECTED]: ERROR_CATEGORIES.DETECTION,
        [ERROR_CODES.CALENDAR_NOT_FOUND]: ERROR_CATEGORIES.DETECTION,
        [ERROR_CODES.ELEMENT_NOT_FOUND]: ERROR_CATEGORIES.DETECTION,
        
        [ERROR_CODES.UI_ELEMENT_MISSING]: ERROR_CATEGORIES.UI,
        [ERROR_CODES.EVENT_HANDLER_FAILED]: ERROR_CATEGORIES.UI,
        [ERROR_CODES.NOTIFICATION_FAILED]: ERROR_CATEGORIES.UI,
        
        [ERROR_CODES.OVERLAY_CREATION_FAILED]: ERROR_CATEGORIES.OVERLAY,
        [ERROR_CODES.OVERLAY_INJECTION_FAILED]: ERROR_CATEGORIES.OVERLAY,
        [ERROR_CODES.OVERLAY_POSITIONING_FAILED]: ERROR_CATEGORIES.OVERLAY,
        
        [ERROR_CODES.TAB_ACCESS_DENIED]: ERROR_CATEGORIES.PERMISSION,
        [ERROR_CODES.SCRIPT_INJECTION_DENIED]: ERROR_CATEGORIES.PERMISSION,
        
        [ERROR_CODES.CHROME_API_ERROR]: ERROR_CATEGORIES.NETWORK,
        [ERROR_CODES.DOM_ACCESS_ERROR]: ERROR_CATEGORIES.NETWORK
      };

      return codeToCategory[code] || 'UNKNOWN';
    }

    /**
     * Logs error with appropriate level and formatting
     * @private
     */
    _logError(standardError) {
      const error = standardError.error;
      const logMessage = `❌ [${error.category}:${error.code}] ${error.message} (${error.context})`;
      
      if (error.category === ERROR_CATEGORIES.PERMISSION || 
          error.category === ERROR_CATEGORIES.NETWORK) {
        console.error(logMessage, error.originalError);
      } else {
        console.warn(logMessage);
      }
    }
  }

  // Make ErrorHandlingCore available globally
  global.ErrorHandlingCore = ErrorHandlingCore;
  global.ERROR_CATEGORIES = ERROR_CATEGORIES;
  global.ERROR_CODES = ERROR_CODES;

  // Convenience instance for immediate use
  global.errorHandler = new ErrorHandlingCore();

  console.log('✅ Error Handling Core loaded!');

})(typeof window !== 'undefined' ? window : this);