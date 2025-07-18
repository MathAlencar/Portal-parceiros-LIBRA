
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/Auth/LoginForm';
import Header from '@/components/Layout/Header';
import Sidebar from '@/components/Layout/Sidebar';
import TopNavigation from '@/components/Layout/TopNavigation';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard';
import Usuarios from './Usuarios';
import Noticias from './Noticias';
import Simulador from './Simulador';
import Formulario from './Formulario';
import MaterialApoio from './MaterialApoio';

const Index = () => {
  const { isAuthenticated, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  // Layout para administradores (sidebar lateral)
  if (user?.role === 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <div className="flex-1 flex flex-col lg:ml-0">
          <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
          
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/usuarios" element={<Usuarios />} />
              <Route path="/noticias" element={<Noticias />} />
              <Route path="/simulador" element={<Simulador />} />
              <Route path="/materiais" element={<MaterialApoio />} />
              <Route path="/grupos" element={
                <div className="p-6">
                  <h1 className="text-2xl font-bold mb-4">Gerenciar Grupos</h1>
                  <p className="text-gray-600">Funcionalidade em desenvolvimento...</p>
                </div>
              } />
              <Route path="/simulador-config" element={
                <div className="p-6">
                  <h1 className="text-2xl font-bold mb-4">Configuração do Simulador</h1>
                  <p className="text-gray-600">Funcionalidade em desenvolvimento...</p>
                </div>
              } />
            </Routes>
          </main>
        </div>
      </div>
    );
  }

  // Layout para usuários/coordenadores (navegação superior)
  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMenuToggle={() => {}} />
      <TopNavigation />
      
      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/formulario" element={<Formulario />} />
          <Route path="/materiais" element={<MaterialApoio />} />
          <Route path="/noticias" element={<Noticias />} />
          <Route path="/simulador" element={<Simulador />} />
          <Route path="/cadastrar-usuario" element={
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-4">Cadastrar Usuário</h1>
              <p className="text-gray-600">Funcionalidade em desenvolvimento...</p>
            </div>
          } />
        </Routes>
      </main>
    </div>
  );
};

export default Index;
