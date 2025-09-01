// UI management module
// Handles UI initialization, course selection, and button setup

class UIManager {
  constructor() {
    this.cachedSettings = null;
    this.isProcessing = false;
    this.scriptExecutor = null; // Will be injected like view manager
    
    // Initialize enhanced logger if available
    this.logger = typeof enhancedLogger !== 'undefined' ? enhancedLogger : console;
  }
  
  /**
   * Sets the script executor for Chrome extension API calls
   * @param {Function} executor - Function to execute scripts in active tab
   */
  setScriptExecutor(executor) {
    this.scriptExecutor = executor;
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
        this.logger.debug && this.logger.debug(
          this.logger.categories?.UI || 'UI',
          `Title updated to: ${titleElement.textContent}`,
          'title-update'
        );
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
      
      this.logger.debug && this.logger.debug(
        this.logger.categories?.UI || 'UI',
        `Course dropdown populated with ${courses.length} courses`,
        'course-dropdown'
      );
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
          this.logger.logUserAction && this.logger.logUserAction('course-change', { course: selectedCourse });
          
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
    this.logger.debug && this.logger.debug(
      this.logger.categories?.UI || 'UI',
      'Setting up overlay button event listeners',
      'button-setup'
    );
    
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
          this.logger.logUserAction && this.logger.logUserAction('overlay-button-click', { 
            overlayType: config.id 
          });
          
          try {
            let result;
            
            if (!this.scriptExecutor) {
              throw new Error('Script executor not configured');
            }
            
            // Create overlay using direct script injection approach
            result = await this.createOverlayDirectly(config);
            
            
            this.logger.logOverlayOperation && this.logger.logOverlayOperation(
              'button-action', 
              config.id, 
              result !== 'error' && result !== 'not_found', 
              { result }
            );
            
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
    
    this.logger.info && this.logger.info(
      this.logger.categories?.UI || 'UI',
      'Overlay button event listeners setup complete',
      'button-setup-complete'
    );
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
    this.logger.debug && this.logger.debug(
      this.logger.categories?.UI || 'UI',
      'Clearing all overlays on course change',
      'overlay-cleanup'
    );
  }

  /**
   * Creates overlay directly using script injection
   * @param {Object} config - Overlay configuration
   * @returns {Promise<string>} Overlay creation result
   */
  async createOverlayDirectly(config) {
    try {
      // Get overlay data based on type
      const overlayData = this.getOverlayData(config.id);
      
      // Execute overlay creation in the active tab
      const result = await this.scriptExecutor((configData, overlayInfo) => {
        // Self-contained overlay creation logic
        console.log('🎨 Creating overlay:', configData.id, overlayInfo);
        
        // Check if overlay already exists (remove if it does)
        const existing = document.getElementById(configData.overlayId);
        const existingText = document.getElementById(configData.overlayId + '-text');
        
        if (existing || existingText) {
          if (existing) existing.remove();
          if (existingText) existingText.remove();
          console.log('🗑️ Removed existing overlay:', configData.overlayId);
          return 'removed';
        }
        
        // Find calendar element
        const selectors = [
          'table.GNKVYU1C-',
          'table[class^="GNKVYU1C"]',
          'table[class*="GNKVYU1C"]',
          '.gwt-TabLayoutPanelContent table',
          'table'
        ];
        
        let calendar = null;
        for (const selector of selectors) {
          try {
            if (selector === 'table') {
              const tables = document.querySelectorAll('table');
              let largest = null, maxArea = 0;
              tables.forEach(t => {
                const r = t.getBoundingClientRect();
                const area = r.width * r.height;
                if (area > maxArea) { maxArea = area; largest = t; }
              });
              if (largest) { calendar = largest; break; }
            } else {
              const el = document.querySelector(selector);
              if (el) { calendar = el; break; }
            }
          } catch (e) { continue; }
        }
        
        if (!calendar) {
          console.error('❌ Calendar not found');
          return 'error';
        }
        
        // Create overlay based on type
        if (overlayInfo.type === 'week-range') {
          // Week range overlay creation logic
          const cells = calendar.querySelectorAll('td');
          const weekCells = [];
          
          cells.forEach(cell => {
            const text = cell.textContent?.trim().toLowerCase();
            
            // Simple string-based week detection - avoid regex complications
            if (text.includes('week')) {
              console.log('Found text containing "week":', text);
              
              // Extract number after "week" using simple parsing
              const parts = text.split('week');
              if (parts.length > 1) {
                const afterWeek = parts[1].trim();
                
                // Extract just the digits at the start
                let numStr = '';
                for (let i = 0; i < afterWeek.length; i++) {
                  const char = afterWeek[i];
                  if (char >= '0' && char <= '9') {
                    numStr += char;
                  } else if (numStr.length > 0) {
                    break; // Stop at first non-digit after we found digits
                  }
                }
                
                if (numStr.length > 0) {
                  const weekNum = parseInt(numStr);
                  console.log('Parsed week number:', weekNum, 'from:', text);
                  if (weekNum >= overlayInfo.startWeek && weekNum <= overlayInfo.endWeek) {
                    console.log('✅ Week', weekNum, 'is in range', overlayInfo.startWeek, '-', overlayInfo.endWeek);
                    weekCells.push(cell);
                  } else {
                    console.log('Week', weekNum, 'is outside range', overlayInfo.startWeek, '-', overlayInfo.endWeek);
                  }
                } else {
                  console.log('No number found after "week" in:', afterWeek);
                }
              }
            }
          });
          
          if (weekCells.length === 0) {
            console.log('❌ No week cells found for range');
            return 'not_found';
          }
          
          // Calculate bounds
          let minLeft = Infinity, maxRight = 0, minTop = Infinity, maxBottom = 0;
          weekCells.forEach(cell => {
            const rect = cell.getBoundingClientRect();
            minLeft = Math.min(minLeft, rect.left);
            maxRight = Math.max(maxRight, rect.right);
            minTop = Math.min(minTop, rect.top);
            maxBottom = Math.max(maxBottom, rect.bottom);
          });
          
          const calendarRect = calendar.getBoundingClientRect();
          
          // Create overlay
          const overlay = document.createElement('div');
          overlay.id = configData.overlayId;
          Object.assign(overlay.style, {
            position: 'fixed',
            top: minTop + 'px',
            left: calendarRect.left + 'px',
            width: calendarRect.width + 'px',
            height: (maxBottom - minTop) + 'px',
            background: configData.color,
            zIndex: '999999',
            pointerEvents: 'none'
          });
          
          document.body.appendChild(overlay);
          
          // Add text overlay
          const textOverlay = document.createElement('div');
          textOverlay.id = configData.overlayId + '-text';
          const centerX = calendarRect.left + (calendarRect.width / 2);
          const centerY = minTop + ((maxBottom - minTop) / 2);
          
          Object.assign(textOverlay.style, {
            position: 'fixed',
            left: centerX + 'px',
            top: centerY + 'px',
            transform: 'translate(-50%, -50%)',
            color: 'white',
            fontSize: '24px',
            fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
            zIndex: '1000001',
            pointerEvents: 'none',
            userSelect: 'none'
          });
          
          textOverlay.textContent = overlayInfo.label;
          document.body.appendChild(textOverlay);
          
          console.log('✅ Week range overlay created:', configData.overlayId);
          return 'created';
          
        } else if (overlayInfo.type === 'day-specific') {
          // Day-specific overlay creation logic
          console.log('🎯 Creating day-specific overlay for day', overlayInfo.dayNumber, 'in week', overlayInfo.weekNumber);
          return 'created'; // Simplified for now
        }
        
        return 'error';
      }, [config, overlayData]);

      return result[0]?.result || result;
    } catch (error) {
      console.error(`❌ Error creating overlay for ${config.id}:`, error);
      return 'error';
    }
  }
  
  /**
   * Gets overlay data for different overlay types
   */
  getOverlayData(overlayId) {
    const settings = this.cachedSettings;
    
    switch (overlayId) {
      case 'select_blok':
        const blokConfig = settings?.bloks?.[settings.defaultBlok];
        return {
          type: 'week-range',
          startWeek: blokConfig?.startWeek || 36,
          endWeek: blokConfig?.endWeek || 44,
          sprintNumber: 0,
          label: 'Blok 1'
        };
        
      case 'select_sprint1':
        const course = this.getCurrentCourseConfig();
        return {
          type: 'week-range',
          startWeek: course?.sprint1?.startWeek || 36,
          endWeek: course?.sprint1?.endWeek || 37,
          sprintNumber: 1,
          label: 'Sprint 1'
        };
        
      case 'select_sprint2':
        const course2 = this.getCurrentCourseConfig();
        return {
          type: 'week-range',
          startWeek: course2?.sprint2?.startWeek || 38,
          endWeek: course2?.sprint2?.endWeek || 39,
          sprintNumber: 2,
          label: 'Sprint 2'
        };
        
      case 'select_sprint3':
        const course3 = this.getCurrentCourseConfig();
        return {
          type: 'week-range',
          startWeek: course3?.sprint3?.startWeek || 40,
          endWeek: course3?.sprint3?.endWeek || 42,
          sprintNumber: 3,
          label: 'Sprint 3'
        };
        
      case 'select_rooster_vrij':
        const rvConfig = settings?.roosterVrij;
        return {
          type: 'week-range',
          startWeek: rvConfig?.startWeek || 43,
          endWeek: rvConfig?.endWeek || 43,
          sprintNumber: -1,
          label: 'Rooster Vrij'
        };
        
      case 'select_toets':
        const toetsConfig = this.getCurrentCourseConfig()?.Toets;
        return {
          type: 'day-specific',
          weekNumber: toetsConfig?.weekNumber || 45,
          dayNumber: toetsConfig?.dayNumber || 5,
          label: 'Toets'
        };
        
      case 'select_assessment':
        const assessConfig = this.getCurrentCourseConfig()?.Assessment;
        return {
          type: 'day-specific',
          weekNumber: assessConfig?.weekNumber || 45,
          dayNumber: assessConfig?.dayNumber || 6,
          label: 'Assessment'
        };
        
      default:
        throw new Error(`Unknown overlay type: ${overlayId}`);
    }
  }
  
  /**
   * Gets current course configuration from settings
   */
  getCurrentCourseConfig() {
    if (!this.cachedSettings) return null;
    
    const currentBlok = this.cachedSettings.defaultBlok;
    const currentModule = this.cachedSettings.defaultModule;
    const currentCourse = getCurrentCourse(); // This function should be available globally
    
    return this.cachedSettings?.bloks?.[currentBlok]?.modules?.[currentModule]?.courses?.[currentCourse];
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
      
      this.logger.info && this.logger.info(
        this.logger.categories?.UI || 'UI',
        `Success feedback shown: ${message}`,
        'success-feedback'
      );
    } catch (error) {
      console.error('❌ Error showing success feedback:', error);
    }
  }
}

// Make UIManager available globally
window.UIManager = UIManager;