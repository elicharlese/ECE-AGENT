/**
 * Flex Layout Component
 * Flexible box layout with responsive controls
 */

import React, { forwardRef } from 'react';
import { cva, type VariantProps } from '../../utils/variants';
import { cn } from '../../utils/cn';
import { useResponsive } from '../../hooks/useResponsive';

const flexVariants = cva(
  'flex',
  {
    variants: {
      direction: {
        row: 'flex-row',
        'row-reverse': 'flex-row-reverse',
        col: 'flex-col',
        'col-reverse': 'flex-col-reverse',
        responsive: '', // Set dynamically
      },
      wrap: {
        nowrap: 'flex-nowrap',
        wrap: 'flex-wrap',
        'wrap-reverse': 'flex-wrap-reverse',
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
      gap: {
        none: 'gap-0',
        xs: 'gap-1',
        sm: 'gap-2',
        md: 'gap-4',
        lg: 'gap-6',
        xl: 'gap-8',
        '2xl': 'gap-12',
        responsive: '', // Set dynamically
      },
    },
    defaultVariants: {
      direction: 'row',
      wrap: 'nowrap',
      align: 'stretch',
      justify: 'start',
      gap: 'none',
    },
  }
);

export interface FlexProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof flexVariants> {
  responsive?: boolean;
  as?: React.ElementType;
}

const Flex = forwardRef<HTMLDivElement, FlexProps>(
  ({ 
    className, 
    direction, 
    wrap, 
    align, 
    justify, 
    gap, 
    responsive = true, 
    as: Component = 'div',
    children,
    ...props 
  }, ref) => {
    const { isMobile } = useResponsive();

    // Responsive direction
    const responsiveDirection = responsive && direction === 'responsive'
      ? isMobile ? 'col' : 'row'
      : direction;

    // Responsive gap
    const responsiveGap = responsive && gap === 'responsive'
      ? isMobile ? 'sm' : 'md'
      : gap;

    return (
      <Component
        ref={ref}
        className={cn(
          flexVariants({ 
            direction: responsiveDirection, 
            wrap, 
            align, 
            justify, 
            gap: responsiveGap 
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

Flex.displayName = 'Flex';

// Flex item component
export interface FlexItemProps extends React.HTMLAttributes<HTMLDivElement> {
  flex?: string | number;
  grow?: boolean | number;
  shrink?: boolean | number;
  basis?: string;
  order?: number;
  alignSelf?: 'auto' | 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  as?: React.ElementType;
}

const FlexItem = forwardRef<HTMLDivElement, FlexItemProps>(
  ({ 
    className, 
    flex, 
    grow, 
    shrink, 
    basis, 
    order, 
    alignSelf, 
    as: Component = 'div',
    style,
    children,
    ...props 
  }, ref) => {
    const flexStyles = {
      flex: flex,
      flexGrow: typeof grow === 'boolean' ? (grow ? 1 : 0) : grow,
      flexShrink: typeof shrink === 'boolean' ? (shrink ? 1 : 0) : shrink,
      flexBasis: basis,
      order: order,
      alignSelf: alignSelf,
      ...style,
    };

    const flexClasses = cn(
      // Default flex item classes
      flex === 1 && 'flex-1',
      flex === 'auto' && 'flex-auto',
      flex === 'initial' && 'flex-initial',
      flex === 'none' && 'flex-none',
      
      // Grow classes
      grow === true && 'flex-grow',
      grow === false && 'flex-grow-0',
      
      // Shrink classes  
      shrink === true && 'flex-shrink',
      shrink === false && 'flex-shrink-0',
      
      // Order classes
      order !== undefined && `order-${order}`,
      
      // Align self classes
      alignSelf === 'auto' && 'self-auto',
      alignSelf === 'start' && 'self-start',
      alignSelf === 'center' && 'self-center',
      alignSelf === 'end' && 'self-end',
      alignSelf === 'stretch' && 'self-stretch',
      alignSelf === 'baseline' && 'self-baseline',
      
      className
    );

    return (
      <Component
        ref={ref}
        className={flexClasses}
        style={flexStyles}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

FlexItem.displayName = 'FlexItem';

export { Flex, FlexItem };
