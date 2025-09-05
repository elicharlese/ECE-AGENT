/**
 * Grid Layout Component
 * CSS Grid layout with responsive controls
 */

import React, { forwardRef } from 'react';
import { cva, type VariantProps } from '../../utils/variants';
import { cn } from '../../utils/cn';
import { useResponsive } from '../../hooks/useResponsive';

const gridVariants = cva(
  'grid',
  {
    variants: {
      cols: {
        1: 'grid-cols-1',
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-4',
        5: 'grid-cols-5',
        6: 'grid-cols-6',
        12: 'grid-cols-12',
        none: 'grid-cols-none',
        responsive: '', // Set dynamically
      },
      rows: {
        1: 'grid-rows-1',
        2: 'grid-rows-2',
        3: 'grid-rows-3',
        4: 'grid-rows-4',
        5: 'grid-rows-5',
        6: 'grid-rows-6',
        none: 'grid-rows-none',
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
      gapX: {
        none: 'gap-x-0',
        xs: 'gap-x-1',
        sm: 'gap-x-2',
        md: 'gap-x-4',
        lg: 'gap-x-6',
        xl: 'gap-x-8',
        '2xl': 'gap-x-12',
      },
      gapY: {
        none: 'gap-y-0',
        xs: 'gap-y-1',
        sm: 'gap-y-2',
        md: 'gap-y-4',
        lg: 'gap-y-6',
        xl: 'gap-y-8',
        '2xl': 'gap-y-12',
      },
      flow: {
        row: 'grid-flow-row',
        col: 'grid-flow-col',
        dense: 'grid-flow-row-dense',
        'col-dense': 'grid-flow-col-dense',
      },
      autoRows: {
        auto: 'auto-rows-auto',
        min: 'auto-rows-min',
        max: 'auto-rows-max',
        fr: 'auto-rows-fr',
      },
      autoCols: {
        auto: 'auto-cols-auto',
        min: 'auto-cols-min',
        max: 'auto-cols-max',
        fr: 'auto-cols-fr',
      },
    },
    defaultVariants: {
      cols: 1,
      gap: 'none',
      flow: 'row',
    },
  }
);

export interface GridProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gridVariants> {
  responsive?: boolean;
  as?: React.ElementType;
}

const Grid = forwardRef<HTMLDivElement, GridProps>(
  ({ 
    className, 
    cols, 
    rows, 
    gap, 
    gapX, 
    gapY, 
    flow, 
    autoRows, 
    autoCols, 
    responsive = true, 
    as: Component = 'div',
    children,
    ...props 
  }, ref) => {
    const { isMobile, isTablet } = useResponsive();

    // Responsive columns
    const responsiveCols = responsive && cols === 'responsive'
      ? isMobile ? 1 : isTablet ? 2 : 3
      : cols;

    // Responsive gap
    const responsiveGap = responsive && gap === 'responsive'
      ? isMobile ? 'sm' : 'md'
      : gap;

    return (
      <Component
        ref={ref}
        className={cn(
          gridVariants({ 
            cols: responsiveCols, 
            rows, 
            gap: responsiveGap, 
            gapX, 
            gapY, 
            flow, 
            autoRows, 
            autoCols 
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

Grid.displayName = 'Grid';

// Grid item component
export interface GridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  colSpan?: number | 'full' | 'auto';
  rowSpan?: number | 'full' | 'auto';
  colStart?: number | 'auto';
  colEnd?: number | 'auto';
  rowStart?: number | 'auto';
  rowEnd?: number | 'auto';
  area?: string;
  as?: React.ElementType;
}

const GridItem = forwardRef<HTMLDivElement, GridItemProps>(
  ({ 
    className, 
    colSpan, 
    rowSpan, 
    colStart, 
    colEnd, 
    rowStart, 
    rowEnd, 
    area, 
    as: Component = 'div',
    style,
    children,
    ...props 
  }, ref) => {
    const gridStyles = {
      gridArea: area,
      ...style,
    };

    const gridClasses = cn(
      // Column span classes
      colSpan === 1 && 'col-span-1',
      colSpan === 2 && 'col-span-2',
      colSpan === 3 && 'col-span-3',
      colSpan === 4 && 'col-span-4',
      colSpan === 5 && 'col-span-5',
      colSpan === 6 && 'col-span-6',
      colSpan === 7 && 'col-span-7',
      colSpan === 8 && 'col-span-8',
      colSpan === 9 && 'col-span-9',
      colSpan === 10 && 'col-span-10',
      colSpan === 11 && 'col-span-11',
      colSpan === 12 && 'col-span-12',
      colSpan === 'full' && 'col-span-full',
      colSpan === 'auto' && 'col-auto',
      
      // Row span classes
      rowSpan === 1 && 'row-span-1',
      rowSpan === 2 && 'row-span-2',
      rowSpan === 3 && 'row-span-3',
      rowSpan === 4 && 'row-span-4',
      rowSpan === 5 && 'row-span-5',
      rowSpan === 6 && 'row-span-6',
      rowSpan === 'full' && 'row-span-full',
      rowSpan === 'auto' && 'row-auto',
      
      // Column start classes
      colStart === 1 && 'col-start-1',
      colStart === 2 && 'col-start-2',
      colStart === 3 && 'col-start-3',
      colStart === 4 && 'col-start-4',
      colStart === 5 && 'col-start-5',
      colStart === 6 && 'col-start-6',
      colStart === 7 && 'col-start-7',
      colStart === 8 && 'col-start-8',
      colStart === 9 && 'col-start-9',
      colStart === 10 && 'col-start-10',
      colStart === 11 && 'col-start-11',
      colStart === 12 && 'col-start-12',
      colStart === 13 && 'col-start-13',
      colStart === 'auto' && 'col-start-auto',
      
      // Column end classes
      colEnd === 1 && 'col-end-1',
      colEnd === 2 && 'col-end-2',
      colEnd === 3 && 'col-end-3',
      colEnd === 4 && 'col-end-4',
      colEnd === 5 && 'col-end-5',
      colEnd === 6 && 'col-end-6',
      colEnd === 7 && 'col-end-7',
      colEnd === 8 && 'col-end-8',
      colEnd === 9 && 'col-end-9',
      colEnd === 10 && 'col-end-10',
      colEnd === 11 && 'col-end-11',
      colEnd === 12 && 'col-end-12',
      colEnd === 13 && 'col-end-13',
      colEnd === 'auto' && 'col-end-auto',
      
      // Row start classes
      rowStart === 1 && 'row-start-1',
      rowStart === 2 && 'row-start-2',
      rowStart === 3 && 'row-start-3',
      rowStart === 4 && 'row-start-4',
      rowStart === 5 && 'row-start-5',
      rowStart === 6 && 'row-start-6',
      rowStart === 7 && 'row-start-7',
      rowStart === 'auto' && 'row-start-auto',
      
      // Row end classes
      rowEnd === 1 && 'row-end-1',
      rowEnd === 2 && 'row-end-2',
      rowEnd === 3 && 'row-end-3',
      rowEnd === 4 && 'row-end-4',
      rowEnd === 5 && 'row-end-5',
      rowEnd === 6 && 'row-end-6',
      rowEnd === 7 && 'row-end-7',
      rowEnd === 'auto' && 'row-end-auto',
      
      className
    );

    return (
      <Component
        ref={ref}
        className={gridClasses}
        style={gridStyles}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

GridItem.displayName = 'GridItem';

export { Grid, GridItem };
