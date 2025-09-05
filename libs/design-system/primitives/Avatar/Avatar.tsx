'use client';

/**
 * Avatar Primitive Component
 * User profile images and fallbacks with responsive design
 */

import React, { forwardRef, useState } from 'react';
import { cva, type VariantProps } from '../../utils/variants';
import { cn } from '../../utils/cn';
import { useResponsive } from '../../hooks/useResponsive';

const avatarVariants = cva(
  'relative flex shrink-0 overflow-hidden rounded-full',
  {
    variants: {
      size: {
        sm: 'h-6 w-6',
        md: 'h-8 w-8',
        lg: 'h-10 w-10',
        xl: 'h-12 w-12',
        '2xl': 'h-16 w-16',
        responsive: '', // Set dynamically
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

const avatarImageVariants = cva('aspect-square h-full w-full object-cover');

const avatarFallbackVariants = cva(
  'flex h-full w-full items-center justify-center rounded-full bg-muted text-muted-foreground font-medium',
  {
    variants: {
      size: {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
        xl: 'text-lg',
        '2xl': 'text-xl',
        responsive: '', // Set dynamically
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface AvatarProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof avatarVariants> {
  responsive?: boolean;
}

const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(
  ({ className, size, responsive = true, ...props }, ref) => {
    const { isMobile } = useResponsive();

    const responsiveSize = responsive && size === 'responsive'
      ? isMobile ? 'sm' : 'md'
      : size;

    return (
      <span
        ref={ref}
        className={cn(avatarVariants({ size: responsiveSize }), className)}
        {...props}
      />
    );
  }
);

Avatar.displayName = 'Avatar';

export interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

const AvatarImage = forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, alt = '', ...props }, ref) => {
    return (
      <img
        ref={ref}
        alt={alt}
        className={cn(avatarImageVariants(), className)}
        {...props}
      />
    );
  }
);

AvatarImage.displayName = 'AvatarImage';

export interface AvatarFallbackProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof avatarFallbackVariants> {
  delayMs?: number;
}

const AvatarFallback = forwardRef<HTMLSpanElement, AvatarFallbackProps>(
  ({ className, size, delayMs, ...props }, ref) => {
    const [canRender, setCanRender] = useState(delayMs === undefined);

    React.useEffect(() => {
      if (delayMs !== undefined) {
        const timer = setTimeout(() => setCanRender(true), delayMs);
        return () => clearTimeout(timer);
      }
    }, [delayMs]);

    return canRender ? (
      <span
        ref={ref}
        className={cn(avatarFallbackVariants({ size }), className)}
        {...props}
      />
    ) : null;
  }
);

AvatarFallback.displayName = 'AvatarFallback';

export { Avatar, AvatarImage, AvatarFallback };
