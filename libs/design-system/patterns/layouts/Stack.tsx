/**
 * Stack Layout Component
 * Vertical and horizontal stacking with responsive spacing
 */

import React, { forwardRef } from 'react';
import { cva, type VariantProps } from '../../utils/variants';
import { cn } from '../../utils/cn';
import { useResponsive } from '../../hooks/useResponsive';
import { responsiveSpacing } from '../../tokens/responsive';

const stackVariants = cva(
  'flex',
  {
    variants: {
      direction: {
        vertical: 'flex-col',
        horizontal: 'flex-row',
        responsive: '', // Set dynamically
      },
      spacing: {
        none: 'gap-0',
        xs: 'gap-1',
        sm: 'gap-2',
        md: 'gap-4',
        lg: 'gap-6',
        xl: 'gap-8',
        '2xl': 'gap-12',
        responsive: '', // Set dynamically
      },
      align: {
        start: 'items-start',
        center: 'items-center',
        end: 'items-end',
        stretch: 'items-stretch',
        baseline: 'items-baseline',
      },
      justify: {
        start: 'justify-start',
        center: 'justify-center',
        end: 'justify-end',
        between: 'justify-between',
        around: 'justify-around',
        evenly: 'justify-evenly',
      },
      wrap: {
        nowrap: 'flex-nowrap',
        wrap: 'flex-wrap',
        'wrap-reverse': 'flex-wrap-reverse',
      },
    },
    defaultVariants: {
      direction: 'vertical',
      spacing: 'md',
      align: 'stretch',
      justify: 'start',
      wrap: 'nowrap',
    },
  }
);

export interface StackProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof stackVariants> {
  responsive?: boolean;
  as?: React.ElementType;
}

const Stack = forwardRef<HTMLDivElement, StackProps>(
  ({ 
    className, 
    direction, 
    spacing, 
    align, 
    justify, 
    wrap, 
    responsive = true, 
    as: Component = 'div',
    children,
    ...props 
  }, ref) => {
    const { isMobile, getValue } = useResponsive();

    // Responsive direction
    const responsiveDirection = responsive && direction === 'responsive'
      ? isMobile ? 'vertical' : 'horizontal'
      : direction;

    // Responsive spacing
    const responsiveSpacingValue = responsive && spacing === 'responsive'
      ? getValue(responsiveSpacing.stack)
      : spacing;

    return (
      <Component
        ref={ref}
        className={cn(
          stackVariants({ 
            direction: responsiveDirection, 
            spacing: responsiveSpacingValue, 
            align, 
            justify, 
            wrap 
          }), 
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Stack.displayName = 'Stack';

// Convenience components
export interface VStackProps extends Omit<StackProps, 'direction'> {}

const VStack = forwardRef<HTMLDivElement, VStackProps>(
  ({ ...props }, ref) => (
    <Stack ref={ref} direction="vertical" {...props} />
  )
);

VStack.displayName = 'VStack';

export interface HStackProps extends Omit<StackProps, 'direction'> {}

const HStack = forwardRef<HTMLDivElement, HStackProps>(
  ({ ...props }, ref) => (
    <Stack ref={ref} direction="horizontal" {...props} />
  )
);

HStack.displayName = 'HStack';

export { Stack, VStack, HStack };
