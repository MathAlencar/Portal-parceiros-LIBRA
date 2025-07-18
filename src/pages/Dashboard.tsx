
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, BookOpen, Calculator, TrendingUp, Activity, Info, BarChart3 } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const AdminDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+2 desde último mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Grupos Ativos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">+1 este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notícias Publicadas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+3 esta semana</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Materiais Disponíveis</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">+5 este mês</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>Últimas ações no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Novo usuário cadastrado</p>
                  <p className="text-xs text-muted-foreground">há 2 horas</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Notícia publicada</p>
                  <p className="text-xs text-muted-foreground">há 5 horas</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Material de apoio atualizado</p>
                  <p className="text-xs text-muted-foreground">há 1 dia</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configurações Rápidas</CardTitle>
            <CardDescription>Acesso rápido às principais funções</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <Users className="h-6 w-6 text-blue-500 mb-2" />
                <p className="text-sm font-medium">Gerenciar Usuários</p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <FileText className="h-6 w-6 text-green-500 mb-2" />
                <p className="text-sm font-medium">Criar Notícia</p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <BookOpen className="h-6 w-6 text-purple-500 mb-2" />
                <p className="text-sm font-medium">Adicionar Material</p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <Calculator className="h-6 w-6 text-orange-500 mb-2" />
                <p className="text-sm font-medium">Config. Simulador</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const UserDashboard = () => (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard - {user?.name}
          </h1>
          <p className="text-gray-600 mt-2">
            Visualize os dados e métricas do seu grupo
          </p>
        </div>

        <Card className="h-[calc(100vh-120px)]">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              <span>Analytics do Grupo</span>
            </CardTitle>
            <CardDescription>
              Dashboard Power BI configurado especificamente para o seu grupo
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="w-full h-full bg-white rounded-lg overflow-hidden">
              <iframe
                src="https://app.powerbi.com/view?r=eyJrIjoiMmUxMmZiNTAtZWQ0OC00NjkwLWI4NGEtYThhMjUwZGI4OGZjIiwidCI6IjdmYzZhYTE4LWYxODUtNGQwZi1hYTdlLTQzZGIyNDc5ZGQwZCJ9"
                width="100%"
                height="100%"
                style={{ minHeight: '700px' }}
                frameBorder="0"
                allowFullScreen
                title="Power BI Dashboard"
                className="rounded-lg"
              />
            </div>
          </CardContent>
        </Card>

        {/* Legenda explicativa */}
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <BarChart3 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-green-900 mb-2">
                Sobre este Dashboard
              </h3>
              <p className="text-sm text-green-800 leading-relaxed">
                Este dashboard apresenta uma visão analítica completa dos dados do seu grupo em tempo real. 
                Aqui você pode acompanhar indicadores de performance, métricas de produtividade, tendências 
                históricas e comparativos com outros períodos. Os dados são atualizados automaticamente e 
                refletem as informações mais recentes coletadas através dos formulários e sistemas integrados. 
                Utilize os filtros e controles interativos do Power BI para explorar diferentes perspectivas 
                dos dados e obter insights valiosos para a gestão do seu grupo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {user?.role === 'admin' ? <AdminDashboard /> : <UserDashboard />}
    </>
  );
};

export default Dashboard;
