import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
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

const roleOptions = ["admin", "manager", "agent"] as const;

const UserManagement = () => {
  const [members, setMembers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editedRole, setEditedRole] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data: profilesData, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, phone, role');

      if (error) throw error;

      const usersWithRoles = profilesData?.map(profile => ({
        ...profile,
        role: profile.role || 'agent',
      })) || [];

      setMembers(usersWithRoles);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'admin' | 'manager' | 'agent') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      toast({ title: 'Success', description: 'User role updated successfully' });
      fetchUsers();
      setEditingUserId(null);
      setEditedRole('');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
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

  const getRoleBadgeVariant = (role: "admin" | "agent" | "manager") => {
    switch (role) {
      case 'admin': return 'indigo';
      case 'manager': return 'pink';
      case 'agent': return 'amber';
      default: return 'outline';
    }
  };

  const handleEditClick = (userId: string, currentRole: string) => {
    setEditingUserId(userId);
    setEditedRole(currentRole);
  };

  const handleCancelClick = () => {
    setEditingUserId(null);
    setEditedRole('');
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
            <Badge variant={getRoleBadgeVariant(user.role as "admin" | "agent" | "manager")} className="mb-4">
              {user.role || 'agent'}
            </Badge>
            
            {/* Role Select */}
            <Select
              value={editingUserId === user.id ? editedRole : user.role || 'agent'}
              onValueChange={v => setEditedRole(v)}
              disabled={editingUserId !== user.id}
            >
              <SelectTrigger className="w-40 mx-auto mb-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map(r => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Buttons */}
            <div className="flex gap-2 mt-2">
              {editingUserId === user.id ? (
                <>
                  <Button
                    variant="green"
                    size="sm"
                    onClick={() => updateUserRole(user.id, editedRole as "admin" | "manager" | "agent")}
                  >
                    Save
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleCancelClick}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="teal"
                    size="sm"
                    onClick={() => handleEditClick(user.id, user.role || 'agent')}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteUser(user.id)}
                  >
                  Delete
                </Button>
              </>
                
              )}
              
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
