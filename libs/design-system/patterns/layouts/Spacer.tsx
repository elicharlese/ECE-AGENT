/**
 * Spacer Layout Utility Component
 * Flexible spacing utility for layouts
 */

import React, { forwardRef } from 'react';
import { cva, type VariantProps } from '../../utils/variants';
import { cn } from '../../utils/cn';
import { useResponsive } from '../../hooks/useResponsive';

const spacerVariants = cva(
  '',
  {
    variants: {
      size: {
        xs: 'h-1 w-1',
        sm: 'h-2 w-2',
        md: 'h-4 w-4',
        lg: 'h-6 w-6',
        xl: 'h-8 w-8',
        '2xl': 'h-12 w-12',
        '3xl': 'h-16 w-16',
        responsive: '', // Set dynamically
      },
      axis: {
        both: '',
        x: 'h-0',
        y: 'w-0',
      },
      grow: {
        true: 'flex-grow',
        false: '',
      },
    },
    defaultVariants: {
      size: 'md',
      axis: 'both',
      grow: false,
    },
  }
);

export interface SpacerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spacerVariants> {
  responsive?: boolean;
}

const Spacer = forwardRef<HTMLDivElement, SpacerProps>(
  ({ className, size, axis, grow, responsive = true, ...props }, ref) => {
    const { isMobile } = useResponsive();

    const responsiveSize = responsive && size === 'responsive'
      ? isMobile ? 'sm' : 'md'
      : size;

    return (
      <div
        ref={ref}
        className={cn(spacerVariants({ size: responsiveSize, axis, grow }), className)}
        aria-hidden="true"
        {...props}
      />
    );
  }
);

Spacer.displayName = 'Spacer';

// Convenience components for specific axes
export interface XSpacerProps extends Omit<SpacerProps, 'axis'> {}

const XSpacer = forwardRef<HTMLDivElement, XSpacerProps>(
  ({ ...props }, ref) => (
    <Spacer ref={ref} axis="x" {...props} />
  )
);

XSpacer.displayName = 'XSpacer';

export interface YSpacerProps extends Omit<SpacerProps, 'axis'> {}

const YSpacer = forwardRef<HTMLDivElement, YSpacerProps>(
  ({ ...props }, ref) => (
    <Spacer ref={ref} axis="y" {...props} />
  )
);

YSpacer.displayName = 'YSpacer';

// Flexible spacer that grows to fill available space
export interface FlexSpacerProps extends Omit<SpacerProps, 'grow' | 'size'> {}

const FlexSpacer = forwardRef<HTMLDivElement, FlexSpacerProps>(
  ({ ...props }, ref) => (
    <Spacer ref={ref} grow size="xs" {...props} />
  )
);

FlexSpacer.displayName = 'FlexSpacer';

export { Spacer, XSpacer, YSpacer, FlexSpacer };
