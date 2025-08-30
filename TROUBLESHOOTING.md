# Troubleshooting Guide

## Overlay Not Visible

1. **Check browser console** (F12 → Console) for detection logs
2. **Verify page URL** - extension only works on https://rooster.hva.nl/schedule
3. **Select course** from dropdown before applying overlay
4. **Ensure rooster page is fully loaded** before applying overlay  
5. **Check overlay-core.js injection** - Look for "overlay-core.js loaded successfully"
6. **Verify target periods exist** - Overlays won't show if configured weeks/days not found in calendar

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
5. **Settings validation errors** - specific error messages show in console if format is incorrect
6. **Check JSON structure** - missing commas, brackets, or incorrect nesting
7. **Course selection** - Ensure selected course exists in current blok/module configuration

## Permission Errors

- **Check permissions**: Ensure extension has `scripting` and `activeTab` permissions
- **Reload extension** if permissions seem stale  
- **Active tab**: Verify rooster tab is active when using extension
- **Domain restriction**: Extension only works on https://rooster.hva.nl/schedule
- **Bookmarklet alternative**: Use bookmarklet version if extension permissions are restricted

## Calendar Detection Failures

1. **Check overlay creation logs** - Look for "Creating [type] overlay" or "Creating day overlay" messages
2. **Verify OverlayCore injection** - Should see "OverlayCore found! Creating overlay..."
3. **Calendar element detection** - Extension tries multiple table selectors automatically  
4. **Sprint vs day detection** - Different detection methods for week ranges vs specific days
5. **GWT class changes**: Rooster updates may change CSS classes requiring selector updates

## Common Console Messages

- ✅ **"overlay-core.js loaded successfully"** - Core library injected properly
- ✅ **"Creating [Sprint/Blok/Rooster Vrij/Day] overlay"** - Overlay creation started
- ✅ **"Found week pattern" / "Found day cell"** - Detection working
- ✅ **"Current course set to: [coursename]"** - Course selection working
- ✅ **"Page validation result: ✅ Valid"** - URL validation passed
- ❌ **"No week/day cells found"** - Target periods not in current calendar view
- ❌ **"OverlayCore not available"** - Core library injection failed
- ❌ **"Settings Error: Missing [field]"** - Check settings.json structure
- ❌ **"Page validation result: ❌ Invalid"** - Wrong URL, navigate to rooster.hva.nl/schedule

## Getting Help

1. **Enable console logging** (F12 → Console) before reporting issues
2. **Copy error messages** exactly as shown
3. **Note calendar view** (which periods are visible when problem occurs)
4. **Include current selections** (Blok, Module, Course)
5. **Specify overlay type** being used (Sprint-based or day-specific)
6. **Include relevant settings.json** section (remove sensitive information)