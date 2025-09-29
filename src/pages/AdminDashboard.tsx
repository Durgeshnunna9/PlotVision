import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import StatCard from '@/components/dashboard/StatCard';
import PropertyCard from '@/components/dashboard/PropertyCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, UserCheck, IndianRupee, TrendingUp, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Sector } from 'recharts';

const AdminDashboard = () => {
  const [properties, setProperties] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [analytics, setAnalytics] = useState<any>({
    totalProperties: 0,
    totalClients: 0,
    activeAgents: 0,
    monthlyRevenue: 0,
    salesData: [],
    propertyTypes: [],
  });

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--success))', 'hsl(var(--warning))'];
  useEffect(() => {
    const fetchData = async () => {
      const { data: propsData } = await supabase.from("properties").select("*");
      const { data: clientsData } = await supabase.from("clients").select("*");
      const { data: agentsData } = await supabase.from("agents").select("*");

      const props = propsData || [];
      const cls = clientsData || [];
      const ags = agentsData || [];

      setProperties(props);
      setClients(cls);
      setAgents(ags);

      // Total revenue
      const revenue = props.reduce((sum, p) => sum + (p.price || 0), 0);
      setTotalRevenue(revenue);

      // Example trend calculations: % change from last month
      const lastMonthRevenue = props
        .filter(
          (p) =>
            new Date(p.created_at).getMonth() === new Date().getMonth() - 1
        )
        .reduce((sum, p) => sum + (p.price || 0), 0);
      const revenueTrend = lastMonthRevenue
        ? ((revenue - lastMonthRevenue) / lastMonthRevenue) * 100
        : 0;

      const propsTrend =
        props.length > 1 ? ((props.length - (props.length - 1)) / (props.length - 1)) * 100 : 0;
      const clientsTrend =
        cls.length > 1 ? ((cls.length - (cls.length - 1)) / (cls.length - 1)) * 100 : 0;
      const agentsTrend =
        ags.length > 1 ? ((ags.length - (ags.length - 1)) / (ags.length - 1)) * 100 : 0;

      setAnalytics({
        totalProperties: props.length,
        totalClients: cls.length,
        activeAgents: ags.filter((a) => a.is_active).length,
        monthlyRevenue: revenue,
        trends: {
          properties: propsTrend,
          clients: clientsTrend,
          agents: agentsTrend,
          revenue: revenueTrend,
        },
      });
    };

    fetchData();
  }, []);
  // Fetch data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      // Properties
      const { data: propsData } = await supabase.from('properties').select('*');
      setProperties(propsData || []);
      console.log("all Data", propsData);

      // Clients
      const { data: clientsData } = await supabase.from('clients').select('*');
      setClients(clientsData || []);

      // Agents
      const { data: agentsData } = await supabase.from('agents').select('*');
      setAgents(agentsData || []);

      // Analytics
      const totalProperties = propsData?.length || 0;
      const totalClients = clientsData?.length || 0;
      const activeAgents = agentsData?.filter(a => a.is_active).length || 0;
      const monthlyRevenue = propsData?.reduce((sum, p) => sum + (p.price || 0), 0) || 0;

      // Monthly sales data for chart
      const salesDataMap: Record<string, number> = {};
      propsData?.forEach((p) => {
        const month = new Date(p.created_at).toLocaleString('default', { month: 'short' });
        salesDataMap[month] = (salesDataMap[month] || 0) + (p.price || 0);
      });
      const salesData = Object.entries(salesDataMap).map(([month, sales]) => ({ month, sales }));

      // Property types pie chart
      const typeCount: Record<string, number> = {};
      propsData?.forEach((p) => {
        typeCount[p.property_type] = (typeCount[p.property_type] || 0) + 1;
        
      });
      const propertyTypes = Object.entries(typeCount).map(([type, count]) => ({ type, count }));
      

      setAnalytics({
        totalProperties,
        totalClients,
        activeAgents,
        monthlyRevenue,
        salesData,
        propertyTypes,
      });
    };

    fetchData();
  }, []);

  const featuredProperties = properties.filter(p => p.featured).slice(0, 3);
  const recentClients = clients.slice(0, 5);
  const topAgents = agents
    .sort((a, b) => (b.total_sales || 0) - (a.total_sales || 0))
    .slice(0, 3);

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
          value={analytics.totalProperties}
          icon={Building2}
          trend={{
            value: Number(analytics.trends?.properties?.toFixed(1) || 0),
            isPositive: (analytics.trends?.properties || 0) >= 0,
          }}
          color="primary"
        />
        <StatCard
          title="Total Clients"
          value={analytics.totalClients}
          icon={Users}
          trend={{
            value: Number(analytics.trends?.clients?.toFixed(1) || 0),
            isPositive: (analytics.trends?.clients || 0) >= 0,
          }}
          color="success"
        />
        <StatCard
          title="Active Agents"
          value={analytics.activeAgents}
          icon={UserCheck}
          trend={{
            value: Number(analytics.trends?.agents?.toFixed(1) || 0),
            isPositive: (analytics.trends?.agents || 0) >= 0,
          }}
          color="accent"
        />
        <StatCard
          title="Monthly Revenue"
          value={`${(analytics.monthlyRevenue / 1000000).toFixed(1)}`}
          icon={IndianRupee}
          trend={{
            value: Number(analytics.trends?.revenue?.toFixed(1) || 0),
            isPositive: (analytics.trends?.revenue || 0) >= 0,
          }}
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
              <BarChart data={analytics.salesData}>
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
          data={analytics.propertyTypes}
          cx="50%"
          cy="50%"
          outerRadius={80}
          dataKey="count"
          nameKey="type"
          activeIndex={0} // index of slice to enlarge (controlled on hover)
          activeShape={(props) => {
            const RADIAN = Math.PI / 180;
            const {
              cx,
              cy,
              midAngle,
              innerRadius,
              outerRadius,
              startAngle,
              endAngle,
              fill,
              payload,
              percent,
              value,
            } = props;

            const sin = Math.sin(-RADIAN * midAngle);
            const cos = Math.cos(-RADIAN * midAngle);
            const sx = cx + (outerRadius + 10) * cos;
            const sy = cy + (outerRadius + 10) * sin;

            return (
              <g>
                {/* Enlarged slice */}
                <Sector
                  cx={cx}
                  cy={cy}
                  innerRadius={innerRadius}
                  outerRadius={outerRadius + 10} // bigger on hover
                  startAngle={startAngle}
                  endAngle={endAngle}
                  fill={fill}
                />
                {/* Label */}
                <text
                  x={sx}
                  y={sy}
                  textAnchor="middle"
                  fill="#333"
                >{`${payload.type}: ${value}`}</text>
              </g>
            );
          }}
        >
          {/* {analytics.propertyTypes.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
            />
          ))} */}
        </Pie>
        <Tooltip formatter={(value, name) => [`${value}`, `${name}`]} />
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
                    <p className="font-semibold text-primary">₹{agent.total_sales?.toLocaleString()}</p>
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
