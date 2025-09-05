/**
 * Design System Shadows
 * 5-level elevation system for depth hierarchy
 */

export const shadows = {
  none: 'none',
  
  // Subtle elevation (cards, inputs)
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  
  // Default elevation (buttons, dropdowns)
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  
  // Medium elevation (modals, popovers)
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  
  // High elevation (overlays, tooltips)
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  
  // Maximum elevation (drawers, sheets)
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  
  // Inner shadows for inset effects
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
} as const;

// Dark theme shadows (more pronounced)
export const darkShadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.4)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.4), 0 8px 10px -6px rgb(0 0 0 / 0.4)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.5)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.3)',
} as const;

// Semantic shadow mappings for components
export const componentShadows = {
  card: shadows.sm,
  button: shadows.sm,
  dropdown: shadows.lg,
  modal: shadows.xl,
  tooltip: shadows.lg,
  drawer: shadows['2xl'],
  input: shadows.inner,
} as const;

export type ShadowScale = typeof shadows;
export type ComponentShadows = typeof componentShadows;
