#!/bin/bash

# Extension Packaging Test Script
# Tests Chrome extension packaging and validates structure
# Used during overlay refactoring to ensure proper extension builds

echo "📦 Running Chrome Extension Packaging Tests"
echo "============================================="

# Track test results
PASSED=0
FAILED=0

# Function to test with result tracking
test_step() {
    local test_name="$1"
    local command="$2"
    
    echo -n "Testing $test_name... "
    
    if eval "$command" > /dev/null 2>&1; then
        echo "✅ PASS"
        ((PASSED++))
        return 0
    else
        echo "❌ FAIL"
        echo "   Command: $command"
        eval "$command" 2>&1 | sed 's/^/   /'
        ((FAILED++))
        return 1
    fi
}

# Change to project root
cd "$(dirname "$0")/.."

echo "🔍 Pre-packaging Validation:"
echo "-----------------------------"

# Check required files exist
test_step "manifest.json exists" "[ -f 'overlay-extension/manifest.json' ]"
test_step "popup.html exists" "[ -f 'overlay-extension/popup.html' ]" 
test_step "overlay-core.js exists" "[ -f 'overlay-extension/overlay-core.js' ]"
test_step "settings.json exists" "[ -f 'overlay-extension/settings.json' ]"
test_step "icons directory exists" "[ -d 'overlay-extension/ico' ]"

echo ""
echo "📋 Manifest Validation:"
echo "------------------------"

# Validate manifest structure
test_step "manifest is valid JSON" "jq empty overlay-extension/manifest.json"
test_step "manifest has required fields" "jq -e '.manifest_version and .name and .version and .permissions' overlay-extension/manifest.json"
test_step "overlay-core.js in web_accessible_resources" "jq -e '.web_accessible_resources[0].resources | contains([\"overlay-core.js\"])' overlay-extension/manifest.json"

echo ""
echo "🏗️ Extension Packaging:"
echo "------------------------"

# Clean up any existing packages
rm -f overlay-extension-test.crx overlay-extension-test.zip

# Test ZIP packaging (safer than CRX for testing)
echo -n "Creating extension ZIP package... "
cd overlay-extension
if zip -r ../overlay-extension-test.zip . -x "*.DS_Store*" "popup_smart_select.js" > /dev/null 2>&1; then
    echo "✅ PASS"
    ((PASSED++))
else
    echo "❌ FAIL"
    ((FAILED++))
fi
cd ..

echo ""
echo "📁 Package Content Validation:"
echo "-------------------------------"

# Validate package contents
test_step "ZIP package created" "[ -f 'overlay-extension-test.zip' ]"
test_step "ZIP contains manifest.json" "unzip -l overlay-extension-test.zip | grep -q manifest.json"
test_step "ZIP contains overlay-core.js" "unzip -l overlay-extension-test.zip | grep -q overlay-core.js"
test_step "ZIP contains popup.html" "unzip -l overlay-extension-test.zip | grep -q popup.html"
test_step "ZIP excludes DS_Store files" "! unzip -l overlay-extension-test.zip | grep -q DS_Store"
test_step "ZIP excludes old popup file" "! unzip -l overlay-extension-test.zip | grep -q popup_smart_select.js"

echo ""
echo "📊 File Size Analysis:"
echo "----------------------"

if [ -f "overlay-extension-test.zip" ]; then
    PACKAGE_SIZE=$(stat -f%z "overlay-extension-test.zip" 2>/dev/null || stat -c%s "overlay-extension-test.zip" 2>/dev/null)
    echo "📦 Package size: $PACKAGE_SIZE bytes"
    
    if [ "$PACKAGE_SIZE" -gt 0 ] && [ "$PACKAGE_SIZE" -lt 10485760 ]; then  # Less than 10MB
        echo "✅ Package size reasonable"
        ((PASSED++))
    else
        echo "❌ Package size suspicious (too large or zero)"
        ((FAILED++))
    fi
    
    echo "📄 Largest files in package:"
    unzip -l overlay-extension-test.zip | sort -k1 -n | tail -5 | sed 's/^/   /'
fi

echo ""
echo "🧹 Cleanup:"
echo "-----------"

# Cleanup test files
echo -n "Removing test package... "
if rm -f overlay-extension-test.zip; then
    echo "✅ DONE"
else
    echo "❌ FAILED"
fi

echo ""
echo "📊 Test Results Summary:"
echo "========================"
echo "✅ Passed: $PASSED"
echo "❌ Failed: $FAILED"
echo "📝 Total:  $((PASSED + FAILED))"

if [ $FAILED -gt 0 ]; then
    echo ""
    echo "❌ EXTENSION PACKAGING TESTS FAILED"
    exit 1
else
    echo ""
    echo "🎉 ALL EXTENSION PACKAGING TESTS PASSED!"
    exit 0
fi