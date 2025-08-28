/**
 * UI Constants for consistent styling across the application
 * These values ensure padding, spacing, and colors are uniform
 */

export const UI_CONSTANTS = {
  // Padding values
  padding: {
    card: 'p-6',
    cardCompact: 'p-4',
    listItem: 'p-4',
    button: 'px-4 py-2',
    input: 'px-3 py-2',
    badge: 'px-2 py-1',
  },
  
  // Spacing values (gap)
  spacing: {
    xs: 'gap-1',
    sm: 'gap-2', 
    md: 'gap-3',
    lg: 'gap-4',
    xl: 'gap-6',
  },
  
  // Border radius
  radius: {
    sm: 'rounded',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    full: 'rounded-full',
  },
  
  // Color schemes for different states
  colors: {
    primary: {
      bg: 'bg-indigo-500',
      hover: 'hover:bg-indigo-600',
      text: 'text-indigo-600 dark:text-indigo-400',
      border: 'border-indigo-500',
    },
    secondary: {
      bg: 'bg-gray-500',
      hover: 'hover:bg-gray-600', 
      text: 'text-gray-600 dark:text-gray-400',
      border: 'border-gray-500',
    },
    success: {
      bg: 'bg-green-500',
      hover: 'hover:bg-green-600',
      text: 'text-green-600 dark:text-green-400',
      border: 'border-green-500',
    },
    warning: {
      bg: 'bg-orange-500',
      hover: 'hover:bg-orange-600',
      text: 'text-orange-600 dark:text-orange-400',
      border: 'border-orange-500',
    },
    danger: {
      bg: 'bg-red-500',
      hover: 'hover:bg-red-600',
      text: 'text-red-600 dark:text-red-400',
      border: 'border-red-500',
    },
    info: {
      bg: 'bg-blue-500',
      hover: 'hover:bg-blue-600',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-500',
    },
  },
  
  // Consistent grid layouts
  grid: {
    cols2: 'grid-cols-1 md:grid-cols-2',
    cols3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    cols4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    cols6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
  },
  
  // Transition animations
  transitions: {
    default: 'transition-all duration-200',
    fast: 'transition-all duration-100',
    slow: 'transition-all duration-300',
  },
  
  // Text sizes
  text: {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
  },
  
  // Shadow styles
  shadow: {
    sm: 'shadow-sm',
    default: 'shadow',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  },
} as const

export type UIConstants = typeof UI_CONSTANTS
