import { useAuth } from '@/contexts/AuthContext';
import AdminDashboard from './AdminDashboard';
import AgentDashboard from './AgentDashboard';
import ManagerDashboard from './ManagerDashboard';
import NotFound from './NotFound';

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'agent':
      return <AgentDashboard />;
    case 'manager':
      return <ManagerDashboard />;
    default:
      return <NotFound />;
  }
};

export default Dashboard;