import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Define user type according to your table
interface User {
  id: string;
  full_name: string;
  role: string;
  avatar_url?: string;
  created_at: string;
}

const UserManagement = () => {
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) throw error;
      setMembers(data ?? []);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
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
      const { error } = await supabase.from('profiles').delete().eq('id', userId);
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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {members.map(user => (
        <Card key={user.id} className="flex flex-col items-center text-center p-4">
          {/* Avatar */}
          <img
            src={user.avatar_url || '/default-avatar.png'}
            alt={user.full_name || 'User'}
            className="w-24 h-24 rounded-full object-cover mb-4"
          />
          {/* Name */}
          <CardTitle className="text-lg font-semibold">{user.full_name || 'No Name'}</CardTitle>
          {/* Role Badge */}
          <Badge variant={getRoleBadgeVariant(user.role)} className="my-2">{user.role || 'No Role'}</Badge>
          {/* Role Select */}
          <Select value={user.role || 'agent'} onValueChange={v => updateUserRole(user.id, v)}>
            <SelectTrigger className="w-40 mx-auto mb-2"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="agent">Agent</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          {/* Buttons */}
          <div className="flex gap-2 mt-2">
            <Button onClick={() => updateUserRole(user.id, user.role)} className="btn-secondary">Edit</Button>
            <Button variant="destructive" onClick={() => deleteUser(user.id)}>Delete</Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default UserManagement;
