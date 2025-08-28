// Configuration and constants for overlay extension
// This file now provides backwards-compatible access to centralized constants from overlay-core.js
// All configuration data is maintained in OVERLAY_CORE_CONFIG for single source of truth

// Overlay styles - now centralized in overlay-core.js as OVERLAY_CORE_CONFIG.OVERLAY_STYLES
// Access via: window.OVERLAY_CORE_CONFIG.OVERLAY_STYLES and window.OVERLAY_CORE_CONFIG.TEXT_OVERLAY_STYLES
const OVERLAY_STYLES = window.OVERLAY_CORE_CONFIG?.OVERLAY_STYLES || {};
const TEXT_OVERLAY_STYLES = window.OVERLAY_CORE_CONFIG?.TEXT_OVERLAY_STYLES || {};

// Calendar selectors - now centralized in overlay-core.js as OVERLAY_CORE_CONFIG.CALENDAR_SELECTORS
const CALENDAR_SELECTORS = window.OVERLAY_CORE_CONFIG?.CALENDAR_SELECTORS || [];

// Calendar configuration - now centralized in overlay-core.js as OVERLAY_CORE_CONFIG.CALENDAR_CONFIGS
// Access via: window.OVERLAY_CORE_CONFIG.CALENDAR_CONFIGS
const CALENDAR_CONFIGS = window.OVERLAY_CORE_CONFIG?.CALENDAR_CONFIGS || [];

const TEXT_CONFIGS = [];

// OpenTelemetry logging - import telemetry service
// Note: In browser extensions, we'll use a global reference since ES6 imports 
// may not work in all contexts. The telemetry service will be loaded separately.

// Enhanced logger with OpenTelemetry integration
const logger = {
  // Get telemetry service instance (loaded globally)
  getTelemetry: () => window.telemetryService || null,
  
  debug: (message, attributes = {}) => {
    const telemetry = logger.getTelemetry();
    if (telemetry) {
      telemetry.debug(message, attributes);
    } else {
      console.log(`🔧 ${message}`, attributes);
    }
  },
  
  info: (message, attributes = {}) => {
    const telemetry = logger.getTelemetry();
    if (telemetry) {
      telemetry.info(message, attributes);
    } else {
      console.info(`ℹ️ ${message}`, attributes);
    }
  },
  
  warn: (message, attributes = {}) => {
    const telemetry = logger.getTelemetry();
    if (telemetry) {
      telemetry.warn(message, attributes);
    } else {
      console.warn(`⚠️ ${message}`, attributes);
    }
  },
  
  error: (message, attributes = {}) => {
    const telemetry = logger.getTelemetry();
    if (telemetry) {
      telemetry.error(message, attributes);
    } else {
      console.error(`❌ ${message}`, attributes);
    }
  },
  
  // Log user actions with structured data
  logUserAction: (action, details = {}) => {
    const telemetry = logger.getTelemetry();
    if (telemetry) {
      telemetry.logUserAction(action, details);
    } else {
      console.info(`👤 User action: ${action}`, details);
    }
  },
  
  // Log overlay operations
  logOverlayOperation: (operation, overlayId, result, details = {}) => {
    const telemetry = logger.getTelemetry();
    if (telemetry) {
      telemetry.logOverlayOperation(operation, overlayId, result, details);
    } else {
      console.info(`🎨 Overlay ${operation}: ${overlayId} -> ${result}`, details);
    }
  },
  
  // Log DOM operations
  logDomOperation: (operation, selector, result, details = {}) => {
    const telemetry = logger.getTelemetry();
    if (telemetry) {
      telemetry.logDomOperation(operation, selector, result, details);
    } else {
      console.debug(`🔍 DOM ${operation}: ${selector} -> ${result}`, details);
    }
  },
  
  // Log errors with context
  logError: (error, context = {}) => {
    const telemetry = logger.getTelemetry();
    if (telemetry) {
      telemetry.logError(error, context);
    } else {
      console.error('❌ Error:', error.message, { error, context });
    }
  },
  
  // Update debug mode from settings
  setDebugMode: (enabled) => {
    const telemetry = logger.getTelemetry();
    if (telemetry) {
      telemetry.setDebugMode(enabled);
    } else {
      console.log(`🔧 Debug logging ${enabled ? 'enabled' : 'disabled'}`);
    }
  }
};