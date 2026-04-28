import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AppShell() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-surface">
  <div className="hidden md:block">
    <Sidebar
      collapsed={sidebarCollapsed}
      onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
    />
  </div>

  <div className="flex-1 flex flex-col min-w-0 w-full">
    <Header />

    <main className="flex-1 w-full p-3 md:p-6">
      <Outlet />
    </main>
  </div>
</div>
  );
}
