import React from 'react';

export type TopNavProps = {
  title?: string;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
};

export const TopNav: React.FC<TopNavProps> = ({ title = 'App', leftSlot, rightSlot }) => {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-default">
      <div className="mx-auto max-w-7xl px-m md:px-l lg:px-[calc(var(--space-l)*1.25)] h-14 flex items-center justify-between">
        <div className="flex items-center gap-s">
          <div className="h-8 w-8 bg-gray-900 text-white flex items-center justify-center radius-8 elev-sm">
            <span className="text-xs font-bold">UI</span>
          </div>
          {/* leftSlot if any */}
        </div>
        <nav className="hidden md:flex items-center gap-m text-sm text-gray-600">
          <a className="hover:text-gray-900" href="/dashboard">Dashboard</a>
          {/* more links */}
        </nav>
        <div className="flex items-center gap-s">
          {rightSlot}
        </div>
      </div>
    </header>
  );
};