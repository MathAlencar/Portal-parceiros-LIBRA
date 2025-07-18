
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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

        <Card className="h-[calc(100vh-200px)]">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
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
                style={{ minHeight: '600px' }}
                frameBorder="0"
                allowFullScreen
                title="Formulário do Grupo"
                className="rounded-lg"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Formulario;
