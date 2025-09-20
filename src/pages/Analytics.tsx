import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, TrendingDown, IndianRupee, Building2, Users, UserCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import StatCard from '@/components/dashboard/StatCard';
import { supabase } from '@/lib/supabaseClient';

const Analytics = () => {
  const [agents, setAgents] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState('all');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--success))', 'hsl(var(--warning))'];
  const [period, setPeriod] = useState<'monthly' | 'quarterly' | 'halfYearly' | 'yearly'>('monthly');
  const [data, setData] = useState<{ label: string; revenue: number }[]>([]);

  const [totalRevenue, setTotalRevenue] = useState(0);

  const [trends, setTrends] = useState({
    revenue: { value: 0, isPositive: true },
    properties: { value: 0, isPositive: true },
    clients: { value: 0, isPositive: true },
    agents: { value: 0, isPositive: true },
  });

  function calculateTrend(current: number, previous: number) {
    if (previous === 0) {
      return { value: current, isPositive: true }; // handle division by 0
    }
    const diff = current - previous;
    const percentage = (diff / previous) * 100;
    return { value: Math.round(percentage), isPositive: diff >= 0 };
  }
  useEffect(() => {
    const fetchData = async () => {
      const now = new Date();
      const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      // Example: Properties
      const { data: currentProperties } = await supabase
        .from("properties")
        .select("*")
        .gte("created_at", startOfThisMonth.toISOString());

      const { data: lastProperties } = await supabase
        .from("properties")
        .select("*")
        .gte("created_at", startOfLastMonth.toISOString())
        .lte("created_at", endOfLastMonth.toISOString());

      // Example: Clients
      const { data: currentClients } = await supabase
        .from("clients")
        .select("*")
        .gte("created_at", startOfThisMonth.toISOString());

      const { data: lastClients } = await supabase
        .from("clients")
        .select("*")
        .gte("created_at", startOfLastMonth.toISOString())
        .lte("created_at", endOfLastMonth.toISOString());

      // Example: Revenue (sum of property prices)
      const currentRevenue = currentProperties?.reduce((sum, p) => sum + (p.price || 0), 0) || 0;
      const lastRevenue = lastProperties?.reduce((sum, p) => sum + (p.price || 0), 0) || 0;

      // Example: Agents rating
      const { data: allAgents } = await supabase.from("agents").select("*");

      setProperties(currentProperties || []);
      setClients(currentClients || []);
      setAgents(allAgents || []);
      setTotalRevenue(currentRevenue);

      // ✅ Calculate trends
      setTrends({
        revenue: calculateTrend(currentRevenue, lastRevenue),
        properties: calculateTrend(currentProperties?.length || 0, lastProperties?.length || 0),
        clients: calculateTrend(currentClients?.length || 0, lastClients?.length || 0),
        agents: calculateTrend(
          allAgents?.reduce((sum, a) => sum + (a.rating || 0), 0) / (allAgents?.length || 1),
          0 // you could store historical avg rating in another table if needed
        ),
      });
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchRevenue = async () => {
      setLoading(true);

      const { data: properties, error } = await supabase
        .from('properties')
        .select('price, sold_at');

      if (error) {
        console.error('Supabase fetch error:', error);
        setData([]);
        setLoading(false);
        return;
      }

      const now = new Date();
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

      // Helper to aggregate revenue
      const aggregateRevenue = (props: any[], startMonth: number, endMonth: number) => {
        return props
          .filter(p => {
            if (!p.sold_at) return false;
            const soldMonth = new Date(p.sold_at).getMonth();
            return soldMonth >= startMonth && soldMonth <= endMonth;
          })
          .reduce((sum, p) => sum + (p.price || 0), 0);
      };

      let chartData: { label: string; revenue: number }[] = [];

      if (!properties || properties.length === 0) {
        // Empty fallback
        if (period === 'monthly') {
          chartData = months.map(m => ({ label: m, revenue: 0 }));
        } else if (period === 'quarterly') {
          chartData = ['Q1','Q2','Q3','Q4'].map(q => ({ label: q, revenue: 0 }));
        } else if (period === 'halfYearly') {
          chartData = ['H1','H2'].map(h => ({ label: h, revenue: 0 }));
        } else {
          chartData = [{ label: now.getFullYear().toString(), revenue: 0 }];
        }
      } else {
        switch (period) {
          case 'monthly':
            chartData = months.map((m, i) => ({
              label: m,
              revenue: aggregateRevenue(properties, i, i)
            }));
            break;
          case 'quarterly':
            chartData = ['Q1','Q2','Q3','Q4'].map((q, i) => ({
              label: q,
              revenue: aggregateRevenue(properties, i*3, i*3+2)
            }));
            break;
          case 'halfYearly':
            chartData = ['H1','H2'].map((h, i) => ({
              label: h,
              revenue: aggregateRevenue(properties, i*6, i*6+5)
            }));
            break;
          case 'yearly':
            const year = now.getFullYear();
            chartData = [{ label: year.toString(), revenue: aggregateRevenue(properties, 0, 11) }];
            break;
        }
      }

      setData(chartData);
      setLoading(false);
    };

    fetchRevenue();
  }, [period]);

  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Fetch agents
      const { data: agentsData } = await supabase.from('agents').select('*');
      setAgents(agentsData || []);

      // Fetch properties
      const { data: propertiesData } = await supabase.from('properties').select('*');
      setProperties(propertiesData || []);

      // Fetch clients
      const { data: clientsData } = await supabase.from('clients').select('*');
      setClients(clientsData || []);

      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return <p>Loading analytics...</p>;

  // Prepare charts data
  const monthlyPerformance = months.map((month, index) => {
    const monthNumber = index + 1; // Jan = 1, Feb = 2, etc.
  
    // Filter properties sold in this month
    const monthlyProperties = properties.filter(
      p => new Date(p.sold_at).getMonth() + 1 === monthNumber
    );
  
    const monthlyClients = clients.filter(
      c => new Date(c.created_at).getMonth() + 1 === monthNumber
    );
  
    const revenue = monthlyProperties.reduce((sum, p) => sum + (p.price || 0), 0);
  
    return {
      month,
      revenue,
      properties: monthlyProperties.length,
      clients: monthlyClients.length
    };
  });

  const agentPerformance = agents.map(agent => ({
    name: agent.name.split(' ')[0] || "Unknown",
    sales: agent.total_sales || 0,
    listings: agent.active_listings || 0,
    clients: agent.clients_count || 0,
    rating: agent.rating || 0
  }));
  const filteredData = selectedAgent === 'all'
    ? agentPerformance
    : agentPerformance.filter(agent => agent.name === selectedAgent);


  const propertyStatusData = [
    { status: 'Available', count: properties.filter(p => p.status === 'available').length },
    { status: 'Pending', count: properties.filter(p => p.status === 'pending').length },
    { status: 'Sold', count: properties.filter(p => p.status === 'sold').length },
    { status: 'Rented', count: properties.filter(p => p.status === 'rented').length },
  ];

  const clientTypeData = [
    { type: 'Buyers', count: clients.filter(c => c.type === 'buyer').length },
    { type: 'Sellers', count: clients.filter(c => c.type === 'seller').length },
    { type: 'Renters', count: clients.filter(c => c.type === 'renter').length },
  ];

  const totalPropertyRevenue = properties.reduce((sum, p) => sum + (p.price || 0), 0);

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
          value={`${(totalPropertyRevenue / 1000000).toFixed(1)}`}
          icon={IndianRupee}
          trend={trends.revenue}
          color="primary"
        />
        <StatCard
          title="Properties Sold"
          value={properties.filter(p => p.status === "sold").length}
          icon={Building2}
          trend={trends.properties}
          color="success"
        />
        <StatCard
          title="Active Clients"
          value={clients.length}
          icon={Users}
          trend={trends.clients}
          color="purple"
        />
        <StatCard
          title="Team Performance"
          value={agents.length ? (agents.reduce((sum, a) => sum + (a.rating || 0), 0) / agents.length).toFixed(1) : "0"}
          icon={UserCheck}
          trend={trends.agents}
          color="warning"
        />
      </div>
      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card className="card-premium">
          <CardHeader className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Revenue Trend
            </CardTitle>

            <Select value={period} onValueChange={value => setPeriod(value as any)}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="halfYearly">Half-Yearly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>

          <CardContent>
            {loading ? (
              <p className="text-center text-muted">Loading data...</p>
            ) : data.length === 0 ? (
              <p className="text-center text-muted">No revenue data available</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']} />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Agent Performance */}
        <Card className="card-premium">
          <CardHeader className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Agent Performance
            </CardTitle>

            {/* Dropdown to select agent */}
            <Select value={selectedAgent} onValueChange={setSelectedAgent}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                {agentPerformance.map(agent => (
                  <SelectItem key={agent.name} value={agent.name}>{agent.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>

          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={filteredData}>
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
          <CardHeader><CardTitle>Property Status</CardTitle></CardHeader>
          
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={propertyStatusData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="count" label={({ status, count }) => `${status}: ${count}`}>
                  {propertyStatusData.map((entry, index) => (<Cell key={index} fill={COLORS[index % COLORS.length]} />))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Client Types */}
        <Card className="card-premium">
          <CardHeader><CardTitle>Client Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={clientTypeData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="count" label={({ type, count }) => `${type}: ${count}`}>
                  {clientTypeData.map((entry, index) => (<Cell key={index} fill={COLORS[index % COLORS.length]} />))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Activity */}
        <Card className="card-premium">
          <CardHeader><CardTitle>Monthly Activity</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="properties" stroke="hsl(var(--primary))" strokeWidth={3} name="Properties" />
                <Line type="monotone" dataKey="clients" stroke="hsl(var(--accent))" strokeWidth={3} name="Clients" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
