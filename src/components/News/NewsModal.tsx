
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const newsSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  category: z.string().min(1, "Categoria é obrigatória"),
  imageUrl: z.string().url("URL da imagem deve ser válida").optional().or(z.literal("")),
  content: z.string().min(1, "Conteúdo é obrigatório"),
});

type NewsFormData = z.infer<typeof newsSchema>;

interface NewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: NewsFormData) => void;
  editingNews?: any;
}

const categories = [
  { id: 'sistema', label: 'Sistema' },
  { id: 'treinamento', label: 'Treinamento' },
  { id: 'manutencao', label: 'Manutenção' },
  { id: 'mercado', label: 'Mercado' },
  { id: 'atualizacoes', label: 'Atualizações' },
  { id: 'eventos', label: 'Eventos' }
];

const NewsModal: React.FC<NewsModalProps> = ({ isOpen, onClose, onSave, editingNews }) => {
  const form = useForm<NewsFormData>({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      title: '',
      category: '',
      imageUrl: '',
      content: '',
    },
  });

  useEffect(() => {
    if (editingNews) {
      form.reset({
        title: editingNews.title || '',
        category: editingNews.category || '',
        imageUrl: editingNews.imageUrl || '',
        content: editingNews.content || '',
      });
    } else {
      form.reset({
        title: '',
        category: '',
        imageUrl: '',
        content: '',
      });
    }
  }, [editingNews, form, isOpen]);

  const onSubmit = (data: NewsFormData) => {
    onSave(data);
    form.reset();
    onClose();
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
            {editingNews ? 'Editar Notícia' : 'Nova Notícia'}
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-2">
            Preencha os campos abaixo para {editingNews ? 'atualizar' : 'criar'} a notícia
          </p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="px-8 pb-8">
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
                        <FormLabel className="text-sm font-medium text-gray-700">Título da Notícia *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Digite o título da notícia" 
                            className="h-11 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem className="mb-4">
                        <FormLabel className="text-sm font-medium text-gray-700">Categoria *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11 rounded-lg border-gray-200 focus:border-blue-500">
                              <SelectValue placeholder="Selecione uma categoria" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">URL da Imagem (opcional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://exemplo.com/imagem.jpg" 
                            className="h-11 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Right Column - Content */}
              <div className="lg:col-span-2">
                <div className="bg-gray-50 rounded-lg p-6 border h-full">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Conteúdo da Notícia</h3>
                  
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem className="h-full">
                        <FormLabel className="text-sm font-medium text-gray-700">Conteúdo da Notícia *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Digite o conteúdo completo da notícia. Seja detalhado e informativo para proporcionar uma boa experiência aos leitores..."
                            className="min-h-[400px] resize-y rounded-lg border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm leading-relaxed"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="gap-3 pt-8 border-t mt-8">
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
                {editingNews ? 'Salvar Alterações' : 'Criar Notícia'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NewsModal;
