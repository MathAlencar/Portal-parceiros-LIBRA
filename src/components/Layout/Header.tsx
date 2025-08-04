import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Menu } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client'; // SupaBase para realizar a chamada no backend;
import { Group } from '@/types/auth'; // Modal do grupo;
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  BookOpen, 
  Calculator,
  UserPlus
} from 'lucide-react';

interface HeaderProps {
  onMenuToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const [userGroup, setUserGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);

  // Função para verificar se a rota atual é uma subpágina do Dashboard
  const isDashboardActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || 
             location.pathname === '/clientes-cadastrados' || 
             location.pathname === '/metricas-relatorios';
    }
    return location.pathname === path;
  };

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

  const getMenuItems = () => {
    const baseItems = [
      { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/formulario', icon: FileText, label: 'Formulário' },
      { path: '/materiais', icon: BookOpen, label: 'Material de Apoio' },
      { path: '/noticias', icon: FileText, label: 'Notícias' },
      { path: '/simulador', icon: Calculator, label: 'Simulador' }
    ];

    if (profile?.role === 'coordenador') {
      return [
        ...baseItems,
        { path: '/cadastrar-usuario', icon: UserPlus, label: 'Cadastrar Usuário' }
      ];
    }

    return baseItems;
  };

  const menuItems = getMenuItems();

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
            console.log('🔗 Link do Power BI do usuário (Header):', formattedGroup.name, ':', formattedGroup.powerBiUrl);
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


  const UserHeader = () => {
    if(!userGroup){
      return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-700 text-lg">Carregando...</p>
        </div>
      </div>
    );
    }else {
      return(
        <header className="bg-blue text-black shadow-md">
          <div className="container mx-auto flex items-center justify-between px-8 py-5">
            <img
              src="https://www.libracredito.com.br/images/site/logo-libra-credito.png"
              alt="Logo Libra Crédito"
              className="h-10"
            />
        <nav>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-center">
                  <div className="flex space-x-8">
                    {menuItems.map((item) => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        className={() =>
                          `inline-flex items-center px-4 py-4 border-b-2 text-sm font-medium transition-colors duration-200 ${
                            isDashboardActive(item.path)
                              ? 'border-blue-500 text-blue-600' 
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`
                        }
                      >
                        <item.icon className="h-5 w-5 mr-2" />
                        <span className="hidden sm:inline">{item.label}</span>
                      </NavLink>
                    ))}
                  </div>
                </div>
              </div>
        </nav>

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
    }
  }

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
