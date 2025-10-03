import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, UserPlus, X } from 'lucide-react';

interface Manager {
  id: string;
  full_name: string;
  avatar_url?: string;
}

interface Agent {
  id: string;
  full_name: string;
  avatar_url?: string;
}

interface Assignment {
  manager_id: string;
  agent_id: string;
  agent_name: string;
  assignment_id: string;
}

const Managers = () => {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedManager, setSelectedManager] = useState<string>('');
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch managers
      const { data: managerRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'manager');

      const managerIds = managerRoles?.map(r => r.user_id) || [];

      if (managerIds.length > 0) {
        const { data: managersData } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', managerIds);
        
        setManagers(managersData || []);
      }

      // Fetch agents
      const { data: agentRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'agent');

      const agentIds = agentRoles?.map(r => r.user_id) || [];

      if (agentIds.length > 0) {
        const { data: agentsData } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', agentIds);
        
        setAgents(agentsData || []);
      }

      // Fetch assignments
      const { data: assignmentsData } = await supabase
        .from('manager_agents')
        .select('id, manager_id, agent_id');

      if (assignmentsData) {
        const enrichedAssignments = await Promise.all(
          assignmentsData.map(async (assignment) => {
            const agent = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', assignment.agent_id)
              .single();
            
            return {
              manager_id: assignment.manager_id,
              agent_id: assignment.agent_id,
              agent_name: agent.data?.full_name || 'Unknown',
              assignment_id: assignment.id
            };
          })
        );
        
        setAssignments(enrichedAssignments);
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const assignAgentToManager = async () => {
    if (!selectedManager || !selectedAgent) {
      toast({ title: 'Error', description: 'Please select both manager and agent', variant: 'destructive' });
      return;
    }

    try {
      const { error } = await supabase
        .from('manager_agents')
        .insert({
          manager_id: selectedManager,
          agent_id: selectedAgent
        });

      if (error) throw error;

      toast({ title: 'Success', description: 'Agent assigned to manager successfully' });
      setSelectedManager('');
      setSelectedAgent('');
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const removeAssignment = async (assignmentId: string) => {
    try {
      const { error } = await supabase
        .from('manager_agents')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;

      toast({ title: 'Success', description: 'Assignment removed successfully' });
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const getAgentsByManager = (managerId: string) => {
    return assignments.filter(a => a.manager_id === managerId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Manager-Agent Assignments</h1>
        <p className="text-muted-foreground">Assign agents to managers for better team organization</p>
      </div>

      {/* Assignment Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Assign Agent to Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={selectedManager} onValueChange={setSelectedManager}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select Manager" />
              </SelectTrigger>
              <SelectContent>
                {managers.map(manager => (
                  <SelectItem key={manager.id} value={manager.id}>
                    {manager.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedAgent} onValueChange={setSelectedAgent}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select Agent" />
              </SelectTrigger>
              <SelectContent>
                {agents.map(agent => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={assignAgentToManager}>
              Assign
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Managers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {managers.map(manager => {
          const managerAgents = getAgentsByManager(manager.id);
          
          return (
            <Card key={manager.id}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                    {manager.full_name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{manager.full_name}</CardTitle>
                    <p className="text-sm text-muted-foreground">Manager</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium mb-3">
                    <Users className="h-4 w-4" />
                    Assigned Agents ({managerAgents.length})
                  </div>
                  
                  {managerAgents.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No agents assigned</p>
                  ) : (
                    <div className="space-y-2">
                      {managerAgents.map(assignment => (
                        <div
                          key={assignment.assignment_id}
                          className="flex items-center justify-between p-2 bg-muted rounded-lg"
                        >
                          <span className="text-sm">{assignment.agent_name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAssignment(assignment.assignment_id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {managers.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No managers found</h3>
            <p className="text-muted-foreground">
              Assign users the "Manager" role in User Management first
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Managers;
