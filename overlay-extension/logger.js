// Centralized logging system with level control

class Logger {
  constructor() {
    this.level = 'INFO'; // DEBUG, INFO, WARN, ERROR
    this.debugMode = true;
    this.levels = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
  }

  setLevel(level) {
    this.level = level.toUpperCase();
  }

  setDebugMode(enabled) {
    this.debugMode = enabled;
    this.level = enabled ? 'DEBUG' : 'INFO';
  }

  shouldLog(level) {
    return this.levels[level] >= this.levels[this.level];
  }

  formatMessage(level, message, data) {
    const timestamp = new Date().toISOString().substr(11, 8);
    const emoji = { DEBUG: '🔧', INFO: '📋', WARN: '⚠️', ERROR: '❌' }[level];
    return `${emoji} [${timestamp}] ${message}`;
  }

  debug(message, data = null) {
    if (this.shouldLog('DEBUG')) {
      console.log(this.formatMessage('DEBUG', message), data || '');
    }
  }

  info(message, data = null) {
    if (this.shouldLog('INFO')) {
      console.log(this.formatMessage('INFO', message), data || '');
    }
  }

  warn(message, data = null) {
    if (this.shouldLog('WARN')) {
      console.warn(this.formatMessage('WARN', message), data || '');
    }
  }

  error(message, data = null) {
    if (this.shouldLog('ERROR')) {
      console.error(this.formatMessage('ERROR', message), data || '');
    }
  }

  // Specialized logging methods
  operation(operation, status, data = null) {
    const message = `${operation}: ${status}`;
    if (status === 'success' || status === 'completed') {
      this.info(message, data);
    } else if (status === 'failed' || status === 'error') {
      this.error(message, data);
    } else {
      this.debug(message, data);
    }
  }

  overlay(overlayType, action, result) {
    this.operation(`${overlayType} overlay ${action}`, result);
  }

  // Production-safe logging (removes debug logs automatically)
  production() {
    this.setLevel('WARN');
    this.debugMode = false;
  }
}

// Export singleton
const logger = new Logger();

// Auto-configure based on extension debug mode
if (typeof chrome !== 'undefined' && chrome.runtime) {
  // Production mode detection
  if (chrome.runtime.getManifest().name.includes('Dev')) {
    logger.setDebugMode(true);
  } else {
    logger.production();
  }
}

// Make available globally
window.logger = logger;