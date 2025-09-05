'use client';

/**
 * Input Primitive Component
 * A cross-platform input component with responsive design
 */

import React, { forwardRef, useState, useCallback, useEffect } from 'react';
import { cva, type VariantProps } from '../../utils/variants';
import { cn } from '../../utils/cn';
import { useResponsive, usePlatform, useUserPreferences } from '../../hooks/useResponsive';
import { responsiveSizes, responsiveTypography, responsiveBorderRadius } from '../../tokens/responsive';

const inputVariants = cva(
  // Base styles
  'relative w-full transition-all duration-200 outline-none',
  {
    variants: {
      variant: {
        default: [
          'bg-background',
          'border border-input',
          'text-foreground',
          'placeholder:text-muted-foreground',
          'hover:border-primary/50',
          'focus:border-primary focus:ring-2 focus:ring-primary/20',
          'disabled:cursor-not-allowed disabled:opacity-50',
        ],
        ghost: [
          'bg-transparent',
          'border-none',
          'text-foreground',
          'placeholder:text-muted-foreground',
          'hover:bg-accent/10',
          'focus:bg-accent/20 focus:ring-2 focus:ring-primary/20',
          'disabled:cursor-not-allowed disabled:opacity-50',
        ],
        filled: [
          'bg-accent/10',
          'border border-transparent',
          'text-foreground',
          'placeholder:text-muted-foreground',
          'hover:bg-accent/20',
          'focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20',
          'disabled:cursor-not-allowed disabled:opacity-50',
        ],
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-12 px-5 text-lg',
        xl: 'h-14 px-6 text-xl',
        responsive: '', // Will be set dynamically
      },
      radius: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        full: 'rounded-full',
        responsive: '', // Will be set dynamically
      },
      invalid: {
        true: [
          'border-destructive',
          'focus:border-destructive focus:ring-destructive/20',
          'text-destructive',
        ],
        false: '',
      },
      platformOptimized: {
        true: '', // Platform-specific styles applied via className
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      radius: 'md',
      invalid: false,
      platformOptimized: true,
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onClear?: () => void;
  loading?: boolean;
  responsive?: boolean;
  containerClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      containerClassName,
      variant = 'default',
      size = 'md',
      radius = 'md',
      invalid = false,
      platformOptimized = true,
      label,
      helperText,
      errorMessage,
      leftIcon,
      rightIcon,
      onClear,
      loading = false,
      responsive = true,
      disabled,
      type = 'text',
      value,
      onChange,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(!!value);
    const { breakpoint, isMobile, getValue } = useResponsive();
    const { platform, isTouch } = usePlatform();
    const { prefersReducedMotion } = useUserPreferences();

    // Update hasValue when value changes
    useEffect(() => {
      setHasValue(!!value);
    }, [value]);

    // Get responsive size
    const responsiveSize = responsive && size === 'responsive'
      ? getValue(responsiveSizes.input.height) || 'h-10'
      : undefined;

    // Get responsive font size
    const responsiveFontSize = responsive
      ? getValue(responsiveSizes.input.fontSize) || 'text-base'
      : undefined;

    // Get responsive border radius
    const responsiveRadius = responsive && radius === 'responsive'
      ? getValue(responsiveBorderRadius.medium) || 'rounded-md'
      : undefined;

    // Platform-specific optimizations
    const platformStyles = platformOptimized
      ? {
          // Mobile optimizations
          ...(platform === 'mobile' && {
            // iOS: Prevent zoom on focus
            fontSize: '16px',
            // Better touch targets
            minHeight: '44px',
          }),
          // Touch device optimizations
          ...(isTouch && {
            // Larger touch targets
            paddingTop: '12px',
            paddingBottom: '12px',
          }),
          // Reduced motion
          ...(prefersReducedMotion && {
            transition: 'none',
          }),
        }
      : {};

    // Handle focus
    const handleFocus = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(true);
        onFocus?.(e);
      },
      [onFocus]
    );

    // Handle blur
    const handleBlur = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);
        onBlur?.(e);
      },
      [onBlur]
    );

    // Handle change
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setHasValue(!!e.target.value);
        onChange?.(e);
      },
      [onChange]
    );

    // Handle clear
    const handleClear = useCallback(() => {
      if (onClear) {
        onClear();
        setHasValue(false);
      }
    }, [onClear]);

    // Determine if invalid
    const isInvalid = invalid || !!errorMessage;

    return (
      <div className={cn('relative w-full', containerClassName)}>
        {/* Label */}
        {label && (
          <label
            className={cn(
              'mb-1.5 block text-sm font-medium',
              isInvalid ? 'text-destructive' : 'text-foreground',
              disabled && 'opacity-50'
            )}
            htmlFor={props.id}
          >
            {label}
            {props.required && (
              <span className="ml-1 text-destructive" aria-label="required">
                *
              </span>
            )}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="pointer-events-none absolute left-0 top-1/2 z-10 flex -translate-y-1/2 items-center pl-3 text-muted-foreground">
              {leftIcon}
            </div>
          )}

          {/* Input Element */}
          <input
            ref={ref}
            type={type}
            value={value}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled || loading}
            aria-invalid={isInvalid}
            aria-describedby={
              errorMessage
                ? `${props.id}-error`
                : helperText
                ? `${props.id}-helper`
                : undefined
            }
            className={cn(
              inputVariants({
                variant,
                size: responsive ? 'responsive' : size,
                radius: responsive ? 'responsive' : radius,
                invalid: isInvalid,
                platformOptimized,
              }),
              responsiveSize,
              responsiveFontSize,
              responsiveRadius,
              leftIcon && 'pl-10',
              (rightIcon || onClear || loading) && 'pr-10',
              className
            )}
            style={platformStyles}
            {...props}
          />

          {/* Right Icon / Clear / Loading */}
          <div className="absolute right-0 top-1/2 z-10 flex -translate-y-1/2 items-center pr-3">
            {loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : onClear && hasValue && !disabled ? (
              <button
                type="button"
                onClick={handleClear}
                className="rounded-sm p-1 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                aria-label="Clear input"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            ) : (
              rightIcon
            )}
          </div>
        </div>

        {/* Helper Text */}
        {helperText && !errorMessage && (
          <p
            id={`${props.id}-helper`}
            className={cn(
              'mt-1.5 text-sm text-muted-foreground',
              disabled && 'opacity-50'
            )}
          >
            {helperText}
          </p>
        )}

        {/* Error Message */}
        {errorMessage && (
          <p
            id={`${props.id}-error`}
            className="mt-1.5 text-sm text-destructive"
            role="alert"
          >
            {errorMessage}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input, inputVariants };
