import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Target, Award, DollarSign, Building, Users, Calendar, Star } from 'lucide-react';
import { mockAgents, mockProperties, mockClients } from '@/data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, RadialBarChart, RadialBar } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';

const Performance = () => {
  const { user } = useAuth();
  
  // Get current agent data
  const currentAgent = mockAgents.find(agent => agent.id === user?.id) || mockAgents[0];
  
  // Sample performance data for the agent
  const monthlyPerformance = [
    { month: 'Jan', sales: 280000, listings: 3, clients: 4 },
    { month: 'Feb', sales: 320000, listings: 4, clients: 5 },
    { month: 'Mar', sales: 180000, listings: 2, clients: 3 },
    { month: 'Apr', sales: 450000, listings: 6, clients: 8 },
    { month: 'May', sales: 380000, listings: 5, clients: 6 },
    { month: 'Jun', sales: 420000, listings: 5, clients: 7 }
  ];

  // Performance goals data
  const goals = [
    { 
      title: 'Monthly Sales Target', 
      current: 420000, 
      target: 500000, 
      percentage: 84,
      icon: DollarSign,
      color: 'text-primary'
    },
    { 
      title: 'New Listings Goal', 
      current: 5, 
      target: 6, 
      percentage: 83,
      icon: Building,
      color: 'text-success'
    },
    { 
      title: 'Client Acquisition', 
      current: 7, 
      target: 8, 
      percentage: 88,
      icon: Users,
      color: 'text-accent'
    },
    { 
      title: 'Customer Rating', 
      current: 4.8, 
      target: 5.0, 
      percentage: 96,
      icon: Star,
      color: 'text-warning'
    }
  ];

  // Achievements data
  const achievements = [
    { title: 'Top Performer', description: 'Highest sales this quarter', earned: true },
    { title: 'Client Champion', description: '95% satisfaction rate', earned: true },
    { title: 'Quick Closer', description: 'Average 21 days to close', earned: true },
    { title: 'Million Dollar Club', description: 'Over $1M in sales', earned: false },
    { title: 'Listing Master', description: '20+ active listings', earned: false },
    { title: 'Referral Pro', description: '50% referral rate', earned: false }
  ];

  // My properties and clients (filtered for current agent)
  const myProperties = mockProperties.filter(p => p.agentId === currentAgent.id);
  const myClients = mockClients.filter(c => c.agentId === currentAgent.id);

  return (
    <div className="space-y-6 fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Performance</h1>
          <p className="text-muted-foreground">Track your personal metrics and achievements</p>
        </div>
        <Badge className="bg-primary/10 text-primary px-4 py-2 text-lg">
          Rating: {currentAgent.rating}/5.0
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-premium">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Sales</p>
                <p className="text-2xl font-bold text-primary">
                  ${(currentAgent.totalSales / 1000000).toFixed(1)}M
                </p>
                <div className="flex items-center gap-1 text-sm text-success">
                  <TrendingUp className="h-4 w-4" />
                  +15%
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-premium">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Listings</p>
                <p className="text-2xl font-bold text-success">{currentAgent.activeListings}</p>
                <div className="flex items-center gap-1 text-sm text-success">
                  <TrendingUp className="h-4 w-4" />
                  +2
                </div>
              </div>
              <Building className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-premium">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Clients</p>
                <p className="text-2xl font-bold text-accent">{currentAgent.clientsCount}</p>
                <div className="flex items-center gap-1 text-sm text-success">
                  <TrendingUp className="h-4 w-4" />
                  +3
                </div>
              </div>
              <Users className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-premium">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Days to Close</p>
                <p className="text-2xl font-bold text-warning">21</p>
                <div className="flex items-center gap-1 text-sm text-success">
                  <TrendingDown className="h-4 w-4" />
                  -5 days
                </div>
              </div>
              <Calendar className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals Progress */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Monthly Goals Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {goals.map((goal, index) => {
              const Icon = goal.icon;
              return (
                <div key={index} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-5 w-5 ${goal.color}`} />
                      <span className="font-medium">{goal.title}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{goal.percentage}%</span>
                  </div>
                  <Progress value={goal.percentage} className="h-2" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>
                      {typeof goal.current === 'number' && goal.current > 1000 
                        ? `$${(goal.current / 1000).toFixed(0)}k` 
                        : goal.current}
                    </span>
                    <span>
                      {typeof goal.target === 'number' && goal.target > 1000 
                        ? `$${(goal.target / 1000).toFixed(0)}k` 
                        : goal.target}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <Card className="card-premium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Sales Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Sales']} />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Activity Chart */}
        <Card className="card-premium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Monthly Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="listings" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} name="Listings" />
                <Bar dataKey="clients" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} name="New Clients" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Achievements & Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border transition-all ${
                  achievement.earned
                    ? 'bg-primary/5 border-primary/20'
                    : 'bg-muted/30 border-muted/50 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    achievement.earned ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    <Award className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{achievement.title}</h4>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    {achievement.earned && (
                      <Badge className="mt-2 bg-success/10 text-success">Earned</Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Recent Properties */}
        <Card className="card-premium">
          <CardHeader>
            <CardTitle>My Recent Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myProperties.slice(0, 5).map((property) => (
                <div key={property.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div>
                    <p className="font-medium">{property.title}</p>
                    <p className="text-sm text-muted-foreground">{property.address}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${property.price.toLocaleString()}</p>
                    <Badge className={`text-xs ${
                      property.status === 'available' ? 'bg-success/10 text-success' :
                      property.status === 'pending' ? 'bg-warning/10 text-warning' :
                      'bg-primary/10 text-primary'
                    }`}>
                      {property.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* My Recent Clients */}
        <Card className="card-premium">
          <CardHeader>
            <CardTitle>My Recent Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myClients.slice(0, 5).map((client) => (
                <div key={client.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div>
                    <p className="font-medium">{client.name}</p>
                    <p className="text-sm text-muted-foreground">{client.email}</p>
                  </div>
                  <div className="text-right">
                    <Badge className={`text-xs ${
                      client.status === 'active' ? 'bg-success/10 text-success' :
                      client.status === 'converted' ? 'bg-primary/10 text-primary' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {client.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">{client.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Performance;