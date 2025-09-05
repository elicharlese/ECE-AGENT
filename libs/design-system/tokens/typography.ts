/**
 * Design System Typography
 * Font scales, weights, and line heights for consistent text styling
 */

export const fontFamily = {
  sans: ['Quicksand', 'system-ui', 'sans-serif'],
  mono: ['Geist Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
} as const;

export const fontSize = {
  xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
  sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
  base: ['1rem', { lineHeight: '1.5rem' }],     // 16px
  lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
  xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
  '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px
  '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
  '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px
  '5xl': ['3rem', { lineHeight: '1' }],         // 48px
  '6xl': ['3.75rem', { lineHeight: '1' }],      // 60px
  '7xl': ['4.5rem', { lineHeight: '1' }],       // 72px
  '8xl': ['6rem', { lineHeight: '1' }],         // 96px
  '9xl': ['8rem', { lineHeight: '1' }],         // 128px
} as const;

export const fontWeight = {
  thin: '100',
  extralight: '200',
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
} as const;

export const lineHeight = {
  none: '1',
  tight: '1.25',
  snug: '1.375',
  normal: '1.5',
  relaxed: '1.625',
  loose: '2',
} as const;

export const letterSpacing = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0em',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
} as const;

// Semantic typography scales for consistent text hierarchy
export const textStyles = {
  // Display text (hero sections, large headings)
  display: {
    '2xl': {
      fontSize: fontSize['7xl'][0],
      lineHeight: fontSize['7xl'][1].lineHeight,
      fontWeight: fontWeight.bold,
      letterSpacing: letterSpacing.tight,
    },
    xl: {
      fontSize: fontSize['6xl'][0],
      lineHeight: fontSize['6xl'][1].lineHeight,
      fontWeight: fontWeight.bold,
      letterSpacing: letterSpacing.tight,
    },
    lg: {
      fontSize: fontSize['5xl'][0],
      lineHeight: fontSize['5xl'][1].lineHeight,
      fontWeight: fontWeight.bold,
      letterSpacing: letterSpacing.tight,
    },
    md: {
      fontSize: fontSize['4xl'][0],
      lineHeight: fontSize['4xl'][1].lineHeight,
      fontWeight: fontWeight.bold,
      letterSpacing: letterSpacing.tight,
    },
    sm: {
      fontSize: fontSize['3xl'][0],
      lineHeight: fontSize['3xl'][1].lineHeight,
      fontWeight: fontWeight.bold,
      letterSpacing: letterSpacing.tight,
    },
  },

  // Headings (section titles, card headers)
  heading: {
    '2xl': {
      fontSize: fontSize['3xl'][0],
      lineHeight: fontSize['3xl'][1].lineHeight,
      fontWeight: fontWeight.semibold,
      letterSpacing: letterSpacing.tight,
    },
    xl: {
      fontSize: fontSize['2xl'][0],
      lineHeight: fontSize['2xl'][1].lineHeight,
      fontWeight: fontWeight.semibold,
      letterSpacing: letterSpacing.tight,
    },
    lg: {
      fontSize: fontSize.xl[0],
      lineHeight: fontSize.xl[1].lineHeight,
      fontWeight: fontWeight.semibold,
      letterSpacing: letterSpacing.tight,
    },
    md: {
      fontSize: fontSize.lg[0],
      lineHeight: fontSize.lg[1].lineHeight,
      fontWeight: fontWeight.semibold,
      letterSpacing: letterSpacing.tight,
    },
    sm: {
      fontSize: fontSize.base[0],
      lineHeight: fontSize.base[1].lineHeight,
      fontWeight: fontWeight.semibold,
      letterSpacing: letterSpacing.tight,
    },
    xs: {
      fontSize: fontSize.sm[0],
      lineHeight: fontSize.sm[1].lineHeight,
      fontWeight: fontWeight.semibold,
      letterSpacing: letterSpacing.tight,
    },
  },

  // Body text (paragraphs, descriptions)
  body: {
    xl: {
      fontSize: fontSize.xl[0],
      lineHeight: fontSize.xl[1].lineHeight,
      fontWeight: fontWeight.normal,
    },
    lg: {
      fontSize: fontSize.lg[0],
      lineHeight: fontSize.lg[1].lineHeight,
      fontWeight: fontWeight.normal,
    },
    md: {
      fontSize: fontSize.base[0],
      lineHeight: fontSize.base[1].lineHeight,
      fontWeight: fontWeight.normal,
    },
    sm: {
      fontSize: fontSize.sm[0],
      lineHeight: fontSize.sm[1].lineHeight,
      fontWeight: fontWeight.normal,
    },
    xs: {
      fontSize: fontSize.xs[0],
      lineHeight: fontSize.xs[1].lineHeight,
      fontWeight: fontWeight.normal,
    },
  },

  // Labels (form labels, captions)
  label: {
    lg: {
      fontSize: fontSize.sm[0],
      lineHeight: fontSize.sm[1].lineHeight,
      fontWeight: fontWeight.medium,
      letterSpacing: letterSpacing.wide,
    },
    md: {
      fontSize: fontSize.xs[0],
      lineHeight: fontSize.xs[1].lineHeight,
      fontWeight: fontWeight.medium,
      letterSpacing: letterSpacing.wide,
    },
    sm: {
      fontSize: fontSize.xs[0],
      lineHeight: fontSize.xs[1].lineHeight,
      fontWeight: fontWeight.medium,
      letterSpacing: letterSpacing.wider,
    },
  },

  // Code text (monospace)
  code: {
    lg: {
      fontSize: fontSize.base[0],
      lineHeight: fontSize.base[1].lineHeight,
      fontFamily: fontFamily.mono,
      fontWeight: fontWeight.normal,
    },
    md: {
      fontSize: fontSize.sm[0],
      lineHeight: fontSize.sm[1].lineHeight,
      fontFamily: fontFamily.mono,
      fontWeight: fontWeight.normal,
    },
    sm: {
      fontSize: fontSize.xs[0],
      lineHeight: fontSize.xs[1].lineHeight,
      fontFamily: fontFamily.mono,
      fontWeight: fontWeight.normal,
    },
  },
} as const;

export type FontFamily = typeof fontFamily;
export type FontSize = typeof fontSize;
export type FontWeight = typeof fontWeight;
export type TextStyles = typeof textStyles;
