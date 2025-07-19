
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
      <DialogContent className="min-w-[900px] max-w-[90vw] max-h-[95vh] overflow-y-auto rounded-xl border-0 shadow-2xl">
        <DialogHeader className="px-8 pt-8 pb-2">
          <DialogTitle className="text-2xl font-bold text-gray-900 leading-tight">
            {material ? 'Editar Material' : 'Novo Material'}
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-2">
            Preencha os campos abaixo para {material ? 'atualizar' : 'criar'} o material de apoio
          </p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="px-8 pb-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Basic Info */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-gray-50 rounded-lg p-6 border">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h3>
                  
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="mb-4">
                        <FormLabel className="text-sm font-medium text-gray-700">Título do Material *</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Ex: Guia do Parceiro" 
                            className="h-11 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem className="mb-4">
                        <FormLabel className="text-sm font-medium text-gray-700">Tipo *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11 rounded-lg border-gray-200 focus:border-blue-500">
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="link">Link Externo</SelectItem>
                            <SelectItem value="file">Arquivo/Documento</SelectItem>
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
                        <FormLabel className="text-sm font-medium text-gray-700">
                          {watchType === 'link' ? 'URL Externa' : 'Link do Arquivo'}
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
                            className="h-11 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          />
                        </FormControl>
                        <FormMessage />
                        <p className="text-xs text-gray-500 mt-1">
                          {watchType === 'link' 
                            ? 'Link para conteúdo externo (site, vídeo, etc.)'
                            : 'Link do Google Drive ou outro serviço de armazenamento'
                          }
                        </p>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Right Column - Description */}
              <div className="lg:col-span-2">
                <div className="bg-gray-50 rounded-lg p-6 border h-full">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Descrição do Material</h3>
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="h-full">
                        <FormLabel className="text-sm font-medium text-gray-700">Descrição</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Descreva detalhadamente o conteúdo do material, seu propósito e como ele pode ajudar os usuários. Seja claro e informativo..."
                            className="min-h-[400px] resize-y rounded-lg border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm leading-relaxed"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-8 border-t mt-8">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                className="px-6 py-3 rounded-lg border-gray-300 hover:bg-gray-50"
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
              >
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
