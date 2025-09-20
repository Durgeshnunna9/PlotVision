import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  phone?: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({ full_name: '', email: '', phone: '', role: 'agent' });
  const { toast } = useToast();

  // Fetch users
  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      console.log({ data, error });
      if (error) throw error;
      setUsers(data || []);
      console.log(data);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Update role
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

  // Delete user
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

  // Create user
  const createUser = async () => {
    try {
      const { data, error } = await supabase.from('profiles').insert(newUser).select().single();
      if (error) throw error;
      toast({ title: 'Success', description: 'User created successfully' });
      setShowCreateModal(false);
      setNewUser({ full_name: '', email: '', phone: '', role: 'agent' });
      fetchUsers();
      console.log(data);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage user roles and permissions</p>
        </div>
        {/* CREATE USER BUTTON */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button>Create User</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Full Name</Label>
                <Input value={newUser.full_name} onChange={e => setNewUser({ ...newUser, full_name: e.target.value })} />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={newUser.phone} onChange={e => setNewUser({ ...newUser, phone: e.target.value })} />
              </div>
              <div>
                <Label>Role</Label>
                <Select value={newUser.role} onValueChange={v => setNewUser({ ...newUser, role: v })}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agent">Agent</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={createUser} className="btn-primary">Save User</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {users.map(user => (
          <Card key={user.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{user.full_name || 'No name'}</CardTitle>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  {user.phone && <p className="text-sm text-muted-foreground">{user.phone}</p>}
                </div>
                <Badge variant={getRoleBadgeVariant(user.role)}>{user.role || 'No role'}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Select value={user.role || 'agent'} onValueChange={v => updateUserRole(user.id, v)}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agent">Agent</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="destructive" onClick={() => deleteUser(user.id)}>Delete</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UserManagement;
