/**
 * Container Layout Component
 * Responsive containers with max-width constraints
 */

import React, { forwardRef } from 'react';
import { cva, type VariantProps } from '../../utils/variants';
import { cn } from '../../utils/cn';
import { useResponsive } from '../../hooks/useResponsive';
import { responsiveSpacing } from '../../tokens/responsive';

const containerVariants = cva(
  'w-full mx-auto',
  {
    variants: {
      size: {
        xs: 'max-w-xs',
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-3xl',
        '4xl': 'max-w-4xl',
        '5xl': 'max-w-5xl',
        '6xl': 'max-w-6xl',
        '7xl': 'max-w-7xl',
        full: 'max-w-full',
        screen: 'max-w-screen-2xl',
        responsive: '', // Set dynamically
      },
      padding: {
        none: 'px-0',
        xs: 'px-2',
        sm: 'px-4',
        md: 'px-6',
        lg: 'px-8',
        xl: 'px-12',
        '2xl': 'px-16',
        responsive: '', // Set dynamically
      },
      center: {
        true: 'mx-auto',
        false: '',
      },
    },
    defaultVariants: {
      size: 'full',
      padding: 'md',
      center: true,
    },
  }
);

export interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {
  responsive?: boolean;
  as?: React.ElementType;
  fluid?: boolean;
}

const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ 
    className, 
    size, 
    padding, 
    center, 
    responsive = true, 
    fluid = false,
    as: Component = 'div',
    children,
    ...props 
  }, ref) => {
    const { isMobile, isTablet, getValue } = useResponsive();

    // Responsive size
    const responsiveSize = responsive && size === 'responsive'
      ? isMobile ? 'full' : isTablet ? '4xl' : '6xl'
      : size;

    // Responsive padding
    const responsivePadding = responsive && padding === 'responsive'
      ? getValue(responsiveSpacing.container)
      : padding;

    // Fluid containers ignore max-width
    const finalSize = fluid ? 'full' : responsiveSize;

    return (
      <Component
        ref={ref}
        className={cn(
          containerVariants({ 
            size: finalSize, 
            padding: responsivePadding, 
            center 
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

Container.displayName = 'Container';

// Specialized container variants
export interface SectionContainerProps extends Omit<ContainerProps, 'size'> {}

const SectionContainer = forwardRef<HTMLDivElement, SectionContainerProps>(
  ({ padding = 'responsive', ...props }, ref) => (
    <Container 
      ref={ref} 
      size="responsive" 
      padding={padding}
      as="section"
      {...props} 
    />
  )
);

SectionContainer.displayName = 'SectionContainer';

export interface ArticleContainerProps extends Omit<ContainerProps, 'size'> {}

const ArticleContainer = forwardRef<HTMLDivElement, ArticleContainerProps>(
  ({ padding = 'lg', ...props }, ref) => (
    <Container 
      ref={ref} 
      size="3xl" 
      padding={padding}
      as="article"
      {...props} 
    />
  )
);

ArticleContainer.displayName = 'ArticleContainer';

export interface FluidContainerProps extends Omit<ContainerProps, 'fluid' | 'size'> {}

const FluidContainer = forwardRef<HTMLDivElement, FluidContainerProps>(
  ({ ...props }, ref) => (
    <Container 
      ref={ref} 
      fluid
      {...props} 
    />
  )
);

FluidContainer.displayName = 'FluidContainer';

export { Container, SectionContainer, ArticleContainer, FluidContainer };
