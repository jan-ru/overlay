# Testing Plan for HvA Overlay Extension

## Overview

This document outlines the testing strategy for the modular Chrome extension that creates calendar overlays for the HvA rooster application.

## Testing Strategy Layers

### 1. Unit Tests (High Priority)
Test individual functions in isolation without DOM dependencies.

**Target Areas:**
- Settings validation and loading
- Week number extraction logic  
- Calendar selector matching
- Overlay bounds calculation
- Logging utility functions

**Example Tests:**
```javascript
// Settings validation
describe('Settings Loader', () => {
  test('validates required courseCode', () => {
    expect(() => validateSettings({})).toThrow('Missing courseCode');
  });
  
  test('validates sprint week ranges', () => {
    const settings = {
      courseCode: 'TEST',
      sprint1: { startWeek: 40, endWeek: 35 } // Invalid range
    };
    expect(() => validateSettings(settings)).toThrow('startWeek cannot be greater than endWeek');
  });
});

// Week detection logic
describe('Week Detection', () => {
  test('extracts week number from week patterns', () => {
    expect(extractWeekNumber('week 36ma 113:40')).toBe(36);
    expect(extractWeekNumber('week 37815:20')).toBe(37);
    expect(extractWeekNumber('week 381515:20')).toBe(38);
  });
  
  test('handles edge cases', () => {
    expect(extractWeekNumber('no week here')).toBe(null);
    expect(extractWeekNumber('week abc')).toBe(null);
  });
});
```

### 2. DOM Integration Tests (Medium Priority)
Test calendar detection and overlay positioning with mock DOM.

**Target Areas:**
- Calendar element detection using selectors
- Week cell finding in mock calendar HTML
- Overlay positioning calculations
- DOM manipulation functions

**Example Tests:**
```javascript
describe('Calendar Detection', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <table class="GNKVYU1C-" style="width: 800px; height: 600px">
        <tr><td>week 36ma 113:40proces</td></tr>
        <tr><td>week 37815:20proces</td></tr>
      </table>
    `;
  });

  test('finds calendar using selector priority', () => {
    const calendar = findCalendarElement(CALENDAR_SELECTORS);
    expect(calendar).toBeTruthy();
    expect(calendar.className).toBe('GNKVYU1C-');
  });
  
  test('finds week cells in calendar', () => {
    const calendar = document.querySelector('table');
    const weekCells = findSprintWeekCells(calendar, 36, 37);
    expect(weekCells).toHaveLength(2);
  });
});
```

### 3. Chrome Extension E2E Tests (Lower Priority)
Test full extension behavior in browser context.

**Target Areas:**
- Extension popup functionality
- Content script injection
- Overlay creation and removal
- Settings loading from extension context

**Tools:**
- Puppeteer with Chrome Extension support
- Chrome Extension Test Utils
- Manual testing scenarios

### 4. Manual Testing Checklist
Systematic manual testing for UI and edge cases.

**Test Scenarios:**
- Different calendar layouts (desktop/mobile views)
- Various week number formats in rooster
- Settings file corruption/missing scenarios
- Multiple overlays interaction
- Browser zoom levels
- Extension reload behavior

## Recommended Tools

1. **Jest** - JavaScript testing framework
2. **jsdom** - DOM simulation for unit tests
3. **Puppeteer** - Browser automation for E2E tests
4. **Chrome Extension Test Utils** - Extension-specific testing helpers

## File Structure Plan

```
tests/
├── unit/
│   ├── settings-loader.test.js      # Settings validation tests
│   ├── calendar-detection.test.js   # Calendar selector tests
│   ├── week-parsing.test.js         # Week number extraction tests
│   ├── overlay-positioning.test.js  # Bounds calculation tests
│   └── logger.test.js               # Logging utility tests
├── integration/
│   ├── dom-manipulation.test.js     # DOM interaction tests
│   ├── extension-popup.test.js      # Popup behavior tests
│   └── overlay-lifecycle.test.js    # Full overlay creation/removal
├── fixtures/
│   ├── mock-calendar.html           # Sample calendar HTML structures
│   ├── test-settings.json           # Valid/invalid settings examples
│   └── rooster-samples/             # Real rooster HTML samples
├── e2e/
│   ├── extension-install.test.js    # Extension loading tests
│   ├── user-workflows.test.js       # Complete user scenarios
│   └── cross-browser.test.js        # Browser compatibility
└── manual/
    ├── test-checklist.md            # Manual testing checklist
    ├── edge-cases.md                # Known edge cases to test
    └── browser-compatibility.md     # Cross-browser test scenarios
```

## Implementation Phases

### Phase 1: Core Unit Tests (Immediate)
Focus on testing pure functions without DOM dependencies:
- Settings validation logic
- Week number extraction regex
- Calendar selector priority logic
- Bounds calculation mathematics

### Phase 2: DOM Integration (Short-term)  
Add tests that interact with mock DOM:
- Calendar element detection
- Week cell finding algorithms
- Overlay positioning with mock elements

### Phase 3: Extension Integration (Long-term)
Full extension testing with browser automation:
- Popup interaction workflows
- Content script injection testing
- Real rooster application integration

### Phase 4: Continuous Testing (Ongoing)
Establish testing as part of development workflow:
- Pre-commit test running
- Settings validation on every change
- Regression testing for rooster updates

## Test Data Requirements

**Mock Calendar HTML Variations:**
- Standard GWT calendar structure
- Alternative table layouts
- Missing week number scenarios
- Different week number formats

**Settings Test Cases:**
- Valid configurations
- Missing required fields
- Invalid week ranges
- Malformed JSON structures
- Edge case week numbers (1, 52, 53)

**Real-world Test Data:**
- Screenshots of actual rooster layouts
- HTML samples from different rooster views
- Week number format examples from different periods

## Success Metrics

**Coverage Goals:**
- Unit tests: >90% line coverage for core logic
- Integration tests: All major user workflows covered
- Manual tests: All supported browsers validated

**Quality Gates:**
- All tests pass before merging changes
- No regressions in calendar detection
- Settings validation catches all edge cases
- Extension works across Chrome versions

## Maintenance Notes

**Regular Updates Needed:**
- Update mock HTML when rooster changes
- Add new test cases for discovered edge cases  
- Validate tests with new Chrome extension API changes
- Update browser compatibility test matrix

**Future Considerations:**
- Performance testing for large calendars
- Accessibility testing for screen readers
- Security testing for content script injection
- Load testing with multiple overlays

---

*Created: 2025-08-27*
*Status: Planning Phase*
*Next Step: Implement Phase 1 unit tests*