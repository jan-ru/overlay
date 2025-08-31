# Troubleshooting Guide

## View Detection and Switching Issues

1. **Check console logs** for "🎯 Detecting active view..." messages
2. **View not detected** - Look for "❌ No active view detected" warnings
3. **Switch failed** - Check for "❌ Button for [ViewName] not found" errors
4. **View switching notification** - Green notification should appear when view is switched
5. **Manual verification** - Check if rooster is actually in "Maand" view after switching
6. **Alternative views** - Extension works best in "Maand" view, automatically switches from other views

## Overlay Not Visible

1. **Check browser console** (F12 → Console) for detection and error logs
2. **Verify page URL** - extension only works on https://rooster.hva.nl/schedule
3. **Check view switching** - Extension automatically switches to "Maand" view for best overlay display
4. **Select course** from dropdown before applying overlay
5. **Check for initialization errors** - Look for "Failed to initialize extension" messages
6. **Verify overlay-core.js injection** - Should see "OverlayCore found! Creating overlay"
7. **Ensure target periods exist** - Overlays won't show if configured weeks/days not found in calendar

## Week Detection Issues  

1. **Check console logs** for "Found week pattern" or "Found day cell" messages
2. **Verify target periods exist** in current calendar view (navigate to correct month if needed)
3. **Week format examples**: looks for "week X" patterns in calendar cells
4. **Day-specific overlays**: Toets/Assessment look for specific day cells in configured weeks
5. **Update settings.json** if week ranges or day numbers have changed
6. **No overlay rule**: No overlay displayed if configured periods not found in calendar
7. **Today emphasis**: Darker overlay shows on current date if within selected period

## Settings Loading Issues

1. **Check console** for "Settings loaded successfully" message  
2. **Verify settings.json exists** and has valid JSON syntax
3. **Course type validation** - Sprint-based courses need sprint1/2/3, day-specific need weekNumber/dayNumber
4. **Reload extension** after modifying settings
5. **Validation error messages** - Consolidated validation shows specific field errors
6. **Check JSON structure** - missing commas, brackets, or incorrect nesting
7. **Course selection** - Ensure selected course exists in current blok/module configuration

## Permission Errors

- **Check permissions**: Ensure extension has `scripting` and `activeTab` permissions
- **Reload extension** if permissions seem stale  
- **Active tab**: Verify rooster tab is active when using extension
- **Domain restriction**: Extension only works on https://rooster.hva.nl/schedule
- **Bookmarklet alternative**: Use bookmarklet version if extension permissions are restricted

## Calendar Detection Failures

1. **Check overlay creation logs** - Look for "Creating [overlaytype] overlay" messages
2. **Verify OverlayCore availability** - Should see "OverlayCore found! Creating overlay"
3. **Unified overlay system** - Single function handles all overlay types with different parameters
4. **Calendar element detection** - Extension tries multiple table selectors with fallbacks
5. **Error handling** - Standardized error messages show specific failure context
6. **GWT class changes** - Rooster updates may change CSS classes requiring selector updates

## Common Console Messages

**View Detection & Switching:**
- ✅ **"🎯 Detecting active view..."** - View detection started
- ✅ **"✅ Active view detected: [ViewName]"** - Current view successfully identified
- ✅ **"✅ Already in Maand view"** - No switching needed
- ✅ **"🔄 Switching to Maand view..."** - Automatic view switching started
- ✅ **"✅ Switch to Maand view confirmed"** - View switching verified successful
- ❌ **"❌ No active view detected"** - Could not identify current view
- ❌ **"❌ Button for Maand not found"** - Switch button not located
- ⚠️ **"⚠️ Switch may not have completed"** - View switch verification failed

**General Extension:**
- ✅ **"🔍 Extension checking URL: [url]"** - Shows exact URL being validated
- ✅ **"🔍 Page validation result: ✅ Valid"** - URL validation passed
- ✅ **"🎨 Creating [overlaytype] overlay"** - Unified overlay creation started
- ✅ **"OverlayCore found! Creating overlay"** - Core library working properly
- ✅ **"Settings loaded successfully"** - Configuration loaded and validated
- ❌ **"Failed to initialize extension: ReferenceError"** - Missing dependency or configuration
- ❌ **"❌ Error creating [overlaytype] overlay"** - Overlay creation failed with context
- ❌ **"Settings Error: Missing [field]"** - Consolidated validation found configuration issue
- ❌ **"🔍 Page validation result: ❌ Invalid"** - Wrong URL or navigation needed

## Common Issues & Solutions

**View detection/switching fails**
- Check if you're on correct HvA rooster page (https://rooster.hva.nl/schedule)
- Look for "❌ No active view detected" in console logs
- Try manually switching to "Maand" view before using extension
- Clear browser cache and reload if view buttons not found
- Extension continues operation even if view detection fails

**"ReferenceError: [VARIABLE] is not defined"**
- Reload the extension completely (Extensions → Refresh)
- Check console for initialization errors
- Verify all required scripts are loading in popup.html

**"Page validation result: ❌ Invalid"** 
- Check console logs for exact URL being detected
- Ensure you're on https://rooster.hva.nl/schedule (not a subdirectory)
- Refresh the page and try again

**View switching notification not appearing**
- Check if browser blocks notifications or popups
- Look for green notification in top-right corner of page
- Console logs show view switching status even without visual notification

**"Settings Error: [validation message]"**
- Check settings.json syntax and structure
- Ensure course types match validation rules (sprint vs day-specific)
- Use console logs to identify specific configuration issues

## Getting Help

1. **Enable console logging** (F12 → Console) before reporting issues
2. **Copy error messages** exactly as shown with emoji prefixes
3. **Include view detection logs** showing detected view and switching attempts
4. **Include URL validation logs** showing detected vs expected URLs
5. **Note current selections** (Blok, Module, Course) and overlay type
6. **Include relevant settings.json** section (remove sensitive information)
7. **Check view switching notifications** and their timing relative to other extension actions