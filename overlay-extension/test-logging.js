// Test script for the new OpenTelemetry logging system
// This file can be temporarily included in popup.html to test logging functionality

function testTelemetryLogging() {
  console.log('🧪 Starting telemetry logging test...');
  
  // Test 1: Check if telemetry service is available
  if (window.telemetryService) {
    console.log('✅ Telemetry service is available');
    
    // Test 2: Test basic logging methods
    window.telemetryService.debug('Test debug message', { test: 'debug' });
    window.telemetryService.info('Test info message', { test: 'info' });
    window.telemetryService.warn('Test warning message', { test: 'warn' });
    window.telemetryService.error('Test error message', { test: 'error' });
    
    // Test 3: Test structured logging methods
    window.telemetryService.logUserAction('test_action', { 
      buttonId: 'test_button',
      timestamp: new Date().toISOString()
    });
    
    window.telemetryService.logOverlayOperation('create', 'test-overlay', 'success', {
      color: 'rgba(255,0,0,0.3)',
      selector: 'table.test'
    });
    
    window.telemetryService.logDomOperation('querySelector', 'table.calendar', 'found', {
      elementCount: 1,
      dimensions: { width: 800, height: 600 }
    });
    
    // Test 4: Test error logging
    const testError = new Error('Test error for telemetry');
    window.telemetryService.logError(testError, {
      component: 'test-logging',
      operation: 'telemetry_test'
    });
    
  } else {
    console.error('❌ Telemetry service not available');
  }
  
  // Test 5: Test enhanced logger from config.js
  if (typeof logger !== 'undefined') {
    console.log('✅ Enhanced logger is available');
    
    logger.debug('Config logger debug test', { source: 'config-logger' });
    logger.info('Config logger info test', { source: 'config-logger' });
    logger.warn('Config logger warn test', { source: 'config-logger' });
    logger.error('Config logger error test', { source: 'config-logger' });
    
    // Test structured logging methods
    logger.logUserAction('config_test_action', { component: 'config-logger' });
    logger.logOverlayOperation('test', 'config-overlay', 'completed', { method: 'config-logger' });
    logger.logDomOperation('test-query', '.test-selector', 'success', { count: 5 });
    
    const configTestError = new Error('Config logger test error');
    logger.logError(configTestError, { source: 'config-logger-test' });
    
  } else {
    console.error('❌ Enhanced logger not available');
  }
  
  console.log('🧪 Telemetry logging test completed - check console for structured logs');
}

// Auto-run test when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', testTelemetryLogging);
} else {
  setTimeout(testTelemetryLogging, 100); // Small delay to ensure all scripts are loaded
}