
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/Auth/LoginForm';
import Layout from '@/components/Layout/Layout';
import Header from '@/components/Layout/Header';
import TopNavigation from '@/components/Layout/TopNavigation';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard';
import Usuarios from './Usuarios';
import Noticias from './Noticias';
import Simulador from './Simulador';
import Formulario from './Formulario';
import MaterialApoio from './MaterialApoio';
import Grupos from './Grupos';
import NewsDetail from '@/components/News/NewsDetail';
import MaterialDetail from '@/components/Materials/MaterialDetail';

const Index = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  // Layout para administradores (usando o novo Layout com sidebar)
  if (user?.role === 'admin') {
    return (
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="/noticias" element={<Noticias />} />
          <Route path="/noticias/:id" element={<NewsDetail />} />
          <Route path="/simulador" element={<Simulador />} />
          <Route path="/materiais" element={<MaterialApoio />} />
          <Route path="/materiais/:id" element={<MaterialDetail />} />
          <Route path="/grupos" element={<Grupos />} />
          <Route path="/simulador-config" element={
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-4">Configuração do Simulador</h1>
              <p className="text-gray-600">Funcionalidade em desenvolvimento...</p>
            </div>
          } />
        </Routes>
      </Layout>
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
          <Route path="/materiais/:id" element={<MaterialDetail />} />
          <Route path="/noticias" element={<Noticias />} />
          <Route path="/noticias/:id" element={<NewsDetail />} />
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
