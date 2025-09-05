/**
 * Progress Primitive Component
 * Progress indicators with responsive design
 */

import React, { forwardRef } from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cva, type VariantProps } from '../../utils/variants';
import { cn } from '../../utils/cn';
import { useResponsive } from '../../hooks/useResponsive';

const progressVariants = cva(
  'relative h-4 w-full overflow-hidden rounded-full bg-secondary',
  {
    variants: {
      size: {
        sm: 'h-2',
        md: 'h-4',
        lg: 'h-6',
        responsive: '', // Set dynamically
      },
      variant: {
        default: 'bg-secondary',
        success: 'bg-green-200 dark:bg-green-900',
        warning: 'bg-yellow-200 dark:bg-yellow-900',
        danger: 'bg-red-200 dark:bg-red-900',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
);

const progressIndicatorVariants = cva(
  'h-full w-full flex-1 bg-primary transition-all',
  {
    variants: {
      variant: {
        default: 'bg-primary',
        success: 'bg-green-600',
        warning: 'bg-yellow-600',
        danger: 'bg-red-600',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>,
    VariantProps<typeof progressVariants> {
  responsive?: boolean;
}

const Progress = forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, size, variant, responsive = true, ...props }, ref) => {
  const { isMobile } = useResponsive();

  const responsiveSize = responsive && size === 'responsive'
    ? isMobile ? 'sm' : 'md'
    : size;

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(progressVariants({ size: responsiveSize, variant }), className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(progressIndicatorVariants({ variant }))}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
});

Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
