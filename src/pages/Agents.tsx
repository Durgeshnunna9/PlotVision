import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { UserCheck, Plus, Search, Mail, Phone, TrendingUp, Building, Users, Star, Edit, Trash2 } from 'lucide-react';
import { mockAgents, mockAnalytics } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';

const Agents = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter agents based on search term and user role
  const filteredAgents = mockAgents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Manager can only see their agents
    if (user?.role === 'manager') {
      return matchesSearch && agent.managerId === user.id;
    }
    
    return matchesSearch;
  });

  const totalSales = filteredAgents.reduce((sum, agent) => sum + agent.totalSales, 0);
  const avgRating = filteredAgents.reduce((sum, agent) => sum + agent.rating, 0) / filteredAgents.length;

  return (
    <div className="space-y-6 fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Agents</h1>
          <p className="text-muted-foreground">
            {user?.role === 'manager' ? 'Manage your team members' : 'Manage all real estate agents'}
          </p>
        </div>
        {user?.role === 'admin' && (
          <Button className="btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Agent
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-premium">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Agents</p>
                <p className="text-2xl font-bold">{filteredAgents.length}</p>
              </div>
              <UserCheck className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-premium">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Sales</p>
                <p className="text-2xl font-bold text-success">
                  ${(totalSales / 1000000).toFixed(1)}M
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-premium">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Listings</p>
                <p className="text-2xl font-bold text-accent">
                  {filteredAgents.reduce((sum, agent) => sum + agent.activeListings, 0)}
                </p>
              </div>
              <Building className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-premium">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
                <p className="text-2xl font-bold text-warning">
                  {avgRating.toFixed(1)}
                </p>
              </div>
              <Star className="h-8 w-8 text-warning" />
            </div>
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
              {filteredAgents.length} agents found
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAgents.map((agent) => (
          <Card key={agent.id} className="card-premium">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-lg">
                    {agent.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{agent.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{agent.specialization}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  {user?.role === 'admin' && (
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
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
                      ${(agent.totalSales / 1000000).toFixed(1)}M
                    </span>
                  </div>
                  <Progress value={(agent.totalSales / 3000000) * 100} className="h-2" />
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-muted/30">
                    <div className="text-lg font-bold text-primary">{agent.activeListings}</div>
                    <div className="text-xs text-muted-foreground">Listings</div>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/30">
                    <div className="text-lg font-bold text-success">{agent.clientsCount}</div>
                    <div className="text-xs text-muted-foreground">Clients</div>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/30">
                    <div className="text-lg font-bold text-warning">{agent.rating}</div>
                    <div className="text-xs text-muted-foreground">Rating</div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-1 text-sm">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= agent.rating ? 'fill-warning text-warning' : 'text-muted-foreground'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-muted-foreground">({agent.rating})</span>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Mail className="h-4 w-4 mr-1" />
                    Contact
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Users className="h-4 w-4 mr-1" />
                    Clients
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAgents.length === 0 && (
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