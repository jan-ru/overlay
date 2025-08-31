#!/bin/bash

# Syntax Validation Test Script
# Tests all JavaScript files for syntax errors
# Used during overlay refactoring to ensure code quality

echo "🧪 Running JavaScript Syntax Validation Tests"
echo "=============================================="

# Track test results
PASSED=0
FAILED=0
FAILED_FILES=()

# Function to test a single JavaScript file
test_js_syntax() {
    local file="$1"
    local name="$2"
    
    if [ ! -f "$file" ]; then
        echo "❌ SKIP: $name - File not found: $file"
        return 1
    fi
    
    echo -n "Testing $name... "
    
    if node -c "$file" 2>/dev/null; then
        echo "✅ PASS"
        ((PASSED++))
        return 0
    else
        echo "❌ FAIL"
        echo "   Error details:"
        node -c "$file" 2>&1 | sed 's/^/   /'
        ((FAILED++))
        FAILED_FILES+=("$name")
        return 1
    fi
}

# Change to project root
cd "$(dirname "$0")/.."

echo "📂 Testing Extension Files:"
echo "----------------------------"

# Test core utility files
test_js_syntax "view-detection-core.js" "view-detection-core.js"
test_js_syntax "error-handling-core.js" "error-handling-core.js"

# Test extension JavaScript files (current architecture)
test_js_syntax "overlay-extension/overlay-core.js" "overlay-core.js"
test_js_syntax "overlay-extension/calendar-overlays.js" "calendar-overlays.js" 
test_js_syntax "overlay-extension/extension-orchestrator.js" "extension-orchestrator.js"
test_js_syntax "overlay-extension/page-validator.js" "page-validator.js"
test_js_syntax "overlay-extension/view-manager.js" "view-manager.js"
test_js_syntax "overlay-extension/ui-manager.js" "ui-manager.js"
test_js_syntax "overlay-extension/settings-loader.js" "settings-loader.js"
test_js_syntax "overlay-extension/logger.js" "logger.js"
test_js_syntax "overlay-extension/error-handler.js" "error-handler.js"

# Test shared files
test_js_syntax "shared-ui.js" "shared-ui.js"

echo ""
echo "📦 Testing Bookmarklet Files:"
echo "------------------------------"

# Test bookmarklet files
test_js_syntax "bookmarklet/overlay-bookmarklet.js" "overlay-bookmarklet.js"

echo ""
echo "📊 Test Results Summary:"
echo "========================"
echo "✅ Passed: $PASSED"
echo "❌ Failed: $FAILED"
echo "📝 Total:  $((PASSED + FAILED))"

if [ $FAILED -gt 0 ]; then
    echo ""
    echo "💥 Failed files:"
    for file in "${FAILED_FILES[@]}"; do
        echo "   - $file"
    done
    echo ""
    echo "❌ SYNTAX VALIDATION FAILED"
    exit 1
else
    echo ""
    echo "🎉 ALL SYNTAX VALIDATION TESTS PASSED!"
    exit 0
fi