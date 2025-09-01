# Architecture Documentation

## Overview

The Calendar Overlay system is a modular JavaScript application designed to provide visual overlays on the HvA (University of Applied Sciences Amsterdam) calendar system. The application supports both Chrome extension and bookmarklet deployment methods.

## System Architecture

```
Calendar Overlay System
├── Chrome Extension (popup-based)
│   ├── Extension Orchestrator (main coordinator)
│   ├── Page Validator (URL validation)
│   ├── View Manager (view detection & switching)  
│   ├── UI Manager (interface handling)
│   └── Settings Loader (configuration management)
├── Bookmarklet (self-contained)
├── Shared Utilities
│   ├── Error Handling Core
│   ├── View Detection Core
│   ├── Enhanced Logger
│   └── Overlay Visibility Validator
└── Overlay Core (rendering engine)
```

## Core Components

### 1. Extension Orchestrator (`extension-orchestrator.js`)
**Purpose**: Main coordination class that manages all extension components with separated concerns.

**Key Features**:
- Step-by-step initialization with comprehensive error handling
- Performance monitoring with timing
- Graceful degradation on failures
- Script execution utility for active tab manipulation

**Dependencies**: 
- PageValidator, ViewManager, UIManager
- Enhanced logging system
- Error handling core

### 2. Page Validator (`page-validator.js`)
**Purpose**: Handles URL validation and page state management.

**Key Features**:
- Validates current tab is on supported HvA rooster page
- Shows/hides appropriate UI states
- Chrome API error handling
- Enhanced logging integration

**Validation**: Only works on `https://rooster.hva.nl/schedule` pages

### 3. View Manager (`view-manager.js`)
**Purpose**: Handles view detection, switching, and user feedback.

**Key Features**:
- Self-contained view detection (no external dependencies)
- Automatic switching to "Maand" view if needed
- User feedback notifications
- Error recovery with detailed logging

**View Detection Logic**:
- XPath-based element detection
- Visual analysis of button states
- Clickable element traversal
- Success/failure feedback

### 4. UI Manager (`ui-manager.js`)
**Purpose**: Manages UI initialization, course selection, and overlay button setup.

**Key Features**:
- Course dropdown management
- Overlay button event handling
- Direct script injection for overlay creation
- Visual button state management
- Settings-based overlay data retrieval

**Overlay Creation**: Self-contained logic injected into page context with calendar detection and week range analysis.

### 5. Enhanced Logger (`logger.js`)
**Purpose**: Universal logging system supporting categories, performance monitoring, and multi-application use.

**Key Features**:
- Categorized logging (INIT, VIEW, OVERLAY, UI, VALIDATION, PERFORMANCE, ERROR, USER)
- Environment auto-detection (development/production)
- Performance timing with threshold-based warnings
- Log history and export functionality
- Multi-application support via factory methods

**Categories**:
```javascript
INIT: 'INIT',           // Initialization and startup
VIEW: 'VIEW',           // View detection and switching
OVERLAY: 'OVERLAY',     // Overlay creation and management
UI: 'UI',              // User interface interactions
VALIDATION: 'VALIDATION', // Page and input validation
PERFORMANCE: 'PERF',    // Performance monitoring
ERROR: 'ERROR',         // Error conditions
USER: 'USER'           // User actions and feedback
```

## Shared Utilities

### 1. Error Handling Core (`error-handling-core.js`)
**Purpose**: Standardized error patterns across the application.

**Error Categories**:
- VALIDATION: Configuration issues
- DETECTION: View/element detection failures
- UI: Interface errors
- OVERLAY: Overlay creation failures
- PERMISSION: Browser permission issues
- NETWORK: System/API errors

**Key Features**:
- Standardized error/success object patterns
- Error categorization and user-friendly formatting
- Function wrapping with automatic error handling
- Result validation utilities

### 2. View Detection Core (`view-detection-core.js`)
**Purpose**: Shared view detection logic used by both extension and bookmarklet.

**Detection Strategies** (fallback chain):
1. Visual Analysis - Background colors and styles
2. DOM Position - Element hierarchy analysis
3. Class Names - CSS class pattern matching
4. Text Content - Direct text content analysis

**Supported Views**: Dag, Week, Maand, Lijst

### 3. Overlay Visibility Validator (`overlay-visibility-validator.js`)
**Purpose**: Validates that created overlays are actually visible and properly positioned.

**Validation Criteria**:
- Visible in viewport (30% weight)
- Proper dimensions (25% weight)
- Correct positioning (20% weight)
- Appropriate opacity (15% weight)
- Correct z-index (10% weight)

**Features**:
- Retry logic with configurable attempts
- Scoring system (0-1, passing threshold: 0.7)
- Validation history tracking
- Performance metrics

## Data Flow

### Extension Initialization Flow
```
1. DOM Ready → Extension Orchestrator
2. Page Validation → Show/Hide UI
3. Manager Configuration → Inject script executors
4. View Detection → Switch to Maand view if needed
5. Settings Loading → Configure UI dropdowns
6. UI Setup → Bind event handlers
7. Overlay Validation → Enable automatic validation
8. Success Feedback → Extension ready
```

### Overlay Creation Flow
```
1. Button Click → UI Manager
2. Get Overlay Data → From settings/configuration
3. Script Injection → Into active tab
4. Calendar Detection → Multiple fallback selectors
5. Week Cell Detection → Text pattern matching
6. Bounds Calculation → Position and size
7. Overlay Creation → DOM element injection
8. Text Label → Centered overlay text
9. Success/Error → Visual button feedback
```

## Error Handling Strategy

### Error Categories
1. **Validation Errors**: Invalid URLs, missing settings
2. **Detection Errors**: View/calendar not found
3. **UI Errors**: Missing elements, event failures
4. **Overlay Errors**: Creation, positioning failures
5. **Permission Errors**: Tab access, script injection denied
6. **Network Errors**: Chrome API, DOM access issues

### Recovery Mechanisms
- **Graceful Degradation**: Limited functionality when components fail
- **Retry Logic**: Automatic retries for transient failures
- **Fallback Strategies**: Multiple approaches for critical operations
- **User Feedback**: Clear error messages and recovery instructions

## Performance Optimizations

### Logging System
- **Environment Detection**: Production vs development logging levels
- **Threshold-based Performance Warnings**: >100ms operations flagged
- **History Limits**: Automatic cleanup of old log entries
- **Async Timer Functions**: Non-blocking performance measurement

### Overlay Creation
- **Calendar Detection Caching**: Avoid repeated DOM queries
- **Resize Handlers**: Debounced window resize updates
- **Element Cleanup**: Automatic removal of old overlays
- **Batch DOM Updates**: Minimize reflow/repaint cycles

## Security Considerations

### Content Security Policy (CSP)
- **No Inline Scripts**: All JavaScript in external files
- **Script Injection**: Secure Chrome scripting API usage
- **Permission Model**: Minimal required permissions

### Input Validation
- **URL Validation**: Strict page URL checking  
- **Settings Validation**: Configuration data verification
- **Error Sanitization**: Safe error message display

## Deployment Methods

### Chrome Extension
- **Manifest V3**: Modern extension platform
- **Popup-based UI**: Clean browser integration
- **Persistent Settings**: Chrome storage API
- **Auto-updates**: Extension platform benefits

### Bookmarklet
- **Self-contained**: Single JavaScript file
- **No Installation**: Works on managed computers
- **Manual Activation**: User-initiated per session
- **CDN Delivery**: GitHub Pages or similar hosting

## Configuration Management

### Settings Structure
```javascript
{
  academicYear: "25-26",
  defaultBlok: "blok1", 
  defaultModule: "2000PRR_22",
  defaultCourse: "Operations",
  bloks: {
    blok1: {
      name: "Blok 1",
      startWeek: 36,
      endWeek: 44,
      modules: {
        "2000PRR_22": {
          courses: {
            Operations: { sprint1: {...}, sprint2: {...}, sprint3: {...} },
            GRC: { sprint1: {...}, sprint2: {...}, sprint3: {...} }
          }
        }
      }
    }
  }
}
```

### Overlay Configuration
- **Week Ranges**: Sprint and blok periods
- **Day-specific**: Toets and assessment dates
- **Visual Settings**: Colors, opacity, positioning
- **Calendar Selectors**: Multiple fallback patterns

## Browser Compatibility

### Supported Browsers
- **Chrome**: Full support (primary target)
- **Edge**: Full support (Chromium-based)
- **Firefox**: Bookmarklet only
- **Safari**: Limited support

### Required APIs
- **Chrome Extensions**: Manifest V3, scripting API, storage API
- **Web Standards**: ES6+, DOM APIs, CSS3
- **Optional Features**: Performance API, Clipboard API

## Future Enhancements

### Planned Features
1. **Multiple Academic Years**: Dynamic year configuration
2. **Custom Overlay Colors**: User-configurable themes
3. **Export/Import Settings**: Configuration backup/restore
4. **Advanced Scheduling**: Custom period definitions
5. **Integration APIs**: LMS/SIS system connections

### Architecture Improvements
1. **Module Federation**: Dynamic component loading
2. **Service Worker**: Background processing
3. **Offline Support**: Local caching strategies
4. **Real-time Updates**: WebSocket-based notifications