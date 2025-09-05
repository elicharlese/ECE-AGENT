/**
 * Platform detection utilities for cross-platform support
 */

// Platform type definitions
export type Platform = 'web' | 'mobile' | 'desktop' | 'unknown';
export type OS = 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'unknown';
export type DeviceType = 'phone' | 'tablet' | 'desktop' | 'tv' | 'unknown';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';

// Check if we're in React Native
const isReactNative = typeof navigator !== 'undefined' && navigator.product === 'ReactNative';

// Check if we're in Electron
const isElectron = isBrowser && !!(window as any).electron;

/**
 * Detect the current platform
 */
export function getPlatform(): Platform {
  if (isReactNative) return 'mobile';
  if (isElectron) return 'desktop';
  if (isBrowser) return 'web';
  return 'unknown';
}

/**
 * Detect the operating system
 */
export function getOS(): OS {
  if (!isBrowser) return 'unknown';
  
  const userAgent = navigator.userAgent.toLowerCase();
  const platform = navigator.platform?.toLowerCase() || '';
  
  if (/iphone|ipad|ipod/.test(userAgent) || platform.startsWith('iphone')) return 'ios';
  if (/android/.test(userAgent)) return 'android';
  if (/win/.test(platform) || /win/.test(userAgent)) return 'windows';
  if (/mac/.test(platform) || /mac/.test(userAgent)) return 'macos';
  if (/linux/.test(platform) || /linux/.test(userAgent)) return 'linux';
  
  return 'unknown';
}

/**
 * Detect device type based on screen size and user agent
 */
export function getDeviceType(): DeviceType {
  if (!isBrowser) return 'unknown';
  
  const userAgent = navigator.userAgent.toLowerCase();
  
  // Check for TV devices
  if (/tv|television|smarttv|googletv|appletv/.test(userAgent)) {
    return 'tv';
  }
  
  // Check for tablets
  if (/ipad|tablet|playbook|silk/.test(userAgent) || 
      (/android/.test(userAgent) && !/mobile/.test(userAgent))) {
    return 'tablet';
  }
  
  // Check for phones
  if (/mobile|iphone|ipod|android.*mobile|blackberry|opera mini|windows phone/.test(userAgent)) {
    return 'phone';
  }
  
  // Default to desktop for larger screens
  return 'desktop';
}

/**
 * Check if the device has touch capability
 */
export function hasTouch(): boolean {
  if (!isBrowser) return false;
  
  return 'ontouchstart' in window || 
         navigator.maxTouchPoints > 0 ||
         (navigator as any).msMaxTouchPoints > 0;
}

/**
 * Check if the device prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (!isBrowser) return false;
  
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  return mediaQuery.matches;
}

/**
 * Check if the device is in dark mode
 */
export function prefersDarkMode(): boolean {
  if (!isBrowser) return false;
  
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  return mediaQuery.matches;
}

/**
 * Platform-specific constants
 */
export const platformConfig = {
  web: {
    minTouchTargetSize: 44, // WCAG AA standard
    defaultFontSize: 16,
    scrollbarWidth: 17, // Approximate, varies by OS
  },
  mobile: {
    minTouchTargetSize: 48, // Material Design standard
    defaultFontSize: 16,
    statusBarHeight: 20, // Varies by device
    navigationBarHeight: 48,
  },
  desktop: {
    minClickTargetSize: 24,
    defaultFontSize: 14,
    windowControlsHeight: 32, // Varies by OS
  },
};

/**
 * Get platform-specific configuration
 */
export function getPlatformConfig() {
  const platform = getPlatform();
  return platformConfig[platform === 'unknown' ? 'web' : platform];
}

// Export convenience checks
export const isWeb = getPlatform() === 'web';
export const isMobile = getPlatform() === 'mobile';
export const isDesktop = getPlatform() === 'desktop';
export const isIOS = getOS() === 'ios';
export const isAndroid = getOS() === 'android';
export const isMacOS = getOS() === 'macos';
export const isWindows = getOS() === 'windows';
export const isLinux = getOS() === 'linux';
export const isTouchDevice = hasTouch();
