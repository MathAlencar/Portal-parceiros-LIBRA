import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Menu } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client'; // SupaBase para realizar a chamada no backend;
import { Group } from '@/types/auth'; // Modal do grupo;

interface HeaderProps {
  onMenuToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const { profile, signOut } = useAuth();
  const [userGroup, setUserGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'coordenador':
        return 'Coordenador';
      case 'usuario':
        return 'Usuário';
      default:
        return 'Usuário';
    }
  };

  // Buscando a informação do grupo do usuário;
  const fetchUserGroupData = async () => {
      try {
        
        if (profile?.group_id) {
          const { data: groupData, error } = await supabase
            .from('groups')
            .select('*')
            .eq('id', profile.group_id)
            .single();
  
          if (error) {
            console.error('Error fetching user group:', error);
          } else {
            const formattedGroup: Group = {
              id: groupData.id,
              name: groupData.name,
              powerBiUrl: groupData.power_bi_url || undefined,
              formUrl: groupData.form_url || undefined,
              createdAt: groupData.created_at
            };
            setUserGroup(formattedGroup);
          }
        } else {
          setUserGroup(null);
        }
      } catch (error) {
        console.error('Error fetching user group data:', error);
      } finally {
        setLoading(false);
      }
  };

 useEffect(() => {
  if (!profile) return;

  // se não for admin e ainda não temos userGroup
  if (profile.role !== 'admin' && !userGroup) {
    fetchUserGroupData();
  }
}, [profile, userGroup]);


  const UserHeader = () => (
    <header className="bg-gradient-to-r from-white-700 to-blue-600 text-black shadow-md">
      <div className="container mx-auto flex items-center justify-between px-8 py-5">
        <img
          src="https://www.libracredito.com.br/images/site/logo-libra-credito.png"
          alt="Logo Libra Crédito"
          className="h-10"
        />

        {/* Informações do usuário e botão de logout */}
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-lg font-semibold leading-tight">
              {profile?.name || 'Usuário'}
            </p>
            <p className="text-sm opacity-80">
              Grupo - {userGroup?.name || 'Sem Grupo'}
            </p>
          </div>
          <Button
            onClick={signOut}
            className="flex items-center gap-2 rounded-full px-4 py-2 bg-yellow-400 text-blue-800 hover:bg-yellow-500 hover:text-white"
          >
            <LogOut className="h-5 w-5" />
            Sair
          </Button>
        </div>
      </div>
    </header>
  )

  const AdminHeader = () => (
    <div className="bg-white shadow-sm border-b px-6 py-4">
      <div className="flex items-center justify-between w-full">
        <div className="text-xl font-semibold text-foreground">
          Gerenciamento
        </div >
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">{profile?.name || 'Usuário'}</p>
            <p className="text-xs text-muted-foreground">
              {profile?.role ? getRoleDisplay(profile.role) : 'Carregando...'}
            </p>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={signOut}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {profile?.role === 'admin' ? <AdminHeader /> : <UserHeader />}
    </>
  );
};

export default Header;
