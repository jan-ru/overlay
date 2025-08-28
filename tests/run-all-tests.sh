#!/bin/bash

# Comprehensive Test Runner
# Runs all overlay project tests in sequence
# Created during overlay refactoring process

echo "🧪 Calendar Overlay Project - Test Runner"
echo "=========================================="
echo ""

# Get script directory
SCRIPT_DIR="$(dirname "$0")"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "📁 Project root: $PROJECT_ROOT"
echo "🔧 Test directory: $SCRIPT_DIR"
echo ""

# Track overall test results
TOTAL_PASSED=0
TOTAL_FAILED=0
FAILED_SUITES=()

# Function to run a test suite
run_test_suite() {
    local suite_name="$1"
    local script_path="$2"
    
    echo "🏃 Running $suite_name"
    echo "$(printf '=%.0s' $(seq 1 ${#suite_name}))====="
    echo ""
    
    if [ ! -f "$script_path" ]; then
        echo "❌ Test suite not found: $script_path"
        echo ""
        ((TOTAL_FAILED++))
        FAILED_SUITES+=("$suite_name (not found)")
        return 1
    fi
    
    # Make script executable
    chmod +x "$script_path"
    
    # Run the test suite
    if "$script_path"; then
        echo ""
        echo "✅ $suite_name: PASSED"
        ((TOTAL_PASSED++))
    else
        echo ""
        echo "❌ $suite_name: FAILED"
        ((TOTAL_FAILED++))
        FAILED_SUITES+=("$suite_name")
    fi
    
    echo ""
    echo "$(printf '=%.0s' $(seq 1 50))"
    echo ""
}

# Function to check prerequisites
check_prerequisites() {
    echo "🔍 Checking Prerequisites"
    echo "========================="
    echo ""
    
    local missing_deps=()
    
    # Check for Node.js (required for syntax validation)
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js not found (required for JavaScript syntax validation)"
        missing_deps+=("node")
    else
        echo "✅ Node.js: $(node --version)"
    fi
    
    # Check for zip (required for packaging tests)
    if ! command -v zip &> /dev/null; then
        echo "❌ zip not found (required for extension packaging)"
        missing_deps+=("zip")
    else
        echo "✅ zip available"
    fi
    
    # Check for jq (required for JSON validation)
    if ! command -v jq &> /dev/null; then
        echo "⚠️ jq not found (JSON validation will be skipped)"
        echo "   Install with: brew install jq (macOS) or apt-get install jq (Ubuntu)"
    else
        echo "✅ jq: $(jq --version)"
    fi
    
    echo ""
    
    if [ ${#missing_deps[@]} -gt 0 ]; then
        echo "❌ Missing required dependencies:"
        for dep in "${missing_deps[@]}"; do
            echo "   - $dep"
        done
        echo ""
        echo "Please install missing dependencies and try again."
        exit 1
    fi
    
    echo "🎉 All prerequisites satisfied!"
    echo ""
}

# Function to display project info
show_project_info() {
    echo "📋 Project Information"
    echo "======================"
    echo ""
    
    # Count JavaScript files
    local js_files=$(find "$PROJECT_ROOT" -name "*.js" | wc -l)
    echo "📄 JavaScript files: $js_files"
    
    # Check if core refactoring files exist
    if [ -f "$PROJECT_ROOT/overlay-extension/overlay-core.js" ]; then
        echo "✅ Core library: overlay-core.js (refactored)"
    else
        echo "❌ Core library: missing"
    fi
    
    if [ -f "$PROJECT_ROOT/bookmarklet/overlay-bookmarklet.js" ]; then
        echo "✅ Bookmarklet: overlay-bookmarklet.js"
    else
        echo "❌ Bookmarklet: missing"
    fi
    
    # Show recent changes
    if [ -d "$PROJECT_ROOT/.git" ]; then
        echo ""
        echo "📝 Recent commits:"
        cd "$PROJECT_ROOT"
        git log --oneline -3 2>/dev/null | sed 's/^/   /' || echo "   Git log unavailable"
        cd - > /dev/null
    fi
    
    echo ""
}

# Main execution
main() {
    echo "🚀 Starting comprehensive test run at $(date)"
    echo ""
    
    # Show project information
    show_project_info
    
    # Check prerequisites
    check_prerequisites
    
    # Run test suites
    run_test_suite "Syntax Validation" "$SCRIPT_DIR/syntax-validation.sh"
    run_test_suite "Extension Packaging" "$SCRIPT_DIR/extension-packaging.sh"
    
    # Final summary
    echo "🏁 Final Test Results"
    echo "====================="
    echo ""
    echo "✅ Passed test suites: $TOTAL_PASSED"
    echo "❌ Failed test suites: $TOTAL_FAILED"
    echo "📝 Total test suites:  $((TOTAL_PASSED + TOTAL_FAILED))"
    
    if [ $TOTAL_FAILED -gt 0 ]; then
        echo ""
        echo "💥 Failed test suites:"
        for suite in "${FAILED_SUITES[@]}"; do
            echo "   - $suite"
        done
        echo ""
        echo "❌ OVERALL TEST RESULT: FAILED"
        echo ""
        echo "🔧 Please fix the failing tests and run again."
        exit 1
    else
        echo ""
        echo "🎉 OVERALL TEST RESULT: PASSED"
        echo ""
        echo "✨ All tests completed successfully!"
        echo "📦 The overlay project is ready for deployment."
        exit 0
    fi
}

# Show usage information
show_usage() {
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  -v, --verbose  Enable verbose output"
    echo ""
    echo "This script runs all test suites for the Calendar Overlay project:"
    echo "  - JavaScript syntax validation"
    echo "  - Chrome extension packaging tests"
    echo ""
    echo "Prerequisites:"
    echo "  - Node.js (for JavaScript syntax checking)"
    echo "  - zip (for extension packaging)"
    echo "  - jq (optional, for JSON validation)"
}

# Handle command line arguments
case "${1:-}" in
    -h|--help)
        show_usage
        exit 0
        ;;
    -v|--verbose)
        set -x
        main
        ;;
    "")
        main
        ;;
    *)
        echo "Unknown option: $1"
        echo ""
        show_usage
        exit 1
        ;;
esac