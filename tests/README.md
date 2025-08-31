# Calendar Overlay Tests

This directory contains automated tests for the Calendar Overlay project, created during the refactoring process to ensure code quality and functionality.

## Test Suites

### 🧪 Syntax Validation (`syntax-validation.sh`)
- **Purpose**: Validates JavaScript syntax for all project files
- **Coverage**: Extension files, bookmarklet, and core library
- **Technology**: Node.js syntax checker (`node -c`)
- **Files Tested**:
  - `overlay-core.js` - Shared core library
  - `calendar-overlays.js` - Extension overlay functions
  - `extension-orchestrator.js` - Main coordination logic
  - `page-validator.js` - URL validation
  - `view-manager.js` - View detection and switching
  - `ui-manager.js` - UI initialization and event handling
  - `overlay-bookmarklet.js` - Bookmarklet implementation
  - `view-detection-core.js` - Shared view detection utility
  - `error-handling-core.js` - Standardized error handling
  - All other JavaScript files

### 📦 Extension Packaging (`extension-packaging.sh`)
- **Purpose**: Tests Chrome extension packaging and structure validation
- **Coverage**: Manifest validation, file inclusion/exclusion, package integrity
- **Technology**: ZIP packaging, JSON validation (jq), file system checks
- **Validations**:
  - Required files exist (manifest.json, popup.html, etc.)
  - Manifest.json is valid and contains required fields
  - overlay-core.js is included in web_accessible_resources
  - Package excludes unwanted files (.DS_Store, old files)
  - Package size is reasonable

### 🏃 Comprehensive Test Runner (`run-all-tests.sh`)
- **Purpose**: Orchestrates all test suites with comprehensive reporting
- **Features**:
  - Prerequisites checking
  - Project information display
  - Sequential test execution
  - Consolidated results reporting
  - Detailed failure analysis

## Usage

### Run All Tests (Recommended)
```bash
cd tests
./run-all-tests.sh
```

### Run Individual Test Suites
```bash
# Syntax validation only
./syntax-validation.sh

# Extension packaging only  
./extension-packaging.sh
```

### Help and Options
```bash
# Show help
./run-all-tests.sh --help

# Verbose mode
./run-all-tests.sh --verbose
```

## Prerequisites

- **Node.js**: Required for JavaScript syntax validation
- **zip**: Required for extension packaging tests
- **jq**: Optional, for advanced JSON validation (recommended)

### Installing Prerequisites

**macOS (Homebrew):**
```bash
brew install node jq
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install nodejs npm jq zip
```

**Windows:**
- Install Node.js from [nodejs.org](https://nodejs.org/)
- Install jq from [jqlang.github.io/jq/](https://jqlang.github.io/jq/)

## Test History

These tests were created during the major refactoring of the overlay project that:

1. **Unified Architecture**: Created shared `overlay-core.js` library
2. **Eliminated Duplication**: Removed ~300 lines of duplicate code
3. **Fixed Syntax Errors**: Resolved global variable redeclaration issues
4. **Improved Deployment**: Standardized both extension and bookmarklet approaches

## Expected Results

When all tests pass, you should see:
```
🎉 OVERALL TEST RESULT: PASSED

✨ All tests completed successfully!
📦 The overlay project is ready for deployment.
```

## Troubleshooting

### Common Issues

1. **"Node.js not found"**: Install Node.js (see Prerequisites)
2. **"jq not found"**: Install jq or skip JSON validation tests
3. **Permission denied**: Make scripts executable: `chmod +x *.sh`
4. **Syntax errors**: Check the specific failing files in the detailed output

### Test Failures

When tests fail, the scripts provide detailed information about:
- Which specific files failed syntax validation
- What packaging requirements are missing
- Exact error messages and suggested fixes

## Integration

These tests can be integrated into:
- **Git hooks**: Run automatically before commits
- **CI/CD pipelines**: Automated testing in deployment workflows  
- **Development workflow**: Quick validation during development

## Maintenance

Update these tests when:
- New JavaScript files are added to the project
- Extension manifest structure changes
- New packaging requirements are introduced
- Additional validation needs are identified

---

*Created during overlay refactoring - August 2024*