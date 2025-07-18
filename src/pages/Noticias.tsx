
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, User, ArrowRight } from 'lucide-react';
import { News } from '@/types/auth';
import { useAuth } from '@/contexts/AuthContext';

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

  // Mock data with categories and images
  const mockNews: NewsWithCategory[] = [
    {
      id: '1',
      title: 'Nova funcionalidade de relatórios disponível',
      content: 'Agora você pode gerar relatórios detalhados diretamente pelo sistema...',
      excerpt: 'Agora você pode gerar relatórios detalhados diretamente pelo sistema com exportação em múltiplos formatos e gráficos interativos.',
      createdAt: '2024-01-15',
      authorId: '1',
      category: 'sistema',
      imageUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400'
    },
    {
      id: '2',
      title: 'Manutenção programada para este final de semana',
      content: 'O sistema passará por uma manutenção no sábado das 02:00 às 06:00...',
      excerpt: 'O sistema passará por manutenção no sábado das 02:00 às 06:00 para implementação de melhorias e correções.',
      createdAt: '2024-01-12',
      authorId: '1',
      category: 'manutencao',
      imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400'
    },
    {
      id: '3',
      title: 'Novos materiais de treinamento disponíveis',
      content: 'Foram adicionados novos vídeos e documentos na seção de Material de Apoio...',
      excerpt: 'Novos vídeos tutoriais e documentos foram adicionados para ajudar no aprendizado das funcionalidades da plataforma.',
      createdAt: '2024-01-10',
      authorId: '1',
      category: 'treinamento',
      imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400'
    },
    {
      id: '4',
      title: 'Atualização de segurança implementada',
      content: 'Uma nova camada de segurança foi implementada para proteger melhor os dados dos usuários...',
      excerpt: 'Nova camada de segurança com criptografia aprimorada e autenticação de dois fatores foi implementada.',
      createdAt: '2024-01-08',
      authorId: '1',
      category: 'sistema',
      imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400'
    }
  ];

  const categories = [
    { id: 'todas', label: 'Todas as Notícias' },
    { id: 'sistema', label: 'Sistema' },
    { id: 'treinamento', label: 'Treinamento' },
    { id: 'manutencao', label: 'Manutenção' }
  ];

  const filteredNews = selectedCategory === 'todas' 
    ? mockNews 
    : mockNews.filter(news => news.category === selectedCategory);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleReadMore = (newsId: string) => {
    navigate(`/noticias/${newsId}`);
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
        {isAdmin && (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Notícia
          </Button>
        )}
      </div>

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

              {isAdmin && (
                <div className="flex space-x-2 mt-3 pt-3 border-t">
                  <Button variant="outline" size="sm">
                    Editar
                  </Button>
                  <Button variant="outline" size="sm">
                    Excluir
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredNews.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Calendar className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma notícia encontrada
            </h3>
            <p className="text-gray-600 mb-4">
              {selectedCategory === 'todas' 
                ? 'Novas notícias aparecerão aqui quando disponíveis'
                : `Nenhuma notícia encontrada na categoria "${categories.find(cat => cat.id === selectedCategory)?.label}"`}
            </p>
            {isAdmin && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Notícia
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Noticias;
