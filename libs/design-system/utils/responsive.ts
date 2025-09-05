/**
 * Responsive design utilities for cross-platform consistency
 */

// Breakpoint definitions (mobile-first approach)
export const breakpoints = {
  xs: 0,     // Extra small devices (phones, < 640px)
  sm: 640,   // Small devices (large phones, >= 640px)
  md: 768,   // Medium devices (tablets, >= 768px)
  lg: 1024,  // Large devices (desktops, >= 1024px)
  xl: 1280,  // Extra large devices (large desktops, >= 1280px)
  '2xl': 1536, // 2X large devices (larger desktops, >= 1536px)
} as const;

export type Breakpoint = keyof typeof breakpoints;

// Container max widths at each breakpoint
export const containers = {
  xs: '100%',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Media query strings for use in CSS
export const mediaQueries = {
  xs: `@media (min-width: ${breakpoints.xs}px)`,
  sm: `@media (min-width: ${breakpoints.sm}px)`,
  md: `@media (min-width: ${breakpoints.md}px)`,
  lg: `@media (min-width: ${breakpoints.lg}px)`,
  xl: `@media (min-width: ${breakpoints.xl}px)`,
  '2xl': `@media (min-width: ${breakpoints['2xl']}px)`,
  // Range queries
  xsOnly: `@media (max-width: ${breakpoints.sm - 1}px)`,
  smOnly: `@media (min-width: ${breakpoints.sm}px) and (max-width: ${breakpoints.md - 1}px)`,
  mdOnly: `@media (min-width: ${breakpoints.md}px) and (max-width: ${breakpoints.lg - 1}px)`,
  lgOnly: `@media (min-width: ${breakpoints.lg}px) and (max-width: ${breakpoints.xl - 1}px)`,
  xlOnly: `@media (min-width: ${breakpoints.xl}px) and (max-width: ${breakpoints['2xl'] - 1}px)`,
  // Orientation queries
  portrait: '@media (orientation: portrait)',
  landscape: '@media (orientation: landscape)',
  // Feature queries
  hover: '@media (hover: hover)',
  touch: '@media (hover: none) and (pointer: coarse)',
  stylus: '@media (hover: none) and (pointer: fine)',
  pointerCoarse: '@media (pointer: coarse)',
  pointerFine: '@media (pointer: fine)',
  // Accessibility queries
  reducedMotion: '@media (prefers-reduced-motion: reduce)',
  highContrast: '@media (prefers-contrast: high)',
  darkMode: '@media (prefers-color-scheme: dark)',
  lightMode: '@media (prefers-color-scheme: light)',
} as const;

/**
 * Get the current breakpoint based on window width
 */
export function getCurrentBreakpoint(): Breakpoint {
  if (typeof window === 'undefined') return 'xs';
  
  const width = window.innerWidth;
  const entries = Object.entries(breakpoints).reverse() as [Breakpoint, number][];
  
  for (const [breakpoint, minWidth] of entries) {
    if (width >= minWidth) {
      return breakpoint;
    }
  }
  
  return 'xs';
}

/**
 * Check if the current viewport matches a breakpoint
 */
export function matchesBreakpoint(breakpoint: Breakpoint): boolean {
  if (typeof window === 'undefined') return false;
  
  const width = window.innerWidth;
  const minWidth = breakpoints[breakpoint];
  const breakpointKeys = Object.keys(breakpoints) as Breakpoint[];
  const nextIndex = breakpointKeys.indexOf(breakpoint) + 1;
  const maxWidth = nextIndex < breakpointKeys.length 
    ? breakpoints[breakpointKeys[nextIndex]] - 1 
    : Infinity;
  
  return width >= minWidth && width <= maxWidth;
}

/**
 * Check if viewport is at or above a breakpoint
 */
export function isBreakpointUp(breakpoint: Breakpoint): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= breakpoints[breakpoint];
}

/**
 * Check if viewport is below a breakpoint
 */
export function isBreakpointDown(breakpoint: Breakpoint): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < breakpoints[breakpoint];
}

/**
 * Responsive value type that changes based on breakpoint
 */
export type ResponsiveValue<T> = T | Partial<Record<Breakpoint, T>>;

/**
 * Get the appropriate value for the current breakpoint
 */
export function getResponsiveValue<T>(
  value: ResponsiveValue<T>,
  currentBreakpoint?: Breakpoint
): T | undefined {
  // If it's not an object, return the value directly
  if (typeof value !== 'object' || value === null) {
    return value as T;
  }
  
  const bp = currentBreakpoint || getCurrentBreakpoint();
  const breakpointKeys = Object.keys(breakpoints) as Breakpoint[];
  const currentIndex = breakpointKeys.indexOf(bp);
  
  // Try to find a value for the current breakpoint or smaller
  for (let i = currentIndex; i >= 0; i--) {
    const key = breakpointKeys[i];
    if (key in value) {
      return (value as any)[key];
    }
  }
  
  // If no matching breakpoint found, return the first defined value
  const values = Object.values(value);
  return values.length > 0 ? values[0] as T : undefined;
}

/**
 * Common responsive spacing scale
 */
export const responsiveSpacing = {
  xs: {
    gutter: 16,
    containerPadding: 16,
    sectionSpacing: 32,
  },
  sm: {
    gutter: 20,
    containerPadding: 20,
    sectionSpacing: 48,
  },
  md: {
    gutter: 24,
    containerPadding: 24,
    sectionSpacing: 64,
  },
  lg: {
    gutter: 32,
    containerPadding: 32,
    sectionSpacing: 80,
  },
  xl: {
    gutter: 40,
    containerPadding: 40,
    sectionSpacing: 96,
  },
  '2xl': {
    gutter: 48,
    containerPadding: 48,
    sectionSpacing: 112,
  },
} as const;

/**
 * Grid system configuration
 */
export const grid = {
  columns: 12,
  gap: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 40,
    '2xl': 48,
  },
} as const;

/**
 * Calculate column width for grid layouts
 */
export function getColumnWidth(
  columns: number,
  totalColumns: number = grid.columns,
  gap: number = 24
): string {
  const gapTotal = (totalColumns - 1) * gap;
  const percentage = (columns / totalColumns) * 100;
  return `calc(${percentage}% - ${(gapTotal * (totalColumns - columns)) / totalColumns}px)`;
}

/**
 * Common device viewport sizes for testing
 */
export const devices = {
  // Phones
  iPhoneSE: { width: 375, height: 667 },
  iPhone12: { width: 390, height: 844 },
  iPhone14Pro: { width: 393, height: 852 },
  pixel5: { width: 393, height: 851 },
  galaxyS20: { width: 360, height: 800 },
  // Tablets
  iPadMini: { width: 768, height: 1024 },
  iPadAir: { width: 820, height: 1180 },
  iPadPro11: { width: 834, height: 1194 },
  iPadPro12: { width: 1024, height: 1366 },
  // Laptops
  macbookAir: { width: 1280, height: 832 },
  macbookPro14: { width: 1512, height: 982 },
  macbookPro16: { width: 1728, height: 1117 },
  // Desktops
  desktop1080: { width: 1920, height: 1080 },
  desktop1440: { width: 2560, height: 1440 },
  desktop4K: { width: 3840, height: 2160 },
} as const;

export type DeviceName = keyof typeof devices;
