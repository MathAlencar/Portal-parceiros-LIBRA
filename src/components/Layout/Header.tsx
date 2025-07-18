
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  onMenuToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const { user } = useAuth();

  return (
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
      </div>
    </div>
  );
};

export default Header;
