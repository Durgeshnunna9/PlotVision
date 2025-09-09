import StatCard from '@/components/dashboard/StatCard';
import PropertyCard from '@/components/dashboard/PropertyCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, UserCheck, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { mockProperties, mockClients, mockAgents, mockAnalytics } from '@/data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AdminDashboard = () => {
  const featuredProperties = mockProperties.filter(p => p.featured).slice(0, 3);
  const recentClients = mockClients.slice(0, 5);
  const topAgents = mockAgents.slice(0, 3);

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--success))', 'hsl(var(--warning))'];

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening with your real estate business.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Properties"
          value={mockAnalytics.totalProperties}
          icon={Building2}
          trend={{ value: 12, isPositive: true }}
          color="primary"
        />
        <StatCard
          title="Total Clients"
          value={mockAnalytics.totalClients}
          icon={Users}
          trend={{ value: 8, isPositive: true }}
          color="success"
        />
        <StatCard
          title="Active Agents"
          value={mockAnalytics.activeAgents}
          icon={UserCheck}
          trend={{ value: 5, isPositive: true }}
          color="accent"
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${(mockAnalytics.monthlyRevenue / 1000000).toFixed(1)}M`}
          icon={DollarSign}
          trend={{ value: 15, isPositive: true }}
          color="warning"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <Card className="card-premium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Monthly Sales Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockAnalytics.salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Sales']} />
                <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Property Types */}
        <Card className="card-premium">
          <CardHeader>
            <CardTitle>Property Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockAnalytics.propertyTypes}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ type, percentage }) => `${type} ${percentage}%`}
                >
                  {mockAnalytics.propertyTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Content Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Clients */}
        <Card className="card-premium">
          <CardHeader>
            <CardTitle>Recent Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentClients.map((client) => (
                <div key={client.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div>
                    <p className="font-medium">{client.name}</p>
                    <p className="text-sm text-muted-foreground">{client.email}</p>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      client.status === 'active' ? 'bg-success/10 text-success' :
                      client.status === 'converted' ? 'bg-primary/10 text-primary' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {client.status}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{client.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Agents */}
        <Card className="card-premium">
          <CardHeader>
            <CardTitle>Top Performing Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topAgents.map((agent, index) => (
                <div key={agent.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium text-sm">
                    #{index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{agent.name}</p>
                    <p className="text-sm text-muted-foreground">{agent.specialization}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">${agent.totalSales.toLocaleString()}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span>⭐ {agent.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Featured Properties */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Featured Properties</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;