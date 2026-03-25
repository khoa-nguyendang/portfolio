import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/services/auth';
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Mail,
  Settings,
  ExternalLink,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  User,
} from 'lucide-react';

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://khoadangnguyen.com';

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/posts', label: 'Posts', icon: FileText },
  { to: '/categories', label: 'Categories', icon: FolderOpen },
  { to: '/contacts', label: 'Contacts', icon: Mail },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-950">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`sidebar-transition fixed inset-y-0 left-0 z-50 flex flex-col border-r border-gray-800 bg-gray-950 lg:relative lg:z-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${collapsed ? 'w-16' : 'w-64'}`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-gray-800 px-4">
          {!collapsed && (
            <span className="text-lg font-bold text-white">
              <span className="text-indigo-400">KD</span> Admin
            </span>
          )}
          <button
            onClick={() => {
              if (window.innerWidth < 1024) {
                setSidebarOpen(false);
              } else {
                setCollapsed(!collapsed);
              }
            }}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-800 hover:text-gray-200"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <ChevronLeft
                className={`h-5 w-5 transition-transform ${collapsed ? 'rotate-180' : ''}`}
              />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setSidebarOpen(false)}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                isActive(item.to)
                  ? 'bg-indigo-500/10 text-indigo-400'
                  : 'text-gray-400 hover:bg-gray-800/60 hover:text-gray-200'
              } ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}

          {/* Separator */}
          <div className="my-3 border-t border-gray-800" />

          {/* External links */}
          <a
            href={SITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-400 transition-all hover:bg-gray-800/60 hover:text-gray-200 ${
              collapsed ? 'justify-center' : ''
            }`}
            title={collapsed ? 'View Site' : undefined}
          >
            <ExternalLink className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>View Site</span>}
          </a>

          <button
            onClick={logout}
            className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-400 transition-all hover:bg-red-500/10 hover:text-red-400 ${
              collapsed ? 'justify-center' : ''
            }`}
            title={collapsed ? 'Logout' : undefined}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </nav>

        {/* User info */}
        {user && (
          <div className="border-t border-gray-800 p-3">
            <div
              className={`flex items-center gap-3 rounded-lg px-3 py-2 ${collapsed ? 'justify-center' : ''}`}
            >
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400">
                <User className="h-4 w-4" />
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-200">
                    {user.name}
                  </p>
                  <p className="truncate text-xs text-gray-500">{user.email}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar (mobile) */}
        <header className="flex h-16 items-center gap-4 border-b border-gray-800 bg-gray-950 px-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-gray-200"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-lg font-bold text-white">
            <span className="text-indigo-400">KD</span> Admin
          </span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
