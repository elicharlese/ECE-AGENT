import React from 'react';
import clsx from 'clsx';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
  description?: React.ReactNode;
  onClose?: () => void;
}

const variantClasses: Record<AlertVariant, string> = {
  info: 'bg-blue-50 text-blue-900 border-blue-200',
  success: 'bg-green-50 text-green-900 border-green-200',
  warning: 'bg-yellow-50 text-yellow-900 border-yellow-200',
  error: 'bg-red-50 text-red-900 border-red-200',
};

const iconMap: Record<AlertVariant, React.ReactNode> = {
  info: (
    <svg className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M18 10A8 8 0 1 1 2 10a8 8 0 0 1 16 0ZM9 8h2V6H9v2Zm0 6h2v-6H9v6Z" clipRule="evenodd" />
    </svg>
  ),
  success: (
    <svg className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M16.707 6.293a1 1 0 0 1 0 1.414l-7.25 7.25a1 1 0 0 1-1.414 0l-3-3a1 1 0 1 1 1.414-1.414l2.293 2.293 6.543-6.543a1 1 0 0 1 1.414 0Z" clipRule="evenodd" />
    </svg>
  ),
  warning: (
    <svg className="h-5 w-5 text-yellow-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M8.257 3.099c.765-1.36 2.721-1.36 3.486 0l6.518 11.586A2 2 0 0 1 16.518 18H3.482a2 2 0 0 1-1.743-3.315L8.257 3.1zM11 14a1 1 0 1 0-2 0 1 1 0 0 0 2 0zm-1-2a1 1 0 0 0 1-1V8a1 1 0 1 0-2 0v3a1 1 0 0 0 1 1z" />
    </svg>
  ),
  error: (
    <svg className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm3.536-11.536a1 1 0 0 0-1.414-1.414L10 7.172 7.879 5.05A1 1 0 0 0 6.464 6.464L8.586 8.586 6.464 10.707a1 1 0 1 0 1.415 1.415L10 10l2.121 2.121a1 1 0 1 0 1.415-1.415L11.414 8.586l2.122-2.122Z" clipRule="evenodd" />
    </svg>
  ),
};

export function Alert({ variant = 'info', title, description, onClose, className, ...rest }: AlertProps) {
  return (
    <div
      role="alert"
      className={clsx(
        'border rounded-md radius-8 p-4 elev-sm flex items-start gap-3',
        variantClasses[variant],
        className,
      )}
      {...rest}
    >
      <div className="shrink-0">{iconMap[variant]}</div>
      <div className="flex-1">
        {title && <div className="font-medium mb-1">{title}</div>}
        {description && <div className="text-sm/6 opacity-90">{description}</div>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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