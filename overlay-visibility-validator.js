// Overlay visibility validation utility
// Validates that created overlays are actually visible and properly positioned

(function(global) {
  'use strict';

  // Configuration constants for validation
  const VISIBILITY_CONFIG = {
    // Minimum dimensions for overlay to be considered visible
    MIN_VISIBLE_WIDTH: 10,
    MIN_VISIBLE_HEIGHT: 10,
    
    // Minimum opacity to be considered visible
    MIN_OPACITY: 0.1,
    
    // Validation timing
    VALIDATION_DELAY_MS: 100,
    RETRY_DELAY_MS: 200,
    MAX_RETRIES: 3,
    
    // Expected overlay properties
    EXPECTED_Z_INDEX_MIN: 999,
    EXPECTED_OVERLAY_TYPES: ['blok', 'sprint1', 'sprint2', 'sprint3', 'rooster_vrij', 'toets', 'assessment'],
    
    // Validation criteria weights (for scoring)
    WEIGHTS: {
      VISIBLE_IN_VIEWPORT: 0.3,
      PROPER_DIMENSIONS: 0.25,
      CORRECT_POSITIONING: 0.2,
      OPACITY_APPROPRIATE: 0.15,
      Z_INDEX_CORRECT: 0.1
    }
  };

  class OverlayVisibilityValidator {
    constructor() {
      this.config = VISIBILITY_CONFIG;
      this.validationHistory = [];
      this.activeValidations = new Map();
    }

    /**
     * Validates if an overlay is properly visible
     * @param {string} overlayId - ID of the overlay to validate
     * @param {Object} expectedConfig - Expected overlay configuration
     * @returns {Promise<Object>} Validation result
     */
    async validateOverlay(overlayId, expectedConfig = {}) {
      const validationId = `${overlayId}-${Date.now()}`;
      
      try {
        // Wait a moment for overlay to be fully rendered
        await new Promise(resolve => setTimeout(resolve, this.config.VALIDATION_DELAY_MS));
        
        const result = await this._performValidationWithRetries(overlayId, expectedConfig, validationId);
        
        this._recordValidation(validationId, overlayId, result);
        
        return result;
      } catch (error) {
        const errorResult = errorHandler.createError(
          ERROR_CODES.OVERLAY_POSITIONING_FAILED,
          `Overlay validation failed: ${error.message}`,
          'validateOverlay',
          error
        );
        
        this._recordValidation(validationId, overlayId, errorResult);
        return errorResult;
      }
    }

    /**
     * Performs validation with retry logic
     * @private
     */
    async _performValidationWithRetries(overlayId, expectedConfig, validationId) {
      let lastError = null;
      
      for (let attempt = 1; attempt <= this.config.MAX_RETRIES; attempt++) {
        try {
          if (attempt > 1) {
            await new Promise(resolve => setTimeout(resolve, this.config.RETRY_DELAY_MS));
          }
          
          const result = this._validateSingleAttempt(overlayId, expectedConfig);
          
          if (result.success) {
            result.attemptsRequired = attempt;
            return result;
          }
          
          lastError = result.error;
          console.warn(`🔄 Validation attempt ${attempt}/${this.config.MAX_RETRIES} failed for ${overlayId}`);
          
        } catch (error) {
          lastError = error;
        }
      }
      
      return errorHandler.createError(
        ERROR_CODES.OVERLAY_POSITIONING_FAILED,
        `Overlay validation failed after ${this.config.MAX_RETRIES} attempts: ${lastError}`,
        'validateOverlayWithRetries'
      );
    }

    /**
     * Performs a single validation attempt
     * @private
     */
    _validateSingleAttempt(overlayId, expectedConfig) {
      const element = document.getElementById(overlayId);
      
      if (!element) {
        return errorHandler.createError(
          ERROR_CODES.OVERLAY_CREATION_FAILED,
          `Overlay element not found: ${overlayId}`,
          'validateSingleAttempt'
        );
      }

      const validationResult = this._analyzeOverlayVisibility(element, expectedConfig);
      
      if (validationResult.overallScore >= 0.7) {
        return errorHandler.createSuccess(validationResult, 'Overlay validation passed', 'validateSingleAttempt');
      } else {
        return errorHandler.createError(
          ERROR_CODES.OVERLAY_POSITIONING_FAILED,
          `Overlay validation failed (score: ${validationResult.overallScore.toFixed(2)})`,
          'validateSingleAttempt',
          validationResult
        );
      }
    }

    /**
     * Analyzes overlay visibility with detailed scoring
     * @private
     */
    _analyzeOverlayVisibility(element, expectedConfig) {
      const rect = element.getBoundingClientRect();
      const styles = window.getComputedStyle(element);
      const viewport = this._getViewportDimensions();
      
      // Individual validation checks
      const checks = {
        visibleInViewport: this._checkViewportVisibility(rect, viewport),
        properDimensions: this._checkDimensions(rect),
        correctPositioning: this._checkPositioning(element, styles, expectedConfig),
        opacityAppropriate: this._checkOpacity(styles),
        zIndexCorrect: this._checkZIndex(styles)
      };

      // Calculate weighted score
      let overallScore = 0;
      overallScore += checks.visibleInViewport.score * this.config.WEIGHTS.VISIBLE_IN_VIEWPORT;
      overallScore += checks.properDimensions.score * this.config.WEIGHTS.PROPER_DIMENSIONS;
      overallScore += checks.correctPositioning.score * this.config.WEIGHTS.CORRECT_POSITIONING;
      overallScore += checks.opacityAppropriate.score * this.config.WEIGHTS.OPACITY_APPROPRIATE;
      overallScore += checks.zIndexCorrect.score * this.config.WEIGHTS.Z_INDEX_CORRECT;

      return {
        overallScore: overallScore,
        passed: overallScore >= 0.7,
        checks: checks,
        elementInfo: {
          id: element.id,
          rect: {
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            x: Math.round(rect.x),
            y: Math.round(rect.y)
          },
          styles: {
            position: styles.position,
            zIndex: styles.zIndex,
            opacity: styles.opacity,
            visibility: styles.visibility,
            display: styles.display
          }
        }
      };
    }

    /**
     * Checks if overlay is visible in viewport
     * @private
     */
    _checkViewportVisibility(rect, viewport) {
      const isInViewport = 
        rect.left < viewport.width &&
        rect.right > 0 &&
        rect.top < viewport.height &&
        rect.bottom > 0;

      const visibleArea = this._calculateVisibleArea(rect, viewport);
      const totalArea = rect.width * rect.height;
      const visibilityRatio = totalArea > 0 ? visibleArea / totalArea : 0;

      return {
        passed: isInViewport && visibilityRatio > 0.1,
        score: Math.min(visibilityRatio * 2, 1), // Score 0-1
        details: {
          inViewport: isInViewport,
          visibilityRatio: visibilityRatio,
          visibleArea: visibleArea,
          totalArea: totalArea
        }
      };
    }

    /**
     * Checks overlay dimensions
     * @private
     */
    _checkDimensions(rect) {
      const hasMinWidth = rect.width >= this.config.MIN_VISIBLE_WIDTH;
      const hasMinHeight = rect.height >= this.config.MIN_VISIBLE_HEIGHT;
      const hasReasonableSize = rect.width > 0 && rect.height > 0;

      const passed = hasMinWidth && hasMinHeight && hasReasonableSize;
      
      // Score based on how well dimensions meet expectations
      let score = 0;
      if (hasReasonableSize) score += 0.3;
      if (hasMinWidth) score += 0.35;
      if (hasMinHeight) score += 0.35;

      return {
        passed: passed,
        score: score,
        details: {
          width: rect.width,
          height: rect.height,
          hasMinWidth: hasMinWidth,
          hasMinHeight: hasMinHeight,
          hasReasonableSize: hasReasonableSize
        }
      };
    }

    /**
     * Checks overlay positioning
     * @private
     */
    _checkPositioning(element, styles, expectedConfig) {
      const isFixed = styles.position === 'fixed';
      const isAbsolute = styles.position === 'absolute';
      const hasValidPosition = isFixed || isAbsolute;

      const hasValidContainer = expectedConfig.expectedParent ? 
        element.parentElement && element.parentElement.matches(expectedConfig.expectedParent) :
        true;

      const passed = hasValidPosition && hasValidContainer;
      
      let score = 0;
      if (hasValidPosition) score += 0.6;
      if (hasValidContainer) score += 0.4;

      return {
        passed: passed,
        score: score,
        details: {
          position: styles.position,
          hasValidPosition: hasValidPosition,
          hasValidContainer: hasValidContainer,
          parentElement: element.parentElement?.tagName
        }
      };
    }

    /**
     * Checks overlay opacity
     * @private
     */
    _checkOpacity(styles) {
      const opacity = parseFloat(styles.opacity) || 1;
      const visibility = styles.visibility;
      const display = styles.display;

      const isVisible = visibility !== 'hidden' && display !== 'none';
      const hasAppropriateOpacity = opacity >= this.config.MIN_OPACITY;

      const passed = isVisible && hasAppropriateOpacity;
      
      let score = 0;
      if (isVisible) score += 0.5;
      if (hasAppropriateOpacity) score += 0.5;

      return {
        passed: passed,
        score: score,
        details: {
          opacity: opacity,
          visibility: visibility,
          display: display,
          isVisible: isVisible,
          hasAppropriateOpacity: hasAppropriateOpacity
        }
      };
    }

    /**
     * Checks z-index for proper layering
     * @private
     */
    _checkZIndex(styles) {
      const zIndex = parseInt(styles.zIndex) || 0;
      const hasAppropriateZIndex = zIndex >= this.config.EXPECTED_Z_INDEX_MIN;

      return {
        passed: hasAppropriateZIndex,
        score: hasAppropriateZIndex ? 1 : 0.3, // Partial credit if at least has some z-index
        details: {
          zIndex: zIndex,
          expected: this.config.EXPECTED_Z_INDEX_MIN,
          hasAppropriateZIndex: hasAppropriateZIndex
        }
      };
    }

    /**
     * Calculates visible area of overlay within viewport
     * @private
     */
    _calculateVisibleArea(rect, viewport) {
      const left = Math.max(0, rect.left);
      const right = Math.min(viewport.width, rect.right);
      const top = Math.max(0, rect.top);
      const bottom = Math.min(viewport.height, rect.bottom);

      if (left >= right || top >= bottom) return 0;

      return (right - left) * (bottom - top);
    }

    /**
     * Gets viewport dimensions
     * @private
     */
    _getViewportDimensions() {
      return {
        width: window.innerWidth || document.documentElement.clientWidth,
        height: window.innerHeight || document.documentElement.clientHeight
      };
    }

    /**
     * Records validation result for history tracking
     * @private
     */
    _recordValidation(validationId, overlayId, result) {
      const record = {
        id: validationId,
        overlayId: overlayId,
        timestamp: Date.now(),
        result: result,
        success: result.success
      };

      this.validationHistory.push(record);

      // Keep history manageable
      if (this.validationHistory.length > 50) {
        this.validationHistory = this.validationHistory.slice(-50);
      }
    }

    /**
     * Validates multiple overlays
     * @param {Array} overlaySpecs - Array of {id, config} objects
     * @returns {Promise<Object>} Combined validation result
     */
    async validateMultipleOverlays(overlaySpecs) {
      const results = [];
      
      for (const spec of overlaySpecs) {
        const result = await this.validateOverlay(spec.id, spec.config || {});
        results.push({
          overlayId: spec.id,
          result: result
        });
      }

      const successCount = results.filter(r => r.result.success).length;
      const totalCount = results.length;
      const overallSuccess = successCount === totalCount;

      return {
        success: overallSuccess,
        summary: {
          total: totalCount,
          passed: successCount,
          failed: totalCount - successCount,
          successRate: totalCount > 0 ? successCount / totalCount : 0
        },
        individualResults: results
      };
    }

    /**
     * Gets validation history
     * @param {string} overlayId - Optional filter by overlay ID
     * @returns {Array} Validation history
     */
    getValidationHistory(overlayId = null) {
      if (overlayId) {
        return this.validationHistory.filter(record => record.overlayId === overlayId);
      }
      return this.validationHistory;
    }

    /**
     * Gets validation statistics
     * @returns {Object} Statistics object
     */
    getValidationStats() {
      if (this.validationHistory.length === 0) {
        return { total: 0, successRate: 0, recentFailures: 0 };
      }

      const total = this.validationHistory.length;
      const successful = this.validationHistory.filter(r => r.success).length;
      const recentCount = 10;
      const recent = this.validationHistory.slice(-recentCount);
      const recentFailures = recent.filter(r => !r.success).length;

      return {
        total: total,
        successful: successful,
        failed: total - successful,
        successRate: successful / total,
        recentValidations: recent.length,
        recentFailures: recentFailures,
        recentSuccessRate: recent.length > 0 ? (recent.length - recentFailures) / recent.length : 0
      };
    }
  }

  // Make OverlayVisibilityValidator available globally
  global.OverlayVisibilityValidator = OverlayVisibilityValidator;
  global.VISIBILITY_CONFIG = VISIBILITY_CONFIG;

  // Create global instance
  global.overlayValidator = new OverlayVisibilityValidator();

  console.log('✅ Overlay Visibility Validator loaded!');

})(typeof window !== 'undefined' ? window : this);