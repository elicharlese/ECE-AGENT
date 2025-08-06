import React from 'react';
import clsx from 'clsx';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full' | 'radius-8' | 'radius-12';
  lines?: number;
  lineHeightClass?: string;
}

const roundedMap: Record<NonNullable<SkeletonProps['rounded']>, string> = {
  none: 'rounded-none',
  sm: 'rounded',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
  'radius-8': 'radius-8',
  'radius-12': 'radius-12',
};

export function Skeleton({
  className,
  rounded = 'md',
  lines = 1,
  lineHeightClass = 'h-4',
  ...rest
}: SkeletonProps) {
  if (lines > 1) {
    return (
      <div className={clsx('space-y-2', className)} {...rest}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={clsx(
              'animate-pulse bg-gray-200 dark:bg-gray-700',
              roundedMap[rounded],
              lineHeightClass
            )}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={clsx(
        'animate-pulse bg-gray-200 dark:bg-gray-700',
        roundedMap[rounded],
        lineHeightClass,
        className
      )}
      {...rest}
    />
  );
}

export default Skeleton;