
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface NewsWithCategory {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  authorId: string;
  category: string;
  imageUrl?: string;
  excerpt: string;
}

const NewsDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [news, setNews] = useState<NewsWithCategory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      if (!id) {
        console.error('NewsDetail: No ID provided in URL params');
        setLoading(false);
        return;
      }

      console.log('NewsDetail: Fetching news with ID:', id);

      try {
        const { data, error } = await supabase
          .from('news')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        console.log('NewsDetail: Supabase response:', { data, error });

        if (error) {
          console.error('NewsDetail: Error fetching news:', error);
          toast({
            title: "Erro ao carregar notícia",
            description: "Não foi possível carregar os detalhes da notícia.",
            variant: "destructive",
          });
          setNews(null);
          return;
        }

        if (!data) {
          console.log('NewsDetail: No news found with ID:', id);
          setNews(null);
          return;
        }

        const formattedNews: NewsWithCategory = {
          id: data.id,
          title: data.title,
          content: data.content,
          createdAt: data.created_at,
          authorId: data.author_id,
          category: data.category || 'sistema',
          imageUrl: data.image_url || undefined,
          excerpt: data.excerpt || data.content.substring(0, 150) + (data.content.length > 150 ? '...' : '')
        };

        console.log('NewsDetail: Formatted news:', formattedNews);
        setNews(formattedNews);
      } catch (error) {
        console.error('NewsDetail: Unexpected error:', error);
        toast({
          title: "Erro inesperado",
          description: "Ocorreu um erro inesperado ao carregar a notícia.",
          variant: "destructive",
        });
        setNews(null);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [id, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-6">
          <Button 
            onClick={() => navigate('/noticias')}
            variant="outline"
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Notícias
          </Button>
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-600">Carregando notícia...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-6">
          <Button 
            onClick={() => navigate('/noticias')}
            variant="outline"
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Notícias
          </Button>
          <Card>
            <CardContent className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Notícia não encontrada
              </h3>
              <p className="text-gray-600">
                A notícia que você está procurando não existe ou foi removida.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatContent = (content: string) => {
    return content.split('\n').map((paragraph, index) => (
      <p key={index} className="mb-4 last:mb-0">
        {paragraph}
      </p>
    ));
  };

  const categories = {
    sistema: 'Sistema',
    treinamento: 'Treinamento',
    manutencao: 'Manutenção',
    mercado: 'Mercado',
    atualizacoes: 'Atualizações',
    eventos: 'Eventos'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <Button 
          onClick={() => navigate('/noticias')}
          variant="outline"
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Notícias
        </Button>

        <article className="bg-white rounded-lg shadow-sm overflow-hidden">
          {news.imageUrl && (
            <div className="h-96 overflow-hidden">
              <img 
                src={news.imageUrl} 
                alt={news.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="p-8">
            <header className="mb-6">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                  {categories[news.category as keyof typeof categories] || news.category}
                </span>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                {news.title}
              </h1>
              
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(news.createdAt)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Administração</span>
                </div>
              </div>
            </header>

            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
              {formatContent(news.content)}
            </div>
          </div>
        </article>

        <div className="mt-6 flex justify-center">
          <Button 
            onClick={() => navigate('/noticias')}
            size="lg"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Notícias
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NewsDetail;
