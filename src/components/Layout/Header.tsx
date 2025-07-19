
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

interface HeaderProps {
  onMenuToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const { profile, signOut } = useAuth();

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

  return (
    <div className="bg-white shadow-sm border-b px-6 py-4">
      <div className="flex items-center justify-between w-full">
        <h1 className="text-xl font-semibold text-foreground">
          Sistema de Gerenciamento de Parceiros
        </h1>
        
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
  );
};

export default Header;
