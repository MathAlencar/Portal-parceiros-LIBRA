
import React, { useState, useMemo, useEffect } from 'react';
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
import NewsFilter from '@/components/News/NewsFilter';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface NewsWithCategory extends News {
  category: string;
  imageUrl?: string;
  excerpt: string;
}

const Noticias: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isAdmin = user?.role === 'admin';
  
  const [newsModalOpen, setNewsModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsWithCategory | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [newsToDelete, setNewsToDelete] = useState<NewsWithCategory | null>(null);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [categoryFilter, setCategoryFilter] = useState('todas');

  const [news, setNews] = useState<NewsWithCategory[]>([]);

  const categories = [
    { id: 'todas', label: 'Todas as Notícias' },
    { id: 'sistema', label: 'Sistema' },
    { id: 'treinamento', label: 'Treinamento' },
    { id: 'manutencao', label: 'Manutenção' },
    { id: 'mercado', label: 'Mercado' },
    { id: 'atualizacoes', label: 'Atualizações' },
    { id: 'eventos', label: 'Eventos' }
  ];

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching news:', error);
        toast({
          title: "Erro ao carregar notícias",
          description: "Não foi possível carregar as notícias.",
          variant: "destructive",
        });
        return;
      }

      const formattedNews: NewsWithCategory[] = data.map(newsItem => ({
        id: newsItem.id,
        title: newsItem.title,
        content: newsItem.content,
        createdAt: newsItem.created_at,
        authorId: newsItem.author_id,
        category: newsItem.category || 'sistema',
        imageUrl: newsItem.image_url || undefined,
        excerpt: newsItem.excerpt || newsItem.content.substring(0, 150) + (newsItem.content.length > 150 ? '...' : '')
      }));

      setNews(formattedNews);
    } catch (error) {
      console.error('Error fetching news:', error);
      toast({
        title: "Erro ao carregar notícias",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort logic
  const filteredAndSortedNews = useMemo(() => {
    let filtered = [...news];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(newsItem => 
        newsItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        newsItem.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (categoryFilter !== 'todas') {
      filtered = filtered.filter(newsItem => newsItem.category === categoryFilter);
    }

    // Apply sorting
    if (sortBy === 'recent') {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'alphabetical') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    return filtered;
  }, [news, searchTerm, categoryFilter, sortBy]);

  // Generate applied filters text
  const appliedFilters = useMemo(() => {
    const filters = [];
    if (categoryFilter !== 'todas') {
      const category = categories.find(cat => cat.id === categoryFilter);
      filters.push(`Categoria = ${category?.label}`);
    }
    if (sortBy === 'recent') {
      filters.push('Ordenado por: Mais recentes');
    } else if (sortBy === 'alphabetical') {
      filters.push('Ordenado por: A-Z');
    }
    return filters;
  }, [categoryFilter, sortBy, categories]);

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

  const handleEditNews = (newsItem: NewsWithCategory) => {
    setEditingNews(newsItem);
    setNewsModalOpen(true);
  };

  const handleDeleteNews = (newsItem: NewsWithCategory) => {
    setNewsToDelete(newsItem);
    setDeleteModalOpen(true);
  };

  const confirmDeleteNews = async () => {
    if (!newsToDelete) return;

    try {
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', newsToDelete.id);

      if (error) {
        console.error('Error deleting news:', error);
        toast({
          title: "Erro ao excluir notícia",
          description: "Não foi possível excluir a notícia.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Notícia excluída",
        description: "A notícia foi excluída com sucesso.",
      });

      await fetchNews(); // Refresh the list
      setDeleteModalOpen(false);
      setNewsToDelete(null);
    } catch (error) {
      console.error('Error deleting news:', error);
      toast({
        title: "Erro ao excluir notícia",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    }
  };

  const handleSaveNews = async (data: any) => {
    try {
      if (editingNews) {
        // Edit existing news
        const { error } = await supabase
          .from('news')
          .update({
            title: data.title,
            content: data.content,
            category: data.category,
            image_url: data.imageUrl,
            excerpt: data.content.substring(0, 150) + (data.content.length > 150 ? '...' : '')
          })
          .eq('id', editingNews.id);

        if (error) {
          console.error('Error updating news:', error);
          toast({
            title: "Erro ao atualizar notícia",
            description: "Não foi possível atualizar a notícia.",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Notícia atualizada",
          description: "A notícia foi atualizada com sucesso.",
        });
      } else {
        // Create new news
        const { error } = await supabase
          .from('news')
          .insert({
            title: data.title,
            content: data.content,
            category: data.category,
            image_url: data.imageUrl,
            excerpt: data.content.substring(0, 150) + (data.content.length > 150 ? '...' : ''),
            author_id: user?.id || 'unknown'
          });

        if (error) {
          console.error('Error creating news:', error);
          toast({
            title: "Erro ao criar notícia",
            description: "Não foi possível criar a notícia.",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Notícia criada",
          description: "A notícia foi criada com sucesso.",
        });
      }

      await fetchNews(); // Refresh the list
      setNewsModalOpen(false);
      setEditingNews(null);
    } catch (error) {
      console.error('Error saving news:', error);
      toast({
        title: "Erro ao salvar notícia",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    }
  };

  const NewsGrid = ({ news }: { news: NewsWithCategory[] }) => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {news.map((newsItem) => (
        <Card key={newsItem.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
          {newsItem.imageUrl && (
            <div className="h-48 overflow-hidden">
              <img 
                src={newsItem.imageUrl} 
                alt={newsItem.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            </div>
          )}
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start mb-2">
              <Badge variant="secondary" className="mb-2">
                {categories.find(cat => cat.id === newsItem.category)?.label}
              </Badge>
            </div>
            <CardTitle className="text-lg leading-tight line-clamp-2">{newsItem.title}</CardTitle>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(newsItem.createdAt)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <User className="h-4 w-4" />
                <span>Admin</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-gray-700 leading-relaxed mb-4 line-clamp-3">
              {newsItem.excerpt}
            </p>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleReadMore(newsItem.id)}
              className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
            >
              Ler mais
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notícias</h1>
            <p className="text-gray-600">Carregando notícias...</p>
          </div>
        </div>
      </div>
    );
  }

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
            <NewsFilter
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              sortBy={sortBy}
              onSortChange={setSortBy}
              categoryFilter={categoryFilter}
              onCategoryChange={setCategoryFilter}
              totalResults={filteredAndSortedNews.length}
              appliedFilters={appliedFilters}
            />

            <NewsGrid news={filteredAndSortedNews} />

            {filteredAndSortedNews.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Calendar className="h-12 w-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma notícia encontrada
                  </h3>
                  <p className="text-gray-600">
                    {news.length === 0 
                      ? 'Nenhuma notícia foi publicada ainda.'
                      : 'Tente ajustar os filtros ou limpar a busca para ver mais resultados'}
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
              news={news.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())}
              onEdit={handleEditNews}
              onDelete={handleDeleteNews}
            />
          </TabsContent>
        </Tabs>
      ) : (
        <>
          <NewsFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            sortBy={sortBy}
            onSortChange={setSortBy}
            categoryFilter={categoryFilter}
            onCategoryChange={setCategoryFilter}
            totalResults={filteredAndSortedNews.length}
            appliedFilters={appliedFilters}
          />

          <NewsGrid news={filteredAndSortedNews} />

          {filteredAndSortedNews.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Calendar className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma notícia encontrada
                </h3>
                <p className="text-gray-600">
                  {news.length === 0 
                    ? 'Nenhuma notícia foi publicada ainda.'
                    : 'Tente ajustar os filtros ou limpar a busca para ver mais resultados'}
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}

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
