# Development Guide

## Project Structure

```
overlay/
├── overlay-extension/          # Chrome Extension
│   ├── manifest.json          # Extension manifest (V3)
│   ├── popup.html             # Extension popup UI
│   ├── popup-init.js          # Popup initialization
│   ├── config.js              # Course and sprint configuration
│   ├── extension-orchestrator.js  # Main coordinator
│   ├── page-validator.js      # URL validation
│   ├── view-manager.js        # View detection & switching
│   ├── ui-manager.js          # UI management & overlay creation
│   ├── logger.js              # Universal logging system
│   ├── error-handling-core.js # Standardized error handling
│   ├── view-detection-core.js # Shared view detection
│   ├── overlay-visibility-validator.js # Overlay validation
│   └── overlay-core.js        # Core overlay rendering
├── bookmarklet/               # Bookmarklet deployment
│   ├── overlay-bookmarklet.js # Self-contained bookmarklet
│   └── bookmarklet.html       # Installation page
└── docs/                     # Documentation
    ├── index.html            # Main documentation page
    ├── architecture.md       # System architecture
    ├── api-reference.md      # API documentation
    └── development-guide.md  # This file
```

## Development Setup

### Prerequisites
- Chrome Browser (for extension development)
- Code editor (VS Code recommended)
- Basic understanding of JavaScript, DOM manipulation, and Chrome Extension APIs

### Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd overlay
   ```

2. **Load the extension in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right)
   - Click "Load unpacked"
   - Select the `overlay-extension` folder

3. **Test the extension**
   - Navigate to `https://rooster.hva.nl/schedule`
   - Click the extension icon in the toolbar
   - Test overlay functionality

## Architecture Overview

### Modular Design
The system follows a modular architecture with separated concerns:

- **Extension Orchestrator**: Main coordinator
- **Page Validator**: URL and page validation  
- **View Manager**: Calendar view detection and switching
- **UI Manager**: User interface and overlay creation
- **Shared Utilities**: Error handling, logging, view detection

### Error Handling Strategy
Standardized error handling with:
- Categorized error codes
- Consistent result objects
- Graceful degradation
- User-friendly messages

### Logging System
Universal logging supporting:
- Multiple applications (extension/bookmarklet)
- Performance monitoring
- Categorized logging (INIT, VIEW, OVERLAY, etc.)
- Development/production modes

## Component Development

### Creating New Components

1. **Follow the established patterns**
   ```javascript
   class NewComponent {
     constructor(logger, dependencies) {
       this.logger = logger;
       // Initialize dependencies
     }
     
     async initialize() {
       this.logger.log('INIT', 'NewComponent initializing');
       // Implementation
     }
   }
   ```

2. **Use error handling**
   ```javascript
   const errorHandler = new ErrorHandlingCore();
   
   async someMethod() {
     try {
       // Implementation
       return errorHandler.createSuccess('Operation completed');
     } catch (error) {
       return errorHandler.createError('ui', 'OPERATION_FAILED', 
         'Operation failed', error);
     }
   }
   ```

3. **Integrate logging**
   ```javascript
   this.logger.startTimer('operation-timer', 'PERFORMANCE');
   // Operation
   this.logger.endTimer('operation-timer', 'Operation completed');
   ```

### View Detection Development

The view detection system uses 4 fallback strategies:

1. **Visual Analysis** (Primary)
   - Analyzes background colors of view buttons
   - Most reliable method

2. **DOM Position** (Secondary)  
   - Examines DOM hierarchy and positioning
   - Fallback for styled interfaces

3. **Class Names** (Tertiary)
   - Pattern matching on CSS classes
   - Works when styling is consistent

4. **Text Content** (Final)
   - Direct text analysis
   - Last resort method

### Adding New Views

To support additional calendar views:

1. Update `VIEW_TYPES` in `view-detection-core.js`
2. Add detection logic for each strategy
3. Update UI components to handle new views
4. Add configuration for the new view

## Extension Development

### Manifest V3 Considerations
- No background scripts, use service workers
- Limited host permissions
- Content Security Policy restrictions
- Declarative net request for network modifications

### Script Injection Patterns
```javascript
// Execute script in active tab
async executeScript(func, args = []) {
  try {
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: func,
      args: args || []
    });
    return results[0]?.result;
  } catch (error) {
    throw error;
  }
}
```

### Storage Management
```javascript
// Save settings
await chrome.storage.local.set({
  'overlay-settings': settings
});

// Load settings
const result = await chrome.storage.local.get('overlay-settings');
const settings = result['overlay-settings'] || defaultSettings;
```

## Testing Strategy

### Manual Testing Checklist

**Extension Installation:**
- [ ] Extension loads without errors
- [ ] Popup displays correctly
- [ ] All components initialize successfully

**Page Validation:**
- [ ] Works only on supported URLs
- [ ] Shows appropriate messages for invalid pages
- [ ] Handles permission errors gracefully

**View Detection:**
- [ ] Correctly detects current view (dag/week/maand/lijst)
- [ ] Switches to Maand view when needed
- [ ] Handles detection failures appropriately

**Overlay Creation:**
- [ ] Creates overlays for all sprint types
- [ ] Positions overlays correctly
- [ ] Handles window resize events
- [ ] Clears overlays when toggled off

**Error Handling:**
- [ ] Displays user-friendly error messages
- [ ] Logs errors for debugging
- [ ] Recovers gracefully from failures

### Browser Testing
Test across different browsers:
- Chrome (primary)
- Edge (Chromium-based)
- Firefox (bookmarklet only)

### Performance Testing
Monitor performance with the enhanced logger:
- Initialization timing
- View detection speed
- Overlay creation performance
- Memory usage

## Debugging

### Debug Tools

1. **Chrome DevTools**
   - Extension popup: Right-click → Inspect
   - Background scripts: `chrome://extensions/` → Inspect views
   - Content scripts: Regular DevTools

2. **Enhanced Logger**
   ```javascript
   // Get logging history
   logger.getHistory('ERROR', 20);
   
   // Export logs
   logger.exportLogs();
   ```

3. **Console Commands**
   ```javascript
   // Test view detection
   ViewDetectionCore.detectCurrentView();
   
   // Test overlay creation
   overlayManager.createOverlay({...config});
   ```

### Common Issues

**Extension not loading:**
- Check manifest.json syntax
- Verify file permissions
- Look for CSP violations

**Script injection failures:**
- Check activeTab permission
- Verify target page URL
- Look for content security policies

**Overlay positioning issues:**
- Calendar container detection
- Week cell identification
- CSS z-index conflicts

## Code Quality

### Standards
- Use ES6+ features
- Follow consistent naming conventions
- Add JSDoc comments for public methods
- Keep functions focused and testable

### Error Handling
- Always use try/catch for async operations
- Return standardized result objects
- Log errors with appropriate categories
- Provide user-friendly error messages

### Performance
- Minimize DOM queries
- Cache expensive operations
- Use throttling for resize events
- Clean up event listeners

## Deployment

### Chrome Extension

1. **Build preparation**
   ```bash
   # Ensure all files are present
   ls overlay-extension/
   
   # Validate manifest
   cat overlay-extension/manifest.json
   ```

2. **Package extension**
   - Zip the `overlay-extension` folder
   - Or use Chrome's "Pack extension" feature

3. **Chrome Web Store**
   - Create developer account
   - Upload extension package
   - Complete store listing
   - Submit for review

### Bookmarklet

1. **Host the script**
   - Upload `overlay-bookmarklet.js` to CDN
   - Update bookmarklet URL references

2. **Generate bookmarklet**
   ```javascript
   javascript:(function(){
     var s=document.createElement('script');
     s.src='https://cdn.example.com/overlay-bookmarklet.js';
     document.head.appendChild(s);
   })();
   ```

3. **Distribution**
   - Host installation page
   - Provide drag-and-drop instructions
   - Include manual installation steps

## Contributing

### Code Style
- 2-space indentation
- Single quotes for strings
- Trailing commas in objects/arrays
- Descriptive variable names

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/new-functionality

# Make changes and commit
git add .
git commit -m "Add new functionality"

# Push and create pull request
git push origin feature/new-functionality
```

### Pull Request Process
1. Update documentation if needed
2. Ensure all tests pass
3. Add screenshots for UI changes
4. Request code review

## Future Enhancements

### Planned Features
- Multiple academic years support
- Custom overlay colors
- Settings import/export
- Advanced scheduling options
- LMS integration APIs

### Architecture Improvements
- Module federation for dynamic loading
- Service worker for background processing
- Offline support with local caching
- WebSocket notifications

### Development Tools
- Automated testing framework
- Build process optimization
- Code coverage reporting
- Performance benchmarking