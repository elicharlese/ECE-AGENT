/**
 * Component variant utilities using class-variance-authority
 */

import { type VariantProps, cva } from 'class-variance-authority';

// Re-export cva and VariantProps for component use
export { cva, type VariantProps };

// Common variant patterns for consistent component APIs
export const baseVariants = {
  size: {
    xs: 'text-xs px-2 py-1',
    sm: 'text-sm px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-6 py-3',
    xl: 'text-lg px-8 py-4',
  },
  variant: {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  },
} as const;

// Utility for creating consistent focus styles
export const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

// Utility for disabled states
export const disabledStyles = 'disabled:pointer-events-none disabled:opacity-50';

// Utility for loading states
export const loadingStyles = 'relative disabled:pointer-events-none';

export type BaseSize = keyof typeof baseVariants.size;
export type BaseVariant = keyof typeof baseVariants.variant;
