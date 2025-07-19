
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { User, UserRole, Group } from '@/types/auth';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import UserModal from '@/components/UserModal';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import { supabase } from '@/integrations/supabase/client';

const Usuarios: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  const [userModalOpen, setUserModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchUsersAndGroups();
  }, []);

  const fetchUsersAndGroups = async () => {
    try {
      setLoading(true);
      
      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) {
        console.error('Error fetching users:', usersError);
        toast({
          title: "Erro ao carregar usuários",
          description: "Não foi possível carregar a lista de usuários.",
          variant: "destructive",
        });
        return;
      }

      // Fetch groups
      const { data: groupsData, error: groupsError } = await supabase
        .from('groups')
        .select('*')
        .order('name');

      if (groupsError) {
        console.error('Error fetching groups:', groupsError);
        toast({
          title: "Erro ao carregar grupos",
          description: "Não foi possível carregar a lista de grupos.",
          variant: "destructive",
        });
      }

      const formattedUsers: User[] = usersData.map(profile => ({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role as UserRole,
        groupId: profile.group_id
      }));

      const formattedGroups: Group[] = groupsData?.map(group => ({
        id: group.id,
        name: group.name,
        powerBiUrl: group.power_bi_url || undefined,
        formUrl: group.form_url || undefined,
        createdAt: group.created_at
      })) || [];

      console.log('Usuarios: Loaded users:', formattedUsers);
      console.log('Usuarios: Loaded groups:', formattedGroups);

      setUsers(formattedUsers);
      setGroups(formattedGroups);
    } catch (error) {
      console.error('Error fetching users and groups:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setUserModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setUserModalOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    if (currentUser?.id === user.id && currentUser.role === 'admin') {
      toast({
        title: "Ação não permitida",
        description: "Administradores não podem excluir a si mesmos.",
        variant: "destructive",
      });
      return;
    }
    
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  const handleSaveUser = async (userData: Partial<User> & { password?: string }) => {
    try {
      if (selectedUser) {
        // Update existing user
        const { error } = await supabase
          .from('profiles')
          .update({
            name: userData.name,
            email: userData.email,
            role: userData.role,
            group_id: userData.groupId
          })
          .eq('id', selectedUser.id);

        if (error) {
          console.error('Error updating user:', error);
          toast({
            title: "Erro ao atualizar usuário",
            description: "Não foi possível atualizar o usuário.",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Usuário atualizado",
          description: "As informações do usuário foram atualizadas com sucesso.",
        });
      } else {
        // Create new user - this would need to be handled through Supabase Auth
        // For now, we'll show a message that this needs to be implemented
        toast({
          title: "Funcionalidade em desenvolvimento",
          description: "A criação de novos usuários será implementada em breve.",
          variant: "destructive",
        });
        return;
      }

      await fetchUsersAndGroups(); // Refresh the list
      setUserModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error saving user:', error);
      toast({
        title: "Erro ao salvar usuário",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    }
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userToDelete.id);

      if (error) {
        console.error('Error deleting user:', error);
        toast({
          title: "Erro ao excluir usuário",
          description: "Não foi possível excluir o usuário.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Usuário excluído",
        description: `O usuário ${userToDelete.name} foi excluído com sucesso.`,
      });

      await fetchUsersAndGroups(); // Refresh the list
      setUserToDelete(null);
      setDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Erro ao excluir usuário",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    }
  };

  const getRoleBadge = (role: UserRole) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      coordenador: 'bg-blue-100 text-blue-800',
      usuario: 'bg-green-100 text-green-800'
    };

    const labels = {
      admin: 'Administrador',
      coordenador: 'Coordenador',
      usuario: 'Usuário'
    };

    return (
      <Badge className={colors[role]}>
        {labels[role]}
      </Badge>
    );
  };

  const getGroupName = (groupId: string | null) => {
    if (!groupId) return '-';
    
    const group = groups.find(g => g.id === groupId);
    return group ? group.name : 'Grupo não encontrado';
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gerenciar Usuários</h1>
            <p className="text-gray-600">Carregando usuários...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar Usuários</h1>
          <p className="text-gray-600">Administre todos os usuários do sistema</p>
        </div>
        <Button onClick={handleCreateUser}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Busque e filtre usuários</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os roles</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="coordenador">Coordenador</SelectItem>
                <SelectItem value="usuario">Usuário</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
          <CardDescription>
            Total de {filteredUsers.length} usuário(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium text-gray-900">Nome</th>
                  <th className="text-left p-3 font-medium text-gray-900">Email</th>
                  <th className="text-left p-3 font-medium text-gray-900">Role</th>
                  <th className="text-left p-3 font-medium text-gray-900">Grupo</th>
                  <th className="text-left p-3 font-medium text-gray-900">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      {users.length === 0 ? 'Nenhum usuário encontrado.' : 'Nenhum usuário corresponde aos filtros aplicados.'}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">{user.name}</td>
                      <td className="p-3 text-gray-600">{user.email}</td>
                      <td className="p-3">{getRoleBadge(user.role)}</td>
                      <td className="p-3 text-gray-600">
                        {getGroupName(user.groupId)}
                      </td>
                      <td className="p-3">
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteUser(user)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <UserModal
        isOpen={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        user={selectedUser}
        onSave={handleSaveUser}
      />

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDeleteUser}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir o usuário ${userToDelete?.name}? Esta ação não poderá ser desfeita.`}
      />
    </div>
  );
};

export default Usuarios;
