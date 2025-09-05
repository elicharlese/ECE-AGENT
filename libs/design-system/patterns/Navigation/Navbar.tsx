'use client';

/**
 * Navbar Navigation Component
 * Responsive navigation bar with mobile menu support
 */

import React, { forwardRef, useState } from 'react';
import { cva, type VariantProps } from '../../utils/variants';
import { cn } from '../../utils/cn';
import { useResponsive } from '../../hooks/useResponsive';
import { Button } from '../../primitives/Button';

const navbarVariants = cva(
  'flex items-center justify-between w-full',
  {
    variants: {
      variant: {
        default: 'bg-background border-b border-border',
        transparent: 'bg-transparent',
        filled: 'bg-primary text-primary-foreground',
        ghost: 'bg-background/80 backdrop-blur-sm',
      },
      size: {
        sm: 'h-12 px-4',
        md: 'h-16 px-6',
        lg: 'h-20 px-8',
        responsive: '', // Set dynamically
      },
      sticky: {
        true: 'sticky top-0 z-50',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      sticky: false,
    },
  }
);

const navbarBrandVariants = cva(
  'flex items-center space-x-2 font-semibold',
  {
    variants: {
      size: {
        sm: 'text-lg',
        md: 'text-xl',
        lg: 'text-2xl',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

const navbarMenuVariants = cva(
  'flex items-center space-x-1',
  {
    variants: {
      orientation: {
        horizontal: 'flex-row',
        vertical: 'flex-col space-x-0 space-y-1',
      },
      responsive: {
        true: 'hidden md:flex',
        false: 'flex',
      },
    },
    defaultVariants: {
      orientation: 'horizontal',
      responsive: true,
    },
  }
);

const mobileMenuVariants = cva(
  'absolute top-full left-0 right-0 bg-background border-b border-border shadow-lg',
  {
    variants: {
      open: {
        true: 'block',
        false: 'hidden',
      },
    },
    defaultVariants: {
      open: false,
    },
  }
);

export interface NavbarProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof navbarVariants> {
  responsive?: boolean;
  as?: React.ElementType;
}

const Navbar = forwardRef<HTMLElement, NavbarProps>(
  ({ 
    className, 
    variant, 
    size, 
    sticky, 
    responsive = true, 
    as: Component = 'nav',
    children,
    ...props 
  }, ref) => {
    const { isMobile } = useResponsive();

    const responsiveSize = responsive && size === 'responsive'
      ? isMobile ? 'sm' : 'md'
      : size;

    return (
      <Component
        ref={ref}
        className={cn(navbarVariants({ variant, size: responsiveSize, sticky }), className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Navbar.displayName = 'Navbar';

export interface NavbarBrandProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof navbarBrandVariants> {
  href?: string;
  as?: React.ElementType;
}

const NavbarBrand = forwardRef<HTMLDivElement, NavbarBrandProps>(
  ({ className, size, href, as, children, ...props }, ref) => {
    const Component = as || (href ? 'a' : 'div');
    
    return (
      <Component
        ref={ref}
        href={href}
        className={cn(navbarBrandVariants({ size }), className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

NavbarBrand.displayName = 'NavbarBrand';

export interface NavbarMenuProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof navbarMenuVariants> {}

const NavbarMenu = forwardRef<HTMLDivElement, NavbarMenuProps>(
  ({ className, orientation, responsive, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(navbarMenuVariants({ orientation, responsive }), className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

NavbarMenu.displayName = 'NavbarMenu';

export interface NavbarItemProps extends React.HTMLAttributes<HTMLElement> {
  href?: string;
  active?: boolean;
  as?: React.ElementType;
}

const NavbarItem = forwardRef<HTMLElement, NavbarItemProps>(
  ({ className, href, active, as, children, ...props }, ref) => {
    const Component = as || (href ? 'a' : 'div');
    
    return (
      <Component
        ref={ref}
        href={href}
        className={cn(
          'px-3 py-2 rounded-md text-sm font-medium transition-colors',
          'hover:bg-accent hover:text-accent-foreground',
          active && 'bg-accent text-accent-foreground',
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

NavbarItem.displayName = 'NavbarItem';

export interface NavbarToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  open?: boolean;
  onToggle?: () => void;
}

const NavbarToggle = forwardRef<HTMLButtonElement, NavbarToggleProps>(
  ({ className, open, onToggle, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant="ghost"
        size="sm"
        className={cn('md:hidden', className)}
        onClick={onToggle}
        aria-label="Toggle navigation menu"
        aria-expanded={open}
        {...props}
      >
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {open ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </Button>
    );
  }
);

NavbarToggle.displayName = 'NavbarToggle';

export interface MobileMenuProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof mobileMenuVariants> {}

const MobileMenu = forwardRef<HTMLDivElement, MobileMenuProps>(
  ({ className, open, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(mobileMenuVariants({ open }), className)}
        {...props}
      >
        <div className="px-4 py-2 space-y-1">
          {children}
        </div>
      </div>
    );
  }
);

MobileMenu.displayName = 'MobileMenu';

// Complete Navbar with mobile support
export interface ResponsiveNavbarProps extends NavbarProps {
  brand?: React.ReactNode;
  menu?: React.ReactNode;
  actions?: React.ReactNode;
}

const ResponsiveNavbar = forwardRef<HTMLElement, ResponsiveNavbarProps>(
  ({ brand, menu, actions, children, ...props }, ref) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
      <div className="relative">
        <Navbar ref={ref} {...props}>
          {brand && <NavbarBrand>{brand}</NavbarBrand>}
          
          {menu && <NavbarMenu>{menu}</NavbarMenu>}
          
          <div className="flex items-center space-x-2">
            {actions}
            {menu && (
              <NavbarToggle
                open={mobileMenuOpen}
                onToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
              />
            )}
          </div>
          
          {children}
        </Navbar>
        
        {menu && (
          <MobileMenu open={mobileMenuOpen}>
            {menu}
          </MobileMenu>
        )}
      </div>
    );
  }
);

ResponsiveNavbar.displayName = 'ResponsiveNavbar';

export { 
  Navbar, 
  NavbarBrand, 
  NavbarMenu, 
  NavbarItem, 
  NavbarToggle, 
  MobileMenu, 
  ResponsiveNavbar 
};
