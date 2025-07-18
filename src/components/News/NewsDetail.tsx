
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Calendar, User } from 'lucide-react';

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

  // Mock data - em uma aplicação real, isso viria de uma API
  const mockNews: NewsWithCategory[] = [
    {
      id: '1',
      title: 'Nova funcionalidade de relatórios disponível',
      content: 'Agora você pode gerar relatórios detalhados diretamente pelo sistema. Esta nova funcionalidade permite exportar dados em diversos formatos, incluindo PDF, Excel e CSV. Os relatórios incluem gráficos interativos, métricas de performance e análises comparativas que facilitam a tomada de decisão estratégica.\n\nCom esta atualização, os usuários podem:\n\n• Gerar relatórios personalizados em tempo real\n• Exportar dados em múltiplos formatos\n• Visualizar gráficos interativos\n• Acessar métricas de performance avançadas\n• Realizar análises comparativas detalhadas\n\nEsta funcionalidade está disponível para todos os usuários e pode ser acessada através do menu principal. Para mais informações sobre como utilizar os novos recursos, consulte o material de apoio disponível na plataforma.',
      excerpt: 'Agora você pode gerar relatórios detalhados diretamente pelo sistema...',
      createdAt: '2024-01-15',
      authorId: '1',
      category: 'sistema',
      imageUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800'
    },
    {
      id: '2',
      title: 'Manutenção programada para este final de semana',
      content: 'O sistema passará por uma manutenção no sábado das 02:00 às 06:00. Durante este período, o acesso pode ficar intermitente. Recomendamos que você salve seu trabalho antes deste horário e evite realizar operações críticas durante a janela de manutenção.\n\nDetalhes da manutenção:\n\n• Data: Sábado, 20 de janeiro\n• Horário: 02:00 às 06:00\n• Impacto: Acesso intermitente\n• Serviços afetados: Todos os módulos do sistema\n\nDurante a manutenção, nossa equipe técnica implementará melhorias de performance e correções de segurança. Agradecemos a compreensão e pedimos desculpas por qualquer inconveniente.',
      excerpt: 'O sistema passará por uma manutenção no sábado das 02:00 às 06:00...',
      createdAt: '2024-01-12',
      authorId: '1',
      category: 'manutencao',
      imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800'
    },
    {
      id: '3',
      title: 'Novos materiais de treinamento disponíveis',
      content: 'Foram adicionados novos vídeos e documentos na seção de Material de Apoio. Confira o conteúdo atualizado sobre as melhores práticas, tutoriais passo a passo e guias de referência rápida para maximizar o uso da plataforma.\n\nNovos materiais incluem:\n\n• Vídeo tutorial: Configuração inicial do sistema\n• Guia PDF: Melhores práticas de segurança\n• Tutorial interativo: Geração de relatórios\n• Webinar gravado: Dicas de produtividade\n• Checklist: Configurações essenciais\n\nTodos os materiais estão disponíveis gratuitamente na seção Material de Apoio. Recomendamos especialmente o novo tutorial interativo para usuários que desejam aprender a usar as funcionalidades avançadas do sistema.',
      excerpt: 'Foram adicionados novos vídeos e documentos na seção de Material de Apoio...',
      createdAt: '2024-01-10',
      authorId: '1',
      category: 'treinamento',
      imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800'
    },
    {
      id: '4',
      title: 'Atualização de segurança implementada',
      content: 'Uma nova camada de segurança foi implementada para proteger melhor os dados dos usuários. Esta atualização inclui criptografia aprimorada, autenticação de dois fatores opcional e monitoramento avançado de atividades suspeitas.\n\nMelhorias de segurança:\n\n• Criptografia AES-256 para todos os dados\n• Autenticação de dois fatores (2FA) opcional\n• Monitoramento de atividades em tempo real\n• Alertas de segurança automáticos\n• Backup automático com criptografia\n\nRecomendamos a todos os usuários que ativem a autenticação de dois fatores para maior proteção. As instruções estão disponíveis na seção de configurações da conta.',
      excerpt: 'Uma nova camada de segurança foi implementada para proteger melhor...',
      createdAt: '2024-01-08',
      authorId: '1',
      category: 'sistema',
      imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800'
    }
  ];

  const news = mockNews.find(item => item.id === id);

  if (!news) {
    return (
      <div className="p-6">
        <Button 
          onClick={() => navigate('/noticias')}
          variant="outline"
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
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
