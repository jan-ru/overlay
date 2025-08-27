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
  { id: "select_day", color: "rgba(255,0,0,0.3)", overlayId: "custom-overlay-day" },        // red
  { id: "select_sprint1", color: "rgba(0,255,0,0.3)", overlayId: "custom-overlay-sprint1" }, // green
  { id: "select_sprint2", color: "rgba(255,165,0,0.3)", overlayId: "custom-overlay-sprint2" }, // orange
  { id: "select_sprint3", color: "rgba(0,0,255,0.3)", overlayId: "custom-overlay-sprint3" } // blue
];

const TEXT_CONFIGS = [
  { id: "textsprint1", text: "Text Sprint 1", position: "30%", overlayId: "custom-text-overlay-sprint1" },
  { id: "textsprint2", text: "Text Sprint 2", position: "40%", overlayId: "custom-text-overlay-sprint2" },
  { id: "textsprint3", text: "Text Sprint 3", position: "50%", overlayId: "custom-text-overlay-sprint3" },
  { id: "textvakantie", text: "Text Vakantie", position: "60%", overlayId: "custom-text-overlay-vakantie" },
  { id: "texttoets", text: "Text Toets", position: "70%", overlayId: "custom-text-overlay-toets" }
];

const MULTICOLOR_CONFIG = {
  colors: ["gray", "blue", "green", "red", "yellow"],
  startY: 153
};

// Logging utility - will be configured based on settings
let DEBUG_MODE = true; // Default to true, will be updated from settings

const logger = {
  debug: (...args) => DEBUG_MODE && console.log(...args),
  info: (...args) => DEBUG_MODE && console.info(...args),
  warn: (...args) => console.warn(...args), // Always show warnings
  error: (...args) => console.error(...args), // Always show errors
  
  // Update debug mode from settings
  setDebugMode: (enabled) => {
    DEBUG_MODE = enabled;
    if (enabled) {
      console.log('🔧 Debug logging enabled');
    }
  }
};