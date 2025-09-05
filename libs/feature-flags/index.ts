/**
 * Feature Flag System for UI Component Migration
 * Enables gradual rollout of new design system components
 */

export interface UIFeatureFlags {
  NEW_BUTTON: boolean;
  NEW_INPUT: boolean;
  NEW_CARD: boolean;
  NEW_DIALOG: boolean;
  NEW_LAYOUT: boolean;
  NEW_TABS: boolean;
  NEW_SELECT: boolean;
  NEW_TABLE: boolean;
}

/**
 * Get feature flags from environment variables
 */
export const getUIFeatureFlags = (): UIFeatureFlags => ({
  NEW_BUTTON: process.env.NEXT_PUBLIC_NEW_BUTTON === 'true',
  NEW_INPUT: process.env.NEXT_PUBLIC_NEW_INPUT === 'true',
  NEW_CARD: process.env.NEXT_PUBLIC_NEW_CARD === 'true',
  NEW_DIALOG: process.env.NEXT_PUBLIC_NEW_DIALOG === 'true',
  NEW_LAYOUT: process.env.NEXT_PUBLIC_NEW_LAYOUT === 'true',
  NEW_TABS: process.env.NEXT_PUBLIC_NEW_TABS === 'true',
  NEW_SELECT: process.env.NEXT_PUBLIC_NEW_SELECT === 'true',
  NEW_TABLE: process.env.NEXT_PUBLIC_NEW_TABLE === 'true',
});

/**
 * Hook for accessing feature flags in React components
 */
export const useUIFeatureFlags = () => {
  return getUIFeatureFlags();
};

/**
 * Utility for checking if a specific UI component should use the new version
 */
export const shouldUseNewComponent = (componentName: keyof UIFeatureFlags): boolean => {
  const flags = getUIFeatureFlags();
  return flags[componentName] ?? false;
};

/**
 * Advanced rollout with user-based percentage
 * For gradual rollout based on user ID hash
 */
export interface RolloutConfig {
  componentName: keyof UIFeatureFlags;
  percentage: number; // 0-100
  userId?: string;
  route?: string;
}

/**
 * Simple hash function for consistent user experience
 */
const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash) / 2147483647; // Normalize to 0-1
};

/**
 * Determine if user should see new component based on rollout percentage
 */
export const shouldUseNewComponentWithRollout = (config: RolloutConfig): boolean => {
  // First check feature flag
  if (!shouldUseNewComponent(config.componentName)) {
    return false;
  }
  
  // If no percentage-based rollout, use feature flag only
  if (config.percentage >= 100) {
    return true;
  }
  
  if (config.percentage <= 0) {
    return false;
  }
  
  // Use user ID for consistent experience, fallback to random
  const seed = config.userId || `${config.route || 'default'}-${Date.now()}`;
  const userHash = hashString(seed);
  
  return userHash < (config.percentage / 100);
};

/**
 * Route-specific rollout configuration
 */
export const ROUTE_ROLLOUT_CONFIG: Record<string, Partial<Record<keyof UIFeatureFlags, number>>> = {
  '/messages': {
    NEW_BUTTON: 25,  // 25% rollout on messages page
    NEW_INPUT: 10,   // 10% rollout for input components
  },
  '/profile': {
    NEW_BUTTON: 50,  // 50% rollout on profile page
    NEW_CARD: 25,    // 25% rollout for cards
  },
  '/admin': {
    NEW_BUTTON: 75,  // Higher rollout for admin (internal users)
    NEW_TABLE: 50,   // 50% rollout for admin tables
  },
};

/**
 * Get rollout percentage for a component on a specific route
 */
export const getRolloutPercentage = (
  componentName: keyof UIFeatureFlags,
  route?: string
): number => {
  if (!route) return 100; // Default to full rollout if no route specified
  
  const routeConfig = ROUTE_ROLLOUT_CONFIG[route];
  return routeConfig?.[componentName] ?? 100;
};
