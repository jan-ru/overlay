# HvA Calendar Overlay Extension

![Chrome Extension](https://img.shields.io/badge/Chrome%20Extension-v2.0-blue?logo=googlechrome)
![Manifest V3](https://img.shields.io/badge/manifest-v3-green?logo=googlechrome)
![License](https://img.shields.io/badge/license-MIT-green)

A Chrome extension for HvA lecturers to display academic calendar overlays on the rooster application. Features unified overlay system, centralized error handling, optimized logging, and dual deployment options for maximum compatibility.

## Architecture Overview

The extension uses Chrome's Manifest V3 architecture with a streamlined, unified overlay system and centralized configuration management for reliable calendar-anchored overlays.

### Core Components

- **manifest.json**: Extension configuration with scripting, activeTab permissions
- **popup.html**: UI with course selector and overlay buttons (Blok, Sprints 1-3, Rooster Vrij, Toets, Assessment)
- **settings.json**: Academic hierarchy with both sprint-based and day-specific courses
- **bookmarklet/**: Standalone bookmarklet version for managed PC environments
- **Streamlined JavaScript Architecture**:
  - **overlay-core.js**: Unified overlay creation library (shared with bookmarklet)
  - **popup-main.js**: Main orchestration, page validation, and event handling
  - **settings-loader.js**: Hierarchical settings with consolidated validation
  - **calendar-overlays.js**: Unified overlay functions for all overlay types
  - **shared-ui.js**: Centralized UI generation for both extension and bookmarklet
  - **logger.js**: Centralized logging with production optimization
  - **error-handler.js**: Standardized error handling patterns

## How It Works

The extension detects calendar week numbers in the HvA rooster and creates colored overlays for configured sprint periods. It uses intelligent calendar detection with fallback strategies and only displays overlays when the target weeks are actually found in the calendar.

**Key Features:**
- **Multiple deployment options** - Chrome extension or bookmarklet for managed environments
- **Page validation** - Only activates on rooster.hva.nl/schedule pages
- **Sprint and day-specific overlays** - Week ranges for sprints, specific days for tests/assessments
- **Course selection** - Dropdown to choose between all configured courses
- **Calendar-anchored positioning** - Overlays adapt to actual calendar layout
- **Smart detection fallbacks** - No overlay if target periods not found

## Installation Options

### Chrome Extension
1. Chrome -> Extensions -> Developer Mode ON
2. Click "Load Unpacked" and select overlay-extension/ directory
3. Extension icon appears in toolbar

### Bookmarklet (Managed PCs)
1. Open bookmarklet/bookmarklet.html in browser
2. Copy the JavaScript code from the text area
3. Create new bookmark with the copied code as URL
4. Use bookmark on rooster.hva.nl/schedule pages

### File Structure
```
overlay-extension/
├── manifest.json              # Extension configuration
├── popup.html                # UI with course selector and overlay buttons
├── settings.json             # Academic hierarchy with sprint and day-specific courses
├── overlay-core.js           # Unified overlay library (shared with bookmarklet)
├── popup-main.js             # Main orchestration, page validation, event handling
├── settings-loader.js        # Hierarchical settings with consolidated validation
├── calendar-overlays.js      # Unified overlay functions for all overlay types
├── logger.js                 # Centralized logging with production optimization
├── error-handler.js          # Standardized error handling patterns
bookmarklet/
├── overlay-bookmarklet.js    # Self-contained bookmarklet with shared UI config
├── bookmarklet.html          # Installation page for bookmarklet
shared-ui.js                  # Centralized UI generation for both deployment methods
ico/                          # Extension icons
```

## Usage

1. Navigate to https://rooster.hva.nl/schedule
2. Click extension icon or bookmarklet
3. Select course from dropdown (Operations, GRC, Toets, Assessment)
4. Choose overlay type:
   - **Blok**: Highlights entire blok period with gray overlay
   - **Sprint 1-3**: Color-coded overlays for configured sprint weeks
   - **Rooster Vrij**: Purple overlay for schedule-free period
   - **Toets/Assessment**: Day-specific overlays for test/assessment days
5. Click same button again to remove overlay

### Configuration

The `settings.json` file supports both sprint-based courses (with startWeek/endWeek for each sprint) and day-specific courses (with weekNumber/dayNumber). After changes, reload the extension.

For troubleshooting issues, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md).

## Technical Notes

- **Unified overlay system** - Single parameterized function handles all overlay types
- **Centralized configuration** - Shared UI and overlay configs between extension and bookmarklet
- **Production-optimized logging** - Automatic debug log removal in production builds
- **Standardized error handling** - Consistent error patterns with contextual logging
- **Streamlined architecture** - 16% code reduction while maintaining full functionality
- **No external dependencies** - Pure JavaScript with standard web APIs

---

*Extension Version: 2.2 | Unified Architecture | Updated: 2025-08-30*