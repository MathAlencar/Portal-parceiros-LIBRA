
import React, { useState, useMemo, useEffect } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MaterialWithDetails extends Material {
  fileSize: string;
  downloadCount: number;
  thumbnailUrl: string;
  downloadUrl?: string;
}

const MaterialApoio: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isAdmin = user?.role === 'admin';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialWithDetails | null>(null);
  const [materialToDelete, setMaterialToDelete] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [typeFilter, setTypeFilter] = useState('all');

  const [materials, setMaterials] = useState<MaterialWithDetails[]>([]);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching materials:', error);
        toast({
          title: "Erro ao carregar materiais",
          description: "Não foi possível carregar os materiais.",
          variant: "destructive",
        });
        return;
      }

      const formattedMaterials: MaterialWithDetails[] = data.map(material => ({
        id: material.id,
        title: material.title,
        type: material.type,
        url: material.url,
        description: material.description || '',
        createdAt: material.created_at,
        fileSize: 'N/A', // This would need to be calculated or stored
        downloadCount: 0, // This would need to be tracked separately
        thumbnailUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=300',
        downloadUrl: material.url || undefined
      }));

      setMaterials(formattedMaterials);
    } catch (error) {
      console.error('Error fetching materials:', error);
      toast({
        title: "Erro ao carregar materiais",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort logic
  const filteredAndSortedMaterials = useMemo(() => {
    let filtered = [...materials];

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
  }, [materials, searchTerm, typeFilter, sortBy]);

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

  const handleSaveMaterial = async (data: any) => {
    try {
      if (selectedMaterial) {
        // Edit existing material
        const { error } = await supabase
          .from('materials')
          .update({
            title: data.title,
            description: data.description,
            url: data.downloadUrl || data.url,
            type: data.downloadUrl ? 'file' : 'link'
          })
          .eq('id', selectedMaterial.id);

        if (error) {
          console.error('Error updating material:', error);
          toast({
            title: "Erro ao atualizar material",
            description: "Não foi possível atualizar o material.",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Material atualizado",
          description: "O material foi atualizado com sucesso.",
        });
      } else {
        // Create new material
        const { error } = await supabase
          .from('materials')
          .insert({
            title: data.title,
            description: data.description,
            url: data.downloadUrl || data.url,
            type: data.downloadUrl ? 'file' : 'link'
          });

        if (error) {
          console.error('Error creating material:', error);
          toast({
            title: "Erro ao criar material",
            description: "Não foi possível criar o material.",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Material criado",
          description: "O material foi criado com sucesso.",
        });
      }

      await fetchMaterials(); // Refresh the list
      setIsModalOpen(false);
      setSelectedMaterial(null);
    } catch (error) {
      console.error('Error saving material:', error);
      toast({
        title: "Erro ao salvar material",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    }
  };

  const confirmDeleteMaterial = async () => {
    if (!materialToDelete) return;

    try {
      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', materialToDelete);

      if (error) {
        console.error('Error deleting material:', error);
        toast({
          title: "Erro ao excluir material",
          description: "Não foi possível excluir o material.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Material excluído",
        description: "O material foi excluído com sucesso.",
      });

      await fetchMaterials(); // Refresh the list
      setMaterialToDelete(null);
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting material:', error);
      toast({
        title: "Erro ao excluir material",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = (url: string) => {
    window.open(url, '_blank', 'noopener noreferrer');
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Material de Apoio</h1>
            <p className="text-gray-600">Carregando materiais...</p>
          </div>
        </div>
      </div>
    );
  }

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
          materials={materials}
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
              {materials.length === 0 
                ? (isAdmin 
                    ? 'Comece adicionando o primeiro material de apoio'
                    : 'Novos materiais aparecerão aqui quando disponíveis')
                : 'Tente ajustar os filtros ou limpar a busca para ver mais resultados'}
            </p>
            {isAdmin && materials.length === 0 && (
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
