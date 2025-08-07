import React from 'react';
import clsx from 'clsx';

export interface LoadingOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  show: boolean;
  label?: string;
  blur?: boolean;
  fullscreen?: boolean;
  variant?: 'surface' | 'transparent';
}

export function LoadingOverlay({
  show,
  label = 'Loading…',
  blur = true,
  fullscreen = false,
  variant = 'surface',
  className,
  ...rest
}: LoadingOverlayProps) {
  if (!show) return null;

  const containerClasses = clsx(
    'inset-0 z-40 flex items-center justify-center',
    fullscreen ? 'fixed' : 'absolute',
    className
  );

  const backdropClasses = clsx(
    'absolute inset-0',
    // Subtle veil using foreground color at low alpha
    'bg-[rgb(var(--color-fg)/0.05)]',
    blur && 'backdrop-blur-sm'
  );

  const panelBase =
    'relative z-10 radius-8 elev-sm border px-m py-s flex items-center gap-s';
  const panelVariant =
    variant === 'surface'
      ? 'bg-[rgb(var(--color-bg))] text-[rgb(var(--color-fg))] border-default'
      : 'bg-transparent text-[rgb(var(--color-fg))] border-transparent';

  return (
    <div className={containerClasses} {...rest}>
      <div className={backdropClasses} />
      <div className={clsx(panelBase, panelVariant)}>
        <svg className="h-5 w-5 animate-spin text-[rgb(var(--color-primary))]" viewBox="0 0 24 24" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
        </svg>
        <span className="text-sm-var font-medium">{label}</span>
      </div>
    </div>
  );
}

export default LoadingOverlay;