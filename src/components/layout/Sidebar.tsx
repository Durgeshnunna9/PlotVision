import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  FileText, 
  BarChart3,
  UserCheck,
  Map,
  ClipboardList,
  TrendingUp,
  Settings
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  path: string;
  roles: ('admin' | 'agent' | 'manager')[];
}

const sidebarItems: SidebarItem[] = [
  {
    icon: LayoutDashboard,
    label: 'Dashboard',
    path: '/dashboard',
    roles: ['admin', 'agent', 'manager']
  },
  {
    icon: Building2,
    label: 'Properties',
    path: '/properties',
    roles: ['admin', 'agent', 'manager']
  },
  // {
  //   icon: Users,
  //   label: 'Clients',
  //   path: '/clients',
  //   roles: ['admin', 'agent', 'manager']
  // },
  {
    icon: UserCheck,
    label: 'Agents',
    path: '/agents',
    roles: ['admin', 'manager']
  },
  {
    icon: Users,
    label: 'Users',
    path: '/users',
    roles: ['admin']
  },
  // {
  //   icon: ClipboardList,
  //   label: 'Tasks',
  //   path: '/tasks',
  //   roles: ['agent', 'manager']
  // },
  {
    icon: Map,
    label: 'HeatMap',
    path: '/heatmap',
    roles: ['admin']
  },
  {
    icon: BarChart3,
    label: 'Analytics',
    path: '/analytics',
    roles: ['admin', 'manager']
  },
  {
    icon: TrendingUp,
    label: 'Performance',
    path: '/performance',
    roles: ['agent']
  },
  {
    icon: FileText,
    label: 'Reports',
    path: '/reports',
    roles: ['admin', 'manager']
  },
  {
    icon: Settings,
    label: 'Settings',
    path: '/settings',
    roles: ['admin']
  }
];

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const filteredItems = sidebarItems.filter(item => 
    user && user.role && item.roles.includes(user.role as 'admin' | 'agent' | 'manager')
  );

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border h-full">
      <nav className="p-4 space-y-2">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;