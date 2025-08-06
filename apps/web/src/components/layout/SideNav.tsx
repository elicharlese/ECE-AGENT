import React from 'react';

export type SideNavProps = {
  items?: Array<{ label: string; href: string }>;
  footer?: React.ReactNode;
};

const defaultItems: SideNavProps['items'] = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'ListDetail', href: '/list-detail' },
  { label: 'Settings', href: '/settings' },
  { label: 'Auth', href: '/auth' },
];

export const SideNav: React.FC<SideNavProps> = ({ items = defaultItems, footer }) => {
  return (
    <nav className="h-[calc(100vh-3.5rem)] overflow-y-auto p-s bg-white">
      <ul className="space-y-1">
        {items.map((it) => (
          <li key={it.href}>
            <a
              href={it.href}
              className="flex items-center justify-between px-s py-s text-sm-var text-gray-700 hover:bg-gray-50 radius-8"
            >
              <span className="flex items-center gap-s">
                {it.icon ?? null}
                {it.label}
              </span>
              {it.trailing ?? null}
            </a>
          </li>
        ))}
      </ul>
      {footer ? <div className="mt-s">{footer}</div> : null}
    </nav>
  );
};