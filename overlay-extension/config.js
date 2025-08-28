// Configuration and constants for overlay extension
const OVERLAY_STYLES = {
  position: 'fixed',
  top: '152px',
  left: '0',
  width: '80%',
  height: '100%',
  zIndex: '999999',
  pointerEvents: 'none'
};

const TEXT_OVERLAY_STYLES = {
  position: "fixed",
  left: "50%",
  transform: "translate(-50%, -50%)",
  color: "white",
  fontSize: "32px",
  fontWeight: "bold",
  textShadow: "3px 3px 6px rgba(0,0,0,0.8)",
  zIndex: "1000000",
  pointerEvents: "none"
};

// CALENDAR SELECTORS - Hardcoded based on detection results
const CALENDAR_SELECTORS = [
  'table.GNKVYU1C-',                    // Primary: exact class match
  'table[class^="GNKVYU1C"]',           // Fallback 1: class starts with GNKVYU1C
  'table[class*="GNKVYU1C"]',           // Fallback 2: class contains GNKVYU1C
  '.gwt-TabLayoutPanelContent table',   // Fallback 3: table in GWT content
  'table'                               // Last resort: any table (will use largest)
];

const CALENDAR_CONFIGS = [
  { id: "select_blok", color: "rgba(128,128,128,0.3)", overlayId: "custom-overlay-blok" },     // gray
  { id: "select_sprint1", color: "rgba(0,255,0,0.3)", overlayId: "custom-overlay-sprint1" },   // green
  { id: "select_sprint2", color: "rgba(255,165,0,0.3)", overlayId: "custom-overlay-sprint2" }, // orange
  { id: "select_sprint3", color: "rgba(0,0,255,0.3)", overlayId: "custom-overlay-sprint3" },   // blue
  { id: "select_toets", color: "rgba(255,255,0,0.3)", overlayId: "custom-overlay-toets" },     // yellow
  { id: "select_assessment", color: "rgba(255,0,255,0.3)", overlayId: "custom-overlay-assessment" }, // magenta
  { id: "select_day", color: "rgba(255,0,0,0.3)", overlayId: "custom-overlay-day" }            // red
];

const TEXT_CONFIGS = [
  { id: "textsprint1", text: "Text Sprint 1", position: "30%", overlayId: "custom-text-overlay-sprint1" }
];

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