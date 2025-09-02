import React from 'react';
import { cn } from '../utils/cn';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

interface HeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface SidebarProps {
  children: React.ReactNode;
  className?: string;
  isOpen?: boolean;
}

interface MainContentProps {
  children: React.ReactNode;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, className }) => (
  <div className={cn('min-h-screen bg-background', className)}>
    {children}
  </div>
);

const Header: React.FC<HeaderProps> = ({ children, className }) => (
  <header className={cn('sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60', className)}>
    <div className="container flex h-14 items-center">
      {children}
    </div>
  </header>
);

const Sidebar: React.FC<SidebarProps> = ({ children, className, isOpen = true }) => (
  <aside className={cn(
    'fixed inset-y-0 left-0 z-50 w-64 bg-background border-r transition-transform duration-300 ease-in-out',
    isOpen ? 'translate-x-0' : '-translate-x-full',
    'lg:translate-x-0 lg:static lg:inset-0',
    className
  )}>
    <div className="flex h-full flex-col">
      {children}
    </div>
  </aside>
);

const MainContent: React.FC<MainContentProps> = ({ children, className }) => (
  <main className={cn('flex-1 lg:ml-64', className)}>
    <div className="container mx-auto p-6">
      {children}
    </div>
  </main>
);

export { Layout, Header, Sidebar, MainContent };
