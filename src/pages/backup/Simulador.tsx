
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench, Calendar, Code } from 'lucide-react';

const Simulador: React.FC = () => {
  return (
    <div className="p-6 space-y-6 mx-auto max--7xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Simulador</h1>
          <p className="text-gray-600">Ferramenta de simulação em desenvolvimento</p>
        </div>
      </div>

      <div className="flex items-center justify-center min-h-[600px]">
        <Card className="max-w-2xl w-full mx-auto">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-orange-100">
              <Wrench className="h-10 w-10 text-orange-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Simulador em Desenvolvimento
            </CardTitle>
            <CardDescription className="text-lg text-gray-600">
              Esta funcionalidade está sendo desenvolvida pela nossa equipe
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <p className="text-gray-700 leading-relaxed">
              O simulador permitirá que você teste diferentes cenários e variáveis 
              para otimizar seus resultados. Esta ferramenta avançada está sendo 
              cuidadosamente desenvolvida para oferecer a melhor experiência possível.
            </p>
            
            <div className="grid md:grid-cols-2 gap-4 text-left">
              <div className="flex items-start space-x-3">
                <Code className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Em Desenvolvimento</h3>
                  <p className="text-sm text-gray-600">
                    Nossa equipe está trabalhando na implementação das funcionalidades
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Em Breve</h3>
                  <p className="text-sm text-gray-600">
                    Assim que estiver pronto, você será notificado
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Fique atento:</strong> Quando a funcionalidade estiver disponível, 
                você poderá criar simulações personalizadas e análises detalhadas.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Simulador;
