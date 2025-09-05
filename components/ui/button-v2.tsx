/**
 * Button Component Migration Wrapper
 * Gradually rolls out new Button component with feature flags
 */

import { shouldUseNewComponentWithRollout } from '@/libs/feature-flags';
import { Button as NewButton } from '@/libs/design-system/primitives/Button';
import { Button as LegacyButton } from './button-legacy';
import type { ComponentProps } from 'react';

// Create backup of current button before migration
// This will be created by migration script

interface ButtonMigrationProps extends ComponentProps<typeof NewButton> {
  // Add any migration-specific props if needed
}

/**
 * Migration wrapper that conditionally renders new or legacy Button
 * Based on feature flags and rollout configuration
 */
export const Button = (props: ButtonMigrationProps) => {
  // Get current route for rollout configuration
  const currentRoute = typeof window !== 'undefined' ? window.location.pathname : '';
  
  // Check if user should see new component
  const useNewButton = shouldUseNewComponentWithRollout({
    componentName: 'NEW_BUTTON',
    percentage: 25, // Start with 25% rollout
    route: currentRoute,
    // userId could be passed from auth context
  });

  // Development warning for migration tracking
  if (process.env.NODE_ENV === 'development' && !useNewButton) {
    console.warn(
      'Using legacy Button component. ' +
      'Set NEXT_PUBLIC_NEW_BUTTON=true to enable new Button component.'
    );
  }

  // Render appropriate component
  if (useNewButton) {
    return <NewButton {...props} />;
  }

  // Fallback to legacy button (will be imported from backup)
  return <LegacyButton {...props} />;
};

// Re-export types for compatibility
export type { ButtonMigrationProps as ButtonProps };
