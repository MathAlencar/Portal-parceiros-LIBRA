
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Calendar, User, ArrowRight } from 'lucide-react';
import { News } from '@/types/auth';
import { useAuth } from '@/contexts/AuthContext';
import NewsModal from '@/components/News/NewsModal';
import NewsTable from '@/components/News/NewsTable';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';

interface NewsWithCategory extends News {
  category: string;
  imageUrl?: string;
  excerpt: string;
}

const Noticias: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [newsModalOpen, setNewsModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsWithCategory | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [newsToDelete, setNewsToDelete] = useState<NewsWithCategory | null>(null);

  // Mock data with categories and images
  const [mockNews, setMockNews] = useState<NewsWithCategory[]>([
    {
      id: '1',
      title: 'Nova funcionalidade de relatórios disponível',
      content: 'Agora você pode gerar relatórios detalhados diretamente pelo sistema com exportação em múltiplos formatos e gráficos interativos para melhor análise dos dados. Esta funcionalidade permite criar dashboards personalizados e relatórios automáticos que podem ser enviados por email ou baixados em PDF.',
      excerpt: 'Agora você pode gerar relatórios detalhados diretamente pelo sistema com exportação em múltiplos formatos e gráficos interativos.',
      createdAt: '2024-01-15',
      authorId: '1',
      category: 'sistema',
      imageUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400'
    },
    {
      id: '2',
      title: 'Manutenção programada para este final de semana',
      content: 'O sistema passará por manutenção no sábado das 02:00 às 06:00 para implementação de melhorias e correções importantes. Durante este período, o acesso à plataforma estará temporariamente indisponível.',
      excerpt: 'O sistema passará por manutenção no sábado das 02:00 às 06:00 para implementação de melhorias e correções.',
      createdAt: '2024-01-12',
      authorId: '1',
      category: 'manutencao',
      imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400'
    },
    {
      id: '3',
      title: 'Novos materiais de treinamento disponíveis',
      content: 'Foram adicionados novos vídeos tutoriais e documentos na seção de Material de Apoio para ajudar no aprendizado das funcionalidades da plataforma. Os materiais incluem guias passo a passo e exemplos práticos.',
      excerpt: 'Novos vídeos tutoriais e documentos foram adicionados para ajudar no aprendizado das funcionalidades da plataforma.',
      createdAt: '2024-01-10',
      authorId: '1',
      category: 'treinamento',
      imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400'
    },
    {
      id: '4',
      title: 'Atualização de segurança implementada',
      content: 'Uma nova camada de segurança foi implementada para proteger melhor os dados dos usuários com criptografia aprimorada e autenticação de dois fatores. Todas as senhas foram resetadas e os usuários precisarão criar novas credenciais.',
      excerpt: 'Nova camada de segurança com criptografia aprimorada e autenticação de dois fatores foi implementada.',
      createdAt: '2024-01-08',
      authorId: '1',
      category: 'sistema',
      imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400'
    }
  ]);

  const categories = [
    { id: 'todas', label: 'Todas as Notícias' },
    { id: 'sistema', label: 'Sistema' },
    { id: 'treinamento', label: 'Treinamento' },
    { id: 'manutencao', label: 'Manutenção' },
    { id: 'mercado', label: 'Mercado' },
    { id: 'atualizacoes', label: 'Atualizações' },
    { id: 'eventos', label: 'Eventos' }
  ];

  const filteredNews = selectedCategory === 'todas' 
    ? mockNews 
    : mockNews.filter(news => news.category === selectedCategory);

  // Sort news by date (newest first)
  const sortedNews = [...mockNews].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleReadMore = (newsId: string) => {
    navigate(`/noticias/${newsId}`);
  };

  const handleCreateNews = () => {
    setEditingNews(null);
    setNewsModalOpen(true);
  };

  const handleEditNews = (news: NewsWithCategory) => {
    setEditingNews(news);
    setNewsModalOpen(true);
  };

  const handleDeleteNews = (news: NewsWithCategory) => {
    setNewsToDelete(news);
    setDeleteModalOpen(true);
  };

  const confirmDeleteNews = () => {
    if (newsToDelete) {
      setMockNews(prev => prev.filter(news => news.id !== newsToDelete.id));
      setDeleteModalOpen(false);
      setNewsToDelete(null);
    }
  };

  const handleSaveNews = (data: any) => {
    if (editingNews) {
      // Edit existing news
      setMockNews(prev => prev.map(news => 
        news.id === editingNews.id 
          ? { 
              ...news, 
              ...data, 
              excerpt: data.content.substring(0, 150) + (data.content.length > 150 ? '...' : '')
            }
          : news
      ));
    } else {
      // Create new news
      const newNews: NewsWithCategory = {
        id: (mockNews.length + 1).toString(),
        ...data,
        excerpt: data.content.substring(0, 150) + (data.content.length > 150 ? '...' : ''),
        createdAt: new Date().toISOString().split('T')[0],
        authorId: user?.id || '1',
      };
      setMockNews(prev => [newNews, ...prev]);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notícias</h1>
          <p className="text-gray-600">
            {isAdmin ? 'Gerencie as notícias do sistema' : 'Fique por dentro das últimas atualizações'}
          </p>
        </div>
      </div>

      {isAdmin ? (
        <Tabs defaultValue="visualizar" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="visualizar">Visualizar Notícias</TabsTrigger>
            <TabsTrigger value="gerenciar">Gerenciar Notícias</TabsTrigger>
          </TabsList>

          <TabsContent value="visualizar" className="space-y-6">
            {/* Categories Navigation */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id)}
                  className="mb-2"
                >
                  {category.label}
                </Button>
              ))}
            </div>

            {/* News Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredNews.map((news) => (
                <Card key={news.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                  {news.imageUrl && (
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={news.imageUrl} 
                        alt={news.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                  )}
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="secondary" className="mb-2">
                        {categories.find(cat => cat.id === news.category)?.label}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg leading-tight line-clamp-2">{news.title}</CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(news.createdAt)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>Admin</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-gray-700 leading-relaxed mb-4 line-clamp-3">
                      {news.excerpt}
                    </p>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReadMore(news.id)}
                      className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    >
                      Ler mais
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Empty state for filtered results */}
            {filteredNews.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Calendar className="h-12 w-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma notícia encontrada
                  </h3>
                  <p className="text-gray-600">
                    {selectedCategory === 'todas' 
                      ? 'Novas notícias aparecerão aqui quando disponíveis'
                      : `Nenhuma notícia encontrada na categoria "${categories.find(cat => cat.id === selectedCategory)?.label}"`}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="gerenciar" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Gerenciar Notícias</h2>
                <p className="text-gray-600">Crie, edite e exclua notícias do sistema</p>
              </div>
              <Button onClick={handleCreateNews}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Notícia
              </Button>
            </div>

            <NewsTable 
              news={sortedNews}
              onEdit={handleEditNews}
              onDelete={handleDeleteNews}
            />
          </TabsContent>
        </Tabs>
      ) : (
        <>
          {/* Categories Navigation for regular users */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className="mb-2"
              >
                {category.label}
              </Button>
            ))}
          </div>

          {/* News Grid for regular users */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredNews.map((news) => (
              <Card key={news.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                {news.imageUrl && (
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={news.imageUrl} 
                      alt={news.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                )}
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary" className="mb-2">
                      {categories.find(cat => cat.id === news.category)?.label}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg leading-tight line-clamp-2">{news.title}</CardTitle>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(news.createdAt)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>Admin</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-700 leading-relaxed mb-4 line-clamp-3">
                    {news.excerpt}
                  </p>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReadMore(news.id)}
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  >
                    Ler mais
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty state for regular users */}
          {filteredNews.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Calendar className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma notícia encontrada
                </h3>
                <p className="text-gray-600">
                  {selectedCategory === 'todas' 
                    ? 'Novas notícias aparecerão aqui quando disponíveis'
                    : `Nenhuma notícia encontrada na categoria "${categories.find(cat => cat.id === selectedCategory)?.label}"`}
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Modals */}
      <NewsModal
        isOpen={newsModalOpen}
        onClose={() => setNewsModalOpen(false)}
        onSave={handleSaveNews}
        editingNews={editingNews}
      />

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDeleteNews}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir a notícia "${newsToDelete?.title}"? Esta ação não poderá ser desfeita.`}
      />
    </div>
  );
};

export default Noticias;
