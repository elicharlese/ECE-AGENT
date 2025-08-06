import React from 'react';

export type TopNavProps = {
  title?: string;
  rightSlot?: React.ReactNode;
};

export const TopNav: React.FC<TopNavProps> = ({ title = 'App', rightSlot }) => {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-gray-900 text-white flex items-center justify-center radius-8 elev-sm">
            <span className="text-xs font-bold">UI</span>
          </div>
          <span className="font-semibold">{title}</span>
        </div>
        <nav className="hidden md:flex items-center gap-4 text-sm text-gray-600">
          <a className="hover:text-gray-900" href="/dashboard">Dashboard</a>
          <a className="hover:text-gray-900" href="/list-detail">ListDetail</a>
          <a className="hover:text-gray-900" href="/settings">Settings</a>
          <a className="hover:text-gray-900" href="/auth">Auth</a>
        </nav>
        <div className="flex items-center gap-2">
          {rightSlot}
        </div>
      </div>
    </header>
  );
};