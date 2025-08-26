# Overlay Toggle Chrome Extension

A Chrome extension designed for lecturers to display course sprint overlays on the standard "rooster" (schedule) application. The extension provides visual indicators for different course phases (Sprint 1, 2, 3) to help students understand the current course timeline.

## Architecture Overview

The extension uses Chrome's Manifest V3 architecture with content script injection to dynamically create overlays on the rooster application.

### Core Components

- **manifest.json**: Extension configuration with scripting and activeTab permissions
- **popup.html**: UI interface with sprint buttons, text overlays, and debugging tools
- **popup.js**: Main logic handling overlay creation, calendar detection, and user interactions

## Technical Implementation

### Smart Overlay System

The extension implements an intelligent calendar detection system that dynamically sizes overlays based on the rooster application's layout:

```javascript
// Calendar detection strategy
1. Analyze all <table> elements on the page
2. Score tables based on size, position, and GWT class patterns
3. Use highest-scoring table for overlay positioning
4. Fallback to responsive sizing if no suitable table found
```

#### Scoring Algorithm
- Width > 600px: +3 points
- Width > 800px: +2 points
- Height > 1000px: +3 points
- Left position < 50px: +2 points
- Top position 100-200px: +2 points
- GWT class patterns: +3 points

### Overlay Types

#### 1. Sprint Overlays
- **Sprint 1**: Blue overlay (`rgba(0,0,255,0.3)`)
- **Sprint 2**: Gray overlay (`rgba(0,0,0,0.3)`)
- **Sprint 3**: Green overlay (`rgba(0,255,0,0.3)`)

Position: `top: 152px` (below typical rooster header)
Z-index: `999999` (ensures visibility over rooster content)

#### 2. Text Overlays
Fixed position text labels with customizable vertical positioning:
- Text Sprint 1-3
- Text Vakantie (Holiday)
- Text Toets (Exam)

Styling: 32px bold white text with black shadow for readability

#### 3. Multicolor Banners
Five horizontal colored bands (gray, blue, green, red, yellow) with 20% height each, starting at y-position 153px.

### GWT Application Compatibility

The rooster application uses Google Web Toolkit (GWT), which generates obfuscated class names. The extension handles this through:

1. **Pattern Matching**: Detects GWT-style class names (`^[A-Z0-9]{8}-$`)
2. **Specific Class Detection**: Looks for known patterns like `GNKVYU1C`
3. **Fallback Strategy**: Uses `.gwt-TabLayoutPanelContent` as secondary detection method

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
overlay-toggle/
├── manifest.json          # Extension configuration
├── popup.html            # UI interface
├── popup.js              # Main application logic
└── README.md            # This file
```

## Usage

1. Navigate to the rooster application
2. Click the extension icon in Chrome toolbar
3. Select desired overlay type:
   - **Sprint Overlays**: Visual coverage of calendar area
   - **Text Overlays**: Floating text labels
   - **Multicolor Banners**: Horizontal color bands

### Debugging Tools

#### Debug Calendar
Analyzes page structure and logs table dimensions, GWT elements, and scoring results to console.

#### Track Click Coordinates
Logs mouse click coordinates for positioning refinement.

#### Test Overlay
Creates a highly visible red test overlay for troubleshooting visibility issues.

## Technical Notes

### Content Security Policy
The extension uses `chrome.scripting.executeScript()` for dynamic code injection, compatible with CSP restrictions.

### State Management
- Overlays are toggled (create/remove) on button clicks
- Only one overlay type active at a time per category
- No persistent state storage required

### Error Handling
- Graceful fallback to standard overlay if smart detection fails
- Console logging for debugging calendar detection
- Permission checks for tab access

### Browser Compatibility
- Chrome Manifest V3
- Requires `scripting` and `activeTab` permissions
- No external dependencies

## Troubleshooting

### Overlay Not Visible
1. Check browser console for detection logs
2. Use "Test Overlay" to verify script injection works
3. Verify rooster page is fully loaded before applying overlay
4. Check if page URL allows script injection (not chrome:// pages)

### Calendar Detection Issues
1. Run "Debug Calendar" to analyze page structure
2. Check console for table scoring results
3. Verify GWT class patterns match current rooster version
4. Extension falls back to responsive sizing automatically

### Permission Errors
- Ensure extension has `activeTab` permission
- Reload extension if permissions seem stale
- Verify rooster tab is active when using extension

## Future Development Notes

### Potential Improvements
- Persistent overlay preferences
- Custom color selection
- Multiple overlay profiles
- Automatic sprint period detection
- Integration with academic calendar systems

### Code Maintenance
- Monitor rooster application updates for GWT class changes
- Update scoring algorithm if layout patterns change
- Consider using MutationObserver for dynamic content changes

## Dependencies

- Chrome Extensions API (Manifest V3)
- No external JavaScript libraries
- Compatible with standard web technologies (HTML5, CSS3, ES6+)

---

*Last updated: [Current Date]*
*Extension Version: 1.1*