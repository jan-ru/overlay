// Enhanced universal logging system
// Supports categories, performance monitoring, and multi-application use

class Logger {
  constructor(options = {}) {
    // Basic logging configuration
    this.level = options.level || 'INFO';
    this.debugMode = options.debugMode !== undefined ? options.debugMode : true;
    this.levels = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3, SILENT: 4 };
    
    // Enhanced features
    this.categories = options.categories || {
      INIT: 'INIT',
      VIEW: 'VIEW', 
      OVERLAY: 'OVERLAY',
      UI: 'UI',
      VALIDATION: 'VALIDATION',
      PERFORMANCE: 'PERF',
      ERROR: 'ERROR',
      USER: 'USER',
      GENERAL: 'GENERAL'
    };
    
    // Performance monitoring
    this.performanceTimers = new Map();
    this.performanceThreshold = options.performanceThreshold || 100;
    
    // History tracking
    this.logHistory = [];
    this.maxHistorySize = options.maxHistorySize || 100;
    
    // Application context
    this.applicationName = options.applicationName || 'App';
    this.environment = this.detectEnvironment(options.environment);
    
    // Auto-configure for detected environment
    if (this.environment === 'production') {
      this.setLevel('WARN');
    }
  }

  /**
   * Detects the runtime environment
   */
  detectEnvironment(forcedEnv = null) {
    if (forcedEnv) return forcedEnv;
    
    // Chrome extension context
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      const manifest = chrome.runtime.getManifest();
      return manifest?.name?.includes('Dev') ? 'development' : 'production';
    }
    
    // Web context indicators
    if (typeof window !== 'undefined') {
      return (location.protocol === 'https:' && !location.hostname.includes('localhost')) 
        ? 'production' : 'development';
    }
    
    // Node.js context
    if (typeof process !== 'undefined' && process.env) {
      return process.env.NODE_ENV === 'production' ? 'production' : 'development';
    }
    
    return 'development';
  }

  setLevel(level) {
    this.level = level.toUpperCase();
  }

  setDebugMode(enabled) {
    this.debugMode = enabled;
    this.level = enabled ? 'DEBUG' : 'INFO';
  }
  
  setApplicationName(name) {
    this.applicationName = name;
  }

  shouldLog(level) {
    return this.levels[level] >= this.levels[this.level];
  }

  /**
   * Enhanced message formatting with categories and context
   */
  formatMessage(level, category, message, context = null) {
    const timestamp = this.getTimestamp();
    const emoji = this.getCategoryEmoji(category) || this.getLevelEmoji(level);
    
    let formattedMessage = `${emoji} [${timestamp}]`;
    
    // Add application context if not default
    if (this.applicationName && this.applicationName !== 'App') {
      formattedMessage += ` [${this.applicationName}]`;
    }
    
    formattedMessage += ` ${category}`;
    
    if (context) {
      formattedMessage += ` (${context})`;
    }
    
    formattedMessage += `: ${message}`;
    
    // Truncate very long messages
    if (formattedMessage.length > 200) {
      formattedMessage = formattedMessage.substring(0, 197) + '...';
    }
    
    return formattedMessage;
  }
  
  getTimestamp() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const ms = now.getMilliseconds().toString().padStart(3, '0');
    return `${hours}:${minutes}:${seconds}.${ms}`;
  }
  
  getCategoryEmoji(category) {
    const emojiMap = {
      [this.categories.INIT]: '🚀',
      [this.categories.VIEW]: '👁️',
      [this.categories.OVERLAY]: '🎨', 
      [this.categories.UI]: '🖱️',
      [this.categories.VALIDATION]: '✅',
      [this.categories.PERFORMANCE]: '⚡',
      [this.categories.ERROR]: '❌',
      [this.categories.USER]: '👤',
      [this.categories.GENERAL]: '📝'
    };
    return emojiMap[category];
  }
  
  getLevelEmoji(level) {
    return { DEBUG: '🔧', INFO: '📋', WARN: '⚠️', ERROR: '❌' }[level];
  }

  /**
   * Adds log entry to history for debugging
   */
  addToHistory(level, category, message, context, data) {
    const entry = {
      timestamp: Date.now(),
      level: this.levels[level],
      levelName: level,
      category: category,
      message: message,
      context: context,
      data: data,
      application: this.applicationName
    };
    
    this.logHistory.push(entry);
    
    // Keep history size manageable
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory = this.logHistory.slice(-this.maxHistorySize);
    }
  }
  
  /**
   * Core logging method with enhanced features
   */
  log(level, category, message, context = null, data = null) {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(level, category, message, context);
    this.addToHistory(level, category, message, context, data);

    // Use appropriate console method based on level
    switch (level) {
      case 'DEBUG':
        console.debug(formattedMessage, data || '');
        break;
      case 'INFO':
        console.info(formattedMessage, data || '');
        break;
      case 'WARN':
        console.warn(formattedMessage, data || '');
        break;
      case 'ERROR':
        console.error(formattedMessage, data || '');
        break;
    }
  }
  
  // Enhanced logging methods with category support
  debug(categoryOrMessage, message = null, context = null, data = null) {
    if (message === null) {
      // Legacy usage: debug(message, data)
      this.log('DEBUG', this.categories.GENERAL, categoryOrMessage, null, context);
    } else {
      // New usage: debug(category, message, context, data)
      this.log('DEBUG', categoryOrMessage, message, context, data);
    }
  }

  info(categoryOrMessage, message = null, context = null, data = null) {
    if (message === null) {
      this.log('INFO', this.categories.GENERAL, categoryOrMessage, null, context);
    } else {
      this.log('INFO', categoryOrMessage, message, context, data);
    }
  }

  warn(categoryOrMessage, message = null, context = null, data = null) {
    if (message === null) {
      this.log('WARN', this.categories.GENERAL, categoryOrMessage, null, context);
    } else {
      this.log('WARN', categoryOrMessage, message, context, data);
    }
  }

  error(categoryOrMessage, message = null, context = null, data = null) {
    if (message === null) {
      this.log('ERROR', this.categories.GENERAL, categoryOrMessage, null, context);
    } else {
      this.log('ERROR', categoryOrMessage, message, context, data);
    }
  }

  // Performance monitoring methods
  
  /**
   * Starts a performance timer
   */
  startTimer(name, category = this.categories.PERFORMANCE) {
    const timer = {
      name: name,
      category: category,
      startTime: performance.now(),
      context: `timer:${name}`
    };
    
    this.performanceTimers.set(name, timer);
    this.debug(category, `Started timer: ${name}`, timer.context);
  }

  /**
   * Ends a performance timer and logs if above threshold
   */
  endTimer(name) {
    const timer = this.performanceTimers.get(name);
    if (!timer) {
      this.warn(this.categories.PERFORMANCE, `Timer not found: ${name}`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - timer.startTime;
    
    this.performanceTimers.delete(name);

    const logLevel = duration > this.performanceThreshold ? 'WARN' : 'DEBUG';
    this.log(logLevel, timer.category, `${timer.name} completed in ${duration.toFixed(2)}ms`, timer.context);
    
    return duration;
  }

  /**
   * Times an async operation
   */
  async timeAsync(name, operation, category = this.categories.PERFORMANCE) {
    this.startTimer(name, category);
    try {
      const result = await operation();
      this.endTimer(name);
      return result;
    } catch (error) {
      this.endTimer(name);
      this.error(category, `${name} failed: ${error.message}`, `timer:${name}`, error);
      throw error;
    }
  }
  
  // Specialized logging methods
  
  /**
   * Logs user actions for analytics
   */
  logUserAction(action, details = null) {
    this.info(this.categories.USER, `User action: ${action}`, 'user-analytics', details);
  }

  /**
   * Logs initialization steps
   */
  logInitStep(step, success = true, details = null) {
    const level = success ? 'INFO' : 'ERROR';
    const message = `Initialization ${success ? 'completed' : 'failed'}: ${step}`;
    this.log(level, this.categories.INIT, message, 'init-sequence', details);
  }

  /**
   * Logs overlay operations
   */
  logOverlayOperation(operation, overlayType, success = true, details = null) {
    const level = success ? 'INFO' : 'ERROR';
    const message = `Overlay ${operation} for ${overlayType}: ${success ? 'success' : 'failed'}`;
    this.log(level, this.categories.OVERLAY, message, `overlay:${overlayType}`, details);
  }
  
  // Legacy methods for backwards compatibility
  operation(operation, status, data = null) {
    const message = `${operation}: ${status}`;
    if (status === 'success' || status === 'completed') {
      this.info(this.categories.GENERAL, message, null, data);
    } else if (status === 'failed' || status === 'error') {
      this.error(this.categories.GENERAL, message, null, data);
    } else {
      this.debug(this.categories.GENERAL, message, null, data);
    }
  }

  overlay(overlayType, action, result) {
    this.operation(`${overlayType} overlay ${action}`, result);
  }
  
  // Utility methods
  
  /**
   * Gets log history with optional filtering
   */
  getHistory(category = null, level = null) {
    let history = this.logHistory;
    
    if (category) {
      history = history.filter(entry => entry.category === category);
    }
    
    if (level !== null) {
      const levelNum = typeof level === 'string' ? this.levels[level] : level;
      history = history.filter(entry => entry.level >= levelNum);
    }
    
    return history;
  }

  /**
   * Exports logs for debugging or support
   */
  exportLogs() {
    const exportData = {
      timestamp: new Date().toISOString(),
      application: this.applicationName,
      environment: this.environment,
      currentLevel: this.level,
      history: this.logHistory,
      categories: this.categories
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Clears log history
   */
  clearHistory() {
    const clearedCount = this.logHistory.length;
    this.logHistory = [];
    this.info(this.categories.INIT, `Cleared ${clearedCount} log entries from history`);
  }

  // Production-safe logging (removes debug logs automatically)
  production() {
    this.setLevel('WARN');
    this.debugMode = false;
    this.environment = 'production';
  }
  
  /**
   * Creates a new logger instance for a different application
   * @param {Object} options - Configuration options
   * @returns {Logger} New logger instance
   */
  static createForApplication(applicationName, options = {}) {
    return new Logger({
      ...options,
      applicationName: applicationName
    });
  }
}

// Create default instance for this application
const logger = new Logger({
  applicationName: 'Calendar-Overlay',
  categories: {
    INIT: 'INIT',
    VIEW: 'VIEW',
    OVERLAY: 'OVERLAY', 
    UI: 'UI',
    VALIDATION: 'VALIDATION',
    PERFORMANCE: 'PERF',
    ERROR: 'ERROR',
    USER: 'USER',
    GENERAL: 'GENERAL'
  }
});

// Make both class and instance available globally for multi-application use
if (typeof window !== 'undefined') {
  window.Logger = Logger;  // Export class for other applications
  window.logger = logger;  // Export instance for this application
  
  // Maintain backwards compatibility with enhanced logger
  window.enhancedLogger = logger;
  window.LOGGING_CONFIG = {
    CATEGORIES: logger.categories,
    LEVELS: logger.levels
  };
}

// Node.js export support
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Logger, logger };
}