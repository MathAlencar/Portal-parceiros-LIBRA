
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Group } from '@/types/auth';

interface GroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (groupData: Omit<Group, 'id' | 'createdAt'>) => void;
  group?: Group | null;
}

const GroupModal: React.FC<GroupModalProps> = ({
  isOpen,
  onClose,
  onSave,
  group
}) => {
  const [formData, setFormData] = useState({
    name: '',
    powerBiUrl: '',
    formUrl: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (group) {
      setFormData({
        name: group.name,
        powerBiUrl: group.powerBiUrl || '',
        formUrl: group.formUrl || ''
      });
    } else {
      setFormData({
        name: '',
        powerBiUrl: '',
        formUrl: ''
      });
    }
    setErrors({});
  }, [group, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome do grupo é obrigatório';
    }

    if (!formData.powerBiUrl.trim()) {
      newErrors.powerBiUrl = 'Link do Power BI é obrigatório';
    } else if (!isValidUrl(formData.powerBiUrl)) {
      newErrors.powerBiUrl = 'Por favor, insira uma URL válida';
    }

    if (!formData.formUrl.trim()) {
      newErrors.formUrl = 'Link do formulário é obrigatório';
    } else if (!isValidUrl(formData.formUrl)) {
      newErrors.formUrl = 'Por favor, insira uma URL válida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave({
        name: formData.name.trim(),
        powerBiUrl: formData.powerBiUrl.trim(),
        formUrl: formData.formUrl.trim()
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {group ? 'Editar Grupo' : 'Novo Grupo'}
          </DialogTitle>
          <DialogDescription>
            {group 
              ? 'Atualize as informações do grupo'
              : 'Preencha os dados para criar um novo grupo'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Grupo *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Digite o nome do grupo"
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="powerBiUrl">Link do Power BI *</Label>
            <Input
              id="powerBiUrl"
              value={formData.powerBiUrl}
              onChange={(e) => handleInputChange('powerBiUrl', e.target.value)}
              placeholder="https://app.powerbi.com/view?r=..."
              className={errors.powerBiUrl ? 'border-destructive' : ''}
            />
            {errors.powerBiUrl && (
              <p className="text-sm text-destructive">{errors.powerBiUrl}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Link embedável do Power BI que será exibido no dashboard dos usuários
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="formUrl">Link do Formulário *</Label>
            <Input
              id="formUrl"
              value={formData.formUrl}
              onChange={(e) => handleInputChange('formUrl', e.target.value)}
              placeholder="https://forms.office.com/..."
              className={errors.formUrl ? 'border-destructive' : ''}
            />
            {errors.formUrl && (
              <p className="text-sm text-destructive">{errors.formUrl}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Link embedável do formulário que será exibido na aba formulário
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {group ? 'Atualizar Grupo' : 'Criar Grupo'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default GroupModal;
