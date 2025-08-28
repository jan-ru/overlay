// OpenTelemetry telemetry service for browser extension
import { logs } from '@opentelemetry/api';
import { LoggerProvider } from '@opentelemetry/sdk-logs';
import { Resource } from '@opentelemetry/resources';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';

class TelemetryService {
  constructor() {
    this.isInitialized = false;
    this.logger = null;
    this.debugMode = true;
    this.loggerProvider = null;
  }

  // Initialize OpenTelemetry logging
  initialize(config = {}) {
    try {
      // Resource identification for the extension
      const resource = new Resource({
        'service.name': 'overlay-extension',
        'service.version': '1.1',
        'service.namespace': 'hva-calendar',
        'browser.extension': true,
        'user_agent': navigator.userAgent,
        'extension.manifest_version': '3'
      });

      // Create logger provider
      this.loggerProvider = new LoggerProvider({ resource });

      // Configure exporter (can be disabled for local development)
      if (config.exportLogs && config.otlpEndpoint) {
        const exporter = new OTLPLogExporter({
          url: config.otlpEndpoint,
          headers: config.headers || {}
        });
        
        const processor = new BatchLogRecordProcessor(exporter, {
          maxExportBatchSize: 30,
          maxQueueSize: 100,
          scheduledDelayMillis: 1000
        });
        
        this.loggerProvider.addLogRecordProcessor(processor);
      }

      // Register the logger provider
      logs.setGlobalLoggerProvider(this.loggerProvider);

      // Get logger instance
      this.logger = logs.getLogger('overlay-extension', '1.1');
      
      this.isInitialized = true;
      this.log('info', '🚀 OpenTelemetry logging initialized', {
        exportEnabled: !!config.exportLogs,
        endpoint: config.otlpEndpoint || 'console-only'
      });

    } catch (error) {
      console.error('❌ Failed to initialize OpenTelemetry:', error);
      // Fallback to console logging
      this.initializeFallback();
    }
  }

  // Fallback to console logging if OTel fails
  initializeFallback() {
    this.isInitialized = true;
    console.warn('⚠️ Using console fallback logging');
  }

  // Core logging method
  log(level, message, attributes = {}) {
    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      level,
      message,
      ...attributes
    };

    // Always log to console for debugging
    if (this.debugMode || level === 'error' || level === 'warn') {
      const emoji = this.getLevelEmoji(level);
      console[level === 'debug' ? 'log' : level](`${emoji} [${timestamp}] ${message}`, attributes);
    }

    // Log to OpenTelemetry if initialized
    if (this.isInitialized && this.logger) {
      try {
        this.logger.emit({
          severityText: level.toUpperCase(),
          severityNumber: this.getSeverityNumber(level),
          body: message,
          attributes: {
            'extension.component': 'overlay',
            ...attributes
          }
        });
      } catch (error) {
        console.error('Failed to emit log to OpenTelemetry:', error);
      }
    }
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

  getSeverityNumber(level) {
    const severities = {
      debug: 5,
      info: 9,
      warn: 13,
      error: 17
    };
    return severities[level] || 9;
  }

  // Shutdown method for cleanup
  shutdown() {
    if (this.loggerProvider) {
      this.loggerProvider.shutdown();
    }
  }
}

// Create and export singleton instance
const telemetryService = new TelemetryService();

// Auto-initialize with basic config
// In production, call initialize() with proper OTLP endpoint
telemetryService.initialize({
  exportLogs: false, // Set to true when you have an OTLP endpoint
  otlpEndpoint: null // Set your OTLP endpoint here
});

export default telemetryService;