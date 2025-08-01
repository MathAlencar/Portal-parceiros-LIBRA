import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, PieChart, Download, Calendar, Target, Activity, Users, ArrowLeft, Construction } from 'lucide-react';

const MetricasRelatorios: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Métricas e Relatórios</h1>
            <p className="text-gray-600 mt-2">Visualize estatísticas e relatórios detalhados do sistema</p>
          </div>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          <Download className="h-4 w-4 mr-2" />
          Exportar Relatório
        </Button>
      </div>

            {/* Construction Notice */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <Construction className="h-8 w-8 text-yellow-600" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-800">Página em Construção</h3>
              <p className="text-yellow-700">Esta funcionalidade está sendo desenvolvida e estará disponível em breve.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700">Taxa de Conversão</p>
                <p className="text-2xl font-bold text-blue-900">15.2%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <Target className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-700">Meta Atingida</p>
                <p className="text-2xl font-bold text-green-900">78%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-700">Crescimento</p>
                <p className="text-2xl font-bold text-purple-900">+23%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-500 rounded-lg">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-orange-700">Este Mês</p>
                <p className="text-2xl font-bold text-orange-900">156</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-gray-600" />
              <span>Performance Mensal</span>
            </CardTitle>
            <CardDescription>Evolução do desempenho ao longo do tempo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Gráfico de Performance</p>
                <p className="text-sm text-gray-400">Dados serão exibidos aqui</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="h-5 w-5 text-gray-600" />
              <span>Distribuição por Categoria</span>
            </CardTitle>
            <CardDescription>Distribuição dos dados por categorias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Gráfico de Distribuição</p>
                <p className="text-sm text-gray-400">Dados serão exibidos aqui</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Relatório de Vendas</h3>
                <p className="text-sm text-gray-600 mt-1">Análise detalhada de vendas</p>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Baixar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Relatório de Clientes</h3>
                <p className="text-sm text-gray-600 mt-1">Perfil e comportamento dos clientes</p>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Baixar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Relatório de Crescimento</h3>
                <p className="text-sm text-gray-600 mt-1">Métricas de crescimento e evolução</p>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Baixar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-gray-600" />
            <span>Atividade Recente</span>
          </CardTitle>
          <CardDescription>Últimas ações e eventos do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Relatório gerado</p>
                <p className="text-xs text-gray-500">Há 2 horas</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Métricas atualizadas</p>
                <p className="text-xs text-gray-500">Há 4 horas</p>
              </div>
            </div>
            <div className="text-center text-gray-500 text-sm py-4">
              Nenhuma outra atividade recente
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MetricasRelatorios; 