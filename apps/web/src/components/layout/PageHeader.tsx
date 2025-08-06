import React from 'react';

export type PageHeaderProps = {
  title: string;
  subtitle?: string;
  breadcrumb?: Array<{ label: string; href?: string }>;
  actions?: React.ReactNode;
};

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, breadcrumb, actions }) => {
  return (
    <div className="mb-4 md:mb-6 lg:mb-8">
      {breadcrumb && breadcrumb.length > 0 ? (
        <nav className="mb-2 text-sm text-gray-500" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2">
            {breadcrumb.map((bc, idx) => {
              const isLast = idx === breadcrumb.length - 1;
              return (
                <li key={idx} className="flex items-center gap-2">
                  {bc.href && !isLast ? (
                    <a className="hover:text-gray-700" href={bc.href}>{bc.label}</a>
                  ) : (
                    <span aria-current={isLast ? 'page' : undefined}>{bc.label}</span>
                  )}
                  {!isLast && <span aria-hidden>›</span>}
                </li>
              );
            })}
          </ol>
        </nav>
      ) : null}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">{title}</h1>
          {subtitle ? <p className="text-sm text-gray-600 mt-1">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  );
};