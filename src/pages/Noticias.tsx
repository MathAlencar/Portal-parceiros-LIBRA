
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, User } from 'lucide-react';
import { News } from '@/types/auth';
import { useAuth } from '@/contexts/AuthContext';

const Noticias: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Mock data
  const mockNews: News[] = [
    {
      id: '1',
      title: 'Nova funcionalidade de relatórios disponível',
      content: 'Agora você pode gerar relatórios detalhados diretamente pelo sistema. Esta nova funcionalidade permite exportar dados em diversos formatos.',
      createdAt: '2024-01-15',
      authorId: '1'
    },
    {
      id: '2',
      title: 'Manutenção programada para este final de semana',
      content: 'O sistema passará por uma manutenção no sábado das 02:00 às 06:00. Durante este período, o acesso pode ficar intermitente.',
      createdAt: '2024-01-12',
      authorId: '1'
    },
    {
      id: '3',
      title: 'Novos materiais de treinamento disponíveis',
      content: 'Foram adicionados novos vídeos e documentos na seção de Material de Apoio. Confira o conteúdo atualizado sobre as melhores práticas.',
      createdAt: '2024-01-10',
      authorId: '1'
    }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
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

      <div className="grid gap-6">
        {mockNews.map((news) => (
          <Card key={news.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <CardTitle className="text-xl">{news.title}</CardTitle>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(news.createdAt)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>Administrador</span>
                    </div>
                  </div>
                </div>
                <Badge variant="secondary">Publicado</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{news.content}</p>
              {isAdmin && (
                <div className="flex space-x-2 mt-4 pt-4 border-t">
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

      {mockNews.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Calendar className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma notícia encontrada
            </h3>
            <p className="text-gray-600 mb-4">
              {isAdmin 
                ? 'Comece criando a primeira notícia do sistema'
                : 'Novas notícias aparecerão aqui quando disponíveis'}
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
