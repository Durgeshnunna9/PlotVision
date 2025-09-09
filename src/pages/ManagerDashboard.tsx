import StatCard from '@/components/dashboard/StatCard';
import PropertyCard from '@/components/dashboard/PropertyCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserCheck, Building2, Users, ClipboardList, Plus, Star, TrendingUp } from 'lucide-react';
import { mockProperties, mockClients, mockAgents, mockTasks } from '@/data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ManagerDashboard = () => {
  // Filter data for manager's team
  const teamAgents = mockAgents.filter(a => a.managerId === 'manager1');
  const teamProperties = mockProperties; // All properties for team overview
  const teamClients = mockClients;
  const teamTasks = mockTasks;

  // Team performance data
  const teamPerformance = teamAgents.map(agent => ({
    name: agent.name.split(' ')[0],
    sales: agent.totalSales / 1000,
    listings: agent.activeListings,
    clients: agent.clientsCount
  }));

  const getAgentStatusColor = (rating: number) => {
    if (rating >= 4.8) return 'bg-success text-success-foreground';
    if (rating >= 4.5) return 'bg-accent text-accent-foreground';
    if (rating >= 4.0) return 'bg-warning text-warning-foreground';
    return 'bg-secondary text-secondary-foreground';
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manager Dashboard</h1>
          <p className="text-muted-foreground">Oversee your team's performance and manage operations.</p>
        </div>
        <Button className="btn-gradient">
          <Plus className="h-4 w-4 mr-2" />
          Assign Task
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Team Members"
          value={teamAgents.length}
          icon={UserCheck}
          trend={{ value: 0, isPositive: true }}
          color="primary"
        />
        <StatCard
          title="Team Properties"
          value={teamProperties.length}
          icon={Building2}
          trend={{ value: 18, isPositive: true }}
          color="success"
        />
        <StatCard
          title="Team Clients"
          value={teamClients.length}
          icon={Users}
          trend={{ value: 12, isPositive: true }}
          color="accent"
        />
        <StatCard
          title="Open Tasks"
          value={teamTasks.filter(t => t.status !== 'completed').length}
          icon={ClipboardList}
          trend={{ value: -5, isPositive: false }}
          color="warning"
        />
      </div>

      {/* Team Performance Chart */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Team Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={teamPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'sales' ? `$${Number(value)}K` : value,
                  name === 'sales' ? 'Sales' : 
                  name === 'listings' ? 'Active Listings' : 'Clients'
                ]} 
              />
              <Bar dataKey="sales" fill="hsl(var(--primary))" name="sales" radius={[2, 2, 0, 0]} />
              <Bar dataKey="listings" fill="hsl(var(--accent))" name="listings" radius={[2, 2, 0, 0]} />
              <Bar dataKey="clients" fill="hsl(var(--success))" name="clients" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Content Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Overview */}
        <Card className="card-premium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Team Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamAgents.map((agent) => (
                <div key={agent.id} className="p-4 rounded-lg border border-border bg-card">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium">
                        {agent.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h4 className="font-medium">{agent.name}</h4>
                        <p className="text-sm text-muted-foreground">{agent.specialization}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getAgentStatusColor(agent.rating)}>
                        <Star className="h-3 w-3 mr-1" />
                        {agent.rating}
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1">
                        ${agent.totalSales.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-border">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-primary">{agent.activeListings}</p>
                      <p className="text-xs text-muted-foreground">Listings</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-success">{agent.clientsCount}</p>
                      <p className="text-xs text-muted-foreground">Clients</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-accent">
                        ${(agent.totalSales / 1000000).toFixed(1)}M
                      </p>
                      <p className="text-xs text-muted-foreground">Sales</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Task Management */}
        <Card className="card-premium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Team Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {teamTasks.map((task) => (
                <div key={task.id} className="p-3 rounded-lg border border-border bg-card">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{task.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground">
                          Assigned to: {mockAgents.find(a => a.id === task.assignedTo)?.name || 'Unknown'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Due: {task.dueDate}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge className={`text-xs ${
                        task.priority === 'high' ? 'bg-destructive text-destructive-foreground' :
                        task.priority === 'medium' ? 'bg-warning text-warning-foreground' :
                        'bg-success text-success-foreground'
                      }`}>
                        {task.priority}
                      </Badge>
                      <Badge variant="outline" className={`text-xs ${
                        task.status === 'completed' ? 'bg-success/10 text-success' :
                        task.status === 'in-progress' ? 'bg-accent/10 text-accent' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {task.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Properties */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Recent Team Properties</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamProperties.slice(0, 6).map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;