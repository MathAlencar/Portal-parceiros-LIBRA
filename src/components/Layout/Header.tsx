
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

interface HeaderProps {
  onMenuToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();

  return (
    <div className="bg-white shadow-sm border-b px-6 py-4">
      <div className="flex items-center justify-between w-full">
        <h1 className="text-xl font-semibold text-foreground">
          Sistema de Gerenciamento de Parceiros
        </h1>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">{user?.name}</p>
            <p className="text-xs text-muted-foreground">
              {user?.role === 'admin' ? 'Administrador' : 
               user?.role === 'coordenador' ? 'Coordenador' : 'Usuário'}
            </p>
          </div>
          
          {user?.role !== 'admin' && (
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
