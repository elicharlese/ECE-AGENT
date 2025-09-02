import { useState, useEffect } from 'react';

interface BreakpointConfig {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
}

const defaultBreakpoints: BreakpointConfig = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export type Breakpoint = keyof BreakpointConfig;

export function useResponsive(breakpoints: BreakpointConfig = defaultBreakpoints) {
  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>('sm');
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setWindowSize({ width, height });

      // Determine current breakpoint
      if (width >= breakpoints['2xl']) {
        setCurrentBreakpoint('2xl');
      } else if (width >= breakpoints.xl) {
        setCurrentBreakpoint('xl');
      } else if (width >= breakpoints.lg) {
        setCurrentBreakpoint('lg');
      } else if (width >= breakpoints.md) {
        setCurrentBreakpoint('md');
      } else {
        setCurrentBreakpoint('sm');
      }
    };

    handleResize(); // Set initial values
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoints]);

  const isMobile = currentBreakpoint === 'sm';
  const isTablet = currentBreakpoint === 'md';
  const isDesktop = ['lg', 'xl', '2xl'].includes(currentBreakpoint);

  return {
    currentBreakpoint,
    windowSize,
    isMobile,
    isTablet,
    isDesktop,
    isAtLeast: (breakpoint: Breakpoint) => windowSize.width >= breakpoints[breakpoint],
    isBelow: (breakpoint: Breakpoint) => windowSize.width < breakpoints[breakpoint],
  };
}
