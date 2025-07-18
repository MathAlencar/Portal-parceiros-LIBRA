
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator, RotateCcw, Download } from 'lucide-react';
import { SimulationVariable } from '@/types/auth';

const Simulador: React.FC = () => {
  // Mock simulation variables
  const mockVariables: SimulationVariable[] = [
    {
      id: '1',
      name: 'Taxa de Conversão (%)',
      value: 2.5,
      min: 0,
      max: 10,
      step: 0.1,
      description: 'Percentual de conversão esperado'
    },
    {
      id: '2',
      name: 'Investimento Inicial (R$)',
      value: 10000,
      min: 1000,
      max: 100000,
      step: 500,
      description: 'Valor do investimento inicial'
    },
    {
      id: '3',
      name: 'Período (meses)',
      value: 12,
      min: 1,
      max: 60,
      step: 1,
      description: 'Período de análise em meses'
    },
    {
      id: '4',
      name: 'Taxa de Crescimento (%)',
      value: 5,
      min: 0,
      max: 20,
      step: 0.5,
      description: 'Taxa de crescimento mensal'
    }
  ];

  const [variables, setVariables] = useState<SimulationVariable[]>(mockVariables);
  const [result, setResult] = useState<number | null>(null);

  const handleVariableChange = (id: string, newValue: number[]) => {
    setVariables(prev => 
      prev.map(variable => 
        variable.id === id 
          ? { ...variable, value: newValue[0] }
          : variable
      )
    );
  };

  const calculateResult = () => {
    // Simple simulation calculation
    const conversao = variables.find(v => v.id === '1')?.value || 0;
    const investimento = variables.find(v => v.id === '2')?.value || 0;
    const periodo = variables.find(v => v.id === '3')?.value || 0;
    const crescimento = variables.find(v => v.id === '4')?.value || 0;

    const resultado = investimento * (1 + conversao/100) * Math.pow(1 + crescimento/100, periodo);
    setResult(resultado);
  };

  const resetVariables = () => {
    setVariables(mockVariables);
    setResult(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Simulador</h1>
          <p className="text-gray-600">Ajuste as variáveis e veja os resultados da simulação</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={resetVariables}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Resetar
          </Button>
          {result && (
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Variáveis de Simulação</CardTitle>
              <CardDescription>Ajuste os parâmetros conforme necessário</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {variables.map((variable) => (
                <div key={variable.id} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-medium">{variable.name}</Label>
                    <Input
                      type="number"
                      value={variable.value}
                      onChange={(e) => handleVariableChange(variable.id, [parseFloat(e.target.value) || 0])}
                      className="w-24 h-8 text-right"
                      min={variable.min}
                      max={variable.max}
                      step={variable.step}
                    />
                  </div>
                  <Slider
                    value={[variable.value]}
                    onValueChange={(value) => handleVariableChange(variable.id, value)}
                    min={variable.min}
                    max={variable.max}
                    step={variable.step}
                    className="w-full"
                  />
                  {variable.description && (
                    <p className="text-xs text-gray-500">{variable.description}</p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Executar Simulação</CardTitle>
              <CardDescription>Calcule o resultado com as variáveis atuais</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={calculateResult} className="w-full">
                <Calculator className="h-4 w-4 mr-2" />
                Calcular
              </Button>
            </CardContent>
          </Card>

          {result !== null && (
            <Card>
              <CardHeader>
                <CardTitle>Resultado da Simulação</CardTitle>
                <CardDescription>Baseado nas variáveis configuradas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    R$ {result.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-sm text-gray-600">Valor projetado</p>
                </div>
                
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Investimento Inicial:</span>
                    <span>R$ {variables.find(v => v.id === '2')?.value.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Taxa de Conversão:</span>
                    <span>{variables.find(v => v.id === '1')?.value}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Período:</span>
                    <span>{variables.find(v => v.id === '3')?.value} meses</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Taxa de Crescimento:</span>
                    <span>{variables.find(v => v.id === '4')?.value}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Simulador;
