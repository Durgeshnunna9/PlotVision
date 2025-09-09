import StatCard from '@/components/dashboard/StatCard';
import PropertyCard from '@/components/dashboard/PropertyCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, ClipboardList, TrendingUp, Calendar, Phone, Mail } from 'lucide-react';
import { mockProperties, mockClients, mockTasks } from '@/data/mockData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AgentDashboard = () => {
  // Filter data for current agent
  const agentProperties = mockProperties.filter(p => p.agentId === 'agent1');
  const agentClients = mockClients.filter(c => c.agentId === 'agent1');
  const agentTasks = mockTasks.filter(t => t.assignedTo === 'agent1');
  
  // Mock performance data for the agent
  const performanceData = [
    { month: 'Jan', deals: 3, revenue: 850000 },
    { month: 'Feb', deals: 4, revenue: 920000 },
    { month: 'Mar', deals: 2, revenue: 780000 },
    { month: 'Apr', deals: 5, revenue: 1100000 },
    { month: 'May', deals: 3, revenue: 950000 },
    { month: 'Jun', deals: 6, revenue: 1250000 }
  ];

  const getTaskPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-destructive text-destructive-foreground';
      case 'medium':
        return 'bg-warning text-warning-foreground';
      case 'low':
        return 'bg-success text-success-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success text-success-foreground';
      case 'in-progress':
        return 'bg-accent text-accent-foreground';
      case 'todo':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Agent Dashboard</h1>
        <p className="text-muted-foreground">Manage your listings, clients, and track your performance.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="My Listings"
          value={agentProperties.length}
          icon={Building2}
          trend={{ value: 20, isPositive: true }}
          color="primary"
        />
        <StatCard
          title="Active Clients"
          value={agentClients.length}
          icon={Users}
          trend={{ value: 15, isPositive: true }}
          color="success"
        />
        <StatCard
          title="Pending Tasks"
          value={agentTasks.filter(t => t.status !== 'completed').length}
          icon={ClipboardList}
          trend={{ value: -10, isPositive: false }}
          color="warning"
        />
        <StatCard
          title="This Month Sales"
          value="$1.25M"
          icon={TrendingUp}
          trend={{ value: 25, isPositive: true }}
          color="accent"
        />
      </div>

      {/* Performance Chart */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            My Performance Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'deals' ? `${value} deals` : `$${Number(value).toLocaleString()}`,
                  name === 'deals' ? 'Deals Closed' : 'Revenue'
                ]} 
              />
              <Line type="monotone" dataKey="deals" stroke="hsl(var(--primary))" strokeWidth={3} />
              <Line type="monotone" dataKey="revenue" stroke="hsl(var(--accent))" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Content Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks & Reminders */}
        <Card className="card-premium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Today's Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {agentTasks.map((task) => (
                <div key={task.id} className="p-3 rounded-lg border border-border bg-card">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{task.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{task.dueDate}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge className={getTaskPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      <Badge variant="outline" className={getTaskStatusColor(task.status)}>
                        {task.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Client Leads */}
        <Card className="card-premium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Recent Client Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {agentClients.map((client) => (
                <div key={client.id} className="p-3 rounded-lg border border-border bg-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{client.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {client.type} • Budget: ${client.budget?.toLocaleString() || 'N/A'}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span>{client.phone}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span>{client.email}</span>
                        </div>
                      </div>
                    </div>
                    <Badge className={`${
                      client.status === 'active' ? 'bg-success/10 text-success' :
                      client.status === 'converted' ? 'bg-primary/10 text-primary' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {client.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Listings */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">My Active Listings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agentProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;