
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/Auth/LoginForm';
import Header from '@/components/Layout/Header';
import Sidebar from '@/components/Layout/Sidebar';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard';
import Usuarios from './Usuarios';
import Noticias from './Noticias';
import Simulador from './Simulador';

const Index = () => {
  const { isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAuthenticated) {
    return <LoginForm />;
  }

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
            <Route path="/materiais" element={
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Material de Apoio</h1>
                <p className="text-gray-600">Funcionalidade em desenvolvimento...</p>
              </div>
            } />
            <Route path="/grupos" element={
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Gerenciar Grupos</h1>
                <p className="text-gray-600">Funcionalidade em desenvolvimento...</p>
              </div>
            } />
            <Route path="/formulario" element={
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Formulário</h1>
                <p className="text-gray-600">Formulário do grupo será carregado aqui...</p>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Index;
