'use client';

/**
 * React hooks for responsive design and platform detection
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Breakpoint, 
  breakpoints, 
  getCurrentBreakpoint, 
  isBreakpointUp,
  isBreakpointDown,
  matchesBreakpoint,
  ResponsiveValue,
  getResponsiveValue,
} from '../utils/responsive';
import { 
  Platform, 
  DeviceType,
  OS,
  getPlatform, 
  getDeviceType,
  getOS,
  hasTouch,
  prefersReducedMotion,
  prefersDarkMode,
} from '../utils/platform';

/**
 * Hook to get the current breakpoint and listen for changes
 */
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(() => getCurrentBreakpoint());

  useEffect(() => {
    const handleResize = () => {
      const newBreakpoint = getCurrentBreakpoint();
      setBreakpoint(newBreakpoint);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return breakpoint;
}

/**
 * Hook to check if viewport matches specific breakpoint conditions
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    
    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
    // Legacy browsers
    else {
      mediaQuery.addListener(handler);
      return () => mediaQuery.removeListener(handler);
    }
  }, [query]);

  return matches;
}

/**
 * Hook with responsive utilities
 */
export function useResponsive() {
  const breakpoint = useBreakpoint();

  const isXs = useMemo(() => matchesBreakpoint('xs'), [breakpoint]);
  const isSm = useMemo(() => isBreakpointUp('sm'), [breakpoint]);
  const isMd = useMemo(() => isBreakpointUp('md'), [breakpoint]);
  const isLg = useMemo(() => isBreakpointUp('lg'), [breakpoint]);
  const isXl = useMemo(() => isBreakpointUp('xl'), [breakpoint]);
  const is2xl = useMemo(() => isBreakpointUp('2xl'), [breakpoint]);

  const isMobile = useMemo(() => isBreakpointDown('md'), [breakpoint]);
  const isTablet = useMemo(() => matchesBreakpoint('md') || matchesBreakpoint('lg'), [breakpoint]);
  const isDesktop = useMemo(() => isBreakpointUp('lg'), [breakpoint]);

  const getValue = useCallback(<T>(value: ResponsiveValue<T>) => {
    return getResponsiveValue(value, breakpoint);
  }, [breakpoint]);

  return {
    breakpoint,
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    is2xl,
    isMobile,
    isTablet,
    isDesktop,
    getValue,
  };
}

/**
 * Hook to get platform information
 */
export function usePlatform() {
  const [platform, setPlatform] = useState<Platform>('unknown');
  const [deviceType, setDeviceType] = useState<DeviceType>('unknown');
  const [os, setOS] = useState<OS>('unknown');
  const [touchDevice, setTouchDevice] = useState(false);

  useEffect(() => {
    setPlatform(getPlatform());
    setDeviceType(getDeviceType());
    setOS(getOS());
    setTouchDevice(hasTouch());
  }, []);

  return {
    platform,
    deviceType,
    os,
    isTouch: touchDevice,
    isWeb: platform === 'web',
    isMobile: platform === 'mobile',
    isDesktop: platform === 'desktop',
    isIOS: os === 'ios',
    isAndroid: os === 'android',
  };
}

/**
 * Hook to get user preferences
 */
export function useUserPreferences() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Initial values
    setReducedMotion(prefersReducedMotion());
    setDarkMode(prefersDarkMode());

    // Listen for changes
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleMotionChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    const handleDarkChange = (e: MediaQueryListEvent) => setDarkMode(e.matches);

    if (motionQuery.addEventListener) {
      motionQuery.addEventListener('change', handleMotionChange);
      darkQuery.addEventListener('change', handleDarkChange);
      return () => {
        motionQuery.removeEventListener('change', handleMotionChange);
        darkQuery.removeEventListener('change', handleDarkChange);
      };
    } else {
      motionQuery.addListener(handleMotionChange);
      darkQuery.addListener(handleDarkChange);
      return () => {
        motionQuery.removeListener(handleMotionChange);
        darkQuery.removeListener(handleDarkChange);
      };
    }
  }, []);

  return {
    prefersReducedMotion: reducedMotion,
    prefersDarkMode: darkMode,
  };
}

/**
 * Hook to get window dimensions
 */
export function useWindowSize() {
  const [size, setSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}

/**
 * Hook to detect viewport orientation
 */
export function useOrientation() {
  const { width, height } = useWindowSize();
  return width > height ? 'landscape' : 'portrait';
}

/**
 * Hook for container queries (element-based responsive design)
 */
export function useContainerQuery<T extends HTMLElement>(
  ref: React.RefObject<T>,
  queries: Record<string, number>
) {
  const [activeQueries, setActiveQueries] = useState<string[]>([]);

  useEffect(() => {
    if (!ref.current || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        const active = Object.entries(queries)
          .filter(([_, minWidth]) => width >= minWidth)
          .map(([name]) => name);
        setActiveQueries(active);
      }
    });

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, queries]);

  return activeQueries;
}

/**
 * Hook to handle responsive images
 */
export function useResponsiveImage(
  sources: ResponsiveValue<string>,
  fallback: string
) {
  const { breakpoint } = useResponsive();
  const src = getResponsiveValue(sources, breakpoint) || fallback;
  
  return src;
}
