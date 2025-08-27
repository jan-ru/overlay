# Troubleshooting Guide

## Overlay Not Visible

1. **Check browser console** (F12 → Console) for detection logs
2. **Use "Debug Calendar"** to verify calendar detection works
3. **Ensure rooster page is fully loaded** before applying overlay  
4. **Check page URL** - extension only works on https://rooster.hva.nl/*
5. **Verify week numbers exist** - Sprint overlays won't show if target weeks not found in calendar

## Week Detection Issues  

1. **Check console logs** for "Found week pattern" messages
2. **Verify target weeks exist** in current calendar view (may need to navigate to correct month)
3. **Week format examples**: looks for "week 36", "week 37815" (week 37 at 8:15), etc.
4. **Update settings.json** if sprint weeks have changed for your course
5. **No overlay rule**: No overlay displayed if configured weeks not found in calendar

## Settings Loading Issues

1. **Check console** for "Settings loaded successfully" message
2. **Verify settings.json exists** and has valid JSON syntax
3. **Reload extension** after modifying settings
4. **Settings validation** - errors will show in console if format is incorrect
5. **Check for typos** in JSON structure (missing commas, brackets, etc.)

## Permission Errors

- **Check permissions**: Ensure extension has `scripting` and `activeTab` permissions
- **Reload extension** if permissions seem stale  
- **Active tab**: Verify rooster tab is active when using extension
- **Domain restriction**: Extension only works on https://rooster.hva.nl/* domains

## Calendar Detection Failures

1. **Run Debug Calendar** to see what tables are found
2. **Check console** for table detection results
3. **GWT class changes**: Rooster updates may change CSS classes
4. **Fallback selectors**: Extension tries multiple detection methods automatically

## Common Console Messages

- ✅ **"Settings loaded successfully"** - Configuration loaded properly
- ✅ **"Found week pattern: week 36"** - Week detection working
- ❌ **"No sprint week cells found"** - Target weeks not in current calendar view
- ❌ **"Failed to load settings"** - Check settings.json file and syntax

## Getting Help

1. **Enable console logging** (F12 → Console) before reporting issues
2. **Copy error messages** exactly as shown
3. **Note calendar view** (which month/weeks are visible when problem occurs)
4. **Include settings.json** content (with any sensitive course codes removed)