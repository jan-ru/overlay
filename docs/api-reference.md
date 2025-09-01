# API Reference

## Core Modules

### ErrorHandlingCore (`error-handling-core.js`)

#### Error Categories
```javascript
const ERROR_CATEGORIES = {
  VALIDATION: 'validation',    // Page/input validation failures
  DETECTION: 'detection',      // View/element detection failures  
  UI: 'ui',                   // Interface interaction failures
  OVERLAY: 'overlay',         // Overlay creation/positioning failures
  PERMISSION: 'permission',   // Browser permission issues
  NETWORK: 'network'          // System/API communication failures
}
```

#### Methods

##### `createError(category, code, message, details = null)`
Creates a standardized error object.

**Parameters:**
- `category` (string): Error category from ERROR_CATEGORIES
- `code` (string): Specific error code 
- `message` (string): Human-readable error message
- `details` (any, optional): Additional error context

**Returns:** Error object
```javascript
{
  success: false,
  category: string,
  code: string, 
  message: string,
  details: any,
  timestamp: Date
}
```

##### `createSuccess(message, data = null)`
Creates a standardized success object.

**Parameters:**
- `message` (string): Success message
- `data` (any, optional): Success payload

**Returns:** Success object
```javascript
{
  success: true,
  message: string,
  data: any,
  timestamp: Date
}
```

##### `wrapFunction(fn, category, errorCode)`
Wraps a function with automatic error handling.

**Parameters:**
- `fn` (function): Function to wrap
- `category` (string): Error category for failures
- `errorCode` (string): Error code for failures

**Returns:** Wrapped function that returns result objects

---

### ViewDetectionCore (`view-detection-core.js`)

Core view detection utility supporting 4 fallback strategies.

#### Constructor
```javascript
new ViewDetectionCore()
```

#### Methods

##### `detectCurrentView()`
Detects the currently active calendar view using fallback strategies.

**Returns:** Promise<Object>
```javascript
{
  success: boolean,
  view: 'dag' | 'week' | 'maand' | 'lijst' | null,
  confidence: number,   // 0-1 confidence score
  method: string,       // Detection method used
  details: any
}
```

**Fallback Strategies:**
1. Visual Analysis - Background color detection
2. DOM Position - Element hierarchy analysis  
3. Class Names - CSS class pattern matching
4. Text Content - Direct text analysis

##### `switchToView(targetView, maxRetries = 3)`
Switches to the specified calendar view with retries.

**Parameters:**
- `targetView` (string): Target view ('dag', 'week', 'maand', 'lijst')
- `maxRetries` (number): Maximum retry attempts

**Returns:** Promise<Object>
```javascript
{
  success: boolean,
  message: string,
  fromView: string,
  toView: string,
  attempts: number
}
```

---

### Enhanced Logger (`logger.js`)

Universal logging system supporting multiple applications.

#### Categories
```javascript
const CATEGORIES = {
  INIT: 'INIT',           // Initialization and startup
  VIEW: 'VIEW',           // View detection and switching
  OVERLAY: 'OVERLAY',     // Overlay creation and management
  UI: 'UI',              // User interface interactions
  VALIDATION: 'VALIDATION', // Page and input validation
  PERFORMANCE: 'PERF',    // Performance monitoring
  ERROR: 'ERROR',         // Error conditions
  USER: 'USER'           // User actions and feedback
}
```

#### Factory Methods

##### `Logger.forExtension()`
Creates logger instance for Chrome extension context.

**Returns:** Logger instance with extension-specific configuration

##### `Logger.forBookmarklet()`
Creates logger instance for bookmarklet context.

**Returns:** Logger instance with bookmarklet-specific configuration

#### Instance Methods

##### `log(category, message, data = null)`
Logs a message with specified category.

**Parameters:**
- `category` (string): Log category from CATEGORIES
- `message` (string): Log message
- `data` (any, optional): Additional log data

##### `startTimer(timerId, category = 'PERFORMANCE')`
Starts a performance timer.

**Parameters:**
- `timerId` (string): Unique timer identifier
- `category` (string): Log category for timer results

##### `endTimer(timerId, successMessage, warnThreshold = 100)`
Ends a performance timer and logs results.

**Parameters:**
- `timerId` (string): Timer identifier from startTimer
- `successMessage` (string): Message for successful completion
- `warnThreshold` (number): Milliseconds threshold for warnings

##### `getHistory(category = null, limit = 50)`
Retrieves log history.

**Parameters:**
- `category` (string, optional): Filter by category
- `limit` (number): Maximum entries to return

**Returns:** Array of log entries

---

## Extension Components

### ExtensionOrchestrator (`extension-orchestrator.js`)

Main coordinator for Chrome extension initialization.

#### Constructor
```javascript
new ExtensionOrchestrator()
```

#### Methods

##### `async initialize()`
Performs step-by-step extension initialization.

**Returns:** Promise<void>

**Initialization Steps:**
1. Logger setup
2. Page validation
3. Component configuration
4. View detection and switching
5. Settings loading
6. UI initialization
7. Success feedback

##### `async executeScript(func, args = [])`
Executes a function in the active tab context.

**Parameters:**
- `func` (function): Function to execute
- `args` (array): Arguments for the function

**Returns:** Promise with script execution result

---

### PageValidator (`page-validator.js`)

Handles URL validation and page state management.

#### Constructor
```javascript
new PageValidator(logger, scriptExecutor)
```

#### Methods

##### `async validateAndShowUI()`
Validates current page and shows/hides appropriate UI.

**Returns:** Promise<Object>
```javascript
{
  success: boolean,
  message: string,
  isValidPage: boolean,
  currentUrl: string
}
```

**Valid URLs:** `https://rooster.hva.nl/schedule*`

---

### ViewManager (`view-manager.js`)

Manages view detection, switching, and user feedback.

#### Constructor
```javascript
new ViewManager(logger, scriptExecutor)
```

#### Methods

##### `async checkAndSwitchToMaandView()`
Ensures calendar is in 'Maand' view, switches if necessary.

**Returns:** Promise<Object>
```javascript
{
  success: boolean,
  message: string,
  currentView: string,
  switchPerformed: boolean
}
```

##### `async showUserNotification(message, type = 'info', duration = 3000)`
Displays user notification on the page.

**Parameters:**
- `message` (string): Notification message
- `type` (string): 'success', 'warning', 'error', 'info'
- `duration` (number): Display duration in milliseconds

---

### UIManager (`ui-manager.js`)

Manages UI initialization, course selection, and overlay creation.

#### Constructor
```javascript
new UIManager(logger, scriptExecutor)`
```

#### Methods

##### `async initializeUI()`
Initializes course dropdown and overlay buttons.

**Returns:** Promise<Object>

##### `async createOverlayDirectly(config)`
Creates calendar overlay using direct script injection.

**Parameters:**
- `config` (object): Overlay configuration
```javascript
{
  type: 'blok' | 'sprint1' | 'sprint2' | 'sprint3',
  course: string,
  color: string,
  opacity: number,
  startWeek: number,
  endWeek: number
}
```

**Returns:** Promise<Object>

---

## Utility Components

### OverlayVisibilityValidator (`overlay-visibility-validator.js`)

Validates that created overlays are properly visible and positioned.

#### Constructor
```javascript
new OverlayVisibilityValidator(config = {})
```

**Config Options:**
```javascript
{
  passingThreshold: 0.7,    // Score threshold for passing
  maxRetries: 3,            // Maximum validation attempts
  retryDelay: 500          // Delay between retries (ms)
}
```

#### Methods

##### `async validateOverlay(overlayElement, expectedConfig = {})`
Validates an overlay element's visibility and positioning.

**Parameters:**
- `overlayElement` (HTMLElement): Overlay element to validate
- `expectedConfig` (object): Expected overlay configuration

**Returns:** Promise<Object>
```javascript
{
  success: boolean,
  score: number,           // 0-1 validation score
  details: {
    viewport: number,      // Viewport visibility (0-1)
    dimensions: number,    // Size validation (0-1)
    positioning: number,   // Position validation (0-1)
    opacity: number,       // Opacity validation (0-1)
    zIndex: number        // Z-index validation (0-1)
  },
  recommendations: string[]
}
```

**Scoring Weights:**
- Viewport visibility: 30%
- Proper dimensions: 25%
- Correct positioning: 20%
- Appropriate opacity: 15%
- Correct z-index: 10%

##### `getValidationHistory(limit = 10)`
Returns recent validation history.

**Returns:** Array of validation results

---

## Configuration

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
            Operations: {
              sprint1: { startWeek: 36, endWeek: 37, color: "#0c7" },
              sprint2: { startWeek: 38, endWeek: 40, color: "#fa0" },
              sprint3: { startWeek: 41, endWeek: 44, color: "#07c" }
            },
            GRC: {
              sprint1: { startWeek: 36, endWeek: 37, color: "#0c7" },
              sprint2: { startWeek: 38, endWeek: 40, color: "#fa0" },
              sprint3: { startWeek: 41, endWeek: 44, color: "#07c" }
            }
          }
        }
      }
    }
  }
}
```

### DOM Configuration Constants
```javascript
const DOM_CONFIG = {
  TRAVERSAL_LEVELS: 4,              // Maximum parent traversal
  SWITCH_VERIFICATION_DELAY: 800,   // View switch verification delay
  NOTIFICATION_DURATION: 3000,      // User notification duration
  RETRY_DELAY: 500,                // Generic retry delay
  OVERLAY_Z_INDEX: 1000,           // Overlay stacking order
  OVERLAY_OPACITY: 0.3             // Default overlay opacity
}
```

## Error Codes

### Validation Errors
- `INVALID_URL`: Page URL not supported
- `MISSING_SETTINGS`: Configuration not loaded
- `INVALID_COURSE`: Course not found in settings

### Detection Errors  
- `VIEW_NOT_DETECTED`: Cannot determine current view
- `CALENDAR_NOT_FOUND`: Calendar container not found
- `WEEK_CELLS_NOT_FOUND`: Week cells not detected

### UI Errors
- `DROPDOWN_INIT_FAILED`: Course dropdown setup failed
- `BUTTON_BINDING_FAILED`: Event handler binding failed
- `NOTIFICATION_FAILED`: User notification display failed

### Overlay Errors
- `OVERLAY_CREATION_FAILED`: Overlay element creation failed
- `POSITIONING_FAILED`: Overlay positioning failed
- `VISIBILITY_VALIDATION_FAILED`: Overlay not properly visible

### Permission Errors
- `TAB_ACCESS_DENIED`: Cannot access active tab
- `SCRIPT_INJECTION_DENIED`: Script execution blocked

### Network Errors
- `CHROME_API_ERROR`: Chrome extension API failure
- `DOM_ACCESS_ERROR`: Document access blocked