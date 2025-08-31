// UI management module
// Handles UI initialization, course selection, and button setup

class UIManager {
  constructor() {
    this.cachedSettings = null;
    this.isProcessing = false;
  }

  /**
   * Sets cached settings for UI operations
   * @param {Object} settings - Loaded settings object
   */
  setCachedSettings(settings) {
    this.cachedSettings = settings;
  }

  /**
   * Updates the extension title
   */
  updateTitle() {
    try {
      const titleElement = document.getElementById('calendar-overlays-title');
      if (titleElement) {
        // Use consistent title across both extension and bookmarklet
        const titleText = 'Calendar Overlays';
        titleElement.textContent = titleText;
        logger.debug('✅ Title updated to:', titleElement.textContent);
      }
    } catch (error) {
      console.error('❌ Error updating title:', error);
    }
  }

  /**
   * Populates the course dropdown with available courses
   */
  populateCourseDropdown() {
    try {
      const courseSelect = document.getElementById('course-select');
      if (!courseSelect || !this.cachedSettings) return;
      
      // Clear existing options
      courseSelect.innerHTML = '';
      
      // Get available courses
      const courses = getAvailableCourses(this.cachedSettings);
      
      // Add course options
      courses.forEach(course => {
        const option = document.createElement('option');
        option.value = course.key;
        option.textContent = course.name;
        courseSelect.appendChild(option);
      });
      
      // Set current course selection
      const currentCourseKey = getCurrentCourse();
      if (currentCourseKey) {
        courseSelect.value = currentCourseKey;
      }
      
      logger.debug('✅ Course dropdown populated with', courses.length, 'courses');
    } catch (error) {
      console.error('❌ Error populating course dropdown:', error);
    }
  }

  /**
   * Sets up course selection change handler
   */
  setupCourseChangeHandler() {
    const courseSelect = document.getElementById('course-select');
    if (!courseSelect) return;
    
    courseSelect.addEventListener('change', (e) => {
      try {
        const selectedCourse = e.target.value;
        if (selectedCourse) {
          setCurrentCourse(selectedCourse);
          logger.debug('✅ Course changed to:', selectedCourse);
          
          // Clear any existing overlays when switching courses
          this.clearAllOverlays();
        }
      } catch (error) {
        console.error('❌ Error changing course:', error);
      }
    });
  }

  /**
   * Sets up event listeners for overlay buttons
   */
  setupOverlayButtonListeners() {
    logger.debug('⚙️ Setting up overlay button event listeners...');
    
    // Calendar overlay buttons - Day, Week, Month
    const CALENDAR_CONFIGS = window.OVERLAY_CORE_CONFIG?.CALENDAR_CONFIGS || [];
    
    CALENDAR_CONFIGS.forEach(config => {
      const button = document.getElementById(config.id);
      console.log(`Looking for calendar button "${config.id}":`, button ? '✅ found' : '❌ not found');
      
      if (button) {
        button.addEventListener("click", async (e) => {
          e.preventDefault();
          e.stopImmediatePropagation();
          
          if (this.isProcessing) return;
          this.isProcessing = true;
          console.log(`🎯 ${config.id} button clicked!`);
          
          try {
            let result;
            
            // Call the appropriate function based on button ID
            if (config.id === 'select_blok') {
              result = await select_blok(config);
            } else if (config.id === 'select_sprint1') {
              result = await select_sprint1(config);
            } else if (config.id === 'select_sprint2') {
              result = await select_sprint2(config);
            } else if (config.id === 'select_sprint3') {
              result = await select_sprint3(config);
            } else if (config.id === 'select_rooster_vrij') {
              result = await select_rooster_vrij(config);
            } else if (config.id === 'select_toets') {
              result = await select_toets(config);
            } else if (config.id === 'select_assessment') {
              result = await select_assessment(config);
            }
            
            console.log(`✅ ${config.id} overlay ${result}`);
            
            // Update button appearance based on state
            this.updateButtonState(button, config, result);
            
          } catch (error) {
            console.error(`❌ Error with ${config.id}:`, error);
            this.showButtonError(button, config, error);
          } finally {
            setTimeout(() => { this.isProcessing = false; }, 500);
          }
        });
      }
    });
    
    console.log('✅ Overlay button event listeners setup complete');
  }

  /**
   * Updates button appearance based on overlay state
   * @param {HTMLElement} button - Button element
   * @param {Object} config - Button configuration
   * @param {string} result - Operation result ('created', 'removed', etc.)
   */
  updateButtonState(button, config, result) {
    try {
      if (result === 'created') {
        button.style.backgroundColor = config.color.replace('0.3', '0.8'); // Make button more opaque when active
        button.style.color = 'white';
        button.setAttribute('data-state', 'active');
      } else if (result === 'removed') {
        button.style.backgroundColor = ''; // Reset to default
        button.style.color = '';
        button.removeAttribute('data-state');
      } else if (result === 'error' || result === 'not_found') {
        // Show temporary error state
        const originalBg = button.style.backgroundColor;
        const originalColor = button.style.color;
        
        button.style.backgroundColor = '#f44336';
        button.style.color = 'white';
        
        setTimeout(() => {
          button.style.backgroundColor = originalBg;
          button.style.color = originalColor;
        }, 2000);
      }
    } catch (error) {
      console.error('❌ Error updating button state:', error);
    }
  }

  /**
   * Shows error feedback on button
   * @param {HTMLElement} button - Button element
   * @param {Object} config - Button configuration 
   * @param {Error} error - Error object
   */
  showButtonError(button, config, error) {
    try {
      // Create temporary error tooltip
      const tooltip = document.createElement('div');
      tooltip.style.cssText = `
        position: absolute;
        background: #f44336;
        color: white;
        padding: 5px 8px;
        border-radius: 3px;
        font-size: 11px;
        z-index: 10001;
        white-space: nowrap;
        pointer-events: none;
      `;
      tooltip.textContent = `Error: ${error.message}`;
      
      // Position near button
      const rect = button.getBoundingClientRect();
      tooltip.style.left = rect.left + 'px';
      tooltip.style.top = (rect.top - 30) + 'px';
      
      document.body.appendChild(tooltip);
      
      // Remove after 3 seconds
      setTimeout(() => {
        if (tooltip.parentNode) {
          tooltip.parentNode.removeChild(tooltip);
        }
      }, 3000);
    } catch (tooltipError) {
      console.error('❌ Error showing button error tooltip:', tooltipError);
    }
  }

  /**
   * Clears all overlays (helper function)
   */
  clearAllOverlays() {
    // This function would remove all existing overlays
    // Implementation depends on how overlays are tracked
    logger.debug('🧹 Clearing all overlays on course change');
  }

  /**
   * Shows general success feedback
   * @param {string} message - Success message
   */
  showSuccessFeedback(message) {
    try {
      let notification = document.getElementById('success-notification');
      
      if (!notification) {
        notification = document.createElement('div');
        notification.id = 'success-notification';
        notification.style.cssText = `
          position: fixed;
          top: 10px;
          right: 10px;
          background: #4CAF50;
          color: white;
          padding: 10px 15px;
          border-radius: 5px;
          font-size: 12px;
          z-index: 10000;
          max-width: 250px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        `;
        document.body.appendChild(notification);
      }
      
      notification.textContent = message;
      notification.style.display = 'block';
      
      // Auto-hide after 3 seconds
      setTimeout(() => {
        if (notification && notification.parentNode) {
          notification.style.display = 'none';
        }
      }, 3000);
      
      console.log('📢 Success feedback shown:', message);
    } catch (error) {
      console.error('❌ Error showing success feedback:', error);
    }
  }
}

// Make UIManager available globally
window.UIManager = UIManager;