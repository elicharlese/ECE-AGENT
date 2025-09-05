/**
 * Design System Motion
 * Animation durations, easing functions, and transition presets
 */

export const duration = {
  instant: '0ms',
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
  slower: '750ms',
  slowest: '1000ms',
} as const;

export const easing = {
  linear: 'linear',
  ease: 'ease',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
  
  // Custom easing curves for smooth animations
  smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
} as const;

// Semantic animation presets for common interactions
export const transitions = {
  // Button interactions
  button: {
    duration: duration.fast,
    easing: easing.smooth,
    property: 'all',
  },
  
  // Modal/dialog animations
  modal: {
    duration: duration.normal,
    easing: easing.smooth,
    property: 'opacity, transform',
  },
  
  // Dropdown/popover animations
  dropdown: {
    duration: duration.fast,
    easing: easing.smooth,
    property: 'opacity, transform',
  },
  
  // Page transitions
  page: {
    duration: duration.normal,
    easing: easing.smooth,
    property: 'opacity, transform',
  },
  
  // Hover effects
  hover: {
    duration: duration.fast,
    easing: easing.smooth,
    property: 'all',
  },
  
  // Focus effects
  focus: {
    duration: duration.instant,
    easing: easing.smooth,
    property: 'box-shadow, border-color',
  },
} as const;

// Animation keyframes for common effects
export const keyframes = {
  fadeIn: {
    from: { opacity: '0' },
    to: { opacity: '1' },
  },
  
  fadeOut: {
    from: { opacity: '1' },
    to: { opacity: '0' },
  },
  
  slideInUp: {
    from: { 
      opacity: '0',
      transform: 'translateY(16px)',
    },
    to: { 
      opacity: '1',
      transform: 'translateY(0)',
    },
  },
  
  slideInDown: {
    from: { 
      opacity: '0',
      transform: 'translateY(-16px)',
    },
    to: { 
      opacity: '1',
      transform: 'translateY(0)',
    },
  },
  
  slideInLeft: {
    from: { 
      opacity: '0',
      transform: 'translateX(-16px)',
    },
    to: { 
      opacity: '1',
      transform: 'translateX(0)',
    },
  },
  
  slideInRight: {
    from: { 
      opacity: '0',
      transform: 'translateX(16px)',
    },
    to: { 
      opacity: '1',
      transform: 'translateX(0)',
    },
  },
  
  scaleIn: {
    from: { 
      opacity: '0',
      transform: 'scale(0.95)',
    },
    to: { 
      opacity: '1',
      transform: 'scale(1)',
    },
  },
  
  scaleOut: {
    from: { 
      opacity: '1',
      transform: 'scale(1)',
    },
    to: { 
      opacity: '0',
      transform: 'scale(0.95)',
    },
  },
  
  spin: {
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' },
  },
  
  pulse: {
    '0%, 100%': { opacity: '1' },
    '50%': { opacity: '0.5' },
  },
} as const;

// Reduced motion preferences
export const reducedMotion = {
  duration: duration.instant,
  easing: easing.linear,
} as const;

export type Duration = typeof duration;
export type Easing = typeof easing;
export type Transitions = typeof transitions;
