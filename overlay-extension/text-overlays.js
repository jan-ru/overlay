// Text overlay functions

// UPDATED: Individual Text overlay toggle function
async function toggleTextOverlay(textConfig) {
  console.log('📝 Toggling text overlay:', textConfig.id);
  
  try {
    const result = await executeScriptInActiveTab((config, styles) => {
      // Check if this specific text overlay exists
      const existing = document.getElementById(config.overlayId);
      if (existing) {
        console.log('🗑️ Removing existing text overlay:', config.overlayId);
        existing.remove();
        return 'removed';
      }

      // Create new text overlay
      const textOverlay = document.createElement("div");
      textOverlay.id = config.overlayId; // Use unique ID
      Object.assign(textOverlay.style, {
        ...styles,
        top: config.position
      });
      textOverlay.textContent = config.text;
      document.body.appendChild(textOverlay);
      console.log('✅ Text overlay created:', config.overlayId);
      return 'created';
    }, [textConfig, TEXT_OVERLAY_STYLES]);

    return result[0]?.result || result;
  } catch (error) {
    console.error('❌ Error toggling text overlay:', error);
    return 'error';
  }
}