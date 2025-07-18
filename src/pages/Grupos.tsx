
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Edit, Trash2, Eye, Plus } from 'lucide-react';
import { Group } from '@/types/auth';
import GroupModal from '@/components/GroupModal';
import GroupViewModal from '@/components/GroupViewModal';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import { useToast } from '@/hooks/use-toast';

// Mock data for groups
const mockGroups: Group[] = [
  {
    id: '1',
    name: 'Grupo 1',
    powerBiUrl: 'https://app.powerbi.com/view?r=eyJrIjoiZXhhbXBsZSIsInQiOiJhIn0%3D',
    formUrl: 'https://forms.office.com/pages/designpagev2.aspx?subpage=design&FormId=example',
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Grupo 2',
    powerBiUrl: 'https://app.powerbi.com/view?r=eyJrIjoiZXhhbXBsZTIiLCJ0IjoiYSJ9',
    formUrl: 'https://forms.office.com/pages/designpagev2.aspx?subpage=design&FormId=example2',
    createdAt: '2024-01-20T14:30:00Z'
  }
];

// Mock function to get user count by group
const getUserCountByGroup = (groupId: string): number => {
  const counts: Record<string, number> = {
    '1': 5,
    '2': 2
  };
  return counts[groupId] || 0;
};

const Grupos: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>(mockGroups);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [viewingContent, setViewingContent] = useState<{type: 'powerbi' | 'form', url: string, groupName: string} | null>(null);
  const [deletingGroup, setDeletingGroup] = useState<Group | null>(null);
  const { toast } = useToast();

  const handleCreateGroup = () => {
    setEditingGroup(null);
    setIsGroupModalOpen(true);
  };

  const handleEditGroup = (group: Group) => {
    setEditingGroup(group);
    setIsGroupModalOpen(true);
  };

  const handleDeleteGroup = (group: Group) => {
    setDeletingGroup(group);
    setIsDeleteModalOpen(true);
  };

  const handleViewContent = (type: 'powerbi' | 'form', url: string, groupName: string) => {
    setViewingContent({ type, url, groupName });
    setIsViewModalOpen(true);
  };

  const handleSaveGroup = (groupData: Omit<Group, 'id' | 'createdAt'>) => {
    if (editingGroup) {
      // Update existing group
      setGroups(prev => prev.map(group => 
        group.id === editingGroup.id 
          ? { ...group, ...groupData }
          : group
      ));
      toast({
        title: "Grupo atualizado",
        description: "As informações do grupo foram atualizadas com sucesso.",
      });
    } else {
      // Create new group
      const newGroup: Group = {
        id: Date.now().toString(),
        ...groupData,
        createdAt: new Date().toISOString()
      };
      setGroups(prev => [...prev, newGroup]);
      toast({
        title: "Grupo criado",
        description: "O novo grupo foi criado com sucesso.",
      });
    }
    setIsGroupModalOpen(false);
    setEditingGroup(null);
  };

  const handleConfirmDelete = () => {
    if (deletingGroup) {
      setGroups(prev => prev.filter(group => group.id !== deletingGroup.id));
      toast({
        title: "Grupo excluído",
        description: "O grupo foi removido com sucesso.",
      });
      setIsDeleteModalOpen(false);
      setDeletingGroup(null);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gerenciar Grupos</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie grupos, links do Power BI e formulários
          </p>
        </div>
        <Button onClick={handleCreateGroup} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Grupo
        </Button>
      </div>

      {/* Groups Table */}
      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome do Grupo</TableHead>
              <TableHead>Power BI</TableHead>
              <TableHead>Formulário</TableHead>
              <TableHead>Usuários Vinculados</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Nenhum grupo encontrado. Clique em "Novo Grupo" para criar o primeiro.
                </TableCell>
              </TableRow>
            ) : (
              groups.map((group) => (
                <TableRow key={group.id}>
                  <TableCell className="font-medium">{group.name}</TableCell>
                  <TableCell>
                    {group.powerBiUrl ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewContent('powerbi', group.powerBiUrl!, group.name)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        Ver
                      </Button>
                    ) : (
                      <span className="text-muted-foreground text-sm">Não configurado</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {group.formUrl ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewContent('form', group.formUrl!, group.name)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        Ver
                      </Button>
                    ) : (
                      <span className="text-muted-foreground text-sm">Não configurado</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {getUserCountByGroup(group.id)} usuários
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditGroup(group)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteGroup(group)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modals */}
      <GroupModal
        isOpen={isGroupModalOpen}
        onClose={() => {
          setIsGroupModalOpen(false);
          setEditingGroup(null);
        }}
        onSave={handleSaveGroup}
        group={editingGroup}
      />

      <GroupViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewingContent(null);
        }}
        content={viewingContent}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingGroup(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Excluir Grupo"
        message={`Tem certeza que deseja excluir o grupo "${deletingGroup?.name}"? Esta ação não poderá ser desfeita e todos os usuários vinculados perderão o acesso aos recursos do grupo.`}
      />
    </div>
  );
};

export default Grupos;
