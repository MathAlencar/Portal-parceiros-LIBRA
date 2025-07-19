
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingNews ? 'Editar Notícia' : 'Nova Notícia'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título da Notícia *</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite o título da notícia" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
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
                      <FormLabel>URL da Imagem (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://exemplo.com/imagem.jpg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Right Column - Content */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conteúdo da Notícia *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Digite o conteúdo completo da notícia..."
                          className="min-h-[280px] resize-y"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter className="gap-2 pt-6">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit">
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
