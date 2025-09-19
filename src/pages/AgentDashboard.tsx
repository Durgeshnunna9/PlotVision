import StatCard from '@/components/dashboard/StatCard';
import PropertyCard from '@/components/dashboard/PropertyCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, ClipboardList, TrendingUp, Calendar, Phone, Mail } from 'lucide-react';
import { mockProperties, mockClients, mockTasks } from '@/data/mockData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

// --- Types ---
interface Trend {
  value: number;
  isPositive: boolean;
}

interface StatResult {
  count: number;
  trend: Trend;
}

interface PerformanceData {
  month: string;
  deals: number;
  revenue: number;      // revenue in thousands/lakhs
  commission: number;   // commission in thousands/lakhs
}
// --- Component ---
const AgentDashboard = () => {
  const [agentProperties, setAgentProperties] = useState<any[]>([]);
  const [agentClients, setAgentClients] = useState<any[]>([]);
  const [agentTasks, setAgentTasks] = useState<any[]>([]);
  const [data, setData] = useState<PerformanceData[]>([]);

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const fetchPerformanceData = async () => {
    const { data: perfData, error } = await supabase
      .from("performance")          // your table name
      .select("month, deals, revenue, commission")
      .order("month", { ascending: true });

    if (error) {
      console.error("Error fetching performance data:", error);
      return;
    }

    setData(perfData as PerformanceData[]);
  };
  // trends
  const [trendListings, setTrendListings] = useState<StatResult>({
    count: 0,
    trend: { value: 0, isPositive: true },
  });
  
  const [trendClients, setTrendClients] = useState<StatResult>({
    count: 0,
    trend: { value: 0, isPositive: true },
  });
  
  const [trendTasks, setTrendTasks] = useState<StatResult>({
    count: 0,
    trend: { value: 0, isPositive: true },
  });
  
  const [trendSales, setTrendSales] = useState<StatResult>({
    count: 0,
    trend: { value: 0, isPositive: true },
  });

  const [user, setUser] = useState<any>(null);

  // --- fetch authenticated user ---
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  // --- fetch main data ---
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // Fetch properties
    const { data: properties, error: propertiesError } = await supabase
      .from("properties")
      .select("*");
    if (!propertiesError && properties) setAgentProperties(properties);

    // Fetch clients
    const { data: clients, error: clientsError } = await supabase
      .from("clients")
      .select("*");
    if (!clientsError && clients) setAgentClients(clients);

    // Fetch tasks
    const { data: tasks, error: tasksError } = await supabase
      .from("tasks")
      .select("*");
    if (!tasksError && tasks) setAgentTasks(tasks);
  };

  // --- Helper: calculate trend ---
  function calculateTrend(current: number, previous: number): Trend {
    if (previous != null && previous > 0) {
      const trend = ((current - previous) / previous) * 100;
      return { value: trend, isPositive: trend >= 0 };
    }
    return { value: 100, isPositive: true }; // fallback when no previous data
  }

  // --- Fetch Listings ---
  async function fetchListings(userId: string): Promise<StatResult> {
    const startOfThisMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    ).toISOString();
    const startOfLastMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth() - 1,
      1
    ).toISOString();

    // Listings this month
    const { count: thisMonth } = await supabase
      .from("properties")
      .select("*", { count: "exact", head: true })
      .eq("agent_id", userId)
      .gte("created_at", startOfThisMonth);

    // Listings last month
    const { count: lastMonth } = await supabase
      .from("properties")
      .select("*", { count: "exact", head: true })
      .eq("agent_id", userId)
      .gte("created_at", startOfLastMonth)
      .lt("created_at", startOfThisMonth);

    return {
      count: thisMonth ?? 0,
      trend: calculateTrend(thisMonth ?? 0, lastMonth ?? 0),
    };
  }

  // --- Fetch Clients ---
  async function fetchClients(userId: string): Promise<StatResult> {
    const startOfThisMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    ).toISOString();
    const startOfLastMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth() - 1,
      1
    ).toISOString();

    const { count: thisMonth } = await supabase
      .from("clients")
      .select("*", { count: "exact", head: true })
      .eq("agent_id", userId)
      .gte("created_at", startOfThisMonth);

    const { count: lastMonth } = await supabase
      .from("clients")
      .select("*", { count: "exact", head: true })
      .eq("agent_id", userId)
      .gte("created_at", startOfLastMonth)
      .lt("created_at", startOfThisMonth);

    return {
      count: thisMonth ?? 0,
      trend: calculateTrend(thisMonth ?? 0, lastMonth ?? 0),
    };
  }
  // --- Fetch Tasks ---
  async function fetchTasks(userId: string): Promise<StatResult> {
    const startOfThisMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    ).toISOString();
    const startOfLastMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth() - 1,
      1
    ).toISOString();

    const { count: thisMonth } = await supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("agent_id", userId)
      .neq("status", "completed")
      .gte("created_at", startOfThisMonth);

    const { count: lastMonth } = await supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("agent_id", userId)
      .neq("status", "completed")
      .gte("created_at", startOfLastMonth)
      .lt("created_at", startOfThisMonth);

    return {
      count: thisMonth ?? 0,
      trend: calculateTrend(thisMonth ?? 0, lastMonth ?? 0),
    };
  }

  // --- Fetch Sales ---
  async function fetchSales(userId: string): Promise<StatResult> {
    const startOfThisMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    ).toISOString();
    const startOfLastMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth() - 1,
      1
    ).toISOString();

    const { data: thisMonthSales } = await supabase
      .from("sales")
      .select("amount")
      .eq("agent_id", userId)
      .gte("created_at", startOfThisMonth);

    const { data: lastMonthSales } = await supabase
      .from("sales")
      .select("amount")
      .eq("agent_id", userId)
      .gte("created_at", startOfLastMonth)
      .lt("created_at", startOfThisMonth);

    const thisSum =
      thisMonthSales?.reduce((sum, s) => sum + s.amount, 0) ?? 0;
    const lastSum =
      lastMonthSales?.reduce((sum, s) => sum + s.amount, 0) ?? 0;

    return {
      count: thisSum ?? 0,
      trend: calculateTrend(thisSum ?? 0, lastSum ?? 0),
    };
  }

  // --- Load trend data after user is fetched ---
  useEffect(() => {
    if (!user?.id) return;

    const loadData = async () => {
      const listingsTrend = await fetchListings(user.id);
      const clientsTrend = await fetchClients(user.id);
      const tasksTrend = await fetchTasks(user.id);
      const salesTrend = await fetchSales(user.id);

      setTrendListings(listingsTrend);
      setTrendClients(clientsTrend);
      setTrendTasks(tasksTrend);
      setTrendSales(salesTrend);
    };

    loadData();
  }, [user?.id]);
  
  // This is used to calculate the trend of this month buildings
  

  // Mock performance data for the agent
  // const performanceData = [
  //   { month: 'Jan', deals: 3, revenue: 850000 },
  //   { month: 'Feb', deals: 4, revenue: 920000 },
  //   { month: 'Mar', deals: 2, revenue: 780000 },
  //   { month: 'Apr', deals: 5, revenue: 1100000 },
  //   { month: 'May', deals: 3, revenue: 950000 },
  //   { month: 'Jun', deals: 6, revenue: 1250000 }
  // ];

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
          value={trendListings.count}
          icon={Building2}
          trend={ trendListings.trend}
          color="primary"
        />
        <StatCard
          title="Active Clients"
          value={trendClients.count}
          icon={Users}
          trend={trendClients.trend}
          color="success"
        />
        <StatCard
          title="Pending Tasks"
          value={trendTasks.count}
          icon={ClipboardList}
          trend={trendTasks.trend}
          color="warning"
        />
        <StatCard
          title="This Month Sales"
          value={`₹${trendSales.count.toLocaleString()}`}
          icon={TrendingUp}
          trend={trendTasks.trend}
          color="success"
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
          {/* Revenue / Commission Chart */}
        <CardContent>
          <h3 className="font-semibold mb-2">Revenue / Commission</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [
                  `$${Number(value).toLocaleString()}`,
                  name === "revenue" ? "Revenue" : "Commission"
                ]}
              />
              <Line type="monotone" dataKey="revenue" stroke="hsl(var(--accent))" strokeWidth={3} />
              <Line type="monotone" dataKey="commission" stroke="hsl(var(--primary))" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>

        {/* Deals Closed Chart */}
        image.png
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