/**
 * Card Primitive Component
 * A flexible container component with responsive design
 */

import React, { forwardRef } from 'react';
import { cva, type VariantProps } from '../../utils/variants';
import { cn } from '../../utils/cn';
import { useResponsive, usePlatform } from '../../hooks/useResponsive';
import { responsiveSpacing, responsiveBorderRadius } from '../../tokens/responsive';

const cardVariants = cva(
  // Base styles
  'relative overflow-hidden transition-all duration-200',
  {
    variants: {
      variant: {
        default: [
          'bg-card',
          'border border-border',
          'text-card-foreground',
        ],
        elevated: [
          'bg-card',
          'shadow-md hover:shadow-lg',
          'text-card-foreground',
        ],
        ghost: [
          'bg-transparent',
          'border border-transparent',
          'hover:bg-accent/10',
          'text-card-foreground',
        ],
        gradient: [
          'bg-gradient-to-br from-primary/10 to-secondary/10',
          'border border-border/50',
          'text-card-foreground',
        ],
      },
      padding: {
        none: 'p-0',
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
        xl: 'p-8',
        responsive: '', // Will be set dynamically
      },
      radius: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        responsive: '', // Will be set dynamically
      },
      interactive: {
        true: [
          'cursor-pointer',
          'hover:scale-[1.02]',
          'active:scale-[0.98]',
          'focus-visible:outline-none',
          'focus-visible:ring-2',
          'focus-visible:ring-primary/20',
        ],
        false: '',
      },
      fullHeight: {
        true: 'h-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
      radius: 'lg',
      interactive: false,
      fullHeight: false,
    },
  }
);

// Card Header variant styles
const cardHeaderVariants = cva(
  'flex items-center justify-between',
  {
    variants: {
      padding: {
        none: '',
        sm: 'p-3 pb-0',
        md: 'p-4 pb-0',
        lg: 'p-6 pb-0',
        xl: 'p-8 pb-0',
        responsive: '', // Will be set dynamically
      },
      separated: {
        true: 'border-b border-border pb-3 mb-3',
        false: '',
      },
    },
    defaultVariants: {
      padding: 'none',
      separated: false,
    },
  }
);

// Card Content variant styles
const cardContentVariants = cva(
  '',
  {
    variants: {
      padding: {
        none: '',
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
        xl: 'p-8',
        responsive: '', // Will be set dynamically
      },
    },
    defaultVariants: {
      padding: 'none',
    },
  }
);

// Card Footer variant styles
const cardFooterVariants = cva(
  'flex items-center',
  {
    variants: {
      padding: {
        none: '',
        sm: 'p-3 pt-0',
        md: 'p-4 pt-0',
        lg: 'p-6 pt-0',
        xl: 'p-8 pt-0',
        responsive: '', // Will be set dynamically
      },
      separated: {
        true: 'border-t border-border pt-3 mt-3',
        false: '',
      },
      justify: {
        start: 'justify-start',
        center: 'justify-center',
        end: 'justify-end',
        between: 'justify-between',
      },
    },
    defaultVariants: {
      padding: 'none',
      separated: false,
      justify: 'start',
    },
  }
);

// Main Card Component
export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  responsive?: boolean;
  as?: React.ElementType;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'default',
      padding = 'md',
      radius = 'lg',
      interactive = false,
      fullHeight = false,
      responsive = true,
      as: Component = 'div',
      children,
      ...props
    },
    ref
  ) => {
    const { getValue, isMobile } = useResponsive();
    const { platform, isTouch } = usePlatform();

    // Get responsive padding
    const responsivePadding = responsive && padding === 'responsive'
      ? getValue(responsiveSpacing.component)
      : undefined;

    // Get responsive border radius
    const responsiveRadius = responsive && radius === 'responsive'
      ? getValue(responsiveBorderRadius.large)
      : undefined;

    // Platform-specific optimizations
    const platformClasses = cn(
      // Mobile optimizations
      platform === 'mobile' && 'touch-manipulation',
      // Touch device optimizations
      isTouch && interactive && 'tap-highlight-transparent',
      // Reduced motion handled by Tailwind's motion-safe/reduce
    );

    return (
      <Component
        ref={ref}
        className={cn(
          cardVariants({
            variant,
            padding: responsive ? 'responsive' : padding,
            radius: responsive ? 'responsive' : radius,
            interactive,
            fullHeight,
          }),
          responsivePadding && `p-[${responsivePadding}]`,
          responsiveRadius && `rounded-[${responsiveRadius}]`,
          platformClasses,
          className
        )}
        {...(interactive && {
          role: 'button',
          tabIndex: 0,
        })}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Card.displayName = 'Card';

// Card Header Component
export interface CardHeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardHeaderVariants> {
  responsive?: boolean;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  (
    {
      className,
      padding = 'none',
      separated = false,
      responsive = true,
      title,
      description,
      action,
      children,
      ...props
    },
    ref
  ) => {
    const { getValue } = useResponsive();

    // Get responsive padding
    const responsivePadding = responsive && padding === 'responsive'
      ? getValue(responsiveSpacing.component)
      : undefined;

    return (
      <div
        ref={ref}
        className={cn(
          cardHeaderVariants({ padding: responsive ? 'responsive' : padding, separated }),
          responsivePadding && `p-[${responsivePadding}] pb-0`,
          className
        )}
        {...props}
      >
        <div className="flex-1">
          {title && (
            <h3 className="text-lg font-semibold leading-none tracking-tight">
              {title}
            </h3>
          )}
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">
              {description}
            </p>
          )}
          {children}
        </div>
        {action && <div className="ml-auto">{action}</div>}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

// Card Content Component
export interface CardContentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardContentVariants> {
  responsive?: boolean;
}

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  (
    {
      className,
      padding = 'none',
      responsive = true,
      ...props
    },
    ref
  ) => {
    const { getValue } = useResponsive();

    // Get responsive padding
    const responsivePadding = responsive && padding === 'responsive'
      ? getValue(responsiveSpacing.component)
      : undefined;

    return (
      <div
        ref={ref}
        className={cn(
          cardContentVariants({ padding: responsive ? 'responsive' : padding }),
          responsivePadding && `p-[${responsivePadding}]`,
          className
        )}
        {...props}
      />
    );
  }
);

CardContent.displayName = 'CardContent';

// Card Footer Component
export interface CardFooterProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardFooterVariants> {
  responsive?: boolean;
}

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  (
    {
      className,
      padding = 'none',
      separated = false,
      justify = 'start',
      responsive = true,
      ...props
    },
    ref
  ) => {
    const { getValue } = useResponsive();

    // Get responsive padding
    const responsivePadding = responsive && padding === 'responsive'
      ? getValue(responsiveSpacing.component)
      : undefined;

    return (
      <div
        ref={ref}
        className={cn(
          cardFooterVariants({
            padding: responsive ? 'responsive' : padding,
            separated,
            justify,
          }),
          responsivePadding && `p-[${responsivePadding}] pt-0`,
          className
        )}
        {...props}
      />
    );
  }
);

CardFooter.displayName = 'CardFooter';

// Card Title Component
export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

const CardTitle = forwardRef<HTMLParagraphElement, CardTitleProps>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        'text-lg font-semibold leading-none tracking-tight',
        className
      )}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

// Card Description Component
export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
);
CardDescription.displayName = 'CardDescription';

export { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription, cardVariants };
