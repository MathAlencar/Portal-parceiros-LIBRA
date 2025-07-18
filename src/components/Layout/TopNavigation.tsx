
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  BookOpen, 
  Calculator,
  UserPlus
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const TopNavigation: React.FC = () => {
  const { user } = useAuth();

  const getMenuItems = () => {
    const baseItems = [
      { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/formulario', icon: FileText, label: 'Formulário' },
      { path: '/materiais', icon: BookOpen, label: 'Material de Apoio' },
      { path: '/noticias', icon: FileText, label: 'Notícias' },
      { path: '/simulador', icon: Calculator, label: 'Simulador' }
    ];

    if (user?.role === 'coordenador') {
      return [
        ...baseItems,
        { path: '/cadastrar-usuario', icon: UserPlus, label: 'Cadastrar Usuário' }
      ];
    }

    return baseItems;
  };

  const menuItems = getMenuItems();

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center">
          <div className="flex space-x-8">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `inline-flex items-center px-4 py-4 border-b-2 text-sm font-medium transition-colors duration-200 ${
                    isActive 
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
  );
};

export default TopNavigation;
