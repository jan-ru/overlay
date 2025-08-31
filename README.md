# HvA Calendar Overlay Extension

![Chrome Extension](https://img.shields.io/badge/Chrome%20Extension-v2.0-blue?logo=googlechrome)
![Manifest V3](https://img.shields.io/badge/manifest-v3-green?logo=googlechrome)
![License](https://img.shields.io/badge/license-MIT-green)

A Chrome extension for HvA lecturers to display academic calendar overlays on the rooster application. Features unified overlay system, automatic view detection and switching, centralized error handling, optimized logging, and dual deployment options for maximum compatibility.

## Architecture Overview

The extension uses Chrome's Manifest V3 architecture with a streamlined, unified overlay system and centralized configuration management for reliable calendar-anchored overlays.

### Core Components

- **manifest.json**: Extension configuration with scripting, activeTab permissions
- **popup.html**: UI with course selector and overlay buttons (Blok, Sprints 1-3, Rooster Vrij, Toets, Assessment)
- **settings.json**: Academic hierarchy with both sprint-based and day-specific courses
- **bookmarklet/**: Standalone bookmarklet version for managed PC environments
- **Modular JavaScript Architecture**:
  - **overlay-core.js**: Unified overlay creation library (shared with bookmarklet)
  - **extension-orchestrator.js**: Main coordination with step-by-step initialization
  - **page-validator.js**: URL validation and page state management
  - **view-manager.js**: View detection, switching, and user feedback
  - **ui-manager.js**: UI initialization, course selection, and button setup
  - **settings-loader.js**: Hierarchical settings with consolidated validation
  - **calendar-overlays.js**: Unified overlay functions for all overlay types
  - **shared-ui.js**: Centralized UI generation for both extension and bookmarklet
  - **logger.js**: Centralized logging with production optimization
  - **error-handler.js**: Standardized error handling patterns

## How It Works

The extension detects calendar week numbers in the HvA rooster and creates colored overlays for configured sprint periods. It uses intelligent calendar detection with fallback strategies and only displays overlays when the target weeks are actually found in the calendar.

**Key Features:**
- **Multiple deployment options** - Chrome extension or bookmarklet for managed environments
- **Automatic view detection** - Detects current calendar view (Dag, Week, Maand, Lijst)
- **Auto-switch to Maand view** - Automatically switches to "Maand" view for optimal overlay display
- **Page validation** - Only activates on rooster.hva.nl/schedule pages
- **Sprint and day-specific overlays** - Week ranges for sprints, specific days for tests/assessments
- **Course selection** - Dropdown to choose between all configured courses
- **Calendar-anchored positioning** - Overlays adapt to actual calendar layout
- **Smart detection fallbacks** - No overlay if target periods not found
- **User feedback notifications** - Visual feedback when view switching occurs

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
├── extension-orchestrator.js  # Main coordination with step-by-step initialization
├── page-validator.js         # URL validation and page state management
├── view-manager.js           # View detection, switching, and user feedback
├── ui-manager.js             # UI initialization, course selection, and button setup
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
3. **Automatic view switching** - Extension detects current view and switches to "Maand" view if needed
4. **View switch notification** - Green notification appears when view is switched
5. Select course from dropdown (Operations, GRC, Toets, Assessment)
6. Choose overlay type:
   - **Blok**: Highlights entire blok period with gray overlay
   - **Sprint 1-3**: Color-coded overlays for configured sprint weeks
   - **Rooster Vrij**: Purple overlay for schedule-free period
   - **Toets/Assessment**: Day-specific overlays for test/assessment days
7. Click same button again to remove overlay

### View Detection and Switching

The extension automatically ensures it operates in the "Maand" (Month) view for optimal overlay display:
- Detects current active view using visual background analysis
- Automatically switches from Dag/Week/Lijst to Maand view when needed
- Shows user notification when view switching occurs
- Verifies successful view change before proceeding
- Continues operation even if view detection fails

### Configuration

The `settings.json` file supports both sprint-based courses (with startWeek/endWeek for each sprint) and day-specific courses (with weekNumber/dayNumber). After changes, reload the extension.

For troubleshooting issues, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md).

## Technical Notes

- **Unified overlay system** - Single parameterized function handles all overlay types
- **Automatic view detection** - Uses visual background color analysis for reliable view identification
- **Smart view switching** - XPath-based element detection with clickable parent discovery
- **Centralized configuration** - Shared UI and overlay configs between extension and bookmarklet
- **Production-optimized logging** - Automatic debug log removal in production builds
- **Standardized error handling** - Consistent error patterns with contextual logging
- **Streamlined architecture** - 16% code reduction while maintaining full functionality
- **No external dependencies** - Pure JavaScript with standard web APIs

---

*Extension Version: 2.3 | View Detection & Auto-Switching | Updated: 2025-08-31*