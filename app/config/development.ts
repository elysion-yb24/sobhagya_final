// Development Configuration
// This file controls development features like sample data
// When backend is ready, simply set USE_SAMPLE_DATA to false

export const DEVELOPMENT_CONFIG = {
  // Set to false when backend is ready to remove all sample data
  USE_SAMPLE_DATA: false,
  
  // Development mode banner
  SHOW_DEV_BANNER: false,
  
  // Console logging for debugging
  ENABLE_DEBUG_LOGS: true,
} as const;

// Helper function to check if sample data should be used
export const shouldUseSampleData = (): boolean => {
  return DEVELOPMENT_CONFIG.USE_SAMPLE_DATA;
};

// Helper function to check if dev banner should be shown
export const shouldShowDevBanner = (): boolean => {
  return DEVELOPMENT_CONFIG.SHOW_DEV_BANNER;
};

// Helper function to check if debug logs should be shown
export const shouldShowDebugLogs = (): boolean => {
  return DEVELOPMENT_CONFIG.ENABLE_DEBUG_LOGS;
};
