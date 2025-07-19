
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { User, UserRole, Group } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null;
  onSave: (userData: Partial<User> & { password?: string }) => void;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, user, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'usuario' as UserRole,
    groupId: 'none'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [groups, setGroups] = useState<Group[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const { toast } = useToast();

  // Fetch groups from Supabase
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoadingGroups(true);
        const { data, error } = await supabase
          .from('groups')
          .select('*')
          .order('name');

        if (error) {
          console.error('Error fetching groups:', error);
          toast({
            title: "Erro ao carregar grupos",
            description: "Não foi possível carregar a lista de grupos.",
            variant: "destructive",
          });
          return;
        }

        const formattedGroups: Group[] = data.map(group => ({
          id: group.id,
          name: group.name,
          powerBiUrl: group.power_bi_url || undefined,
          formUrl: group.form_url || undefined,
          createdAt: group.created_at
        }));

        console.log('UserModal: Loaded groups from Supabase:', formattedGroups);
        setGroups(formattedGroups);
      } catch (error) {
        console.error('Error fetching groups:', error);
        toast({
          title: "Erro ao carregar grupos",
          description: "Ocorreu um erro inesperado ao carregar grupos.",
          variant: "destructive",
        });
      } finally {
        setLoadingGroups(false);
      }
    };

    if (isOpen) {
      fetchGroups();
    }
  }, [isOpen, toast]);

  useEffect(() => {
    if (user) {
      console.log('UserModal: Setting form data for user:', user);
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
        groupId: user.groupId || 'none'
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'usuario',
        groupId: 'none'
      });
    }
    setErrors({});
  }, [user, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Formato de e-mail inválido';
    }

    if (!user && !formData.password.trim()) {
      newErrors.password = 'Senha é obrigatória';
    }

    if (!formData.role) {
      newErrors.role = 'Role é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const userData: Partial<User> & { password?: string } = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      groupId: formData.groupId === 'none' ? null : formData.groupId
    };

    if (formData.password) {
      userData.password = formData.password;
    }

    console.log('UserModal: Saving user data:', userData);
    onSave(userData);
    toast({
      title: user ? "Usuário atualizado" : "Usuário criado",
      description: user ? "Os dados do usuário foram atualizados com sucesso." : "Novo usuário foi criado com sucesso.",
    });
    onClose();
  };

  const getGroupName = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    return group ? group.name : 'Grupo não encontrado';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {user ? 'Editar Usuário' : 'Novo Usuário'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div>
            <Label htmlFor="email">E-mail *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
          </div>

          <div>
            <Label htmlFor="password">
              {user ? 'Nova Senha (deixe em branco para manter atual)' : 'Senha *'}
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className={errors.password ? 'border-red-500' : ''}
            />
            {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
          </div>

          <div>
            <Label>Role *</Label>
            <Select
              value={formData.role}
              onValueChange={(value: UserRole) => setFormData(prev => ({ ...prev, role: value }))}
            >
              <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
                <SelectValue placeholder="Selecione um role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="coordenador">Coordenador</SelectItem>
                <SelectItem value="usuario">Usuário</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && <p className="text-sm text-red-500 mt-1">{errors.role}</p>}
          </div>

          <div>
            <Label>Grupo</Label>
            <Select
              value={formData.groupId}
              onValueChange={(value) => setFormData(prev => ({ ...prev, groupId: value }))}
              disabled={loadingGroups}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingGroups ? "Carregando grupos..." : "Selecione um grupo (opcional)"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum grupo</SelectItem>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formData.groupId !== 'none' && (
              <p className="text-xs text-muted-foreground mt-1">
                Grupo selecionado: {getGroupName(formData.groupId)}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            {user ? 'Atualizar' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserModal;
