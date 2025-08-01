import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Search, Filter, Plus, ArrowLeft, Construction, DollarSign, Calendar, User, Building, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Interface para os dados do Power BI
interface ClientePowerBI {
  "Parceiros": string;
  "Pendências da etapa": string | null;
  "Entrada Negociação": string | null;
  "Entrada Comercial": string | null;
  "Entrada Crédito": string | null;
  "Entrada Operações": string | null;
  "Responsável (Parceiro)": string;
  "Valor": number;
  "Entrada Registro": string | null;
  "Entrada Comitê": string | null;
  "Cliente": string;
  "Valor financiado (FINAL)": number | null;
  "Entrada AIJ": string | null;
  "Valor (FINAL)": number | null;
  "Término": string | null;
  "Id": number;
  "Motivo de perda": string | null;
  "Estágio": string;
  "Início": string;
  "Situação": string;
}

// Definição dos estágios do pipeline
const estagiosPipeline = [
  { 
    id: 'comercial', 
    nome: 'Comercial', 
    cor: 'blue',
    subestagios: ['Conexão', 'Qualificação', 'Dia 1', 'Dia 2', 'Dia 3', 'Data Marcada']
  },
  { 
    id: 'analise-financeira', 
    nome: 'Análise Financeira', 
    cor: 'green',
    subestagios: ['SCR/Certidões', 'Análise Financeira', 'Doc AF']
  },
  { 
    id: 'analise-juridica', 
    nome: 'Análise Jurídica', 
    cor: 'purple',
    subestagios: ['Análise do Imóvel', 'Análise Jurídica', 'Doc AJ']
  },
  { 
    id: 'comite', 
    nome: 'Comitê', 
    cor: 'orange',
    subestagios: ['Doc CdC', 'Comitê de Crédito']
  },
  { 
    id: 'negociacao', 
    nome: 'Negociação', 
    cor: 'yellow',
    subestagios: ['Negociação', 'Fechamento']
  },
  { 
    id: 'pre-cartorio', 
    nome: 'Pré-Cartório', 
    cor: 'indigo',
    subestagios: ['Laudo/Certificado', 'Formalização', 'Assinatura']
  },
  { 
    id: 'cartorio', 
    nome: 'Cartório', 
    cor: 'pink',
    subestagios: ['Registro', 'Liquidação']
  },
  { 
    id: 'carteira', 
    nome: 'Carteira', 
    cor: 'teal',
    subestagios: ['Ativo', 'Inserção']
  }
];

// Função para mapear estágio do cliente para o pipeline
const mapearEstagioParaPipeline = (estagio: string) => {
  const mapeamento: { [key: string]: string } = {
    // Comercial
    'Conexão': 'comercial',
    'Qualificação': 'comercial',
    'Dia 1': 'comercial',
    'Dia 2': 'comercial',
    'Dia 3': 'comercial',
    'Data Marcada': 'comercial',
    'Comercial': 'comercial',
    
    // Análise Financeira
    'SCR/Certidões': 'analise-financeira',
    'Análise Financeira': 'analise-financeira',
    'Doc AF': 'analise-financeira',
    
    // Análise Jurídica
    'Análise do Imóvel': 'analise-juridica',
    'Análise Jurídica': 'analise-juridica',
    'Doc AJ': 'analise-juridica',
    
    // Comitê
    'Doc CdC': 'comite',
    'Comitê de Crédito': 'comite',
    'Comitê': 'comite',
    
    // Negociação
    'Negociação': 'negociacao',
    'Fechamento': 'negociacao',
    
    // Pré-Cartório
    'Laudo/Certificado': 'pre-cartorio',
    'Formalização': 'pre-cartorio',
    'Assinatura': 'pre-cartorio',
    'Pré-Cartório': 'pre-cartorio',
    
    // Cartório
    'Registro': 'cartorio',
    'Liquidação': 'cartorio',
    'Cartório': 'cartorio',
    
    // Carteira
    'Ativo': 'carteira',
    'Inserção': 'carteira',
    'Carteira': 'carteira'
  };
  return mapeamento[estagio] || 'comercial';
};

// Função para formatar valor monetário
const formatarValor = (valor: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
};

// Função para formatar data
const formatarData = (dataString: string) => {
  if (!dataString) return '-';
  const data = new Date(dataString);
  return data.toLocaleDateString('pt-BR');
};

// Função para formatar nome (apenas primeiro e segundo nome)
const formatarNome = (nomeCompleto: string) => {
  if (!nomeCompleto) return '-';
  const nomes = nomeCompleto.trim().split(' ');
  if (nomes.length <= 2) {
    return nomeCompleto;
  }
  return `${nomes[0]} ${nomes[1]}`;
};

// Componente do card do cliente
const ClienteCard: React.FC<{ cliente: ClientePowerBI; onClick: () => void }> = ({ cliente, onClick }) => {
  const getStatusColor = (situacao: string) => {
    switch (situacao) {
      case 'Em aberto': return 'bg-green-100 text-green-800 border-green-200';
      case 'Perdida': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-300 bg-white"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header do card */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 text-lg truncate">
                {formatarNome(cliente.Cliente)}
              </h4>
              <p className="text-sm text-gray-500 truncate mt-1">
                {cliente['Responsável (Parceiro)']}
              </p>
            </div>
            <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(cliente.Situação)}`}>
              {cliente.Situação}
            </span>
          </div>

          {/* Valor */}
          <div className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <span className="text-lg font-medium text-gray-900">
              {formatarValor(cliente.Valor)}
            </span>
          </div>

          {/* Parceiro */}
          <div className="flex items-center space-x-2">
            <Building className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-gray-600 truncate">
              {cliente.Parceiros}
            </span>
          </div>

          {/* Data de início */}
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-500" />
            <span className="text-sm text-gray-600">
              Início: {formatarData(cliente.Início)}
            </span>
          </div>

          {/* ID do cliente */}
          <div className="text-xs text-gray-400 pt-2 border-t border-gray-100">
            ID: {cliente.Id}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Componente do estágio do pipeline
const EstagioPipeline: React.FC<{ 
  estagio: any; 
  clientes: ClientePowerBI[]; 
  onClienteClick: (cliente: ClientePowerBI) => void 
}> = ({ estagio, clientes, onClienteClick }) => {
  const cores = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    purple: 'bg-purple-50 border-purple-200',
    orange: 'bg-orange-50 border-orange-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    indigo: 'bg-indigo-50 border-indigo-200',
    pink: 'bg-pink-50 border-pink-200',
    teal: 'bg-teal-50 border-teal-200'
  };

  return (
    <div className={`w-96 min-w-96 ${cores[estagio.cor as keyof typeof cores]} rounded-lg border-2 p-4 h-[700px] flex flex-col`}>
      {/* Header do estágio */}
      <div className="mb-4 flex-shrink-0">
        <h3 className="font-semibold text-gray-900 text-lg mb-1">{estagio.nome}</h3>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">{clientes.length} clientes</span>
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
        </div>
      </div>

      {/* Lista de clientes */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {clientes.length > 0 ? (
          clientes.map((cliente, index) => (
            <ClienteCard 
              key={`${cliente.Id}-${index}`} 
              cliente={cliente} 
              onClick={() => onClienteClick(cliente)}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Nenhum cliente</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ClientesCadastrados: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [clienteSelecionado, setClienteSelecionado] = useState<ClientePowerBI | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [clientes, setClientes] = useState<ClientePowerBI[]>([]);
  const [loading, setLoading] = useState(true);
  const [userGroup, setUserGroup] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filtroSituacao, setFiltroSituacao] = useState<string>('Em aberto'); // Filtro padrão

  // Buscar dados do Power BI
  const fetchPowerBIData = async (powerBiUrl: string, grupoNome: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔗 Buscando dados do Power BI:', powerBiUrl);
      console.log('🏢 Filtrando por grupo:', grupoNome);
      
      const response = await fetch(powerBiUrl);
      if (!response.ok) {
        throw new Error(`Erro ao buscar dados: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📊 Dados recebidos do Power BI (todos):', data);
      
      // Filtrar dados pelo grupo do usuário
      const dadosFiltrados = data.filter((cliente: ClientePowerBI) => {
        const parceiroCliente = cliente.Parceiros;
        const grupoUsuario = grupoNome;
        
        console.log(`🔍 Comparando: Cliente "${parceiroCliente}" vs Grupo "${grupoUsuario}"`);
        
        // Verificar se o parceiro do cliente corresponde ao grupo do usuário
        return parceiroCliente === grupoUsuario;
      });
      
      console.log('📊 Dados filtrados para o grupo:', dadosFiltrados);
      console.log(`📈 Total de clientes: ${data.length} | Filtrados: ${dadosFiltrados.length}`);
      
      setClientes(dadosFiltrados);
    } catch (error) {
      console.error('❌ Erro ao buscar dados do Power BI:', error);
      setError('Erro ao carregar dados do Power BI. Verifique se o link está correto.');
      // Usar dados de fallback em caso de erro
      setClientes([]);
    } finally {
      setLoading(false);
    }
  };

  // Buscar grupo do usuário
  const fetchUserGroup = async () => {
    try {
      if (profile?.group_id) {
        const { data: groupData, error } = await supabase
          .from('groups')
          .select('*')
          .eq('id', profile.group_id)
          .single();

        if (error) {
          console.error('Error fetching user group:', error);
          setError('Erro ao carregar dados do grupo');
          return;
        }

        setUserGroup(groupData);
        console.log('🔗 Link do Power BI do grupo:', groupData.name, ':', groupData.power_bi_url);

        if (groupData.power_bi_url) {
          await fetchPowerBIData(groupData.power_bi_url, groupData.name);
        } else {
          setError('Nenhum link do Power BI configurado para este grupo');
        }
      } else {
        setError('Usuário não possui grupo associado');
      }
    } catch (error) {
      console.error('Error fetching user group:', error);
      setError('Erro ao carregar dados do usuário');
    }
  };

  useEffect(() => {
    if (profile) {
      fetchUserGroup();
    }
  }, [profile]);

  // Calcular clientes filtrados usando useMemo para evitar recálculos desnecessários
  const clientesFiltrados = useMemo(() => {
    let clientesFiltrados = clientes;

    // Primeiro filtrar por situação
    if (filtroSituacao !== 'Todos') {
      clientesFiltrados = clientes.filter((cliente) => cliente.Situação === filtroSituacao);
    }

    // Depois filtrar por termo de busca
    if (searchTerm.trim()) {
      const termoLower = searchTerm.toLowerCase().trim();
      clientesFiltrados = clientesFiltrados.filter((cliente) => {
        // Buscar principalmente pelo nome do cliente
        const nomeCliente = cliente.Cliente.toLowerCase();
        if (nomeCliente.includes(termoLower)) {
          return true;
        }

        // Buscar também por outros campos relevantes
        const responsavel = cliente['Responsável (Parceiro)']?.toLowerCase() || '';
        const parceiro = cliente.Parceiros?.toLowerCase() || '';
        const id = cliente.Id.toString();

        return (
          responsavel.includes(termoLower) ||
          parceiro.includes(termoLower) ||
          id.includes(termoLower)
        );
      });
    }

    console.log(`🔍 Filtro: "${filtroSituacao}" | Busca: "${searchTerm}" | Resultados: ${clientesFiltrados.length}`);
    return clientesFiltrados;
  }, [clientes, searchTerm, filtroSituacao]);

  // Organizar clientes por estágio
  const clientesPorEstagio = estagiosPipeline.map(estagio => {
    const clientesNoEstagio = clientesFiltrados.filter(cliente => 
      mapearEstagioParaPipeline(cliente.Estágio) === estagio.id
    );
    
    return {
      ...estagio,
      clientes: clientesNoEstagio
    };
  });

  const handleClienteClick = (cliente: ClientePowerBI) => {
    setClienteSelecionado(cliente);
    setShowModal(true);
  };

  const fecharModal = () => {
    setShowModal(false);
    setClienteSelecionado(null);
  };

  const handleRefresh = () => {
    if (userGroup?.power_bi_url) {
      fetchPowerBIData(userGroup.power_bi_url, userGroup.name);
    }
  };

  // Função para lidar com mudanças no campo de busca
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const termo = event.target.value;
    setSearchTerm(termo);
  };

  // Função para limpar a busca
  const limparBusca = () => {
    setSearchTerm('');
  };

  // Função para mudar filtro de situação
  const handleFiltroSituacaoChange = (situacao: string) => {
    setFiltroSituacao(situacao);
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Pipeline de Clientes</h1>
              <p className="text-gray-600 mt-2">Carregando dados do Power BI...</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-700 text-lg">Carregando dados do Power BI...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Pipeline de Clientes</h1>
              <p className="text-gray-600 mt-2">Erro ao carregar dados</p>
            </div>
          </div>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Erro ao Carregar Dados</h3>
              <p className="text-red-700 mb-4">{error}</p>
              <Button onClick={handleRefresh} className="bg-red-600 hover:bg-red-700">
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar Novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pipeline de Clientes</h1>
            <p className="text-gray-600 mt-2">
              Visualize o progresso dos clientes através dos estágios
              {userGroup && (
                <span className="text-blue-600">
                  • Grupo: {userGroup.name} • Filtrado por parceiro
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            className="flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => navigate('/formulario')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Cliente
          </Button>
        </div>
      </div>

      {/* Filtro Ativo */}
      {userGroup && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Filter className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Filtro Ativo</p>
                  <p className="text-xs text-blue-600">
                    Mostrando apenas clientes do parceiro: <span className="font-semibold">{userGroup.name}</span>
                    {filtroSituacao !== 'Todos' && (
                      <span> • Situação: <span className="font-semibold">{filtroSituacao}</span></span>
                    )}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-blue-600">
                  {clientesFiltrados.length} cliente{clientesFiltrados.length !== 1 ? 's' : ''} encontrado{clientesFiltrados.length !== 1 ? 's' : ''}
                  {searchTerm && clientesFiltrados.length !== clientes.length && (
                    <span className="block text-blue-500">
                      de {clientes.length} total
                    </span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar por nome do cliente, responsável, parceiro ou ID..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={limparBusca}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              {searchTerm && (
                <div className="text-sm text-gray-600">
                  {clientesFiltrados.length} resultado{clientesFiltrados.length !== 1 ? 's' : ''}
                </div>
              )}
              <div className="flex items-center gap-2">
                <select
                  value={filtroSituacao}
                  onChange={(e) => handleFiltroSituacaoChange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="Em aberto">Em Aberto</option>
                  <option value="Perdida">Perdidos</option>
                  <option value="Todos">Todos</option>
                </select>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Mais Filtros
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700">Total de Clientes</p>
                <p className="text-2xl font-bold text-blue-900">{clientesFiltrados.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-700">Em Aberto</p>
                <p className="text-2xl font-bold text-green-900">
                  {clientesFiltrados.filter(c => c.Situação === 'Em aberto').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-500 rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-yellow-700">Em Análise</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {clientesFiltrados.filter(c => 
                    c.Situação === 'Em aberto' && 
                    (c.Estágio === 'Análise Financeira' || c.Estágio === 'Análise Jurídica')
                  ).length}
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  Análise Financeira + Jurídica
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-500 rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-red-700">Perdidos</p>
                <p className="text-2xl font-bold text-red-900">
                  {clientesFiltrados.filter(c => c.Situação === 'Perdida').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Pipeline de Clientes</span>
          </CardTitle>
          <CardDescription>
            Visualize o progresso dos clientes através dos diferentes estágios do processo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-8 overflow-x-auto pb-4 px-2">
            {clientesPorEstagio.map((estagio) => (
              <EstagioPipeline
                key={estagio.id}
                estagio={estagio}
                clientes={estagio.clientes}
                onClienteClick={handleClienteClick}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal de detalhes do cliente */}
      {showModal && clienteSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Detalhes do Cliente</h2>
                <Button variant="outline" onClick={fecharModal}>
                  ✕
                </Button>
              </div>
              
              <div className="space-y-6">
                {/* Informações básicas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Informações Básicas</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Cliente:</span> {formatarNome(clienteSelecionado.Cliente)}</div>
                      <div><span className="font-medium">ID:</span> {clienteSelecionado.Id}</div>
                      <div><span className="font-medium">Parceiro:</span> {clienteSelecionado.Parceiros}</div>
                      <div><span className="font-medium">Responsável:</span> {clienteSelecionado['Responsável (Parceiro)']}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Status e Valores</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Situação:</span> {clienteSelecionado.Situação}</div>
                      <div><span className="font-medium">Estágio:</span> {clienteSelecionado.Estágio}</div>
                      <div><span className="font-medium">Valor:</span> {formatarValor(clienteSelecionado.Valor)}</div>
                      {clienteSelecionado['Valor (FINAL)'] && (
                        <div><span className="font-medium">Valor Final:</span> {formatarValor(clienteSelecionado['Valor (FINAL)'])}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Datas importantes */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Datas Importantes</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><span className="font-medium">Início:</span> {formatarData(clienteSelecionado.Início)}</div>
                    {clienteSelecionado.Término && (
                      <div><span className="font-medium">Término:</span> {formatarData(clienteSelecionado.Término)}</div>
                    )}
                    {clienteSelecionado['Entrada Comercial'] && (
                      <div><span className="font-medium">Entrada Comercial:</span> {formatarData(clienteSelecionado['Entrada Comercial'])}</div>
                    )}
                    {clienteSelecionado['Entrada Crédito'] && (
                      <div><span className="font-medium">Entrada Crédito:</span> {formatarData(clienteSelecionado['Entrada Crédito'])}</div>
                    )}
                    {clienteSelecionado['Entrada Comitê'] && (
                      <div><span className="font-medium">Entrada Comitê:</span> {formatarData(clienteSelecionado['Entrada Comitê'])}</div>
                    )}
                    {clienteSelecionado['Entrada Negociação'] && (
                      <div><span className="font-medium">Entrada Negociação:</span> {formatarData(clienteSelecionado['Entrada Negociação'])}</div>
                    )}
                    {clienteSelecionado['Entrada Registro'] && (
                      <div><span className="font-medium">Entrada Registro:</span> {formatarData(clienteSelecionado['Entrada Registro'])}</div>
                    )}
                    {clienteSelecionado['Entrada AIJ'] && (
                      <div><span className="font-medium">Entrada AIJ:</span> {formatarData(clienteSelecionado['Entrada AIJ'])}</div>
                    )}
                  </div>
                </div>

                {/* Informações adicionais */}
                {(clienteSelecionado['Motivo de perda'] || clienteSelecionado['Pendências da etapa']) && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Informações Adicionais</h3>
                    <div className="space-y-2 text-sm">
                      {clienteSelecionado['Motivo de perda'] && (
                        <div><span className="font-medium">Motivo de Perda:</span> {clienteSelecionado['Motivo de perda']}</div>
                      )}
                      {clienteSelecionado['Pendências da etapa'] && (
                        <div><span className="font-medium">Pendências:</span> {clienteSelecionado['Pendências da etapa']}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-6 space-x-3">
                <Button variant="outline" onClick={fecharModal}>
                  Fechar
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Editar Cliente
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientesCadastrados; 