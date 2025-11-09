import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'user' | 'admin';
}

export const AdminUsers = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('email');

    if (profilesError || !profiles) {
      setLoading(false);
      return;
    }

    const usersWithRoles = await Promise.all(
      profiles.map(async (profile) => {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', profile.id)
          .eq('role', 'admin')
          .maybeSingle();

        return {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          role: roleData ? 'admin' : 'user',
        } as UserProfile;
      })
    );

    setUsers(usersWithRoles);
    setLoading(false);
  };

  const handleRoleChange = async (userId: string, newRole: 'user' | 'admin') => {
    try {
      if (newRole === 'admin') {
        // Add admin role
        const { error } = await supabase.from('user_roles').insert({
          user_id: userId,
          role: 'admin',
        });

        if (error) throw error;
      } else {
        // Remove admin role
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', 'admin');

        if (error) throw error;
      }

      toast({
        title: 'Sucesso',
        description: 'Função do usuário atualizada com sucesso.',
      });

      loadUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Falha ao atualizar a função do usuário.',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciar Usuários</CardTitle>
        <CardDescription>
          Visualize e altere as funções dos usuários
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center py-4 text-muted-foreground">Carregando usuários...</p>
        ) : users.length === 0 ? (
          <p className="text-center py-4 text-muted-foreground">Nenhum usuário encontrado</p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Nome Completo</TableHead>
                  <TableHead>Função</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.full_name || '-'}</TableCell>
                    <TableCell>
                      <Select
                        value={user.role}
                        onValueChange={(value: 'user' | 'admin') =>
                          handleRoleChange(user.id, value)
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">Usuário</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
