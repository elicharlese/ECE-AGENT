import React from 'react';
import clsx from 'clsx';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';
type AlertSize = 'sm' | 'md' | 'lg';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  size?: AlertSize;
  title?: string;
  description?: React.ReactNode;
  onClose?: () => void;
}

const variantClasses: Record<AlertVariant, string> = {
  info: 'bg-[rgb(var(--color-info)/0.08)] border-[rgb(var(--color-info)/0.25)] text-[rgb(var(--color-fg))]',
  success: 'bg-[rgb(var(--color-success)/0.08)] border-[rgb(var(--color-success)/0.25)] text-[rgb(var(--color-fg))]',
  warning: 'bg-[rgb(var(--color-warning)/0.1)] border-[rgb(var(--color-warning)/0.3)] text-[rgb(var(--color-fg))]',
  error: 'bg-[rgb(var(--color-danger)/0.08)] border-[rgb(var(--color-danger)/0.25)] text-[rgb(var(--color-fg))]',
};

const iconColor: Record<AlertVariant, string> = {
  info: 'text-[rgb(var(--color-info))]',
  success: 'text-[rgb(var(--color-success))]',
  warning: 'text-[rgb(var(--color-warning))]',
  error: 'text-[rgb(var(--color-danger))]',
};

const sizeMap: Record<AlertSize, { container: string; icon: string; title: string; desc: string; close: string }> = {
  sm: { container: 'px-s py-s text-sm', icon: 'h-4 w-4', title: 'text-sm font-medium', desc: 'text-xs-var opacity-90', close: 'h-6 w-6' },
  md: { container: 'px-m py-s text-base', icon: 'h-5 w-5', title: 'text-base font-medium', desc: 'text-sm-var opacity-90', close: 'h-7 w-7' },
  lg: { container: 'px-l py-m text-lg', icon: 'h-6 w-6', title: 'text-lg font-semibold', desc: 'text-base-var opacity-90', close: 'h-8 w-8' },
};

const iconMap: Record<AlertVariant, React.ReactNode> = {
  info: (
    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M18 10A8 8 0 1 1 2 10a8 8 0 0 1 16 0ZM9 8h2V6H9v2Zm0 6h2v-6H9v6Z" clipRule="evenodd" />
    </svg>
  ),
  success: (
    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M16.707 6.293a1 1 0 0 1 0 1.414l-7.25 7.25a1 1 0 0 1-1.414 0l-3-3a1 1 0 1 1 1.414-1.414l2.293 2.293 6.543-6.543a1 1 0 0 1 1.414 0Z" clipRule="evenodd" />
    </svg>
  ),
  warning: (
    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M8.257 3.099c.765-1.36 2.721-1.36 3.486 0l6.518 11.586A2 2 0 0 1 16.518 18H3.482a2 2 0 0 1-1.743-3.315L8.257 3.1zM11 14a1 1 0 1 0-2 0 1 1 0 0 0 2 0zm-1-2a1 1 0 0 0 1-1V8a1 1 0 1 0-2 0v3a1 1 0 0 0 1 1z" />
    </svg>
  ),
  error: (
    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm3.536-11.536a1 1 0 0 0-1.414-1.414L10 7.172 7.879 5.05A1 1 0 0 0 6.464 6.464L8.586 8.586 6.464 10.707a1 1 0 1 0 1.415 1.415L10 10l2.121 2.121a1 1 0 1 0 1.415-1.415L11.414 8.586l2.122-2.122Z" clipRule="evenodd" />
    </svg>
  ),
};

export function Alert({ variant = 'info', size = 'md', title, description, onClose, className, ...rest }: AlertProps) {
  return (
    <div
      role="alert"
      className={clsx(
        'border radius-8 elev-sm flex items-start gap-s',
        variantClasses[variant],
        sizeMap[size].container,
        className,
      )}
      {...rest}
    >
      <div className={clsx('shrink-0', iconColor[variant])}>
        {/* size-specific icon sizing */}
        <div className={sizeMap[size].icon}>{iconMap[variant]}</div>
      </div>
      <div className="flex-1">
        {title && <div className={clsx(sizeMap[size].title, 'mb-1')}>{title}</div>}
        {description && <div className={clsx(sizeMap[size].desc)}>{description}</div>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className={clsx(
            'ml-2 inline-flex items-center justify-center rounded transition-quick focus:outline-none focus:ring-2',
            'focus:ring-offset-2',
            'hover:bg-[rgb(var(--color-fg)/0.05)]',
            'focus:ring-[rgb(var(--color-primary))]',
            size === 'sm' ? 'h-6 w-6' : size === 'lg' ? 'h-8 w-8' : 'h-7 w-7'
          )}
          aria-label="Close alert"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 1 0-1.06-1.06L10 8.94 6.28 5.22Z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default Alert;