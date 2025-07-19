
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Material } from '@/types/auth';

const materialSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  type: z.enum(['link', 'file'], { required_error: 'Tipo é obrigatório' }),
  url: z.string().url('URL inválida').optional().or(z.literal('')),
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
      type: material?.type || 'link',
      url: material?.url || '',
    },
  });

  const watchType = form.watch('type');

  React.useEffect(() => {
    if (material) {
      form.reset({
        title: material.title,
        description: material.description || '',
        type: material.type,
        url: material.url,
      });
    } else {
      form.reset({
        title: '',
        description: '',
        type: 'link',
        url: '',
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
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {material ? 'Editar Material' : 'Novo Material'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Digite o título do material" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="link">Link Externo</SelectItem>
                          <SelectItem value="file">Arquivo</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {watchType === 'link' ? 'URL Externa *' : 'Link do Arquivo *'}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder={
                            watchType === 'link' 
                              ? "https://exemplo.com" 
                              : "https://drive.google.com/file/d/..."
                          }
                          type="url"
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-sm text-gray-500">
                        {watchType === 'link' 
                          ? 'Link para conteúdo externo (site, vídeo, etc.)'
                          : 'Link do Google Drive ou outro serviço de armazenamento'
                        }
                      </p>
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Descreva o material..."
                          className="min-h-[200px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t">
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
