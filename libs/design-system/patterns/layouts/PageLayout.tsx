/**
 * PageLayout Component
 * Flexible page layout with sections for hero, content, and sidebars
 */

import React from 'react';
import { cva, type VariantProps } from '../../utils/variants';
import { cn } from '../../utils/cn';
import { useResponsive } from '../../hooks/useResponsive';
import { responsiveSpacing, responsiveLayout } from '../../tokens/responsive';

// PageLayout variants
const pageLayoutVariants = cva(
  'relative min-h-screen bg-background',
  {
    variants: {
      container: {
        none: '',
        fixed: 'mx-auto max-w-7xl',
        fluid: 'mx-auto w-full max-w-full',
        responsive: '', // Set dynamically
      },
      padding: {
        none: '',
        sm: 'px-4 py-4',
        md: 'px-6 py-6',
        lg: 'px-8 py-8',
        xl: 'px-12 py-12',
        responsive: '', // Set dynamically
      },
    },
    defaultVariants: {
      container: 'fixed',
      padding: 'md',
    },
  }
);

// Page Header variants
const pageHeaderVariants = cva(
  'relative',
  {
    variants: {
      align: {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
      },
      spacing: {
        none: '',
        sm: 'mb-4',
        md: 'mb-6',
        lg: 'mb-8',
        xl: 'mb-12',
        responsive: '', // Set dynamically
      },
    },
    defaultVariants: {
      align: 'left',
      spacing: 'lg',
    },
  }
);

// Page Content variants
const pageContentVariants = cva(
  'relative',
  {
    variants: {
      layout: {
        single: '',
        'two-column': 'grid gap-6 lg:grid-cols-2',
        'three-column': 'grid gap-6 lg:grid-cols-3',
        'sidebar-left': 'grid gap-6 lg:grid-cols-[300px_1fr]',
        'sidebar-right': 'grid gap-6 lg:grid-cols-[1fr_300px]',
        'dual-sidebar': 'grid gap-6 lg:grid-cols-[250px_1fr_250px]',
      },
      spacing: {
        none: '',
        sm: 'space-y-4',
        md: 'space-y-6',
        lg: 'space-y-8',
        xl: 'space-y-12',
      },
    },
    defaultVariants: {
      layout: 'single',
      spacing: 'md',
    },
  }
);

// Section variants
const sectionVariants = cva(
  'relative',
  {
    variants: {
      spacing: {
        none: '',
        sm: 'py-8',
        md: 'py-12',
        lg: 'py-16',
        xl: 'py-24',
        responsive: '', // Set dynamically
      },
      background: {
        none: '',
        muted: 'bg-muted',
        accent: 'bg-accent',
        gradient: 'bg-gradient-to-b from-background to-muted',
      },
      container: {
        none: '',
        fixed: 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8',
        fluid: 'px-4 sm:px-6 lg:px-8',
      },
    },
    defaultVariants: {
      spacing: 'md',
      background: 'none',
      container: 'fixed',
    },
  }
);

// Main PageLayout Component
export interface PageLayoutProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof pageLayoutVariants> {
  responsive?: boolean;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  className,
  container = 'fixed',
  padding = 'md',
  responsive = true,
  children,
  ...props
}) => {
  const { getValue, breakpoint } = useResponsive();

  // Get responsive container width
  const responsiveContainer = responsive && container === 'responsive'
    ? (
        breakpoint === 'xs' ? 'mx-auto w-full' :
        breakpoint === 'sm' ? 'mx-auto max-w-2xl' :
        breakpoint === 'md' ? 'mx-auto max-w-4xl' :
        breakpoint === 'lg' ? 'mx-auto max-w-6xl' :
        'mx-auto max-w-7xl'
      )
    : undefined;

  // Get responsive padding
  const responsivePadding = responsive && padding === 'responsive'
    ? getValue(responsiveSpacing.container)
    : undefined;

  return (
    <div
      className={cn(
        pageLayoutVariants({
          container: responsive ? 'responsive' : container,
          padding: responsive ? 'responsive' : padding,
        }),
        responsiveContainer,
        responsivePadding && `px-[${responsivePadding}] py-[${responsivePadding}]`,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Page Header Component
export interface PageHeaderProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'title'>,
    VariantProps<typeof pageHeaderVariants> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
  actions?: React.ReactNode;
  responsive?: boolean;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  className,
  align = 'left',
  spacing = 'lg',
  title,
  subtitle,
  breadcrumbs,
  actions,
  responsive = true,
  children,
  ...props
}) => {
  const { getValue } = useResponsive();

  const responsiveSpacingValue = responsive && spacing === 'responsive'
    ? 'mb-4 sm:mb-6 lg:mb-8'
    : undefined;

  return (
    <header
      className={cn(
        pageHeaderVariants({
          align,
          spacing: responsive ? 'responsive' : spacing,
        }),
        responsiveSpacingValue,
        className
      )}
      {...props}
    >
      {breadcrumbs && (
        <nav className="mb-4" aria-label="Breadcrumb">
          {breadcrumbs}
        </nav>
      )}
      
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {title && (
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="mt-2 text-lg text-muted-foreground sm:text-xl">
              {subtitle}
            </p>
          )}
          {children}
        </div>
        
        {actions && (
          <div className="ml-4 flex shrink-0 items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
};

// Page Content Component
export interface PageContentProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof pageContentVariants> {
  responsive?: boolean;
}

export const PageContent: React.FC<PageContentProps> = ({
  className,
  layout = 'single',
  spacing = 'md',
  responsive = true,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        pageContentVariants({ layout, spacing }),
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Page Section Component
export interface PageSectionProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof sectionVariants> {
  responsive?: boolean;
  as?: 'section' | 'div' | 'article';
}

export const PageSection: React.FC<PageSectionProps> = ({
  className,
  spacing = 'md',
  background = 'none',
  container = 'fixed',
  responsive = true,
  as: Component = 'section',
  children,
  ...props
}) => {
  const { getValue } = useResponsive();

  const responsiveSpacingValue = responsive && spacing === 'responsive'
    ? getValue(responsiveSpacing.section)
    : undefined;

  return (
    <Component
      className={cn(
        sectionVariants({ spacing: responsive ? 'responsive' : spacing, background, container }),
        responsiveSpacingValue && `py-[${responsiveSpacingValue}]`,
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};

// Page Sidebar Component
export interface PageSidebarProps extends React.HTMLAttributes<HTMLElement> {
  position?: 'left' | 'right';
  sticky?: boolean;
  responsive?: boolean;
}

export const PageSidebar: React.FC<PageSidebarProps> = ({
  className,
  position = 'right',
  sticky = false,
  responsive = true,
  children,
  ...props
}) => {
  const { isMobile } = useResponsive();

  return (
    <aside
      className={cn(
        'space-y-4',
        sticky && !isMobile && 'sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto',
        position === 'left' && 'order-first',
        position === 'right' && 'order-last',
        responsive && isMobile && 'mt-8 border-t border-border pt-8',
        className
      )}
      {...props}
    >
      {children}
    </aside>
  );
};

// Page Grid Component
export interface PageGridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  responsive?: boolean;
}

export const PageGrid: React.FC<PageGridProps> = ({
  className,
  columns = 3,
  gap = 'md',
  responsive = true,
  children,
  ...props
}) => {
  const { breakpoint } = useResponsive();

  const gridColumns = responsive
    ? cn(
        'grid',
        breakpoint === 'xs' && 'grid-cols-1',
        breakpoint === 'sm' && columns >= 2 && 'grid-cols-2',
        breakpoint === 'md' && columns >= 3 && 'grid-cols-3',
        breakpoint === 'lg' && columns >= 4 && `grid-cols-${Math.min(columns, 4)}`,
        breakpoint === 'xl' && `grid-cols-${columns}`,
        breakpoint === '2xl' && `grid-cols-${columns}`
      )
    : `grid grid-cols-${columns}`;

  const gapSize = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
    xl: 'gap-12',
  }[gap];

  return (
    <div
      className={cn(gridColumns, gapSize, className)}
      {...props}
    >
      {children}
    </div>
  );
};

// Page Hero Component
export interface PageHeroProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  cta?: React.ReactNode;
  image?: React.ReactNode;
  variant?: 'default' | 'centered' | 'split';
  responsive?: boolean;
}

export const PageHero: React.FC<PageHeroProps> = ({
  className,
  title,
  subtitle,
  cta,
  image,
  variant = 'default',
  responsive = true,
  children,
  ...props
}) => {
  const { isMobile } = useResponsive();

  const variantClasses = {
    default: 'py-16 lg:py-24',
    centered: 'py-24 text-center lg:py-32',
    split: 'grid items-center gap-8 py-16 lg:grid-cols-2 lg:gap-16 lg:py-24',
  };

  return (
    <section
      className={cn(
        'relative',
        variantClasses[variant],
        className
      )}
      {...props}
    >
      <div className={variant === 'split' ? '' : 'mx-auto max-w-4xl'}>
        <div>
          {title && (
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="mt-4 text-lg text-muted-foreground sm:text-xl">
              {subtitle}
            </p>
          )}
          {cta && (
            <div className={cn(
              'mt-8 flex gap-4',
              variant === 'centered' ? 'justify-center' : 'flex-wrap'
            )}>
              {cta}
            </div>
          )}
          {children}
        </div>
        {image && variant === 'split' && (
          <div className={cn(
            'relative',
            responsive && isMobile && 'order-first'
          )}>
            {image}
          </div>
        )}
      </div>
      {image && variant !== 'split' && (
        <div className="mt-12">
          {image}
        </div>
      )}
    </section>
  );
};
