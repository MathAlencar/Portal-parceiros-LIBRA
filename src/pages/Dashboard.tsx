
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, FileText, BookOpen, Calculator, TrendingUp, Activity, BarChart3, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Group } from '@/types/auth';

interface DashboardStats {
  totalUsers: number;
  admins: number;
  coordenadores: number;
  usuarios: number;
  totalGroups: number;
  totalNews: number;
  totalMaterials: number;
}

interface RecentActivity {
  id: string;
  type: 'user' | 'news' | 'material';
  description: string;
  createdAt: string;
}

const Dashboard: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    admins: 0,
    coordenadores: 0,
    usuarios: 0,
    totalGroups: 0,
    totalNews: 0,
    totalMaterials: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [userGroup, setUserGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchDashboardData();
    } else {
      fetchUserGroupData();
    }
  }, [profile]);

  const fetchUserGroupData = async () => {
    try {
      setLoading(true);
      
      if (profile?.group_id) {
        console.log('Dashboard: Fetching group data for user group:', profile.group_id);
        
        const { data: groupData, error } = await supabase
          .from('groups')
          .select('*')
          .eq('id', profile.group_id)
          .single();

        if (error) {
          console.error('Error fetching user group:', error);
        } else {
          const formattedGroup: Group = {
            id: groupData.id,
            name: groupData.name,
            powerBiUrl: groupData.power_bi_url || undefined,
            formUrl: groupData.form_url || undefined,
            createdAt: groupData.created_at
          };
          
          console.log('Dashboard: User group data loaded:', formattedGroup);
          setUserGroup(formattedGroup);
        }
      } else {
        console.log('Dashboard: User has no group assigned');
        setUserGroup(null);
      }
    } catch (error) {
      console.error('Error fetching user group data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch user statistics
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('role');

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      // Count users by role
      const userStats = profiles?.reduce((acc, profile) => {
        acc.totalUsers++;
        if (profile.role === 'admin') acc.admins++;
        else if (profile.role === 'coordenador') acc.coordenadores++;
        else if (profile.role === 'usuario') acc.usuarios++;
        return acc;
      }, { totalUsers: 0, admins: 0, coordenadores: 0, usuarios: 0 }) || 
      { totalUsers: 0, admins: 0, coordenadores: 0, usuarios: 0 };

      // Fetch groups count
      const { count: groupsCount, error: groupsError } = await supabase
        .from('groups')
        .select('*', { count: 'exact', head: true });

      if (groupsError) {
        console.error('Error fetching groups count:', groupsError);
      }

      // Fetch news count
      const { count: newsCount, error: newsError } = await supabase
        .from('news')
        .select('*', { count: 'exact', head: true });

      if (newsError) {
        console.error('Error fetching news count:', newsError);
      }

      // Fetch materials count
      const { count: materialsCount, error: materialsError } = await supabase
        .from('materials')
        .select('*', { count: 'exact', head: true });

      if (materialsError) {
        console.error('Error fetching materials count:', materialsError);
      }

      setStats({
        ...userStats,
        totalGroups: groupsCount || 0,
        totalNews: newsCount || 0,
        totalMaterials: materialsCount || 0
      });

      // Fetch recent activity
      await fetchRecentActivity();

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      // Get recent users
      const { data: recentProfiles } = await supabase
        .from('profiles')
        .select('name, created_at')
        .order('created_at', { ascending: false })
        .limit(3);

      // Get recent news
      const { data: recentNews } = await supabase
        .from('news')
        .select('title, created_at')
        .order('created_at', { ascending: false })
        .limit(3);

      // Get recent materials
      const { data: recentMaterials } = await supabase
        .from('materials')
        .select('title, created_at')
        .order('created_at', { ascending: false })
        .limit(3);

      const activities: RecentActivity[] = [];

      // Add recent users
      recentProfiles?.forEach(profile => {
        activities.push({
          id: `user-${profile.name}`,
          type: 'user',
          description: `Novo usuário cadastrado: ${profile.name}`,
          createdAt: profile.created_at
        });
      });

      // Add recent news
      recentNews?.forEach(news => {
        activities.push({
          id: `news-${news.title}`,
          type: 'news',
          description: `Notícia publicada: ${news.title}`,
          createdAt: news.created_at
        });
      });

      // Add recent materials
      recentMaterials?.forEach(material => {
        activities.push({
          id: `material-${material.title}`,
          type: 'material',
          description: `Material adicionado: ${material.title}`,
          createdAt: material.created_at
        });
      });

      // Sort by creation date and take the 5 most recent
      activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setRecentActivity(activities.slice(0, 5));

    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `há ${diffInMinutes} minuto${diffInMinutes !== 1 ? 's' : ''}`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `há ${hours} hora${hours !== 1 ? 's' : ''}`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `há ${days} dia${days !== 1 ? 's' : ''}`;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user': return 'bg-blue-500';
      case 'news': return 'bg-green-500';
      case 'material': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const AdminDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Usuários cadastrados</p>
            
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Admins:</span>
                <span className="font-medium">{loading ? '...' : stats.admins}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Coordenadores:</span>
                <span className="font-medium">{loading ? '...' : stats.coordenadores}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Usuários:</span>
                <span className="font-medium">{loading ? '...' : stats.usuarios}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Grupos Ativos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : stats.totalGroups}</div>
            <p className="text-xs text-muted-foreground">Grupos cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notícias Publicadas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : stats.totalNews}</div>
            <p className="text-xs text-muted-foreground">Notícias no sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Materiais Disponíveis</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : stats.totalMaterials}</div>
            <p className="text-xs text-muted-foreground">Materiais cadastrados</p>
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
              {loading ? (
                <div className="text-center text-muted-foreground">Carregando atividades...</div>
              ) : recentActivity.length === 0 ? (
                <div className="text-center text-muted-foreground">Nenhuma atividade recente</div>
              ) : (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4">
                    <div className={`w-2 h-2 rounded-full ${getActivityColor(activity.type)}`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">{formatTimeAgo(activity.createdAt)}</p>
                    </div>
                  </div>
                ))
              )}
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
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-accent hover:border-primary transition-all"
                onClick={() => navigate('/usuarios')}
              >
                <Users className="h-6 w-6 text-blue-500" />
                <div className="text-center">
                  <p className="text-sm font-medium">Gerenciar Usuários</p>
                  <p className="text-xs text-muted-foreground">Acesse a lista de usuários</p>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-accent hover:border-primary transition-all"
                onClick={() => navigate('/noticias')}
              >
                <FileText className="h-6 w-6 text-green-500" />
                <div className="text-center">
                  <p className="text-sm font-medium">Criar Notícia</p>
                  <p className="text-xs text-muted-foreground">Publique uma nova notícia</p>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-accent hover:border-primary transition-all"
                onClick={() => navigate('/materiais')}
              >
                <BookOpen className="h-6 w-6 text-purple-500" />
                <div className="text-center">
                  <p className="text-sm font-medium">Adicionar Material</p>
                  <p className="text-xs text-muted-foreground">Cadastre material de apoio</p>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-accent hover:border-primary transition-all"
                onClick={() => navigate('/simulador-config')}
              >
                <Settings className="h-6 w-6 text-orange-500" />
                <div className="text-center">
                  <p className="text-sm font-medium">Config. Simulador</p>
                  <p className="text-xs text-muted-foreground">Ajuste as variáveis</p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const UserDashboard = () => (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard - {profile?.name}
          </h1>
          <p className="text-gray-600 mt-2">
            {userGroup ? (
              <>Grupo: <span className="font-semibold">{userGroup.name}</span> - Visualize os dados e métricas do seu grupo em tempo real</>
            ) : (
              'Você não está vinculado a nenhum grupo. Entre em contato com o administrador.'
            )}
          </p>
        </div>

        {userGroup && userGroup.powerBiUrl ? (
          <div className="w-full">
            <Card className="shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                  <span>Analytics do Grupo - {userGroup.name}</span>
                </CardTitle>
                <CardDescription>
                  Dashboard Power BI configurado especificamente para o seu grupo
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="w-full bg-white rounded-lg overflow-hidden border">
                  <iframe
                    src={userGroup.powerBiUrl}
                    width="100%"
                    height="800"
                    style={{ minHeight: '800px' }}
                    frameBorder="0"
                    allowFullScreen
                    title={`Power BI Dashboard - ${userGroup.name}`}
                    className="rounded-lg"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        ) : userGroup ? (
          <Card className="shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <BarChart3 className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    📊 Dashboard não configurado
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    O grupo "{userGroup.name}" ainda não possui um link do Power BI configurado. Entre em contato com o administrador para configurar o dashboard.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}

        <Card className="shadow-md">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <BarChart3 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  📊 Sobre este Dashboard
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {userGroup ? (
                    `Este dashboard apresenta uma visão analítica dos dados do seu grupo "${userGroup.name}" em tempo real. 
                    Os dados são atualizados automaticamente com base nos formulários enviados e refletem 
                    métricas de performance, produtividade e tendências. Use os filtros do Power BI para 
                    explorar os dados conforme sua necessidade e obter insights valiosos para a gestão 
                    do seu grupo.`
                  ) : (
                    'Você não está vinculado a nenhum grupo. Entre em contato com o administrador para ser adicionado a um grupo e ter acesso aos dashboards e formulários específicos.'
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <>
      {profile?.role === 'admin' ? <AdminDashboard /> : <UserDashboard />}
    </>
  );
};

export default Dashboard;
