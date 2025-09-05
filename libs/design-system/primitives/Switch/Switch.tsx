/**
 * Switch Primitive Component
 * Toggle switches with responsive design
 */

import React, { forwardRef } from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cva, type VariantProps } from '../../utils/variants';
import { cn } from '../../utils/cn';
import { useResponsive } from '../../hooks/useResponsive';

const switchVariants = cva(
  'peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
  {
    variants: {
      size: {
        sm: 'h-4 w-7',
        md: 'h-6 w-11',
        lg: 'h-8 w-14',
        responsive: '', // Set dynamically
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

const switchThumbVariants = cva(
  'pointer-events-none block rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0',
  {
    variants: {
      size: {
        sm: 'h-3 w-3 data-[state=checked]:translate-x-3',
        md: 'h-5 w-5 data-[state=checked]:translate-x-5',
        lg: 'h-7 w-7 data-[state=checked]:translate-x-6',
        responsive: '', // Set dynamically
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>,
    VariantProps<typeof switchVariants> {
  responsive?: boolean;
}

const Switch = forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  SwitchProps
>(({ className, size, responsive = true, ...props }, ref) => {
  const { isMobile } = useResponsive();

  const responsiveSize = responsive && size === 'responsive'
    ? isMobile ? 'sm' : 'md'
    : size;

  return (
    <SwitchPrimitive.Root
      className={cn(switchVariants({ size: responsiveSize }), className)}
      {...props}
      ref={ref}
    >
      <SwitchPrimitive.Thumb className={cn(switchThumbVariants({ size: responsiveSize }))} />
    </SwitchPrimitive.Root>
  );
});

Switch.displayName = SwitchPrimitive.Root.displayName;

export { Switch };
