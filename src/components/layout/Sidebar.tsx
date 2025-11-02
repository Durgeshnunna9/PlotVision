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
  Settings,
  UsersRound
} from 'lucide-react';
import { IconUsersGroup } from '@tabler/icons-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  path: string;
  roles: ('ADMIN' | 'AGENT' | 'MANAGER')[];
}

const sidebarItems: SidebarItem[] = [
  {
    icon: LayoutDashboard,
    label: 'Dashboard',
    path: '/dashboard',
    roles: ['ADMIN', 'AGENT', 'MANAGER']
  },
  {
    icon: Building2,
    label: 'Properties',
    path: '/properties',
    roles: ['ADMIN', 'AGENT', 'MANAGER']
  },
  // {
  //   icon: Users,
  //   label: 'Clients',
  //   path: '/clients',
  //   roles: ['ADMIN', 'AGENT', 'MANAGER']
  // },
  {
    icon: UserCheck,
    label: 'Agents',
    path: '/agents',
    roles: ['ADMIN', 'MANAGER']
  },
  {
    icon: IconUsersGroup,
    label: 'Assigned Agents',
    path: '/assigned_agents',
    roles: ['MANAGER']
  },
  {
    icon: IconUsersGroup,
    label: 'Users',
    path: '/users',
    roles: ['ADMIN']
  },

  {
    icon: UsersRound,
    label: 'Managers',
    path: '/managers',
    roles: ['ADMIN']
  },
  // {
  //   icon: ClipboardList,
  //   label: 'Tasks',
  //   path: '/tasks',
  //   roles: ['AGENT', 'MANAGER']
  // },
  {
    icon: Map,
    label: 'HeatMap',
    path: '/heatmap',
    roles: ['ADMIN']
  },
  {
    icon: BarChart3,
    label: 'Analytics',
    path: '/analytics',
    roles: ['ADMIN', 'MANAGER']
  },
  {
    icon: TrendingUp,
    label: 'Performance',
    path: '/performance',
    roles: ['AGENT']
  },
  {
    icon: FileText,
    label: 'Reports',
    path: '/reports',
    roles: ['ADMIN', 'MANAGER']
  },
  // {
  //   icon: Settings,
  //   label: 'Settings',
  //   path: '/settings',
  //   roles: ['ADMIN']
  // }
];

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const filteredItems = sidebarItems.filter(item => 
    user && user.role && item.roles.includes(user.role as 'ADMIN' | 'AGENT' | 'MANAGER')
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