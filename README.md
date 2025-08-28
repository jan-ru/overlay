# HvA Calendar Overlay Extension

![Chrome Extension](https://img.shields.io/badge/Chrome%20Extension-v2.0-blue?logo=googlechrome)
![Manifest V3](https://img.shields.io/badge/manifest-v3-green?logo=googlechrome)
![License](https://img.shields.io/badge/license-MIT-green)

A Chrome extension for HvA lecturers to display academic calendar overlays on the "rooster" application. Features hierarchical course structure (Academic Year > Blok > Module > Course) with sprint-based visual indicators and intelligent calendar detection.

## Architecture Overview

The extension uses Chrome's Manifest V3 architecture with a modular JavaScript structure and settings-based configuration to dynamically create calendar-anchored overlays.

### Core Components

- **manifest.json**: Extension configuration with scripting, activeTab permissions
- **popup.html**: UI with course selectors and overlay buttons (Blok, Sprints 1-3, Rooster Vrij, Toets, Assessment)
- **settings.json**: Academic hierarchy configuration (Academic Year > Bloks > Modules > Courses)
- **Modular JavaScript Architecture**:
  - **overlay-core.js**: Centralized overlay creation library (shared with bookmarklet)
  - **popup-main.js**: Main orchestration and event handling
  - **config.js**: Backwards-compatible access to centralized constants
  - **settings-loader.js**: Hierarchical settings loading and validation
  - **calendar-overlays.js**: Calendar overlay functions with week detection
  - **text-overlays.js**: Text overlay functionality

## How It Works

The extension detects calendar week numbers in the HvA rooster and creates colored overlays for configured sprint periods. It uses intelligent calendar detection with fallback strategies and only displays overlays when the target weeks are actually found in the calendar.

**Key Features:**
- **Hierarchical structure** - Academic Year (25-26) > Bloks (1-4) > Modules > Courses
- **Week-based detection** - Finds "week 36", "week 37815" patterns in calendar cells
- **Course selection** - Dropdown to choose between courses (Operations, GRC) in Process & Risk module
- **Calendar-anchored** - Overlays position relative to actual calendar layout
- **Smart fallbacks** - No overlay if target weeks/days not found

## Installation & Development

### Prerequisites
- Chrome browser with Developer Mode enabled
- Access to the rooster application

### Installation Steps
1. Clone/download the extension files
2. Open Chrome -> Extensions -> Developer Mode ON
3. Click "Load Unpacked" and select the extension directory
4. Extension icon appears in toolbar

### File Structure
```
overlay-extension/
├── manifest.json              # Extension configuration
├── popup.html                # UI with course selector and overlay buttons
├── settings.json             # Academic hierarchy (Bloks/Modules/Courses)
├── overlay-core.js           # Centralized overlay library (shared core)
├── popup-main.js             # Main orchestration and event handling
├── config.js                 # Backwards-compatible constant access
├── settings-loader.js        # Hierarchical settings management
├── calendar-overlays.js      # Calendar overlay functions
├── text-overlays.js          # Text overlay functionality
├── ico/                      # Extension icons
└── README.md                # This file
```

## Usage

1. Navigate to the HvA rooster application (https://rooster.hva.nl/*)
2. Click the extension icon in Chrome toolbar  
3. Select course from dropdown (Operations/GRC)
4. Choose overlay type:
   - **Blok**: Highlights entire blok period (weeks 36-44) with darker emphasis on today if within range
   - **Sprint 1-3**: Highlights configured sprint weeks with color coding and darker emphasis on today if within range
   - **Rooster Vrij**: Highlights schedule-free period (week 43) with purple overlay
   - **Toets/Assessment**: Placeholder functions for future implementation

### Configuration

The `settings.json` file defines the academic hierarchy: Academic Year > Bloks > Modules > Courses. Configure week ranges for bloks and sprints. After making changes, reload the extension in Chrome.

For troubleshooting issues, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md).

## Technical Notes

- **Chrome Manifest V3** with scripting and activeTab permissions
- **Hierarchical settings structure** - Academic Year > Bloks > Modules > Courses
- **Calendar-anchored positioning** - Overlays adapt to actual calendar layout
- **Smart week detection** - Only displays overlays when target weeks are found
- **No external dependencies** - Uses only standard web APIs

---

*Extension Version: 2.0 | Hierarchical Architecture | Last updated: 2025-08-28*