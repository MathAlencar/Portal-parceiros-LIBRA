
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  FileText, 
  BookOpen, 
  Calculator,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const { user, logout } = useAuth();

  const getMenuItems = () => {
    const baseItems = [
      { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' }
    ];

    if (user?.role === 'admin') {
      return [
        ...baseItems,
        { path: '/usuarios', icon: Users, label: 'Usuários' },
        { path: '/grupos', icon: UserPlus, label: 'Grupos' },
        { path: '/noticias', icon: FileText, label: 'Notícias' },
        { path: '/materiais', icon: BookOpen, label: 'Materiais' },
        { path: '/simulador-config', icon: Settings, label: 'Config. Simulador' }
      ];
    }

    if (user?.role === 'coordenador') {
      return [
        ...baseItems,
        { path: '/formulario', icon: FileText, label: 'Formulário' },
        { path: '/materiais', icon: BookOpen, label: 'Material de Apoio' },
        { path: '/noticias', icon: FileText, label: 'Notícias' },
        { path: '/simulador', icon: Calculator, label: 'Simulador' },
        { path: '/cadastrar-usuario', icon: UserPlus, label: 'Cadastrar Usuário' }
      ];
    }

    return [
      ...baseItems,
      { path: '/formulario', icon: FileText, label: 'Formulário' },
      { path: '/materiais', icon: BookOpen, label: 'Material de Apoio' },
      { path: '/noticias', icon: FileText, label: 'Notícias' },
      { path: '/simulador', icon: Calculator, label: 'Simulador' }
    ];
  };

  const menuItems = getMenuItems();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-slate-900 text-white z-50 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        w-64 lg:relative lg:translate-x-0
      `}>
        {/* Header */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-blue-400">SGP Sistema</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="lg:hidden text-white hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-sm text-slate-400 mt-1">{user?.name}</p>
          <span className="text-xs bg-blue-600 px-2 py-1 rounded-full">
            {user?.role === 'admin' ? 'Administrador' : 
             user?.role === 'coordenador' ? 'Coordenador' : 'Usuário'}
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                      isActive 
                        ? 'bg-blue-600 text-white' 
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`
                  }
                  onClick={() => window.innerWidth < 1024 && onToggle()}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700">
          <Button
            variant="ghost"
            onClick={logout}
            className="w-full justify-start text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Sair
          </Button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
