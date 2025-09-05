'use client';

/**
 * AppShell Layout Component
 * Main application shell with responsive layout for header, sidebar, and content
 */

import React, { useState, useCallback, useEffect } from 'react';
import { cva, type VariantProps } from '../../utils/variants';
import { cn } from '../../utils/cn';
import { useResponsive, usePlatform, useWindowSize } from '../../hooks/useResponsive';
import { responsiveLayout } from '../../tokens/responsive';

// AppShell variants
const appShellVariants = cva(
  'relative flex h-screen w-full overflow-hidden bg-background',
  {
    variants: {
      direction: {
        horizontal: 'flex-row',
        vertical: 'flex-col',
      },
    },
    defaultVariants: {
      direction: 'horizontal',
    },
  }
);

// Header variants
const headerVariants = cva(
  'relative z-30 flex items-center border-b border-border bg-background',
  {
    variants: {
      height: {
        sm: 'h-12',
        md: 'h-14',
        lg: 'h-16',
        xl: 'h-20',
        responsive: '', // Set dynamically
      },
      sticky: {
        true: 'sticky top-0',
        false: '',
      },
    },
    defaultVariants: {
      height: 'md',
      sticky: true,
    },
  }
);

// Sidebar variants
const sidebarVariants = cva(
  'relative z-20 flex flex-col border-r border-border bg-background transition-all duration-300',
  {
    variants: {
      width: {
        sm: 'w-48',
        md: 'w-56',
        lg: 'w-64',
        xl: 'w-72',
        collapsed: 'w-16',
        responsive: '', // Set dynamically
      },
      position: {
        left: 'order-first',
        right: 'order-last border-r-0 border-l',
      },
      collapsible: {
        true: '',
        false: '',
      },
      overlay: {
        true: 'absolute inset-y-0 shadow-lg',
        false: '',
      },
    },
    defaultVariants: {
      width: 'md',
      position: 'left',
      collapsible: true,
      overlay: false,
    },
  }
);

// Main content variants
const mainContentVariants = cva(
  'relative flex flex-1 flex-col overflow-hidden',
  {
    variants: {
      padding: {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        responsive: '', // Set dynamically
      },
    },
    defaultVariants: {
      padding: 'md',
    },
  }
);

// Footer variants
const footerVariants = cva(
  'relative z-10 flex items-center border-t border-border bg-background',
  {
    variants: {
      height: {
        sm: 'h-8',
        md: 'h-10',
        lg: 'h-12',
        xl: 'h-14',
        responsive: '', // Set dynamically
      },
    },
    defaultVariants: {
      height: 'sm',
    },
  }
);

// AppShell Context
interface AppShellContextValue {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  isMobile: boolean;
  sidebarOverlay: boolean;
}

const AppShellContext = React.createContext<AppShellContextValue | undefined>(undefined);

export const useAppShell = () => {
  const context = React.useContext(AppShellContext);
  if (!context) {
    throw new Error('useAppShell must be used within AppShell');
  }
  return context;
};

// Main AppShell Component
export interface AppShellProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof appShellVariants> {
  defaultSidebarCollapsed?: boolean;
  sidebarBreakpoint?: 'sm' | 'md' | 'lg' | 'xl';
  responsive?: boolean;
  children?: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  className,
  direction = 'horizontal',
  defaultSidebarCollapsed = false,
  sidebarBreakpoint = 'lg',
  responsive = true,
  children,
  ...props
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(defaultSidebarCollapsed);
  const [sidebarOverlay, setSidebarOverlay] = useState(false);
  const { breakpoint, isMobile } = useResponsive();
  const { width } = useWindowSize();

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    const shouldOverlay = breakpoint === 'xs' || breakpoint === 'sm';
    setSidebarOverlay(shouldOverlay);
    if (shouldOverlay && !defaultSidebarCollapsed) {
      setSidebarCollapsed(true);
    }
  }, [breakpoint, defaultSidebarCollapsed]);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  const contextValue: AppShellContextValue = {
    sidebarCollapsed,
    setSidebarCollapsed,
    toggleSidebar,
    isMobile,
    sidebarOverlay,
  };

  return (
    <AppShellContext.Provider value={contextValue}>
      <div
        className={cn(appShellVariants({ direction }), className)}
        {...props}
      >
        {children}
      </div>
    </AppShellContext.Provider>
  );
};

// AppShell Header
export interface AppShellHeaderProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof headerVariants> {
  responsive?: boolean;
}

export const AppShellHeader: React.FC<AppShellHeaderProps> = ({
  className,
  height = 'md',
  sticky = true,
  responsive = true,
  children,
  ...props
}) => {
  const { getValue } = useResponsive();

  const responsiveHeight = responsive && height === 'responsive'
    ? getValue(responsiveLayout.header.mobile, responsiveLayout.header.desktop)
    : undefined;

  return (
    <header
      className={cn(
        headerVariants({ height: responsive ? 'responsive' : height, sticky }),
        responsiveHeight,
        className
      )}
      {...props}
    >
      {children}
    </header>
  );
};

// AppShell Sidebar
export interface AppShellSidebarProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof sidebarVariants> {
  responsive?: boolean;
}

export const AppShellSidebar: React.FC<AppShellSidebarProps> = ({
  className,
  width = 'md',
  position = 'left',
  collapsible = true,
  responsive = true,
  children,
  ...props
}) => {
  const { sidebarCollapsed, sidebarOverlay } = useAppShell();
  const { getValue } = useResponsive();

  const responsiveWidth = responsive && width === 'responsive'
    ? getValue(responsiveLayout.sidebar.mobile, responsiveLayout.sidebar.desktop)
    : undefined;

  const currentWidth = collapsible && sidebarCollapsed ? 'collapsed' : width;

  return (
    <>
      {/* Overlay backdrop for mobile */}
      {sidebarOverlay && !sidebarCollapsed && (
        <div
          className="fixed inset-0 z-10 bg-black/50 lg:hidden"
          onClick={() => {
            // Access context through the useAppShell hook outside the callback
            // This is handled by the parent component
          }}
        />
      )}
      
      <aside
        className={cn(
          sidebarVariants({
            width: responsive ? 'responsive' : currentWidth,
            position,
            collapsible,
            overlay: sidebarOverlay,
          }),
          responsiveWidth,
          sidebarOverlay && sidebarCollapsed && '-translate-x-full',
          sidebarOverlay && position === 'left' && 'left-0',
          sidebarOverlay && position === 'right' && 'right-0',
          className
        )}
        {...props}
      >
        {children}
      </aside>
    </>
  );
};

// AppShell Main Content
export interface AppShellMainProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof mainContentVariants> {
  responsive?: boolean;
}

export const AppShellMain: React.FC<AppShellMainProps> = ({
  className,
  padding = 'md',
  responsive = true,
  children,
  ...props
}) => {
  const { getValue } = useResponsive();

  const responsivePadding = responsive && padding === 'responsive'
    ? getValue('p-4', 'p-8')
    : undefined;

  return (
    <main
      className={cn(
        mainContentVariants({ padding: responsive ? 'responsive' : padding }),
        responsivePadding,
        'flex-1 overflow-auto',
        className
      )}
      {...props}
    >
      {children}
    </main>
  );
};

// AppShell Footer
export interface AppShellFooterProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof footerVariants> {
  responsive?: boolean;
}

export const AppShellFooter: React.FC<AppShellFooterProps> = ({
  className,
  height = 'sm',
  responsive = true,
  children,
  ...props
}) => {
  const { getValue } = useResponsive();

  const responsiveHeight = responsive && height === 'responsive'
    ? getValue('h-8', 'h-12')
    : undefined;

  return (
    <footer
      className={cn(
        footerVariants({ height: responsive ? 'responsive' : height }),
        responsiveHeight,
        className
      )}
      {...props}
    >
      {children}
    </footer>
  );
};

// Sidebar Toggle Button
export interface SidebarToggleProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  iconOpen?: React.ReactNode;
  iconClosed?: React.ReactNode;
}

export const SidebarToggle: React.FC<SidebarToggleProps> = ({
  className,
  iconOpen,
  iconClosed,
  ...props
}) => {
  const { sidebarCollapsed, toggleSidebar } = useAppShell();

  return (
    <button
      onClick={toggleSidebar}
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-primary/20',
        className
      )}
      aria-label={sidebarCollapsed ? 'Open sidebar' : 'Close sidebar'}
      {...props}
    >
      {sidebarCollapsed ? (
        iconClosed || (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        )
      ) : (
        iconOpen || (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        )
      )}
    </button>
  );
};
