'use client';

/**
 * Dialog Primitive Component
 * A cross-platform modal dialog with responsive design
 */

import React, { forwardRef, useEffect, useCallback, useRef } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cva, type VariantProps } from '../../utils/variants';
import { cn } from '../../utils/cn';
import { useResponsive, usePlatform, useUserPreferences } from '../../hooks/useResponsive';
import { responsiveLayout, responsiveBorderRadius } from '../../tokens/responsive';

// Overlay variants
const overlayVariants = cva(
  [
    'fixed inset-0 z-50',
    'data-[state=open]:animate-in data-[state=closed]:animate-out',
    'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
  ],
  {
    variants: {
      blur: {
        true: 'backdrop-blur-sm',
        false: '',
      },
      variant: {
        default: 'bg-black/50',
        light: 'bg-white/50',
        dark: 'bg-black/80',
      },
    },
    defaultVariants: {
      blur: true,
      variant: 'default',
    },
  }
);

// Content variants
const contentVariants = cva(
  [
    'fixed z-50',
    'w-full',
    'bg-background',
    'shadow-lg',
    'duration-200',
    'data-[state=open]:animate-in data-[state=closed]:animate-out',
  ],
  {
    variants: {
      position: {
        center: [
          'left-[50%] top-[50%]',
          'translate-x-[-50%] translate-y-[-50%]',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
          'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
        ],
        top: [
          'left-[50%] top-0',
          'translate-x-[-50%]',
          'data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
        ],
        bottom: [
          'bottom-0 left-0 right-0',
          'data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
        ],
        left: [
          'left-0 top-0 bottom-0',
          'data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
        ],
        right: [
          'right-0 top-0 bottom-0',
          'data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
        ],
      },
      size: {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        full: 'max-w-full',
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
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        xl: 'p-10',
        responsive: '', // Will be set dynamically
      },
    },
    defaultVariants: {
      position: 'center',
      size: 'md',
      radius: 'lg',
      padding: 'md',
    },
  }
);

// Dialog Context for compound components
const DialogContext = React.createContext<{
  responsive?: boolean;
}>({});

// Main Dialog Component
export interface DialogProps extends DialogPrimitive.DialogProps {
  responsive?: boolean;
}

const Dialog: React.FC<DialogProps> = ({ responsive = true, ...props }) => {
  return (
    <DialogContext.Provider value={{ responsive }}>
      <DialogPrimitive.Root {...props} />
    </DialogContext.Provider>
  );
};

// Dialog Trigger
const DialogTrigger = DialogPrimitive.Trigger;

// Dialog Portal
const DialogPortal = DialogPrimitive.Portal;

// Dialog Overlay
export interface DialogOverlayProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>,
    VariantProps<typeof overlayVariants> {}

const DialogOverlay = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  DialogOverlayProps
>(({ className, blur, variant, ...props }, ref) => {
  const { prefersReducedMotion } = useUserPreferences();

  return (
    <DialogPrimitive.Overlay
      ref={ref}
      className={cn(
        overlayVariants({ blur, variant }),
        prefersReducedMotion && 'motion-reduce:transition-none',
        className
      )}
      {...props}
    />
  );
});

DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

// Dialog Content
export interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof contentVariants> {
  showCloseButton?: boolean;
  overlayProps?: DialogOverlayProps;
}

const DialogContent = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(
  (
    {
      className,
      children,
      position = 'center',
      size = 'md',
      radius = 'lg',
      padding = 'md',
      showCloseButton = true,
      overlayProps,
      ...props
    },
    ref
  ) => {
    const { responsive } = React.useContext(DialogContext);
    const { getValue, isMobile } = useResponsive();
    const { platform, isTouch } = usePlatform();
    const { prefersReducedMotion } = useUserPreferences();
    const contentRef = useRef<HTMLDivElement>(null);

    // Get responsive size
    const responsiveSize = responsive && size === 'responsive'
      ? getValue(responsiveLayout.modal.medium)
      : undefined;

    // Get responsive border radius
    const responsiveRadius = responsive && radius === 'responsive'
      ? getValue(responsiveBorderRadius.large)
      : undefined;

    // Platform-specific adjustments
    const platformPosition = isMobile && position === 'center' ? 'bottom' : position;
    const platformRadius = isMobile && position === 'bottom' ? 'rounded-t-xl rounded-b-none' : undefined;

    // Focus trap for accessibility
    useEffect(() => {
      if (!contentRef.current) return;

      const focusableElements = contentRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      };

      document.addEventListener('keydown', handleTabKey);
      return () => document.removeEventListener('keydown', handleTabKey);
    }, []);

    return (
      <DialogPortal>
        <DialogOverlay {...overlayProps} />
        <DialogPrimitive.Content
          ref={(node) => {
            if (typeof ref === 'function') ref(node);
            else if (ref) ref.current = node;
            (contentRef as any).current = node;
          }}
          className={cn(
            contentVariants({
              position: platformPosition,
              size: responsive ? 'responsive' : size,
              radius: responsive ? 'responsive' : radius,
              padding,
            }),
            responsiveSize,
            responsiveRadius,
            platformRadius,
            prefersReducedMotion && 'motion-reduce:transition-none',
            // Mobile-specific styles
            isMobile && 'max-h-[90vh] overflow-y-auto',
            // Touch-specific styles
            isTouch && 'touch-manipulation',
            className
          )}
          onOpenAutoFocus={(e) => {
            // Prevent auto-focus on mobile to avoid keyboard popup
            if (isMobile) e.preventDefault();
          }}
          {...props}
        >
          {children}
          {showCloseButton && (
            <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          )}
        </DialogPrimitive.Content>
      </DialogPortal>
    );
  }
);

DialogContent.displayName = DialogPrimitive.Content.displayName;

// Dialog Header
const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col space-y-1.5 text-center sm:text-left',
      className
    )}
    {...props}
  />
);

DialogHeader.displayName = 'DialogHeader';

// Dialog Footer
const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
      className
    )}
    {...props}
  />
);

DialogFooter.displayName = 'DialogFooter';

// Dialog Title
const DialogTitle = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      'text-lg font-semibold leading-none tracking-tight',
      className
    )}
    {...props}
  />
));

DialogTitle.displayName = DialogPrimitive.Title.displayName;

// Dialog Description
const DialogDescription = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));

DialogDescription.displayName = DialogPrimitive.Description.displayName;

// Dialog Close
const DialogClose = DialogPrimitive.Close;

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogOverlay,
  DialogPortal,
};
