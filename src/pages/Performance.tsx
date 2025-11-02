import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Target, Award, IndianRupee, Building, Users, Calendar, Star, BarChart as BarChartIcon, } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
// import { supabase } from '@/lib/supabaseClient';
import { useState, useEffect } from 'react';

const Performance = () => {
  const { user } = useAuth()
  const [agent, setAgent] = useState<any>(null)
  const [properties, setProperties] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [monthlyPerformance, setMonthlyPerformance] = useState<any[]>([])

  // Fetch all needed data
  useEffect(() => {
    // if (!user) return

    // const fetchData = async () => {
    //   // Agent profile
    //   const { data: agentData } = await supabase
    //     .from("profiles")
    //     .select("*")
    //     .eq("id", user.id)
    //     .single()
    //   setAgent(agentData)

    //   // Properties assigned to agent
    //   const { data: propsData } = await supabase
    //     .from("properties")
    //     .select("*")
    //     .eq("agent_id", user.id)
    //     .order("created_at", { ascending: false })
    //   setProperties(propsData || [])

      

    //   // Sales trend (aggregate deals per month)
    //   const { data: perfData, error } = await supabase.rpc("get_agent_performance", {
    //     agent_uuid: user.id,
    //     interval: "month",
    //   })
    //   if (!error) setMonthlyPerformance(perfData || [])
    // }

    

    // const fetchData = async () => {
    //   const [agentRes, propsRes] = await Promise.all([
    //     fetch(`http://localhost:8090/agent/${user.id}`),
    //     fetch(`http://localhost:8090/properties/agent/agentId`),
    //     // fetch(`http://localhost:8090/performance/agent/agentId`),
    //   ]);
  
    //   const agentData = await agentRes.json();
    //   const propsData = await propsRes.json();
    //   // const perfData = await perfRes.json();
  
    //   setAgent(agentData);
    //   setProperties(propsData);
    //   // setMonthlyPerformance(perfData);
    // };
    const fetchData = async () => {
      if (!user) return;
      try{
        const agentResponse = await fetch(`http://localhost:8090/agents/user/${user.id}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        });
    
        if (!agentResponse.ok) throw new Error("Failed to get agent data");
    
        const agentResult = await agentResponse.json();
        console.log("Agent Loaded:", agentResult);
    
        const propertyResponse = await fetch("http://localhost:8090/performance/agent/${agent.agentId}", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!propertyResponse.ok) throw new Error("Failed to get property data");
    
        const propertyResult = await propertyResponse.json();
        console.log("Agent Loaded:", propertyResult);
      }
      catch(error){
        console.error("Error fetching data:", error)
        setAgent(null)
        setProperties([])
      }
    };
    fetchData()
  },[user])
     
    
    

  
  

  // Example goals (could also be in DB)
  const goals = [
    {
      title: "Monthly Sales Target",
      current: agent?.this_month_sales || 0,
      target: agent?.monthly_sales_target || 500000,
      percentage: ((agent?.this_month_sales || 0) / (agent?.monthly_sales_target || 1)) * 100,
      icon: IndianRupee,
      color: "text-primary",
    },
    {
      title: "New Listings Goal",
      current: agent?.this_month_listings || 0,
      target: 6,
      percentage: ((agent?.this_month_listings || 0) / 6) * 100,
      icon: Building,
      color: "text-success",
    },
    {
      title: "Client Acquisition",
      current: agent?.this_month_clients || 0,
      target: 8,
      percentage: ((agent?.this_month_clients || 0) / 8) * 100,
      icon: Users,
      color: "text-accent",
    },
    {
      title: "Customer Rating",
      current: agent?.rating || 0,
      target: 5,
      percentage: ((agent?.rating || 0) / 5) * 100,
      icon: Star,
      color: "text-warning",
    },
  ]

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Performance</h1>
          <p className="text-muted-foreground">Track your personal metrics and achievements</p>
        </div>
        <Badge className="bg-primary/10 text-primary px-4 py-2 text-lg hover:bg-gray-200">
          Rating: {agent?.rating || 0.0}/5.0
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* 🟢 Total Sales */}
      <Card className="card-premium">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Sales</p>
              <p className="text-2xl font-bold text-primary">
                ₹
                {agent?.total_sales
                  ? (agent.total_sales / 1000000).toFixed(1) + "K"
                  : "0.0"}
              </p>
            </div>
            <IndianRupee className="h-8 w-8 text-primary" />
          </div>
        </CardContent>
      </Card>

      {/* 🟢 Active Listings */}
      <Card className="card-premium">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Listings</p>
              <p className="text-2xl font-bold text-success">
                {agent?.active_listings ?? 0}
              </p>
            </div>
            <Building className="h-8 w-8 text-success" />
          </div>
        </CardContent>
      </Card>

      {/* 🟢 Active Clients */}
      <Card className="card-premium">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Clients</p>
              <p className="text-2xl font-bold text-accent">
                {agent?.clients_count ?? 0}
              </p>
            </div>
            <Users className="h-8 w-8 text-accent" />
          </div>
        </CardContent>
      </Card>

      {/* 🟢 Avg. Days to Close */}
      <Card className="card-premium">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg. Days to Close</p>
              <p className="text-2xl font-bold text-warning">
                {agent?.avg_days_to_close ?? 0}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-warning" />
          </div>
        </CardContent>
      </Card>
    </div>

      {/* Goals */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Monthly Goals Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {agent && goals.map((goal, i) => {
              const Icon = goal.icon
              return (
                <div key={i} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-5 w-5 ${goal.color}`} />
                      <span className="font-medium">{goal.title}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {goal.percentage.toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={goal.percentage} className="h-2" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{goal.current}</span>
                    <span>{goal.target}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
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
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip formatter={(val) => [`$${Number(val).toLocaleString()}`, "Sales"]} />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={3} />
                <Line type="monotone" dataKey="commission" stroke="hsl(var(--accent))" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Activity */}
        <Card className="card-premium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChartIcon className="h-5 w-5" />
              Monthly Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="deals" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} name="Deals" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Performance