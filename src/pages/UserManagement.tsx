import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface UserWithRole {
  id: string;
  full_name: string;
  avatar_url?: string;
  phone?: number;
  email?: string;
  role?: string;
}

const UserManagement = () => {
  const [members, setMembers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch profiles with their roles from user_roles table
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, phone');
      
      if (profilesError) throw profilesError;

      // Fetch user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');
      
      if (rolesError) throw rolesError;

      // Combine profiles with roles
      const usersWithRoles = profilesData?.map(profile => {
        const userRole = rolesData?.find(r => r.user_id === profile.id);
        return {
          ...profile,
          role: userRole?.role || 'agent'
        };
      }) || [];

      setMembers(usersWithRoles);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      // Delete existing role
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      // Insert new role
      const { error } = await supabase
        .from('user_roles')
        .insert([{ user_id: userId, role: newRole as 'admin' | 'manager' | 'agent' }]);

      if (error) throw error;
      
      toast({ title: 'Success', description: 'User role updated successfully' });
      fetchUsers();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      // Delete role first (will cascade)
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      // Delete profile
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      
      toast({ title: 'Deleted', description: 'User removed successfully' });
      fetchUsers();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'manager': return 'secondary';
      case 'agent': return 'default';
      default: return 'outline';
    }
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
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">Manage user roles and permissions</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {members.map(user => (
          <Card key={user.id} className="flex flex-col items-center text-center p-4">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-2xl mb-4">
              {user.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
            </div>
            
            {/* Name */}
            <CardTitle className="text-lg font-semibold mb-2">{user.full_name || 'No Name'}</CardTitle>
            
            {/* Role Badge */}
            <Badge variant={getRoleBadgeVariant(user.role || 'agent')} className="mb-4">
              {user.role || 'agent'}
            </Badge>
            
            {/* Role Select */}
            <Select 
              value={user.role || 'agent'} 
              onValueChange={v => updateUserRole(user.id, v)}
            >
              <SelectTrigger className="w-40 mx-auto mb-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="agent">Agent</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Delete Button */}
            <div className="flex gap-2 mt-2">
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => deleteUser(user.id)}
              >
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {members.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">No users found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserManagement;
