
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Material } from '@/types/auth';

const materialSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  thumbnailUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  downloadUrl: z.string().url('URL inválida').optional().or(z.literal(''))
    .refine((url) => {
      if (!url) return true;
      return url.startsWith('https://drive.google.com/');
    }, 'Link deve ser do Google Drive'),
});

type MaterialFormData = z.infer<typeof materialSchema>;

interface MaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: MaterialFormData) => void;
  material?: Material | null;
}

const MaterialModal: React.FC<MaterialModalProps> = ({
  isOpen,
  onClose,
  onSave,
  material
}) => {
  const form = useForm<MaterialFormData>({
    resolver: zodResolver(materialSchema),
    defaultValues: {
      title: material?.title || '',
      description: material?.description || '',
      thumbnailUrl: '',
      downloadUrl: material?.url || '',
    },
  });

  React.useEffect(() => {
    if (material) {
      form.reset({
        title: material.title,
        description: material.description || '',
        thumbnailUrl: '',
        downloadUrl: material.url,
      });
    } else {
      form.reset({
        title: '',
        description: '',
        thumbnailUrl: '',
        downloadUrl: '',
      });
    }
  }, [material, form]);

  const handleSubmit = (data: MaterialFormData) => {
    onSave(data);
    form.reset();
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {material ? 'Editar Material' : 'Novo Material'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título do Material *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Guia do Parceiro" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição *</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Resumo breve do material..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="thumbnailUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Imagem de Capa (opcional)</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="https://images.unsplash.com/..."
                      type="url"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="downloadUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link de Download (opcional)</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="https://drive.google.com/file/d/..."
                      type="url"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit">
                {material ? 'Salvar Alterações' : 'Criar Material'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default MaterialModal;
