/**
 * Design System Colors
 * Semantic color system with HSL values for consistent theming
 */

export const colors = {
  // Primary brand colors (Purple to Blue gradient theme)
  primary: {
    50: 'hsl(222, 47%, 95%)',
    100: 'hsl(222, 47%, 90%)',
    200: 'hsl(222, 47%, 80%)',
    300: 'hsl(222, 47%, 70%)',
    400: 'hsl(222, 47%, 60%)',
    500: 'hsl(222, 47%, 50%)',
    600: 'hsl(222, 47%, 40%)',
    700: 'hsl(222, 47%, 30%)',
    800: 'hsl(222, 47%, 20%)',
    900: 'hsl(222, 47%, 11%)',
  },

  // Secondary colors (Neutral grays)
  secondary: {
    50: 'hsl(210, 40%, 98%)',
    100: 'hsl(210, 40%, 96%)',
    200: 'hsl(210, 40%, 90%)',
    300: 'hsl(210, 40%, 80%)',
    400: 'hsl(210, 40%, 60%)',
    500: 'hsl(210, 40%, 50%)',
    600: 'hsl(210, 40%, 40%)',
    700: 'hsl(210, 40%, 30%)',
    800: 'hsl(210, 40%, 20%)',
    900: 'hsl(210, 40%, 10%)',
  },

  // Success colors (Green)
  success: {
    50: 'hsl(142, 76%, 95%)',
    100: 'hsl(142, 76%, 90%)',
    200: 'hsl(142, 76%, 80%)',
    300: 'hsl(142, 76%, 70%)',
    400: 'hsl(142, 76%, 60%)',
    500: 'hsl(142, 76%, 50%)',
    600: 'hsl(142, 76%, 40%)',
    700: 'hsl(142, 76%, 30%)',
    800: 'hsl(142, 76%, 20%)',
    900: 'hsl(142, 76%, 10%)',
  },

  // Warning colors (Amber)
  warning: {
    50: 'hsl(48, 96%, 95%)',
    100: 'hsl(48, 96%, 90%)',
    200: 'hsl(48, 96%, 80%)',
    300: 'hsl(48, 96%, 70%)',
    400: 'hsl(48, 96%, 60%)',
    500: 'hsl(48, 96%, 50%)',
    600: 'hsl(48, 96%, 40%)',
    700: 'hsl(48, 96%, 30%)',
    800: 'hsl(48, 96%, 20%)',
    900: 'hsl(48, 96%, 10%)',
  },

  // Error/Destructive colors (Red)
  error: {
    50: 'hsl(0, 84%, 95%)',
    100: 'hsl(0, 84%, 90%)',
    200: 'hsl(0, 84%, 80%)',
    300: 'hsl(0, 84%, 70%)',
    400: 'hsl(0, 84%, 60%)',
    500: 'hsl(0, 84%, 50%)',
    600: 'hsl(0, 84%, 40%)',
    700: 'hsl(0, 84%, 30%)',
    800: 'hsl(0, 84%, 20%)',
    900: 'hsl(0, 84%, 10%)',
  },

  // AI/Agent colors (Purple - from existing brand)
  ai: {
    50: 'hsl(258, 90%, 95%)',
    100: 'hsl(258, 90%, 90%)',
    200: 'hsl(258, 90%, 80%)',
    300: 'hsl(258, 90%, 70%)',
    400: 'hsl(258, 90%, 60%)',
    500: 'hsl(258, 90%, 50%)', // #8b5cf6
    600: 'hsl(258, 90%, 40%)',
    700: 'hsl(258, 90%, 30%)',
    800: 'hsl(258, 90%, 20%)',
    900: 'hsl(258, 90%, 10%)',
  },

  // Human colors (Blue - from existing brand)
  human: {
    50: 'hsl(217, 91%, 95%)',
    100: 'hsl(217, 91%, 90%)',
    200: 'hsl(217, 91%, 80%)',
    300: 'hsl(217, 91%, 70%)',
    400: 'hsl(217, 91%, 60%)',
    500: 'hsl(217, 91%, 50%)', // #3b82f6
    600: 'hsl(217, 91%, 40%)',
    700: 'hsl(217, 91%, 30%)',
    800: 'hsl(217, 91%, 20%)',
    900: 'hsl(217, 91%, 10%)',
  },

  // Neutral colors for backgrounds and text
  neutral: {
    0: 'hsl(0, 0%, 100%)',     // Pure white
    50: 'hsl(0, 0%, 98%)',
    100: 'hsl(0, 0%, 96%)',
    200: 'hsl(0, 0%, 90%)',
    300: 'hsl(0, 0%, 80%)',
    400: 'hsl(0, 0%, 60%)',
    500: 'hsl(0, 0%, 50%)',
    600: 'hsl(0, 0%, 40%)',
    700: 'hsl(0, 0%, 30%)',
    800: 'hsl(0, 0%, 20%)',
    900: 'hsl(0, 0%, 10%)',
    950: 'hsl(0, 0%, 4%)',
    1000: 'hsl(0, 0%, 0%)',    // Pure black
  },
} as const;

// Semantic color mappings for light theme
export const lightTheme = {
  background: colors.neutral[0],
  foreground: colors.neutral[900],
  
  card: colors.neutral[0],
  cardForeground: colors.neutral[900],
  
  popover: colors.neutral[0],
  popoverForeground: colors.neutral[900],
  
  primary: colors.primary[900],
  primaryForeground: colors.neutral[50],
  
  secondary: colors.secondary[100],
  secondaryForeground: colors.secondary[900],
  
  muted: colors.secondary[100],
  mutedForeground: colors.secondary[600],
  
  accent: colors.secondary[100],
  accentForeground: colors.secondary[900],
  
  destructive: colors.error[500],
  destructiveForeground: colors.neutral[50],
  
  border: colors.secondary[200],
  input: colors.secondary[200],
  ring: colors.primary[500],
  
  success: colors.success[500],
  successForeground: colors.neutral[50],
  
  warning: colors.warning[500],
  warningForeground: colors.neutral[900],
} as const;

// Semantic color mappings for dark theme
export const darkTheme = {
  background: colors.neutral[950],
  foreground: colors.neutral[50],
  
  card: colors.neutral[950],
  cardForeground: colors.neutral[50],
  
  popover: colors.neutral[950],
  popoverForeground: colors.neutral[50],
  
  primary: colors.primary[50],
  primaryForeground: colors.primary[900],
  
  secondary: colors.secondary[800],
  secondaryForeground: colors.secondary[50],
  
  muted: colors.secondary[800],
  mutedForeground: colors.secondary[400],
  
  accent: colors.secondary[800],
  accentForeground: colors.secondary[50],
  
  destructive: colors.error[400],
  destructiveForeground: colors.neutral[50],
  
  border: colors.secondary[800],
  input: colors.secondary[800],
  ring: colors.primary[300],
  
  success: colors.success[400],
  successForeground: colors.neutral[900],
  
  warning: colors.warning[400],
  warningForeground: colors.neutral[900],
} as const;

export type ColorScale = typeof colors.primary;
export type SemanticColors = typeof lightTheme;
