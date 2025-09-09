import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Building2, Users, UserCheck } from 'lucide-react';
import { mockAnalytics, mockProperties, mockClients, mockAgents } from '@/data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import StatCard from '@/components/dashboard/StatCard';

const Analytics = () => {
  const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--success))', 'hsl(var(--warning))'];

  // Sample monthly performance data
  const monthlyPerformance = [
    { month: 'Jan', revenue: 850000, properties: 12, clients: 8 },
    { month: 'Feb', revenue: 920000, properties: 15, clients: 10 },
    { month: 'Mar', revenue: 780000, properties: 10, clients: 6 },
    { month: 'Apr', revenue: 1100000, properties: 18, clients: 14 },
    { month: 'May', revenue: 950000, properties: 14, clients: 9 },
    { month: 'Jun', revenue: 1250000, properties: 20, clients: 16 }
  ];

  // Agent performance data
  const agentPerformance = mockAgents.map(agent => ({
    name: agent.name.split(' ')[0],
    sales: agent.totalSales,
    listings: agent.activeListings,
    clients: agent.clientsCount,
    rating: agent.rating
  }));

  // Property status distribution
  const propertyStatusData = [
    { status: 'Available', count: mockProperties.filter(p => p.status === 'available').length },
    { status: 'Pending', count: mockProperties.filter(p => p.status === 'pending').length },
    { status: 'Sold', count: mockProperties.filter(p => p.status === 'sold').length },
    { status: 'Rented', count: mockProperties.filter(p => p.status === 'rented').length }
  ];

  // Client type distribution
  const clientTypeData = [
    { type: 'Buyers', count: mockClients.filter(c => c.type === 'buyer').length },
    { type: 'Sellers', count: mockClients.filter(c => c.type === 'seller').length },
    { type: 'Renters', count: mockClients.filter(c => c.type === 'renter').length }
  ];

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Comprehensive business insights and performance metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`$${(mockAnalytics.monthlyRevenue / 1000000).toFixed(1)}M`}
          icon={DollarSign}
          trend={{ value: 15, isPositive: true }}
          color="primary"
        />
        <StatCard
          title="Properties Sold"
          value="47"
          icon={Building2}
          trend={{ value: 8, isPositive: true }}
          color="success"
        />
        <StatCard
          title="Active Clients"
          value={mockAnalytics.totalClients}
          icon={Users}
          trend={{ value: 12, isPositive: true }}
          color="accent"
        />
        <StatCard
          title="Team Performance"
          value="4.8"
          icon={UserCheck}
          trend={{ value: 5, isPositive: true }}
          color="warning"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card className="card-premium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyPerformance}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']} />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(var(--primary))" 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Agent Performance */}
        <Card className="card-premium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Agent Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={agentPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Sales']} />
                <Bar dataKey="sales" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Property Status */}
        <Card className="card-premium">
          <CardHeader>
            <CardTitle>Property Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={propertyStatusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ status, count }) => `${status}: ${count}`}
                >
                  {propertyStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Client Types */}
        <Card className="card-premium">
          <CardHeader>
            <CardTitle>Client Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={clientTypeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ type, count }) => `${type}: ${count}`}
                >
                  {clientTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Activity */}
        <Card className="card-premium">
          <CardHeader>
            <CardTitle>Monthly Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="properties" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  name="Properties"
                />
                <Line 
                  type="monotone" 
                  dataKey="clients" 
                  stroke="hsl(var(--accent))" 
                  strokeWidth={3}
                  name="Clients"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-premium">
          <CardContent className="p-6">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Average Deal Size</h3>
              <p className="text-3xl font-bold text-primary">$425K</p>
              <div className="flex items-center justify-center gap-1 text-sm text-success">
                <TrendingUp className="h-4 w-4" />
                +12% from last month
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-premium">
          <CardContent className="p-6">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Conversion Rate</h3>
              <p className="text-3xl font-bold text-success">68%</p>
              <div className="flex items-center justify-center gap-1 text-sm text-success">
                <TrendingUp className="h-4 w-4" />
                +5% from last month
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-premium">
          <CardContent className="p-6">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Client Satisfaction</h3>
              <p className="text-3xl font-bold text-warning">4.8/5</p>
              <div className="flex items-center justify-center gap-1 text-sm text-success">
                <TrendingUp className="h-4 w-4" />
                +0.2 from last month
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;