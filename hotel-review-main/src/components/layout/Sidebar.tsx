import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  PlusCircle,
  Building2,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Tổng quan' },
  { to: '/reviews', icon: MessageSquare, label: 'Đánh giá' },
  { to: '/reviews/new', icon: PlusCircle, label: 'Tạo đánh giá' },
  { to: '/branches', icon: Building2, label: 'Chi nhánh' },
  { to: '/settings', icon: Settings, label: 'Cài đặt' },
];

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { canCreateReview } = useAuthStore();

  return (
    <aside
      className={cn(
        'h-screen bg-primary-900 text-white flex flex-col transition-all duration-300 sticky top-0',
        collapsed ? 'w-16' : 'w-60',
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-primary-800">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <span className="text-accent-400 font-bold text-lg">★</span>
            <span className="font-semibold text-sm">A25 Hotel Hub</span>
          </div>
        )}

        <button onClick={onToggle} className="p-1 hover:bg-primary-800 rounded">
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 py-4">
        {navItems
          .filter((item) => {
            if (item.to === '/reviews/new') return canCreateReview();
            return true;
          })
          .map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                  isActive
                    ? 'bg-primary-800 text-accent-400 border-r-2 border-accent-400'
                    : 'text-primary-200 hover:bg-primary-800 hover:text-white',
                )
              }
            >
              <item.icon size={20} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
      </nav>

      {!collapsed && (
        <div className="p-4 border-t border-primary-800 text-xs text-primary-400">
          A25 Hotel Review Hub v1.0
        </div>
      )}
    </aside>
  );
}