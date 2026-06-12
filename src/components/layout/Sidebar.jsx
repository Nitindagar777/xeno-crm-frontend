import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getInitials, getAvatarColor } from '../../utils/formatters';
import {
  LayoutDashboard,
  Users,
  Filter,
  Send,
  LogOut,
  Sparkles,
  Briefcase,
  History,
  Radio
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Workspace', path: '/workspace', icon: Briefcase },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Customers', path: '/customers', icon: Users },
    { name: 'Segments', path: '/segments', icon: Filter },
    { name: 'Campaigns', path: '/campaigns', icon: Send },
    { name: 'Message History', path: '/history', icon: History }
  ];

  const getSimulatorUrl = () => {
    const { hostname, protocol } = window.location;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    
    if (isLocalhost) {
      return `http://${hostname}:5001`;
    }
    
    if (hostname.startsWith('frontend.')) {
      return `${protocol}//${hostname.replace('frontend.', 'channel.')}`;
    }
    return `${protocol}//channel.${hostname}`;
  };

  const simulatorUrl = `${getSimulatorUrl()}/?userId=${user?._id || ''}`;

  const avatarBgColor = getAvatarColor(user?.name || '');
  const initials = getInitials(user?.name || '');

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-surface-card border-r border-border flex flex-col justify-between z-30">
      <div>
        {/* Brand Logo */}
        <div className="h-16 flex items-center px-6 border-b border-border">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-primary/15 rounded-lg text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold text-text-primary tracking-tight">
              XENO<span className="text-primary">CRM</span>
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1.5 flex-1 mt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary/10 text-primary border-l-2 border-primary'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
                  }`
                }
              >
                <Icon className="h-4.5 w-4.5" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}

          <a
            href={simulatorUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 text-text-secondary hover:text-text-primary hover:bg-surface-elevated"
          >
            <Radio className="h-4.5 w-4.5 text-amber-500" />
            <span>Channel Simulator</span>
          </a>
        </nav>
      </div>

      {/* User Session Info */}
      <div className="p-4 border-t border-border bg-surface-elevated/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-inner"
              style={{ backgroundColor: avatarBgColor }}
            >
              {initials}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-text-primary truncate">
                {user?.name || 'Marketer'}
              </span>
              <span className="text-xs text-text-muted capitalize">
                {user?.role || 'marketer'}
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-2 text-text-secondary hover:text-danger rounded-lg hover:bg-danger/10 transition-colors"
            title="Log out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
