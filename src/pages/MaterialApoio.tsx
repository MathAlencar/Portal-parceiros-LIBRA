
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Video, Image, Plus } from 'lucide-react';
import { Material } from '@/types/auth';
import { useAuth } from '@/contexts/AuthContext';

interface MaterialWithDetails extends Material {
  fileSize: string;
  downloadCount: number;
  thumbnailUrl: string;
}

const MaterialApoio: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Mock data for materials
  const mockMaterials: MaterialWithDetails[] = [
    {
      id: '1',
      title: 'Guia Completo do Sistema',
      type: 'file',
      url: '/downloads/guia-sistema.pdf',
      description: 'Manual completo com todas as funcionalidades do sistema, passo a passo para configuração e uso avançado.',
      createdAt: '2024-01-15',
      fileSize: '2.5 MB',
      downloadCount: 127,
      thumbnailUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=300'
    },
    {
      id: '2',
      title: 'Vídeo Tutorial - Primeiros Passos',
      type: 'link',
      url: 'https://youtube.com/watch?v=example',
      description: 'Vídeo explicativo sobre como começar a usar a plataforma, ideal para novos usuários.',
      createdAt: '2024-01-12',
      fileSize: 'Online',
      downloadCount: 89,
      thumbnailUrl: 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=300'
    },
    {
      id: '3',
      title: 'Templates de Relatórios',
      type: 'file',
      url: '/downloads/templates-relatorios.zip',
      description: 'Coleção de templates prontos para criação de relatórios profissionais e apresentações.',
      createdAt: '2024-01-10',
      fileSize: '1.8 MB',
      downloadCount: 203,
      thumbnailUrl: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=300'
    },
    {
      id: '4',
      title: 'Checklist de Configuração',
      type: 'file',
      url: '/downloads/checklist-configuracao.pdf',
      description: 'Lista de verificação para garantir que todas as configurações estejam corretas.',
      createdAt: '2024-01-08',
      fileSize: '512 KB',
      downloadCount: 156,
      thumbnailUrl: 'https://images.unsplash.com/photo-1483058712412-4245e9b90334?w=300'
    },
    {
      id: '5',
      title: 'Boas Práticas de Segurança',
      type: 'file',
      url: '/downloads/boas-praticas-seguranca.pdf',
      description: 'Documento com orientações sobre segurança digital e proteção de dados na plataforma.',
      createdAt: '2024-01-05',
      fileSize: '1.2 MB',
      downloadCount: 95,
      thumbnailUrl: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=300'
    },
    {
      id: '6',
      title: 'Integração com APIs',
      type: 'link',
      url: 'https://docs.api.example.com',
      description: 'Documentação técnica para desenvolvedores sobre integração com APIs externas.',
      createdAt: '2024-01-02',
      fileSize: 'Online',
      downloadCount: 67,
      thumbnailUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=300'
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'file':
        return FileText;
      case 'link':
        return Video;
      default:
        return FileText;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'file':
        return 'Arquivo';
      case 'link':
        return 'Link';
      default:
        return 'Material';
    }
  };

  const handleDownload = (material: MaterialWithDetails) => {
    if (material.type === 'link') {
      window.open(material.url, '_blank');
    } else {
      // In a real application, this would trigger a file download
      console.log(`Downloading: ${material.title}`);
      // You could also implement actual file download logic here
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Material de Apoio</h1>
          <p className="text-gray-600">
            {isAdmin ? 'Gerencie os materiais de apoio disponíveis' : 'Acesse tutoriais, guias e recursos para maximizar seu uso da plataforma'}
          </p>
        </div>
        {isAdmin && (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Material
          </Button>
        )}
      </div>

      {/* Materials Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockMaterials.map((material) => {
          const TypeIcon = getTypeIcon(material.type);
          
          return (
            <Card key={material.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 overflow-hidden bg-gray-100">
                <img 
                  src={material.thumbnailUrl} 
                  alt={material.title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className="mb-2">
                    {getTypeBadge(material.type)}
                  </Badge>
                  <div className="flex items-center text-xs text-gray-500">
                    <Download className="h-3 w-3 mr-1" />
                    {material.downloadCount}
                  </div>
                </div>
                <CardTitle className="text-lg leading-tight">{material.title}</CardTitle>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                  {material.description}
                </p>
                
                <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
                  <span>{formatDate(material.createdAt)}</span>
                  <span>{material.fileSize}</span>
                </div>

                <Button 
                  onClick={() => handleDownload(material)}
                  className="w-full"
                  variant={material.type === 'link' ? 'outline' : 'default'}
                >
                  <TypeIcon className="h-4 w-4 mr-2" />
                  {material.type === 'link' ? 'Acessar' : 'Baixar'}
                </Button>

                {isAdmin && (
                  <div className="flex space-x-2 mt-3 pt-3 border-t">
                    <Button variant="outline" size="sm" className="flex-1">
                      Editar
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Excluir
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {mockMaterials.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <FileText className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum material disponível
            </h3>
            <p className="text-gray-600 mb-4">
              {isAdmin 
                ? 'Comece adicionando o primeiro material de apoio'
                : 'Novos materiais aparecerão aqui quando disponíveis'}
            </p>
            {isAdmin && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Material
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MaterialApoio;
