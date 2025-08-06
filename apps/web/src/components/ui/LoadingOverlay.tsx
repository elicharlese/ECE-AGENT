import React from 'react';
import clsx from 'clsx';

export interface LoadingOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  show: boolean;
  label?: string;
  blur?: boolean;
  fullscreen?: boolean;
}

export function LoadingOverlay({
  show,
  label = 'Loading…',
  blur = true,
  fullscreen = false,
  className,
  ...rest
}: LoadingOverlayProps) {
  if (!show) return null;

  const containerClasses = clsx(
    'inset-0 z-40 flex items-center justify-center',
    fullscreen ? 'fixed' : 'absolute',
    className
  );

  return (
    <div className={containerClasses} {...rest}>
      <div className={clsx('absolute inset-0 bg-white/70 dark:bg-gray-900/50', blur && 'backdrop-blur-sm')} />
      <div className="relative z-10 radius-8 elev-sm border bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-4 py-3 flex items-center gap-3">
        <svg className="h-5 w-5 animate-spin text-blue-600" viewBox="0 0 24 24" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
        </svg>
        <span className="text-sm font-medium">{label}</span>
      </div>
    </div>
  );
}

export default LoadingOverlay;