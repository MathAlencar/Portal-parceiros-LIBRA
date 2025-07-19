import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Video, Plus, ArrowRight, Edit, Trash2 } from 'lucide-react';
import { Material } from '@/types/auth';
import { useAuth } from '@/contexts/AuthContext';
import MaterialModal from '@/components/Materials/MaterialModal';
import MaterialTable from '@/components/Materials/MaterialTable';
import MaterialFilter from '@/components/Materials/MaterialFilter';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';

interface MaterialWithDetails extends Material {
  fileSize: string;
  downloadCount: number;
  thumbnailUrl: string;
  downloadUrl?: string;
}

const MaterialApoio: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialWithDetails | null>(null);
  const [materialToDelete, setMaterialToDelete] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [typeFilter, setTypeFilter] = useState('all');

  // Mock data for materials
  const [mockMaterials, setMockMaterials] = useState<MaterialWithDetails[]>([
    {
      id: '1',
      title: 'Guia Completo do Sistema',
      type: 'file',
      url: 'https://drive.google.com/file/d/example1',
      description: 'Manual completo com todas as funcionalidades do sistema, passo a passo para configuração e uso avançado.',
      createdAt: '2024-01-15',
      fileSize: '2.5 MB',
      downloadCount: 127,
      thumbnailUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=300',
      downloadUrl: 'https://drive.google.com/file/d/example1'
    },
    {
      id: '2',
      title: 'Vídeo Tutorial - Primeiros Passos',
      type: 'link',
      url: '',
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
      url: 'https://drive.google.com/file/d/example3',
      description: 'Coleção de templates prontos para criação de relatórios profissionais e apresentações.',
      createdAt: '2024-01-10',
      fileSize: '1.8 MB',
      downloadCount: 203,
      thumbnailUrl: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=300',
      downloadUrl: 'https://drive.google.com/file/d/example3'
    }
  ]);

  // Filter and sort logic
  const filteredAndSortedMaterials = useMemo(() => {
    let filtered = [...mockMaterials];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(material => 
        material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (typeFilter === 'with-pdf') {
      filtered = filtered.filter(material => material.downloadUrl);
    } else if (typeFilter === 'with-link') {
      filtered = filtered.filter(material => material.url && !material.downloadUrl);
    }

    // Apply sorting
    if (sortBy === 'recent') {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'alphabetical') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    return filtered;
  }, [mockMaterials, searchTerm, typeFilter, sortBy]);

  // Generate applied filters text
  const appliedFilters = useMemo(() => {
    const filters = [];
    if (typeFilter === 'with-pdf') {
      filters.push('Tipo = Com PDF para Download');
    } else if (typeFilter === 'with-link') {
      filters.push('Tipo = Somente com Link Externo');
    }
    if (sortBy === 'recent') {
      filters.push('Ordenado por: Mais recentes');
    } else if (sortBy === 'alphabetical') {
      filters.push('Ordenado por: A-Z');
    }
    return filters;
  }, [typeFilter, sortBy]);

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

  const handleViewMore = (materialId: string) => {
    navigate(`/materiais/${materialId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleCreateMaterial = () => {
    setSelectedMaterial(null);
    setIsModalOpen(true);
  };

  const handleEditMaterial = (material: MaterialWithDetails) => {
    setSelectedMaterial(material);
    setIsModalOpen(true);
  };

  const handleDeleteMaterial = (materialId: string) => {
    setMaterialToDelete(materialId);
    setIsDeleteModalOpen(true);
  };

  const handleSaveMaterial = (data: any) => {
    if (selectedMaterial) {
      // Edit existing material
      setMockMaterials(prev => prev.map(material => 
        material.id === selectedMaterial.id 
          ? {
              ...material,
              title: data.title,
              description: data.description,
              url: data.downloadUrl || '',
              downloadUrl: data.downloadUrl,
              thumbnailUrl: data.thumbnailUrl || material.thumbnailUrl
            }
          : material
      ));
    } else {
      // Create new material
      const newMaterial: MaterialWithDetails = {
        id: Date.now().toString(),
        title: data.title,
        type: data.downloadUrl ? 'file' : 'link',
        url: data.downloadUrl || '',
        description: data.description,
        createdAt: new Date().toISOString().split('T')[0],
        fileSize: 'N/A',
        downloadCount: 0,
        thumbnailUrl: data.thumbnailUrl || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=300',
        downloadUrl: data.downloadUrl
      };
      setMockMaterials(prev => [newMaterial, ...prev]);
    }
    setIsModalOpen(false);
    setSelectedMaterial(null);
  };

  const confirmDeleteMaterial = () => {
    if (materialToDelete) {
      setMockMaterials(prev => prev.filter(material => material.id !== materialToDelete));
      setMaterialToDelete(null);
      setIsDeleteModalOpen(false);
    }
  };

  const handleDownload = (url: string) => {
    window.open(url, '_blank', 'noopener noreferrer');
  };

  if (isAdmin && viewMode === 'table') {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Material de Apoio</h1>
            <p className="text-gray-600">Gerencie os materiais de apoio disponíveis</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setViewMode('cards')}>
              Visualização Cards
            </Button>
            <Button onClick={handleCreateMaterial}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Material
            </Button>
          </div>
        </div>

        <MaterialTable
          materials={mockMaterials}
          onEdit={handleEditMaterial}
          onDelete={handleDeleteMaterial}
        />

        <MaterialModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveMaterial}
          material={selectedMaterial}
        />

        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDeleteMaterial}
          title="Excluir Material"
          message="Tem certeza que deseja excluir este material? Esta ação não pode ser desfeita."
        />
      </div>
    );
  }

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
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setViewMode('table')}>
              Visualização Tabela
            </Button>
            <Button onClick={handleCreateMaterial}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Material
            </Button>
          </div>
        )}
      </div>

      {/* Filters */}
      <MaterialFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortBy={sortBy}
        onSortChange={setSortBy}
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
        totalResults={filteredAndSortedMaterials.length}
        appliedFilters={appliedFilters}
      />

      {/* Materials Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredAndSortedMaterials.map((material) => {
          const TypeIcon = getTypeIcon(material.type);
          
          return (
            <Card key={material.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
              <div className="h-48 overflow-hidden bg-gray-100">
                <img 
                  src={material.thumbnailUrl} 
                  alt={material.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
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
                <CardTitle className="text-lg leading-tight line-clamp-2">{material.title}</CardTitle>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                  {material.description}
                </p>
                
                <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
                  <span>{formatDate(material.createdAt)}</span>
                  <span>{material.fileSize}</span>
                </div>

                <div className="space-y-2">
                  {material.downloadUrl && (
                    <Button 
                      onClick={() => handleDownload(material.downloadUrl!)}
                      className="w-full"
                      variant="default"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Baixar PDF
                    </Button>
                  )}

                  <Button 
                    onClick={() => handleViewMore(material.id)}
                    className="w-full"
                    variant="outline"
                  >
                    Ver mais
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>

                {isAdmin && (
                  <div className="flex space-x-2 mt-3 pt-3 border-t">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleEditMaterial(material)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteMaterial(material.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Excluir
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredAndSortedMaterials.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <FileText className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum material encontrado
            </h3>
            <p className="text-gray-600 mb-4">
              {mockMaterials.length === 0 
                ? (isAdmin 
                    ? 'Comece adicionando o primeiro material de apoio'
                    : 'Novos materiais aparecerão aqui quando disponíveis')
                : 'Tente ajustar os filtros ou limpar a busca para ver mais resultados'}
            </p>
            {isAdmin && mockMaterials.length === 0 && (
              <Button onClick={handleCreateMaterial}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Material
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <MaterialModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveMaterial}
        material={selectedMaterial}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteMaterial}
        title="Excluir Material"
        message="Tem certeza que deseja excluir este material? Esta ação não pode ser desfeita."
      />
    </div>
  );
};

export default MaterialApoio;
