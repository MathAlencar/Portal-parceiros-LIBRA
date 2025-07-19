
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, FileText, Video, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MaterialWithDetails {
  id: string;
  title: string;
  type: 'link' | 'file';
  url: string;
  description: string;
  createdAt: string;
}

const MaterialDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [material, setMaterial] = useState<MaterialWithDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaterial = async () => {
      if (!id) {
        console.error('MaterialDetail: No ID provided in URL params');
        setLoading(false);
        return;
      }

      console.log('MaterialDetail: Fetching material with ID:', id);

      try {
        const { data, error } = await supabase
          .from('materials')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        console.log('MaterialDetail: Supabase response:', { data, error });

        if (error) {
          console.error('MaterialDetail: Error fetching material:', error);
          toast({
            title: "Erro ao carregar material",
            description: "Não foi possível carregar os detalhes do material.",
            variant: "destructive",
          });
          setMaterial(null);
          return;
        }

        if (!data) {
          console.log('MaterialDetail: No material found with ID:', id);
          setMaterial(null);
          return;
        }

        const formattedMaterial: MaterialWithDetails = {
          id: data.id,
          title: data.title,
          type: (data.type === 'link' || data.type === 'file') ? data.type : 'file',
          url: data.url,
          description: data.description || '',
          createdAt: data.created_at
        };

        console.log('MaterialDetail: Formatted material:', formattedMaterial);
        setMaterial(formattedMaterial);
      } catch (error) {
        console.error('MaterialDetail: Unexpected error:', error);
        toast({
          title: "Erro inesperado",
          description: "Ocorreu um erro inesperado ao carregar o material.",
          variant: "destructive",
        });
        setMaterial(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterial();
  }, [id, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-6">
          <Button 
            onClick={() => navigate('/materiais')}
            variant="outline"
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Materiais
          </Button>
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-600">Carregando material...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!material) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-6">
          <Button 
            onClick={() => navigate('/materiais')}
            variant="outline"
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Materiais
          </Button>
          <Card>
            <CardContent className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Material não encontrado
              </h3>
              <p className="text-gray-600">
                O material que você está procurando não existe ou foi removido.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatContent = (content: string) => {
    return content.split('\n').map((paragraph, index) => (
      <p key={index} className="mb-4 last:mb-0">
        {paragraph}
      </p>
    ));
  };

  const handleDownload = () => {
    if (material.url) {
      console.log('MaterialDetail: Opening URL:', material.url);
      window.open(material.url, '_blank', 'noopener noreferrer');
    } else {
      console.error('MaterialDetail: No URL available for material');
      toast({
        title: "Erro",
        description: "URL não disponível para este material.",
        variant: "destructive",
      });
    }
  };

  const getTypeIcon = () => {
    return material.type === 'file' ? FileText : Video;
  };

  const TypeIcon = getTypeIcon();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <Button 
          onClick={() => navigate('/materiais')}
          variant="outline"
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Materiais
        </Button>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="h-96 overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
            <div className="text-center">
              <TypeIcon className="h-24 w-24 text-blue-500 mx-auto mb-4" />
              <Badge variant="outline" className="text-lg px-4 py-2">
                {material.type === 'file' ? 'Arquivo' : 'Link Externo'}
              </Badge>
            </div>
          </div>
          
          <div className="p-8">
            <header className="mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                    {material.title}
                  </h1>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(material.createdAt)}</span>
                  </div>
                </div>

                <Button 
                  onClick={handleDownload}
                  size="lg"
                  className="ml-4"
                  disabled={!material.url}
                >
                  <TypeIcon className="h-4 w-4 mr-2" />
                  {material.type === 'link' ? 'Acessar Link' : 'Baixar Arquivo'}
                </Button>
              </div>
            </header>

            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
              {formatContent(material.description)}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <Button 
            onClick={() => navigate('/materiais')}
            size="lg"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Materiais
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MaterialDetail;
