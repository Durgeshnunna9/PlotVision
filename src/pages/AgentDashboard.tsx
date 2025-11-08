import StatCard from '@/components/dashboard/StatCard';
import PropertyCard from '@/components/dashboard/PropertyCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, ClipboardList, TrendingUp, Calendar, Phone, Mail, MapPin, Edit, Eye, LandPlot, Trash2, DollarSign, IndianRupee, ChartNoAxesColumnIncreasing } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Bar,BarChart } from 'recharts';
import { AreaChart, Area,  } from 'recharts';
import { useEffect, useState } from "react";
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import Modal from '@mui/material/Modal';
import { Button } from 'react-day-picker';
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
  const [trendListings, setTrendListings] = useState({ count: 0, trend: { value: 0, isPositive: true } });
  const [trendTasks, setTrendTasks] = useState({ count: 0, trend: { value: 0, isPositive: true } });
  const [trendSales, setTrendSales] = useState({ count: 0, trend: { value: 0, isPositive: true } });
  const [agentTasks, setAgentTasks] = useState<any[]>([]);
  const [agentProperties, setAgentProperties] = useState<any[]>([]);
  const [data, setData] =useState<PerformanceData[]>([]);
  const { user } = useAuth();

  // --- Helper to calculate trend ---
  function calculateTrend(current: number, previous: number): Trend {
    if (previous != null && previous > 0) {
      const trend = ((current - previous) / previous) * 100;
      return { value: trend, isPositive: trend >= 0 };
    }
    return { value: 100, isPositive: true };
  }

  // --- Load Agent ID from localStorage or user context ---
  const [userId, setUserId] = useState<number | null>(null);

useEffect(() => {
  const storedUser = localStorage.getItem("user");

  if (storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser);

      if (parsedUser?.userId) {
        setUserId(parsedUser.userId);
        console.log("✅ Loaded user from localStorage:", parsedUser);
      } else {
        console.warn("⚠️ User data missing userId — clearing localStorage...");
        localStorage.removeItem("user");
      }
    } catch (err) {
      console.error("❌ Invalid user data in localStorage:", err);
      localStorage.removeItem("user");
    }
  } else {
    console.warn("⚠️ No stored user found — skipping data fetch.");
  }
}, []);


  // --- Fetch Performance Data from Backend ---
  useEffect(() => {
    if (!userId) return;

    const fetchPerformanceDataFromBackend = async () => {
      try {
        const res = await fetch(`http://localhost:8090/api/performance/user/${userId}/monthly`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          const errText = await res.text().catch(() => "");
          console.warn("Performance API returned error:", res.status, errText);
          setData([]);
          return;
        }

        const perf = await res.json();
        if (Array.isArray(perf) && perf.length > 0) {
          const normalized = perf.map((p: any) => ({
            month: String(p.month ?? p.period ?? p.label ?? ""),
            deals: Number(p.deals ?? 0),
            revenue: Number(p.revenue ?? 0),
            commission: Number(p.commission ?? 0),
          }));
          setData(normalized);
        } else {
          setData([]);
        }
      } catch (err) {
        console.error("Error fetching performance data:", err);
        setData([]);
      }
    };

    fetchPerformanceDataFromBackend();
  }, [userId]);

  // Fetch Dashboard Stats
  useEffect(() => {
    if (!userId) return;

    const fetchDashboardStats = async () => {
      try {
        const res = await fetch(`http://localhost:8090/api/dashboard/stats/${userId}`);
        if (!res.ok) {
          console.warn("Dashboard stats fetch failed:", res.status);
          return;
        }

        const stats = await res.json();
        setTrendListings({
          count: stats.listings || 0,
          trend: { value: 0, isPositive: true },
        });
        setTrendTasks({
          count: stats.pendingTasks || 0,
          trend: { value: 0, isPositive: true },
        });
        setTrendSales({
          count: stats.totalSales || 0,
          trend: { value: 0, isPositive: true },
        });
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
      }
    };

    fetchDashboardStats();
  }, [userId]);

  // --- Task color helpers ---
  const getTaskPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive text-destructive-foreground";
      case "medium":
        return "bg-warning text-warning-foreground";
      case "low":
        return "bg-success text-success-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-success text-success-foreground";
      case "in-progress":
        return "bg-accent text-accent-foreground";
      case "todo":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Agent Dashboard</h1>
        <p className="text-muted-foreground">Manage your listings, clients, and track your performance.</p>
      </div>

      {/* <LineChart data={data}>
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={3} />
        <Line type="monotone" dataKey="commission" stroke="#82ca9d" strokeWidth={3} />
      </LineChart> */}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
        <StatCard
          title="My Listings"
          value={trendListings.count}
          icon={Building2}
          trend={trendListings.trend}
          color="primary"
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
          trend={trendSales.trend}
          color="success"
        />
      </div>

      {/* Performance Chart */}
      <Card className="card-premium p-5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
          <ChartNoAxesColumnIncreasing className="h-7 w-6"/>
            My Performance Trend
          </CardTitle>
        </CardHeader>
          {/* Revenue / Commission Chart */}
          {/* <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <ClipboardList className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-lg mb-2">Coming Soon</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                This feature is currently under development and will be available shortly.
              </p>
            </div>
          </CardContent> */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <Card className="card-premium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IndianRupee className="h-5 w-5" />
                Revenue Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => `₹${Number(value).toLocaleString()}`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(var(--accent))" 
                    fill="hsl(var(--accent))" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Commission Chart */}
          <Card className="card-premium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Commission Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => `₹${Number(value).toLocaleString()}`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="commission" 
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary))" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </Card>

      {/* Content Row */}
      <div className="grid grid-cols-1 gap-6">
        {/* Tasks & Reminders */}
        <Card className="card-premium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Today's Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {agentTasks.length === 0 ? (
              // Empty state
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <ClipboardList className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <h3 className="font-medium text-lg mb-1">No tasks yet</h3>
                <p className="text-sm text-muted-foreground">
                  You don't have any tasks assigned for today.
                </p>
              </div>
            ) : (
              // Tasks list
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
            )}
          </CardContent>
        </Card>
      </div>

      {/* <div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">My Active Listings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agentProperties.length === 0 ? (
              <div className="col-span-full text-center text-muted-foreground">
                No properties found.
              </div>
            ) : (
              agentProperties.map((property) => (
                <Card key={property.propertyId} className="property-card group">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={property.property_photos?.[0] ?? "/placeholder.jpg"}
                      alt={property.title ?? "Property Image"}
                      className="property-image w-full h-full object-cover group-hover:scale-110 transition-transform"
                    />
                    {property.featured && (
                      <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                        Featured
                      </Badge>
                    )}
                  </div>

                  <CardContent className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg">{property.location}</h3>
                      <div className="flex items-center text-muted-foreground text-sm">
                        <MapPin className="h-4 w-4 mr-1" />
                        {property.landmark}
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <Badge variant="outline" className="text-xs">
                        {property.store_model}
                      </Badge>
                    </div>

                    <div className="flex justify-between text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <LandPlot className="h-5 w-5 mr-1" />
                        {property.store_size} sqft
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {property.about_property}
                    </p>

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setSelectedProperty(property);
                          setShowViewModal(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" /> View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {showViewModal && selectedProperty && (
            <Modal
              isOpen={showViewModal}
              onClose={() => setShowViewModal(false)}
              title="Property Details"
              size="xl"
            >
              <div className="p-4 space-y-4">
                <h2 className="text-xl font-semibold">{selectedProperty.location}</h2>
                <p className="text-sm text-muted-foreground">
                  {selectedProperty.about_property}
                </p>
                <img
                  src={selectedProperty.property_photos?.[0] ?? "/placeholder.jpg"}
                  className="rounded-md w-full h-64 object-cover"
                />
              </div>
            </Modal>
          )}
        </div>
      </div> */}
    </div>
  );
};

export default AgentDashboard;