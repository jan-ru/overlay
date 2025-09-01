# User Guide

## Overview

The Calendar Overlay system provides visual overlays on the HvA (University of Applied Sciences Amsterdam) calendar to help students and faculty visualize academic periods, sprints, and important dates for the Process & Risk module (2000PRR_22).

## Features

- **Course Selection**: Switch between Operations and GRC courses
- **Period Overlays**: Visual overlays for Blok and Sprint periods
- **Today Highlighting**: Emphasizes today's date when within selected periods
- **Responsive Design**: Adapts to window resizing automatically
- **Multiple Deployment**: Available as Chrome extension or bookmarklet

## Installation Options

### Option 1: Chrome Extension (Recommended)

**Advantages:**
- Easy installation and use
- Persistent settings
- Automatic updates
- Better performance
- Full feature set

**Requirements:**
- Google Chrome or Chromium-based browser
- Access to Chrome Web Store or developer mode

**Installation Steps:**
1. Download the extension package
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right corner)
4. Click "Load unpacked" and select the extension folder
5. The extension icon will appear in your browser toolbar

### Option 2: Bookmarklet (For Managed Computers)

**Advantages:**
- No installation required
- Works on managed/restricted computers
- No administrator rights needed
- Single-click activation

**Limitations:**
- Must be activated manually each session
- Settings are not persistent
- Limited to default configuration

**Installation Steps:**
1. Right-click the bookmarklet button and select "Bookmark this link"
2. Or drag the bookmarklet button to your bookmarks bar
3. Navigate to your HvA calendar page
4. Click the bookmarklet in your bookmarks

**Manual Installation:**
If dragging doesn't work:
1. Copy the provided JavaScript code
2. Create a new bookmark manually
3. Set the bookmark URL to the copied code
4. Name it "Calendar Overlays"

## Getting Started

### Step 1: Navigate to Your Calendar
Open your browser and go to: `https://rooster.hva.nl/schedule`

**Note**: The overlay system only works on HvA rooster pages. If you're on an incompatible page, you'll see a message indicating the page is not supported.

### Step 2: Launch the Overlay System

**Chrome Extension:**
- Click the extension icon in your browser toolbar
- The control panel will appear in the popup

**Bookmarklet:**
- Click the bookmarklet in your bookmarks bar
- A control panel will appear in the top-right corner of the page

### Step 3: Select Your Course
Use the dropdown menu to select your course:
- **Operations**: Standard operations management track
- **GRC**: Governance, Risk, and Compliance track

**Note**: Changing courses will clear any existing overlays.

### Step 4: Apply Overlays
Click the overlay buttons to show visual periods on your calendar:

- **Blok**: Shows the entire academic block period (weeks 36-44)
- **Sprint 1**: First sprint period (weeks 36-37) - Green overlay
- **Sprint 2**: Second sprint period (weeks 38-40) - Orange overlay  
- **Sprint 3**: Third sprint period (weeks 41-44) - Blue overlay

### Step 5: Toggle Overlays
- Click the same button again to remove an overlay
- Multiple overlays can be active simultaneously
- Course switching automatically clears all overlays

## Using the System

### Calendar View Requirements
The overlay system works best in **Month view ("Maand")**. The system will:
1. Automatically detect your current calendar view
2. Switch to Month view if you're in a different view
3. Notify you when the view is changed

### Overlay Behavior

**Visual Indicators:**
- Overlays appear as colored, semi-transparent rectangles
- Text labels clearly identify the period type
- Today's date gets extra emphasis when within the selected period

**Responsiveness:**
- Overlays automatically adjust when you resize the browser window
- Position and size adapt to calendar changes
- No manual adjustment needed

### Today's Date Highlighting
When today's date falls within a selected overlay period:
- The overlay becomes slightly darker over today's cell
- This helps quickly identify your current position in the academic timeline

## Troubleshooting

### Common Issues

**"Extension not working" or "Overlay not appearing"**
- Verify you're on the correct HvA calendar page (`https://rooster.hva.nl/schedule`)
- Check that the calendar is in Month view
- Refresh the page and try again

**"Page not supported" message**
- You're not on a supported HvA rooster page
- Navigate to `https://rooster.hva.nl/schedule`
- Make sure you're logged into the HvA rooster system

**Bookmarklet not responding**
- Check that JavaScript is enabled in your browser
- Try refreshing the page before clicking the bookmarklet
- Make sure you're not on a page with strict content security policies

**Extension blocked or won't install**
- Your organization may block extension installations
- Use the bookmarklet method instead
- Contact your IT support for assistance

**Wrong weeks showing**
- Verify the current academic year settings
- Check if you're in the correct academic block period
- The system is configured for Academic Year 25-26, Block 1 (weeks 36-44)

**Overlays appear in wrong position**
- Try refreshing the page
- Resize the browser window to trigger repositioning
- Switch calendar views and return to Month view

### Advanced Troubleshooting

**Debug Console (for technical users):**
1. Press F12 to open browser developer tools
2. Go to the Console tab
3. Look for any error messages
4. Check if the overlay creation process completed successfully

**Performance Issues:**
- Close other browser tabs to free memory
- Disable other browser extensions temporarily
- Clear browser cache and cookies for the HvA site

**Settings Not Persisting (Bookmarklet):**
This is expected behavior. Bookmarklets don't save settings between sessions. Use the Chrome extension for persistent settings.

## Tips and Best Practices

### Optimal Usage
- Use Month view for best overlay visibility
- Keep the browser window reasonably large for clear overlay rendering
- Apply overlays one at a time to see changes clearly

### Planning Your Schedule
- Use Blok overlay to see the entire academic period
- Apply Sprint overlays to focus on specific timeframes
- Combine overlays to compare different periods

### Multiple Course Tracking
- Switch between Operations and GRC courses as needed
- Remember that course switching clears existing overlays
- Take screenshots if you need to compare courses side-by-side

### Browser Recommendations
- **Primary**: Google Chrome (full support)
- **Alternative**: Microsoft Edge (Chromium-based, full support)
- **Limited**: Firefox (bookmarklet only)
- **Minimal**: Safari (basic bookmarklet support)

## Keyboard Shortcuts

Currently, the system doesn't support keyboard shortcuts, but you can:
- Use Tab to navigate between dropdown and buttons
- Use Enter to activate selected buttons
- Use Escape to close the extension popup

## Academic Calendar Information

**Current Configuration:**
- **Academic Year**: 25-26
- **Block**: Blok 1
- **Period**: Weeks 36-44
- **Module**: Process & Risk (2000PRR_22)

**Sprint Breakdown:**
- **Sprint 1**: Weeks 36-37 (2 weeks)
- **Sprint 2**: Weeks 38-40 (3 weeks)  
- **Sprint 3**: Weeks 41-44 (4 weeks)

## Privacy and Security

### Data Collection
The overlay system:
- Does not collect personal information
- Does not store calendar data
- Works entirely within your browser
- Does not send data to external servers

### Permissions (Chrome Extension)
The extension requires:
- **Active Tab**: To interact with the current calendar page
- **Storage**: To save your course preferences
- **Host Permission**: Access to HvA rooster pages only

### Security Considerations
- All code runs locally in your browser
- No external network requests (except for bookmarklet loading)
- Safe to use on managed/corporate computers
- Open source code available for inspection

## Support and Feedback

### Getting Help
1. Check this user guide first
2. Review the troubleshooting section
3. Verify you're following the correct installation steps

### Reporting Issues
If you encounter problems:
- Note the exact error messages
- Record the steps you took before the issue
- Include your browser version and operating system
- Check the browser console for technical error details

### Feature Requests
The overlay system is designed for the specific needs of the Process & Risk module. Future versions may include:
- Support for additional academic years
- Custom overlay colors
- Export/import of settings
- Integration with other HvA systems

## Version Information

**Current Version**: 1.0.0  
**Supported Academic Year**: 25-26  
**Module**: Process & Risk (2000PRR_22)  
**Last Updated**: Current date displays automatically

The system is actively maintained and updated as needed for the current academic year and module requirements.