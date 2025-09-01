# Troubleshooting Guide

## Quick Diagnosis

### Is the overlay system working?
1. Are you on `https://rooster.hva.nl/schedule`? ✅ Required
2. Is your calendar in Month view? ✅ Automatically switched
3. Did the extension/bookmarklet load successfully? ✅ Check console

### Extension vs Bookmarklet Issues
- **Extension problems**: Usually permission or installation issues
- **Bookmarklet problems**: Usually script loading or JavaScript restrictions

## Installation Issues

### Chrome Extension Won't Load

**Symptoms:**
- Extension doesn't appear in toolbar
- "Load unpacked" fails
- Extension shows as "corrupted"

**Solutions:**
```
1. Verify file structure:
   overlay-extension/
   ├── manifest.json ✅
   ├── popup.html ✅
   ├── popup-init.js ✅
   └── [other files] ✅

2. Check manifest.json syntax:
   - Valid JSON format
   - No trailing commas
   - All required fields present

3. Enable Developer Mode:
   - Go to chrome://extensions/
   - Toggle "Developer mode" ON
   - Refresh the page

4. Permissions check:
   - Right-click extension folder
   - Check file/folder permissions
   - Ensure Chrome can read all files
```

**Error Messages:**
- `"Manifest file is missing or unreadable"`: Check file permissions and JSON syntax
- `"Extension contains invalid manifest"`: Validate manifest.json format
- `"This extension may have been corrupted"`: Re-download and extract files

### Bookmarklet Installation Problems

**Symptoms:**
- Drag-and-drop doesn't work
- Bookmark doesn't execute
- "javascript:" prefix gets stripped

**Solutions:**
```
Method 1 - Manual Creation:
1. Create new bookmark manually
2. Name: "Calendar Overlays"
3. URL: [paste the javascript code]
4. Save in bookmarks bar

Method 2 - Copy-Paste:
1. Copy the provided JavaScript code
2. Edit an existing bookmark
3. Replace URL with the code
4. Ensure "javascript:" prefix remains

Method 3 - Browser-Specific:
Chrome: Right-click → "Add to bookmarks"
Firefox: Drag to bookmarks toolbar
Edge: Right-click → "Add to favorites"
```

## Runtime Errors

### Extension Errors

**"Extension not working on this page"**
```
Cause: Wrong URL or page type
Solution:
- Navigate to https://rooster.hva.nl/schedule
- Ensure you're logged into HvA rooster
- Refresh the page after navigation
```

**"Script execution failed" or "Cannot access tab"**
```
Cause: Permission or security restrictions
Solution:
1. Check activeTab permission in manifest
2. Reload the extension:
   - Go to chrome://extensions/
   - Click refresh icon on extension
3. Try on a fresh tab/window
```

**"Extension popup shows error"**
```
Cause: JavaScript errors in popup
Debug:
1. Right-click extension icon
2. Select "Inspect popup"
3. Check Console tab for errors
4. Note the specific error message
```

### Bookmarklet Errors

**"Nothing happens when clicking bookmarklet"**
```
Causes & Solutions:
1. JavaScript disabled:
   - Check browser settings
   - Enable JavaScript
   
2. Content Security Policy blocking:
   - Try on different page first
   - Check console for CSP errors
   
3. Bookmark URL corrupted:
   - Re-create bookmark
   - Ensure full JavaScript code copied
```

**"Bookmarklet loads but panel doesn't appear"**
```
Diagnostic steps:
1. Press F12 → Console tab
2. Look for error messages
3. Check if script loaded:
   console.log('Script loaded')
   
Common fixes:
- Refresh page and try again
- Clear browser cache
- Try in incognito/private mode
```

## Calendar Detection Issues

### "Calendar not found" Error

**Symptoms:**
- Overlay buttons turn red
- Console shows "Calendar container not detected"
- No overlays appear

**Diagnostic Steps:**
```javascript
// Run in browser console:
document.querySelector('#calendar') // Should return element
document.querySelector('.fc-view-container') // Alternative selector
document.querySelectorAll('[class*="calendar"]') // Find all calendar-like elements
```

**Solutions:**
1. **Calendar selector update needed:**
   - HvA may have changed calendar structure
   - Check if calendar uses different CSS classes
   - Report the new structure for fixing

2. **Page not fully loaded:**
   - Wait for page to load completely
   - Try clicking overlay button after 2-3 seconds
   - Refresh page if needed

3. **Different calendar view:**
   - Ensure you're in Month ("Maand") view
   - System should auto-switch but may fail
   - Manually click Month view button

### "Week cells not found" Error

**Symptoms:**
- Console shows "No week cells found for range"
- Specific weeks can't be located
- Overlays don't appear for certain periods

**Debug Process:**
```javascript
// Check week detection:
const cells = document.querySelectorAll('.fc-day');
cells.forEach(cell => {
  console.log(cell.textContent, cell.dataset);
});

// Look for week indicators:
document.querySelectorAll('[class*="week"]').forEach(el => {
  console.log(el.className, el.textContent);
});
```

**Fixes:**
1. **Week number format changed:**
   - Check if HvA changed week display format
   - Look for "week XX" vs "Week XX" variations
   - Update detection regex if needed

2. **Calendar structure modified:**
   - HvA updated their calendar system
   - Different CSS classes for week cells
   - Requires code update to match new structure

## View Detection Problems

### "Cannot determine current view" Error

**Symptoms:**
- Extension can't detect calendar view
- Automatic Month view switching fails
- Shows "Unknown" as current view

**Manual Check:**
```javascript
// Test view detection manually:
const buttons = document.querySelectorAll('[class*="btn"], [class*="button"]');
buttons.forEach(btn => {
  const style = window.getComputedStyle(btn);
  console.log(btn.textContent, style.backgroundColor, btn.className);
});
```

**Solutions:**
1. **Update view detection logic:**
   - HvA changed button styling
   - Different background colors for active state
   - New CSS classes for view buttons

2. **Fallback strategies failing:**
   - All 4 detection methods unsuccessful
   - Requires manual view investigation
   - May need additional detection strategies

### View Switching Fails

**Symptoms:**
- "Could not switch to Month view" message
- System detects view but can't change it
- Stuck in wrong calendar view

**Debug Steps:**
```javascript
// Find view buttons:
const viewButtons = document.querySelectorAll('*');
Array.from(viewButtons).filter(el => 
  el.textContent && 
  (el.textContent.includes('Maand') || 
   el.textContent.includes('Month'))
);
```

**Fixes:**
1. **Button not clickable:**
   - Element found but not interactive
   - Try parent/child elements
   - Check for disabled state

2. **Timing issues:**
   - Click event too fast
   - Add delay between detection and click
   - Wait for view to fully load

## Overlay Creation Issues

### Overlays Appear in Wrong Position

**Symptoms:**
- Overlays show but misaligned
- Covers wrong calendar cells
- Size doesn't match calendar

**Diagnostic:**
```javascript
// Check calendar bounds:
const calendar = document.querySelector('#calendar');
const rect = calendar.getBoundingClientRect();
console.log('Calendar position:', rect);

// Check existing overlays:
document.querySelectorAll('[id*="overlay"]').forEach(overlay => {
  console.log('Overlay position:', overlay.getBoundingClientRect());
});
```

**Solutions:**
1. **Bounds calculation error:**
   - Refresh page to recalculate
   - Resize browser window
   - Check for CSS transforms affecting position

2. **Calendar structure changed:**
   - HvA modified calendar layout
   - Different cell structure
   - Update positioning logic needed

### Overlays Don't Resize Properly

**Symptoms:**
- Window resize breaks overlay positioning
- Overlays remain fixed size
- Misalignment after window changes

**Quick Fix:**
- Refresh page after resizing
- Toggle overlay off and on
- Switch to different view and back

**Permanent Fix:**
- Check resize event handlers
- Verify debouncing works correctly
- Update calculation for new dimensions

## Performance Issues

### Extension Runs Slowly

**Symptoms:**
- Long initialization time
- Slow overlay creation
- Browser becomes unresponsive

**Performance Check:**
```javascript
// Check timing in console:
// Look for PERF category logs
// Times over 100ms get warnings

// Monitor memory usage:
console.log(performance.memory);
```

**Optimizations:**
1. **Reduce DOM queries:**
   - Cache frequently accessed elements
   - Minimize selector complexity
   - Use ID selectors when possible

2. **Optimize overlay creation:**
   - Batch DOM updates
   - Use document fragments
   - Minimize style calculations

### Memory Leaks

**Symptoms:**
- Browser memory increases over time
- Multiple overlay elements accumulate
- Event handlers not cleaned up

**Detection:**
```javascript
// Count overlay elements:
document.querySelectorAll('[id*="overlay"]').length

// Check event listeners:
// Use browser dev tools Memory tab
// Take heap snapshots to compare
```

**Prevention:**
- Remove old overlays before creating new ones
- Cleanup event handlers properly
- Clear timers and intervals

## Browser Compatibility

### Firefox Issues

**Limitations:**
- Chrome extension doesn't work
- Bookmarklet only option
- Some features may be limited

**Firefox-Specific Problems:**
```
1. Bookmarklet URL handling:
   - Firefox may modify javascript: URLs
   - Try creating bookmark manually
   
2. Security restrictions:
   - Stricter content security policies
   - May block certain operations
   
3. API differences:
   - Different DOM behaviors
   - CSS compatibility issues
```

### Safari Issues

**Known Problems:**
- Limited bookmarklet support
- Stricter security model
- Different JavaScript behavior

**Workarounds:**
- Enable "Develop" menu in Safari
- Disable security restrictions temporarily
- Use Chrome/Edge for full support

## Network and Security

### Content Security Policy (CSP) Errors

**Error Messages:**
- "Refused to execute inline script"
- "Refused to load the script"
- "script-src directive violated"

**Solutions:**
```
1. Extension CSP fix:
   - All scripts in external files
   - No inline JavaScript
   - Update manifest.json permissions

2. Page CSP issues:
   - HvA rooster has strict CSP
   - May block bookmarklet loading
   - Try different browsers

3. Script loading errors:
   - Check network tab in dev tools
   - Verify script URLs accessible
   - Try loading script directly
```

### Permission Errors

**Chrome Extension Permissions:**
- activeTab: Access current tab
- storage: Save preferences
- https://rooster.hva.nl/*: Access HvA pages

**Permission Denied Errors:**
```
Solutions:
1. Reload extension completely
2. Check manifest permissions
3. Try on different page first
4. Clear browser data if needed
```

## Debugging Tools

### Chrome DevTools

**For Extension:**
1. Right-click extension icon → "Inspect popup"
2. Go to `chrome://extensions/` → Details → "Inspect views"
3. Check Console, Sources, and Network tabs

**For Web Page:**
1. Press F12 on calendar page
2. Console tab for error messages
3. Network tab for script loading
4. Elements tab for DOM inspection

### Console Commands

**Test Functions:**
```javascript
// Test view detection:
if (window.ViewDetectionCore) {
  ViewDetectionCore.detectCurrentView();
}

// Test overlay creation:
if (window.createOverlay) {
  createOverlay({type: 'sprint1', course: 'Operations'});
}

// Check logger:
if (window.logger) {
  logger.getHistory('ERROR', 10);
}
```

**Diagnostic Information:**
```javascript
// System info:
console.log('URL:', window.location.href);
console.log('User Agent:', navigator.userAgent);
console.log('Calendar elements:', document.querySelectorAll('[class*="calendar"]').length);

// Extension status:
console.log('Extension loaded:', typeof window.extensionOrchestrator !== 'undefined');
```

## Getting Additional Help

### Information to Provide

When reporting issues, include:
1. **Browser version** (Chrome/Firefox/Safari + version number)
2. **Operating System** (Windows/Mac/Linux)
3. **Exact error message** (copy from console)
4. **Steps to reproduce** (what you clicked/did)
5. **Screenshot** of error or unexpected behavior

### Log Export

```javascript
// Export debugging information:
if (window.logger) {
  console.log('=== OVERLAY SYSTEM DEBUG INFO ===');
  console.log('Version: 1.0.0');
  console.log('Timestamp:', new Date().toISOString());
  console.log('URL:', window.location.href);
  console.log('User Agent:', navigator.userAgent);
  console.log('Recent Errors:');
  logger.getHistory('ERROR', 20).forEach(entry => {
    console.log(entry.timestamp, entry.message, entry.data);
  });
}
```

### Emergency Workarounds

**If overlays completely fail:**
1. Take screenshots of important calendar periods
2. Use browser bookmarks to mark important dates
3. Create manual reminders in your preferred system

**If extension becomes unresponsive:**
1. Disable/remove the extension
2. Use bookmarklet method temporarily
3. Clear browser cache and reinstall

**If bookmarklet stops working:**
1. Create fresh bookmark with updated code
2. Try in incognito/private browsing mode
3. Test on different computer/browser