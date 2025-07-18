
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, FileText, Video, Calendar } from 'lucide-react';

interface MaterialWithDetails {
  id: string;
  title: string;
  type: 'link' | 'file';
  url: string;
  description: string;
  createdAt: string;
  fileSize: string;
  downloadCount: number;
  thumbnailUrl: string;
}

const MaterialDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock data - em uma aplicação real, isso viria de uma API
  const mockMaterials: MaterialWithDetails[] = [
    {
      id: '1',
      title: 'Guia Completo do Sistema',
      type: 'file',
      url: '/downloads/guia-sistema.pdf',
      description: 'Manual completo com todas as funcionalidades do sistema, passo a passo para configuração e uso avançado. Este guia abrangente inclui:\n\n• Configuração inicial do sistema\n• Navegação pelos módulos principais\n• Criação e gerenciamento de relatórios\n• Configurações de segurança\n• Dicas de produtividade\n• Solução de problemas comuns\n• Glossário de termos técnicos\n\nEste material é essencial para novos usuários e serve como referência rápida para funcionalidades avançadas. Recomendamos manter uma cópia impressa ou salva no dispositivo para consulta offline.',
      createdAt: '2024-01-15',
      fileSize: '2.5 MB',
      downloadCount: 127,
      thumbnailUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400'
    },
    {
      id: '2',
      title: 'Vídeo Tutorial - Primeiros Passos',
      type: 'link',
      url: 'https://youtube.com/watch?v=example',
      description: 'Vídeo explicativo sobre como começar a usar a plataforma, ideal para novos usuários. Este tutorial em vídeo cobre:\n\n• Primeiro acesso ao sistema\n• Navegação básica\n• Configuração do perfil\n• Primeiros relatórios\n• Dicas de navegação\n• Atalhos úteis\n\nDuração: 15 minutos\nIdioma: Português\nQualidade: HD 1080p\n\nEste vídeo é perfeito para quem prefere aprender visualmente e quer uma introdução rápida às principais funcionalidades.',
      createdAt: '2024-01-12',
      fileSize: 'Online',
      downloadCount: 89,
      thumbnailUrl: 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=400'
    },
    {
      id: '3',
      title: 'Templates de Relatórios',
      type: 'file',
      url: '/downloads/templates-relatorios.zip',
      description: 'Coleção de templates prontos para criação de relatórios profissionais e apresentações. Este pacote inclui:\n\n• Template de relatório mensal\n• Template de relatório trimestral\n• Template de análise de performance\n• Template de apresentação executiva\n• Template de dashboard resumido\n• Guia de personalização\n• Exemplos preenchidos\n\nTodos os templates são compatíveis com as principais ferramentas de escritório e podem ser personalizados conforme a necessidade da sua área.',
      createdAt: '2024-01-10',
      fileSize: '1.8 MB',
      downloadCount: 203,
      thumbnailUrl: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=400'
    },
    {
      id: '4',
      title: 'Checklist de Configuração',
      type: 'file',
      url: '/downloads/checklist-configuracao.pdf',
      description: 'Lista de verificação para garantir que todas as configurações estejam corretas. Este checklist inclui:\n\n• Verificações de segurança\n• Configurações de perfil\n• Permissões de acesso\n• Integrações externas\n• Backup de dados\n• Configurações de notificação\n• Testes de funcionalidade\n\nUse este checklist durante a configuração inicial ou para auditorias periódicas do sistema. Cada item inclui instruções detalhadas e critérios de validação.',
      createdAt: '2024-01-08',
      fileSize: '512 KB',
      downloadCount: 156,
      thumbnailUrl: 'https://images.unsplash.com/photo-1483058712412-4245e9b90334?w=400'
    },
    {
      id: '5',
      title: 'Boas Práticas de Segurança',
      type: 'file',
      url: '/downloads/boas-praticas-seguranca.pdf',
      description: 'Documento com orientações sobre segurança digital e proteção de dados na plataforma. Este guia aborda:\n\n• Criação de senhas seguras\n• Autenticação de dois fatores\n• Proteção contra phishing\n• Backup seguro de dados\n• Controle de acesso\n• Monitoramento de atividades\n• Resposta a incidentes\n\nSeguir estas práticas é essencial para manter a segurança dos dados e garantir a conformidade com as políticas da organização.',
      createdAt: '2024-01-05',
      fileSize: '1.2 MB',
      downloadCount: 95,
      thumbnailUrl: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=400'
    },
    {
      id: '6',
      title: 'Integração com APIs',
      type: 'link',
      url: 'https://docs.api.example.com',
      description: 'Documentação técnica para desenvolvedores sobre integração com APIs externas. Esta documentação inclui:\n\n• Endpoints disponíveis\n• Métodos de autenticação\n• Exemplos de código\n• Estrutura de dados\n• Códigos de erro\n• Limites de taxa\n• SDKs disponíveis\n\nDestinado a desenvolvedores e administradores técnicos que precisam integrar o sistema com outras plataformas.',
      createdAt: '2024-01-02',
      fileSize: 'Online',
      downloadCount: 67,
      thumbnailUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400'
    }
  ];

  const material = mockMaterials.find(item => item.id === id);

  if (!material) {
    return (
      <div className="p-6">
        <Button 
          onClick={() => navigate('/materiais')}
          variant="outline"
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Material não encontrado
            </h3>
            <p className="text-gray-600">
              O material que você está procurando não existe ou foi removido.
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

  const handleDownload = () => {
    if (material.type === 'link') {
      window.open(material.url, '_blank');
    } else {
      console.log(`Downloading: ${material.title}`);
      // Implementar lógica de download real aqui
    }
  };

  const getTypeIcon = () => {
    return material.type === 'file' ? FileText : Video;
  };

  const TypeIcon = getTypeIcon();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <Button 
          onClick={() => navigate('/materiais')}
          variant="outline"
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Materiais
        </Button>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="h-96 overflow-hidden bg-gray-100">
            <img 
              src={material.thumbnailUrl} 
              alt={material.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="p-8">
            <header className="mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <Badge variant="outline" className="mb-3">
                    {material.type === 'file' ? 'Arquivo' : 'Link'}
                  </Badge>
                  <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                    {material.title}
                  </h1>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(material.createdAt)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Download className="h-4 w-4" />
                    <span>{material.downloadCount} downloads</span>
                  </div>
                  <span>Tamanho: {material.fileSize}</span>
                </div>

                <Button 
                  onClick={handleDownload}
                  size="lg"
                  className="ml-4"
                >
                  <TypeIcon className="h-4 w-4 mr-2" />
                  {material.type === 'link' ? 'Acessar' : 'Baixar'}
                </Button>
              </div>
            </header>

            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
              {formatContent(material.description)}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <Button 
            onClick={() => navigate('/materiais')}
            size="lg"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Materiais
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MaterialDetail;
