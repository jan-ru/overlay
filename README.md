# Overlay Toggle Chrome Extension

A Chrome extension designed for lecturers to display course sprint overlays on the HvA "rooster" (schedule) application. The extension provides visual indicators for different course phases (Sprint 1, 2, 3) by detecting actual week numbers in the calendar and overlaying them with colored highlights.

## Architecture Overview

The extension uses Chrome's Manifest V3 architecture with a modular JavaScript structure and settings-based configuration to dynamically create calendar-anchored overlays.

### Core Components

- **manifest.json**: Extension configuration with scripting, activeTab permissions, and web-accessible resources
- **popup.html**: UI interface with Day, Sprint 1-3, text overlay, and debugging buttons
- **settings.json**: Configuration file defining course code and sprint week ranges
- **Modular JavaScript Architecture**:
  - **popup-main.js**: Main orchestration and event handling
  - **config.js**: Constants and configuration objects
  - **settings-loader.js**: Settings loading and validation
  - **calendar-overlays.js**: Day and Sprint overlay functions
  - **text-overlays.js**: Text overlay functionality  
  - **multicolor-overlays.js**: Multicolor banner functionality
  - **calendar-utils.js**: Shared calendar detection utilities

## How It Works

The extension detects calendar week numbers in the HvA rooster and creates colored overlays for configured sprint periods. It uses intelligent calendar detection with fallback strategies and only displays overlays when the target weeks are actually found in the calendar.

**Key Features:**
- **Week-based detection** - Finds "week 36", "week 37815" patterns in calendar cells
- **Settings-driven** - Configure sprint weeks via `settings.json`
- **Calendar-anchored** - Overlays position relative to actual calendar, not fixed coordinates  
- **Smart fallbacks** - No overlay if target weeks not found (prevents incorrect displays)

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
├── popup.html                # UI interface with modular script loading
├── settings.json             # Sprint configuration and course settings
├── popup-main.js             # Main orchestration and event handling
├── config.js                 # Constants and configuration objects
├── settings-loader.js        # Settings loading and validation
├── calendar-overlays.js      # Day and Sprint overlay functions
├── text-overlays.js          # Text overlay functionality
├── multicolor-overlays.js    # Multicolor banner functionality
├── calendar-utils.js         # Shared calendar detection utilities
├── ico/                      # Extension icons (16px, 32px, 48px, 128px)
└── README.md                # This file
```

## Usage

1. Navigate to the HvA rooster application (https://rooster.hva.nl/*)
2. Click the extension icon in Chrome toolbar  
3. Select desired overlay type:
   - **Day**: Highlights today's date in red
   - **Sprint 1-3**: Highlights configured sprint weeks with color coding
   - **Text Overlays**: Individual floating text labels (toggleable)
   - **Multicolor Banners**: Five horizontal color bands across calendar
   - **Debug Calendar**: Analyzes calendar structure for troubleshooting

### Configuration

The `settings.json` file is self-documenting with instructions and examples. Edit the week numbers to match your course schedule. After making changes, reload the extension in Chrome.

For troubleshooting issues, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md).

## Technical Notes

- **Chrome Manifest V3** with scripting and activeTab permissions
- **Modular JavaScript architecture** - 6 separate files for maintainability  
- **Settings-driven configuration** - JSON file with validation
- **Calendar-anchored positioning** - Overlays adapt to actual calendar layout
- **No external dependencies** - Uses only standard web APIs

---

*Extension Version: 1.1 | Modular Architecture | Last updated: 2025-08-27*