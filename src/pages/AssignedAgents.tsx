"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import ClientsModal from "@/components/dashboard/ClientsModal";
import {
  UserCheck,
  Plus,
  Search,
  Mail,
  Phone,
  TrendingUp,
  Building,
  Users,
  Star,
  Edit,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";

type AgentRole = "admin" | "agent" | "manager" | string;

type Agent = {
  id: string;
  full_name: string;
  phone?: string;
  email?: string;
  avatar_url?: string;
  role: AgentRole;
  specialization?: string;
  totalSales?: number;
  activeListings?: number;
  clientsCount?: number;
  rating?: number;
};

type Client = {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  agent_id: string;
};

const Agents = () => {
  const { user } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  // Fetch all agents
  const fetchAgents = async () => {
    setIsLoading(true);
    try {
      // Step 1: Get current user's id and role
      const currentUserId = user?.id;
      const currentUserRole = user?.role;
  
      if (!currentUserId) {
        console.warn("No authenticated user found");
        setAgents([]);
        setIsLoading(false);
        return;
      }
  
      let agentData: Agent[] = [];
  
      // Step 2: Branch logic based on role
      if (currentUserRole === "admin") {
        // Admins see all agents
        let query = supabase.from("profiles").select("*").eq("role", "agent");
  
        if (searchTerm) {
          query = query.or(
            `full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`
          );
        }
  
        const { data, error } = await query;
        if (error) throw error;
        agentData = data || [];
  
      } else if (currentUserRole === "manager") {
        // Managers see only their assigned agents
        const { data: assignments, error: assignError } = await supabase
          .from("manager_agents")
          .select("agent_id")
          .eq("manager_id", currentUserId);
  
        if (assignError) throw assignError;
  
        const assignedAgentIds = (assignments || []).map(a => a.agent_id);
  
        if (assignedAgentIds.length === 0) {
          agentData = [];
        } else {
          let query = supabase
            .from("profiles")
            .select("*")
            .in("id", assignedAgentIds)
            .eq("role", "agent");
  
          if (searchTerm) {
            query = query.or(
              `full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`
            );
          }
  
          const { data, error } = await query;
          if (error) throw error;
          agentData = data || [];
        }
  
      } else {
        // Other roles see nothing (optional)
        agentData = [];
      }
  
      setAgents(agentData);
    } catch (err: any) {
      console.error("Error fetching agents:", err.message || err);
      setAgents([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch clients for a specific agent
  const fetchClients = async (agentId: string) => {
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("agent_id", agentId);
        console.log("Agents data:", data, "Error:", error);

      if (error) {
        console.error("Error fetching clients:", error.message);
        setClients([]);
      } else {
        setClients(data || []);
      }
    } catch (err) {
      console.error("Unexpected error fetching clients:", err);
      setClients([]);
    }
  };

  // Fetch agents on mount and on search term change
  useEffect(() => {
    if (!user) return;

    fetchAgents();

    // Setup real-time subscription
    const channel = supabase
      .channel("agents-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
          filter: "role=eq.agent",
        },
        () => {
          fetchAgents(); // refetch on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, searchTerm]);

  // Aggregate stats
  const totalSales = agents.reduce((sum, agent) => sum + (agent.totalSales || 0), 0);
  const avgRating =
    agents.length > 0
      ? agents.reduce((sum, agent) => sum + (agent.rating || 0), 0) / agents.length
      : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading agents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Agents</h1>
          <p className="text-muted-foreground">
            {user?.role === "manager"
              ? "Manage your team members"
              : "Manage all real estate agents"}
          </p>
        </div>
        {user?.role === "admin" && (
          <Button className="btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Agent
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-premium">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Total Agents</p>
              <p className="text-2xl font-bold">{agents.length}</p>
            </div>
            <UserCheck className="h-8 w-8 text-primary" />
          </CardContent>
        </Card>

        <Card className="card-premium">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Total Sales</p>
              <p className="text-2xl font-bold text-success">
                ₹{(totalSales / 1000000).toFixed(1)}K
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-success" />
          </CardContent>
        </Card>

        <Card className="card-premium">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Active Listings</p>
              <p className="text-2xl font-bold text-accent">
                {agents.reduce((sum, agent) => sum + (agent.activeListings || 0), 0)}
              </p>
            </div>
            <Building className="h-8 w-8 text-accent" />
          </CardContent>
        </Card>

        <Card className="card-premium">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Avg Rating</p>
              <p className="text-2xl font-bold text-warning">{avgRating.toFixed(1)}</p>
            </div>
            <Star className="h-8 w-8 text-warning" />
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Agents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Search by name, email, or specialization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-primary flex-1"
            />
            <div className="text-sm text-muted-foreground flex items-center">
              {agents.length} agents found
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <Card key={agent.id} className="card-premium">
            <CardHeader className="pb-3 flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-lg">
                  {agent.full_name?.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <CardTitle className="text-lg">{agent.full_name}</CardTitle>
                  <p className="text-sm text-muted-foreground capitalize">{agent.role}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
                {user?.role === "admin" && (
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Mail className="h-4 w-4 mr-2" />
                    {agent.email}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Phone className="h-4 w-4 mr-2" />
                    {agent.phone}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Sales</span>
                    <span className="text-sm font-bold text-primary">
                      ₹{((agent.totalSales ?? 0) / 1000000).toFixed(1)}
                    </span>
                  </div>
                  <Progress
                    value={Math.min(((agent.totalSales ?? 0) / 3000000) * 100, 100)}
                    className="h-2"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-muted/30">
                    <div className="text-lg font-bold text-primary">
                      {agent.activeListings ?? 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Listings</div>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/30">
                    <div className="text-lg font-bold text-success">{agent.clientsCount ?? 0}</div>
                    <div className="text-xs text-muted-foreground">Clients</div>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/30">
                    <div className="text-lg font-bold text-warning">{agent.rating ?? 0}</div>
                    <div className="text-xs text-muted-foreground">Rating</div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-1 text-sm">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= (agent.rating ?? 0)
                          ? "fill-warning text-warning"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-muted-foreground">({agent.rating ?? 0})</span>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={async () => {
                      setSelectedAgentId(agent.id);
                      await fetchClients(agent.id);
                      setShowModal(true);
                    }}
                  >
                    <Users className="h-4 w-4 mr-1" />
                    Clients
                  </Button>
                  {/* <ClientsModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    // clients={clients}
                  /> */}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {agents.length === 0 && (
        <Card className="card-premium">
          <CardContent className="text-center py-12">
            <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No agents found</h3>
            <p className="text-muted-foreground">Try adjusting your search criteria</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Agents;
