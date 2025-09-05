/**
 * Responsive Design Tokens
 * Platform-specific values that adapt to different screen sizes and devices
 */

import { ResponsiveValue } from '../utils/responsive';

/**
 * Responsive typography scales
 */
export const responsiveTypography = {
  // Font sizes that scale with viewport
  fontSize: {
    // Display text
    display: {
      xs: '2rem',      // 32px
      sm: '2.5rem',    // 40px
      md: '3rem',      // 48px
      lg: '3.5rem',    // 56px
      xl: '4rem',      // 64px
      '2xl': '4.5rem', // 72px
    } as ResponsiveValue<string>,
    
    // Headings
    h1: {
      xs: '1.875rem',  // 30px
      sm: '2.25rem',   // 36px
      md: '2.5rem',    // 40px
      lg: '3rem',      // 48px
      xl: '3.5rem',    // 56px
    } as ResponsiveValue<string>,
    
    h2: {
      xs: '1.5rem',    // 24px
      sm: '1.75rem',   // 28px
      md: '2rem',      // 32px
      lg: '2.25rem',   // 36px
      xl: '2.5rem',    // 40px
    } as ResponsiveValue<string>,
    
    h3: {
      xs: '1.25rem',   // 20px
      sm: '1.375rem',  // 22px
      md: '1.5rem',    // 24px
      lg: '1.75rem',   // 28px
      xl: '2rem',      // 32px
    } as ResponsiveValue<string>,
    
    h4: {
      xs: '1.125rem',  // 18px
      sm: '1.125rem',  // 18px
      md: '1.25rem',   // 20px
      lg: '1.375rem',  // 22px
      xl: '1.5rem',    // 24px
    } as ResponsiveValue<string>,
    
    h5: {
      xs: '1rem',      // 16px
      sm: '1rem',      // 16px
      md: '1.125rem',  // 18px
      lg: '1.25rem',   // 20px
      xl: '1.25rem',   // 20px
    } as ResponsiveValue<string>,
    
    h6: {
      xs: '0.875rem',  // 14px
      sm: '0.875rem',  // 14px
      md: '1rem',      // 16px
      lg: '1rem',      // 16px
      xl: '1.125rem',  // 18px
    } as ResponsiveValue<string>,
    
    // Body text
    body: {
      xs: '0.875rem',  // 14px
      sm: '0.875rem',  // 14px
      md: '1rem',      // 16px
      lg: '1rem',      // 16px
      xl: '1.125rem',  // 18px
    } as ResponsiveValue<string>,
    
    // Small text
    small: {
      xs: '0.75rem',   // 12px
      sm: '0.75rem',   // 12px
      md: '0.875rem',  // 14px
      lg: '0.875rem',  // 14px
      xl: '0.875rem',  // 14px
    } as ResponsiveValue<string>,
  },
  
  // Line heights that adjust with font size
  lineHeight: {
    tight: {
      xs: 1.2,
      sm: 1.25,
      md: 1.25,
      lg: 1.3,
    } as ResponsiveValue<number>,
    
    normal: {
      xs: 1.5,
      sm: 1.5,
      md: 1.6,
      lg: 1.6,
    } as ResponsiveValue<number>,
    
    relaxed: {
      xs: 1.7,
      sm: 1.75,
      md: 1.8,
      lg: 1.8,
    } as ResponsiveValue<number>,
  },
};

/**
 * Responsive spacing scales
 */
export const responsiveSpacing = {
  // Container padding
  container: {
    xs: '1rem',      // 16px
    sm: '1.25rem',   // 20px
    md: '1.5rem',    // 24px
    lg: '2rem',      // 32px
    xl: '2.5rem',    // 40px
    '2xl': '3rem',   // 48px
  } as ResponsiveValue<string>,
  
  // Section spacing
  section: {
    xs: '2rem',      // 32px
    sm: '3rem',      // 48px
    md: '4rem',      // 64px
    lg: '5rem',      // 80px
    xl: '6rem',      // 96px
    '2xl': '7rem',   // 112px
  } as ResponsiveValue<string>,
  
  // Component spacing
  component: {
    xs: '0.75rem',   // 12px
    sm: '1rem',      // 16px
    md: '1.25rem',   // 20px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
  } as ResponsiveValue<string>,
  
  // Grid gaps
  gridGap: {
    xs: '0.5rem',    // 8px
    sm: '0.75rem',   // 12px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '2.5rem', // 40px
  } as ResponsiveValue<string>,
};

/**
 * Component size scales
 */
export const responsiveSizes = {
  // Button sizes
  button: {
    height: {
      xs: '2.25rem',   // 36px - mobile friendly
      sm: '2.25rem',   // 36px
      md: '2.5rem',    // 40px
      lg: '2.75rem',   // 44px
      xl: '3rem',      // 48px
    } as ResponsiveValue<string>,
    
    padding: {
      xs: '0.75rem',   // 12px
      sm: '0.875rem',  // 14px
      md: '1rem',      // 16px
      lg: '1.25rem',   // 20px
      xl: '1.5rem',    // 24px
    } as ResponsiveValue<string>,
  },
  
  // Input sizes
  input: {
    height: {
      xs: '2.5rem',    // 40px - mobile friendly
      sm: '2.5rem',    // 40px
      md: '2.75rem',   // 44px
      lg: '3rem',      // 48px
      xl: '3.25rem',   // 52px
    } as ResponsiveValue<string>,
    
    fontSize: {
      xs: '1rem',      // 16px - prevents zoom on iOS
      sm: '1rem',      // 16px
      md: '1rem',      // 16px
      lg: '1.125rem',  // 18px
      xl: '1.125rem',  // 18px
    } as ResponsiveValue<string>,
  },
  
  // Icon sizes
  icon: {
    small: {
      xs: '1rem',      // 16px
      sm: '1rem',      // 16px
      md: '1.125rem',  // 18px
      lg: '1.25rem',   // 20px
    } as ResponsiveValue<string>,
    
    medium: {
      xs: '1.25rem',   // 20px
      sm: '1.25rem',   // 20px
      md: '1.5rem',    // 24px
      lg: '1.75rem',   // 28px
    } as ResponsiveValue<string>,
    
    large: {
      xs: '1.5rem',    // 24px
      sm: '1.75rem',   // 28px
      md: '2rem',      // 32px
      lg: '2.5rem',    // 40px
    } as ResponsiveValue<string>,
  },
  
  // Touch targets (minimum interactive element size)
  touchTarget: {
    xs: '44px',      // iOS minimum
    sm: '44px',      
    md: '40px',      // Can be smaller on desktop
    lg: '36px',      
    xl: '32px',
  } as ResponsiveValue<string>,
};

/**
 * Layout dimensions
 */
export const responsiveLayout = {
  // Header heights
  header: {
    xs: '56px',      // Mobile
    sm: '56px',      
    md: '64px',      // Tablet
    lg: '72px',      // Desktop
    xl: '80px',      
  } as ResponsiveValue<string>,
  
  // Sidebar widths
  sidebar: {
    collapsed: '64px',
    expanded: {
      xs: '100%',      // Full width on mobile
      sm: '100%',      
      md: '280px',     // Fixed width on tablet
      lg: '320px',     // Wider on desktop
      xl: '360px',     
    } as ResponsiveValue<string>,
  },
  
  // Modal widths
  modal: {
    small: {
      xs: 'calc(100% - 2rem)',
      sm: 'calc(100% - 3rem)',
      md: '400px',
      lg: '480px',
    } as ResponsiveValue<string>,
    
    medium: {
      xs: 'calc(100% - 2rem)',
      sm: 'calc(100% - 3rem)',
      md: '600px',
      lg: '720px',
    } as ResponsiveValue<string>,
    
    large: {
      xs: 'calc(100% - 2rem)',
      sm: 'calc(100% - 3rem)',
      md: '800px',
      lg: '960px',
      xl: '1200px',
    } as ResponsiveValue<string>,
  },
  
  // Max content widths
  maxWidth: {
    content: {
      xs: '100%',
      sm: '100%',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    } as ResponsiveValue<string>,
    
    readable: {
      xs: '100%',
      sm: '100%',
      md: '640px',
      lg: '720px',
      xl: '800px',
    } as ResponsiveValue<string>,
  },
};

/**
 * Platform-specific adjustments
 */
export const platformAdjustments = {
  // iOS specific
  ios: {
    safeAreaTop: 'env(safe-area-inset-top, 0px)',
    safeAreaBottom: 'env(safe-area-inset-bottom, 0px)',
    safeAreaLeft: 'env(safe-area-inset-left, 0px)',
    safeAreaRight: 'env(safe-area-inset-right, 0px)',
    scrollBounce: '-webkit-overflow-scrolling: touch',
    tapHighlight: '-webkit-tap-highlight-color: transparent',
  },
  
  // Android specific
  android: {
    statusBarHeight: '24px',
    navigationBarHeight: '48px',
    rippleEffect: true,
  },
  
  // Desktop specific
  desktop: {
    hoverEffects: true,
    focusVisible: true,
    keyboardShortcuts: true,
    rightClick: true,
  },
};

/**
 * Responsive border radius
 */
export const responsiveBorderRadius = {
  small: {
    xs: '0.25rem',   // 4px
    sm: '0.25rem',   
    md: '0.375rem',  // 6px
    lg: '0.375rem',
  } as ResponsiveValue<string>,
  
  medium: {
    xs: '0.375rem',  // 6px
    sm: '0.5rem',    // 8px
    md: '0.625rem',  // 10px
    lg: '0.75rem',   // 12px
  } as ResponsiveValue<string>,
  
  large: {
    xs: '0.5rem',    // 8px
    sm: '0.75rem',   // 12px
    md: '1rem',      // 16px
    lg: '1.25rem',   // 20px
  } as ResponsiveValue<string>,
  
  xlarge: {
    xs: '0.75rem',   // 12px
    sm: '1rem',      // 16px
    md: '1.5rem',    // 24px
    lg: '2rem',      // 32px
  } as ResponsiveValue<string>,
};

/**
 * Animation durations that respect user preferences
 */
export const responsiveMotion = {
  duration: {
    instant: '0ms',
    fast: {
      xs: '150ms',    // Slightly slower on mobile for better perception
      sm: '150ms',
      md: '100ms',
      lg: '100ms',
    } as ResponsiveValue<string>,
    
    normal: {
      xs: '250ms',
      sm: '250ms',
      md: '200ms',
      lg: '200ms',
    } as ResponsiveValue<string>,
    
    slow: {
      xs: '400ms',
      sm: '400ms',
      md: '300ms',
      lg: '300ms',
    } as ResponsiveValue<string>,
  },
};
