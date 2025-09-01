// Popup initialization script
// Handles extension initialization and orchestrator setup

// Initialize extension using new orchestrator
const extensionOrchestrator = new ExtensionOrchestrator();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  logger.info(logger.categories.INIT, 'DOM Content Loaded - initializing with orchestrator', 'popup-init');
  extensionOrchestrator.initialize();
});

// Fallback initialization
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => extensionOrchestrator.initialize());
} else {
  logger.info(logger.categories.INIT, 'DOM already loaded - initializing immediately with orchestrator', 'popup-init');
  extensionOrchestrator.initialize();
}

// Make orchestrator available globally for debugging
window.extensionOrchestrator = extensionOrchestrator;