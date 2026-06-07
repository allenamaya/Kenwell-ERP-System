'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Redirect to login if not authenticated
  if (!isLoading && !user) {
    router.push('/login');
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const navigationItems = [
    { label: 'Dashboard', href: '/dashboard', icon: '📊' },
    ...(user?.role === 'admin' || user?.role === 'operations'
      ? [
          { label: 'Agents', href: '/dashboard/agents', icon: '👥' },
          { label: 'Customers', href: '/dashboard/customers', icon: '👤' },
          { label: 'Policies', href: '/dashboard/policies', icon: '📋' },
          { label: 'Claims', href: '/dashboard/claims', icon: '📝' },
          { label: 'Billing', href: '/dashboard/billing', icon: '💰' },
        ]
      : []),
    ...(user?.role === 'agent'
      ? [
          { label: 'My Customers', href: '/dashboard/my-customers', icon: '👤' },
          { label: 'My Policies', href: '/dashboard/my-policies', icon: '📋' },
          { label: 'Commissions', href: '/dashboard/commissions', icon: '💵' },
        ]
      : []),
    ...(user?.role === 'finance'
      ? [
          { label: 'Invoices', href: '/dashboard/invoices', icon: '🧾' },
          { label: 'Payments', href: '/dashboard/payments', icon: '💳' },
          { label: 'Reports', href: '/dashboard/reports', icon: '📊' },
        ]
      : []),
    ...(user?.role === 'customer'
      ? [
          { label: 'Billing', href: '/dashboard/billing', icon: '💰' },
        ]
      : []),
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-sidebar border-r border-border transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-border px-4">
          <img src="/logo.svg" alt="Logo" className="h-10" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center px-4 py-3 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              <span className="text-lg min-w-fit">{item.icon}</span>
              {sidebarOpen && <span className="ml-3">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* User Profile */}
        <div className="border-t border-border p-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center py-2 text-sm text-sidebar-foreground hover:text-sidebar-primary"
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <h2 className="font-heading text-lg font-semibold text-foreground">
              Kenwell ERP
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm">
              <p className="font-medium text-foreground">{user?.first_name} {user?.last_name}</p>
              <p className="text-muted-foreground text-xs capitalize">
                {user?.role}
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-primary border-primary hover:bg-primary hover:text-white"
            >
              Logout
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-background">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
