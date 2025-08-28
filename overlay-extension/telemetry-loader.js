// Telemetry loader for browser extension
// This file loads the telemetry service and makes it globally available
// Since browser extensions have limitations with ES6 modules, we use a simpler approach

// Simple telemetry service for browser extension context
class SimpleTelemetryService {
  constructor() {
    this.debugMode = true;
    this.serviceName = 'overlay-extension';
    this.serviceVersion = '1.1';
  }

  // Core logging method
  log(level, message, attributes = {}) {
    const timestamp = new Date().toISOString();
    const emoji = this.getLevelEmoji(level);
    
    // Enhanced console logging with structured data
    if (this.debugMode || level === 'error' || level === 'warn') {
      const logData = {
        timestamp,
        service: this.serviceName,
        version: this.serviceVersion,
        level,
        message,
        ...attributes
      };
      
      console[level === 'debug' ? 'log' : level](`${emoji} [${timestamp}] ${message}`, logData);
    }

    // TODO: In Phase 2, add OpenTelemetry SDK integration here
    // This will send logs to OTLP endpoint when configured
  }

  // Convenience methods
  debug(message, attributes = {}) {
    this.log('debug', message, attributes);
  }

  info(message, attributes = {}) {
    this.log('info', message, attributes);
  }

  warn(message, attributes = {}) {
    this.log('warn', message, attributes);
  }

  error(message, attributes = {}) {
    this.log('error', message, attributes);
  }

  // Log user interactions
  logUserAction(action, details = {}) {
    this.info(`User action: ${action}`, {
      'user.action': action,
      'user.interaction': true,
      ...details
    });
  }

  // Log overlay operations
  logOverlayOperation(operation, overlayId, result, details = {}) {
    this.info(`Overlay operation: ${operation}`, {
      'overlay.operation': operation,
      'overlay.id': overlayId,
      'overlay.result': result,
      ...details
    });
  }

  // Log DOM operations
  logDomOperation(operation, selector, result, details = {}) {
    this.debug(`DOM operation: ${operation}`, {
      'dom.operation': operation,
      'dom.selector': selector,
      'dom.result': result,
      ...details
    });
  }

  // Log errors with context
  logError(error, context = {}) {
    this.error(`Error: ${error.message}`, {
      'error.name': error.name,
      'error.message': error.message,
      'error.stack': error.stack,
      'error.context': context
    });
  }

  // Configuration methods
  setDebugMode(enabled) {
    this.debugMode = enabled;
    this.info(`Debug mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  // Utility methods
  getLevelEmoji(level) {
    const emojis = {
      debug: '🔧',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌'
    };
    return emojis[level] || 'ℹ️';
  }
}

// Create and make globally available
if (typeof window !== 'undefined') {
  window.telemetryService = new SimpleTelemetryService();
  window.telemetryService.info('🚀 Telemetry service initialized');
} else if (typeof global !== 'undefined') {
  global.telemetryService = new SimpleTelemetryService();
}