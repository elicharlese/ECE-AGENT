import React from 'react';
import { TopNav } from './TopNav';
import { SideNav } from './SideNav';

export type ShellProps = {
  title?: string;
  sidebar?: React.ReactNode; // allow custom sidebar or use built-in
  children: React.ReactNode;
};

export const Shell: React.FC<ShellProps> = ({ title, sidebar, children }) => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <TopNav title={title} />
      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-64 border-r border-gray-200 bg-white">
          {sidebar ?? <SideNav />}
        </aside>

        {/* Content area */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
};