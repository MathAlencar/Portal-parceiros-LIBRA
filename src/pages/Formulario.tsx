
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Info } from 'lucide-react';

const Formulario: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Formulário do Grupo</h1>
          <p className="text-gray-600 mt-2">
            Complete o formulário específico do seu grupo
          </p>
        </div>

        {/* Form Embed Section - Increased Size */}
        <div className="w-full">
          <Card className="shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-6 w-6 text-blue-600" />
                <span>Formulário de Avaliação</span>
              </CardTitle>
              <CardDescription>
                Formulário configurado especificamente para o seu grupo
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="w-full bg-white rounded-lg overflow-hidden border">
                <iframe
                  src="https://forms.ploomes.com/form/71ddb819ff34423593666ab06754953e"
                  width="100%"
                  height="800"
                  style={{ minHeight: '800px' }}
                  frameBorder="0"
                  allowFullScreen
                  title="Formulário do Grupo"
                  className="rounded-lg"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Explanatory Legend - Outside the form iframe */}
        <Card className="shadow-md">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  📝 Sobre este Formulário
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Este formulário foi desenvolvido para coletar informações estratégicas do seu grupo. 
                  Através dele, você pode fornecer dados importantes sobre leads, performance e 
                  necessidades da sua área. As informações coletadas alimentam os dashboards e 
                  ajudam na tomada de decisões baseadas em dados. Complete todas as seções para 
                  garantir a precisão dos dados e relatórios gerados.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Formulario;
