/**
 * Skeleton Primitive Component
 * Loading placeholders with responsive design
 */

import React, { forwardRef } from 'react';
import { cva, type VariantProps } from '../../utils/variants';
import { cn } from '../../utils/cn';
import { useResponsive, useUserPreferences } from '../../hooks/useResponsive';

const skeletonVariants = cva(
  'animate-pulse rounded-md bg-muted',
  {
    variants: {
      variant: {
        default: 'bg-muted',
        shimmer: 'bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-[shimmer_2s_infinite]',
        pulse: 'animate-pulse bg-muted',
      },
      size: {
        sm: 'h-4',
        md: 'h-6',
        lg: 'h-8',
        xl: 'h-10',
        responsive: '', // Set dynamically
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  responsive?: boolean;
}

const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant, size, responsive = true, ...props }, ref) => {
    const { isMobile } = useResponsive();
    const { prefersReducedMotion } = useUserPreferences();

    const responsiveSize = responsive && size === 'responsive'
      ? isMobile ? 'sm' : 'md'
      : size;

    // Use static variant if user prefers reduced motion
    const effectiveVariant = prefersReducedMotion ? 'default' : variant;

    return (
      <div
        ref={ref}
        className={cn(
          skeletonVariants({ variant: effectiveVariant, size: responsiveSize }),
          prefersReducedMotion && 'animate-none',
          className
        )}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

export { Skeleton, skeletonVariants };
