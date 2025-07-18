
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Info } from 'lucide-react';

const Formulario: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Formulário do Grupo</h1>
          <p className="text-gray-600 mt-2">
            Complete o formulário específico do seu grupo
          </p>
        </div>

        <Card className="h-[calc(100vh-120px)]">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-6 w-6 text-blue-600" />
              <span>Formulário de Avaliação</span>
            </CardTitle>
            <CardDescription>
              Formulário configurado especificamente para o seu grupo
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="w-full h-full bg-white rounded-lg overflow-hidden">
              <iframe
                src="https://forms.ploomes.com/form/71ddb819ff34423593666ab06754953e"
                width="100%"
                height="100%"
                style={{ minHeight: '700px' }}
                frameBorder="0"
                allowFullScreen
                title="Formulário do Grupo"
                className="rounded-lg"
              />
            </div>
          </CardContent>
        </Card>

        {/* Legenda explicativa */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-blue-900 mb-2">
                Sobre este Formulário
              </h3>
              <p className="text-sm text-blue-800 leading-relaxed">
                Este formulário foi desenvolvido especificamente para coletar informações estratégicas 
                do seu grupo. Através dele, você pode fornecer dados importantes sobre processos, 
                desempenho e necessidades específicas da sua área. As informações coletadas são 
                utilizadas para gerar insights personalizados no dashboard e contribuem para a 
                tomada de decisões estratégicas da organização. Complete todas as seções para 
                garantir a precisão dos dados e relatórios gerados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Formulario;
