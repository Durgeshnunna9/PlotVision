import React, { useEffect, useState } from 'react';
import StatCard from '@/components/dashboard/StatCard';
import PropertyCard from '@/components/dashboard/PropertyCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserCheck, Building2, Users, ClipboardList, Star, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

const ManagerDashboard = () => {
  const managerId = 'manager1'; // Replace with auth user ID if using Supabase Auth

  const [agents, setAgents] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
 
  const [previousAgentsCount, setPreviousAgentsCount] = useState(0);
  const [previousPropertiesCount, setPreviousPropertiesCount] = useState(0);
  const [previousClientsCount, setPreviousClientsCount] = useState(0);
  const [previousOpenTasksCount, setPreviousOpenTasksCount] = useState(0);
  const PREDEFINED_TASKS = [
    "Daily Report",
    "Client Follow-up",
    "System Check",
    "Data Entry",
  ];
  const [open, setOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string>("");
  const [selectedTask, setSelectedTask] = useState<string>("");
  const [customTask, setCustomTask] = useState("");

  useEffect(() => {
    if (!managerId) return;

    const fetchAgents = async () => {
      const { data, error } = await supabase
        .from("agents")
        .select("id, name")
        .eq("manager_id", managerId);

      if (!error && data) setAgents(data);
    };
    fetchAgents();
  }, [managerId]);

  // Handle assign task
  const handleAssign = async () => {
    if (!selectedAgent || (!selectedTask && !customTask)) return;

    const taskToAssign = selectedTask || customTask;

    const { error } = await supabase.from("tasks").insert([
      {
        agent_id: selectedAgent,
        task_name: taskToAssign,
        status: "Pending",
      },
    ]);

    if (!error) {
      setOpen(false);
      setSelectedAgent("");
      setSelectedTask("");
      setCustomTask("");
    }
  };

  useEffect(() => { // This is for trends
    const fetchData = async () => {
      // Current period counts
      const { data: agentsData } = await supabase.from('agents').select('*');
      const { data: propertiesData } = await supabase.from('properties').select('*');
      const { data: clientsData } = await supabase.from('clients').select('*');
      const { data: tasksData } = await supabase.from('tasks').select('*');
  
      setAgents(agentsData || []);
      setProperties(propertiesData || []);
      setClients(clientsData || []);
      setTasks(tasksData || []);
  
      // Previous period counts (example: last month)
      const { data: prevAgents } = await supabase
        .from('agents')
        .select('*')
        .lt('created_at', new Date(new Date().setMonth(new Date().getMonth() - 1)));
      
      const { data: prevProperties } = await supabase
        .from('properties')
        .select('*')
        .lt('created_at', new Date(new Date().setMonth(new Date().getMonth() - 1)));
  
      const { data: prevClients } = await supabase
        .from('clients')
        .select('*')
        .lt('created_at', new Date(new Date().setMonth(new Date().getMonth() - 1)));
  
      const { data: prevOpenTasks } = await supabase
        .from('tasks')
        .select('*')
        .lt('created_at', new Date(new Date().setMonth(new Date().getMonth() - 1)))
        .neq('status', 'completed');
  
      setPreviousAgentsCount(prevAgents?.length || 0);
      setPreviousPropertiesCount(prevProperties?.length || 0);
      setPreviousClientsCount(prevClients?.length || 0);
      setPreviousOpenTasksCount(prevOpenTasks?.length || 0);
    };
  
    fetchData();
  }, []);
  const calculateTrend = (current: number, previous: number) => {
    const value = current - previous;
    return { value, isPositive: value >= 0 };
  };
  
  const agentTrend = calculateTrend(agents.length, previousAgentsCount);
  const propertyTrend = calculateTrend(properties.length, previousPropertiesCount);
  const clientTrend = calculateTrend(clients.length, previousClientsCount);
  const openTasksTrend = calculateTrend(
    tasks.filter(t => t.status !== 'completed').length,
    previousOpenTasksCount
  );
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // 1️⃣ Fetch agents
      const { data: agentsData } = await supabase
        .from('agents')
        .select('*')
        .eq('manager_id', managerId);
      setAgents(agentsData || []);

      const agentIds = agentsData?.map(a => a.id) || [];

      // 2️⃣ Fetch properties assigned to agents
      const { data: propertiesData } = await supabase
        .from('properties')
        .select('*')
        .in('assigned_agent_id', agentIds);
      setProperties(propertiesData || []);

      // 3️⃣ Fetch clients assigned to agents
      const { data: clientsData } = await supabase
        .from('clients')
        .select('*')
        .in('assigned_agent_id', agentIds);
      setClients(clientsData || []);

      // 4️⃣ Fetch tasks assigned to agents
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('*')
        .in('assigned_to', agentIds);
      setTasks(tasksData || []);

      setLoading(false);
    };

    fetchData();
  }, [managerId]);

  const teamPerformance = agents.map(agent => ({
    name: agent.name.split(' ')[0],
    sales: (agent.total_sales ?? 0) / 1000,
    listings: agent.active_listings ?? 0,
    clients: agent.clients_count ?? 0
  }));

  const getAgentStatusColor = (rating: number) => {
    if (rating >= 4.8) return 'bg-success text-success-foreground';
    if (rating >= 4.5) return 'bg-accent text-accent-foreground';
    if (rating >= 4.0) return 'bg-warning text-warning-foreground';
    return 'bg-secondary text-secondary-foreground';
  };

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manager Dashboard</h1>
          <p className="text-muted-foreground">Oversee your team's performance and manage operations.</p>
        </div>
        <Button className="btn-gradient" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Assign Task
        </Button>

        {/* Modal */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Assign Task</DialogTitle>
              <DialogDescription>
                Select an agent and assign them a task.
              </DialogDescription>
            </DialogHeader>

            {/* Agent Selection */}
            {agents.length > 0 ? (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Select Agent</label>
                <select
                  className="w-full border rounded p-2"
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value)}
                >
                  <option value="">-- Select Agent --</option>
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <p className="text-sm text-gray-500 mb-4">No agents assigned to you yet.</p>
            )}

            {/* Predefined Tasks */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Choose Task</label>
              <div className="flex flex-wrap gap-2">
                {PREDEFINED_TASKS.map((task) => (
                  <Button
                    key={task}
                    variant={selectedTask === task ? "default" : "outline"}
                    onClick={() => {
                      setSelectedTask(task);
                      setCustomTask("");
                    }}
                  >
                    {task}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Task Input */}
            <div className="mb-4">
              <Input
                placeholder="Or enter a custom task"
                value={customTask}
                onChange={(e) => {
                  setCustomTask(e.target.value);
                  setSelectedTask("");
                }}
              />
            </div>

            <DialogFooter>
              <Button onClick={handleAssign} disabled={!selectedAgent}>
                Assign
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Team Members" value={agents.length} icon={UserCheck} trend={agentTrend} color="primary" />
        <StatCard title="Team Properties" value={properties.length} icon={Building2} trend={propertyTrend} color="success" />
        <StatCard title="Team Clients" value={clients.length} icon={Users} trend={clientTrend} color="purple" />
        <StatCard title="Open Tasks" value={tasks.filter(t => t.status !== 'completed').length} icon={ClipboardList} trend={openTasksTrend} color="accent" />
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
                  name === 'sales' ? 'Sales' : name === 'listings' ? 'Active Listings' : 'Clients'
                ]}
              />
              <Bar dataKey="sales" fill="hsl(var(--primary))" name="sales" radius={[2, 2, 0, 0]} />
              <Bar dataKey="listings" fill="hsl(var(--accent))" name="listings" radius={[2, 2, 0, 0]} />
              <Bar dataKey="clients" fill="hsl(var(--success))" name="clients" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Team Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {agents.map(agent => (
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
                    <Badge className={getAgentStatusColor(agent.rating ?? 0)}>
                      <Star className="h-3 w-3 mr-1" />
                      {agent.rating ?? '0'}
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-1">
                      ${(agent.total_sales ?? 0).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-border">
                  <div className="text-center">
                    <p className="text-lg font-semibold text-primary">{agent.active_listings ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Listings</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-success">{agent.clients_count ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Clients</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-accent">
                      ${( (agent.total_sales ?? 0) / 1000000).toFixed(1)}M
                    </p>
                    <p className="text-xs text-muted-foreground">Sales</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Properties */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Recent Team Properties</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.slice(0, 6).map(property => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
