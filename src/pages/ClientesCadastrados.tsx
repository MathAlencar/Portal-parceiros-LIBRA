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
      case 'Em aberto': return 'bg-green-500 text-white border-green-600';
      case 'Perdida': return 'bg-red-500 text-white border-red-600';
      default: return 'bg-gray-500 text-white border-gray-600';
    }
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-xl transition-all duration-200 border-2 hover:border-blue-400 bg-white shadow-md hover:scale-[1.02]"
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="space-y-4">
          {/* Header do card */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 text-lg truncate">
                {formatarNome(cliente.Cliente)}
              </h4>
              <p className="text-sm text-gray-700 truncate mt-1 font-medium">
                {cliente['Responsável (Parceiro)']}
              </p>
            </div>
            <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusColor(cliente.Situação)} shadow-sm`}>
              {cliente.Situação}
            </span>
          </div>

          {/* Valor */}
          <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-lg">
            <DollarSign className="h-5 w-5 text-green-600" />
            <span className="text-lg font-bold text-gray-900">
              {formatarValor(cliente.Valor)}
            </span>
          </div>

          {/* Parceiro */}
          <div className="flex items-center space-x-2">
            <Building className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-gray-700 truncate font-medium">
              {cliente.Parceiros}
            </span>
          </div>

          {/* Data de início */}
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-600" />
            <span className="text-sm text-gray-700 font-medium">
              Início: {formatarData(cliente.Início)}
            </span>
          </div>

          {/* ID do cliente */}
          <div className="text-xs text-gray-500 pt-3 border-t border-gray-200 font-medium">
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
    blue: 'bg-gradient-to-br from-blue-100 to-blue-200 border-blue-400 shadow-md',
    green: 'bg-gradient-to-br from-green-100 to-green-200 border-green-400 shadow-md',
    purple: 'bg-gradient-to-br from-purple-100 to-purple-200 border-purple-400 shadow-md',
    orange: 'bg-gradient-to-br from-orange-100 to-orange-200 border-orange-400 shadow-md',
    yellow: 'bg-gradient-to-br from-yellow-100 to-yellow-200 border-yellow-400 shadow-md',
    indigo: 'bg-gradient-to-br from-indigo-100 to-indigo-200 border-indigo-400 shadow-md',
    pink: 'bg-gradient-to-br from-pink-100 to-pink-200 border-pink-400 shadow-md',
    teal: 'bg-gradient-to-br from-teal-100 to-teal-200 border-teal-400 shadow-md'
  };

  const coresTexto = {
    blue: 'text-blue-900',
    green: 'text-green-900',
    purple: 'text-purple-900',
    orange: 'text-orange-900',
    yellow: 'text-yellow-900',
    indigo: 'text-indigo-900',
    pink: 'text-pink-900',
    teal: 'text-teal-900'
  };

  const coresIndicador = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    yellow: 'bg-yellow-500',
    indigo: 'bg-indigo-500',
    pink: 'bg-pink-500',
    teal: 'bg-teal-500'
  };

  return (
    <div className={`w-96 min-w-96 ${cores[estagio.cor as keyof typeof cores]} rounded-lg border-2 p-4 h-[700px] flex flex-col`}>
      {/* Header do estágio */}
      <div className="mb-4 flex-shrink-0">
        <h3 className={`font-bold text-lg mb-2 ${coresTexto[estagio.cor as keyof typeof coresTexto]}`}>{estagio.nome}</h3>
        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium ${coresTexto[estagio.cor as keyof typeof coresTexto]}`}>
            {clientes.length} cliente{clientes.length !== 1 ? 's' : ''}
          </span>
          <div className={`w-3 h-3 ${coresIndicador[estagio.cor as keyof typeof coresIndicador]} rounded-full shadow-sm`}></div>
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
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600 font-medium">Nenhum cliente</p>
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
  const [dataLoaded, setDataLoaded] = useState(false); // Controle para evitar recarregamento

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
      setDataLoaded(true); // Marcar que os dados foram carregados com sucesso
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
    if (profile && !dataLoaded) {
      fetchUserGroup();
    } else if (profile && dataLoaded) {
      // Se os dados já foram carregados, apenas definir loading como false
      setLoading(false);
    }
  }, [profile, dataLoaded]);

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
      setDataLoaded(false); // Resetar o estado para permitir recarregamento
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
      <div className="p-6 space-y-6 min-h-screen">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 bg-white border-gray-300 hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="text-center bg-white p-8 rounded-lg shadow-md border border-gray-200">
            <div className="animate-spin h-16 w-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-6" />
            <p className="text-gray-800 text-xl font-semibold">Carregando dados do Power BI...</p>
            <p className="text-gray-600 mt-2">Aguarde enquanto buscamos as informações dos clientes</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 bg-white border-gray-300 hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Pipeline de Clientes</h1>
              <p className="text-gray-700 mt-2 font-medium">Erro ao carregar dados</p>
            </div>
          </div>
        </div>
        <Card className="border-red-400 bg-red-100 shadow-lg">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">!</span>
              </div>
              <h3 className="text-xl font-bold text-red-900 mb-3">Erro ao Carregar Dados</h3>
              <p className="text-red-800 mb-6 text-lg">{error}</p>
              <Button onClick={handleRefresh} className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3">
                <RefreshCw className="h-5 w-5 mr-2" />
                Tentar Novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 bg-white border-gray-300 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          {/* <div>
            <h1 className="text-3xl font-bold text-gray-900">Pipeline de Clientes   </h1>
            <p className="text-gray-700 mt-2">
              Visualize o progresso dos clientes através dos estágios 
              {userGroup && (
                <span className="text-blue-700 font-medium">
                  • Grupo: {userGroup.name} • Filtrado por parceiro
                </span>
              )}
            </p>
          </div> */}
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            className="flex items-center space-x-2 bg-white border-gray-300 hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => navigate('/formulario')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Cliente
          </Button>
        </div>
      </div>

      {/* Filtro Ativo */}
      {userGroup && (
        <Card className="border-blue-300 bg-blue-100 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Filter className="h-5 w-5 text-blue-700" />
                <div>
                  <p className="text-sm font-semibold text-blue-900">Filtro Ativo</p>
                  <p className="text-sm text-blue-800">
                    Mostrando apenas clientes do parceiro: <span className="font-bold">{userGroup.name}</span>
                    {filtroSituacao !== 'Todos' && (
                      <span> • Situação: <span className="font-bold">{filtroSituacao}</span></span>
                    )}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-blue-900">
                  {clientesFiltrados.length} cliente{clientesFiltrados.length !== 1 ? 's' : ''} encontrado{clientesFiltrados.length !== 1 ? 's' : ''}
                  {searchTerm && clientesFiltrados.length !== clientes.length && (
                    <span className="block text-blue-700">
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
      <Card className="bg-white shadow-md border-gray-200">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar por nome do cliente, responsável, parceiro ou ID..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-12 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              />
              {searchTerm && (
                <button
                  onClick={limparBusca}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              {searchTerm && (
                <div className="text-sm text-gray-700 font-medium">
                  {clientesFiltrados.length} resultado{clientesFiltrados.length !== 1 ? 's' : ''}
                </div>
              )}
              <div className="flex items-center gap-2">
                <select
                  value={filtroSituacao}
                  onChange={(e) => handleFiltroSituacaoChange(e.target.value)}
                  className="px-3 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white text-gray-900"
                >
                  <option value="Em aberto">Em Aberto</option>
                  <option value="Perdida">Perdidos</option>
                  <option value="Todos">Todos</option>
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-blue-600 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-100">Total de Clientes</p>
                <p className="text-3xl font-bold text-white">{clientesFiltrados.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 border-green-600 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-100">Em Aberto</p>
                <p className="text-3xl font-bold text-white">
                  {clientesFiltrados.filter(c => c.Situação === 'Em aberto').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 border-orange-600 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-orange-100">Em Análise</p>
                <p className="text-3xl font-bold text-white">
                  {clientesFiltrados.filter(c => 
                    c.Situação === 'Em aberto' && 
                    (c.Estágio === 'Análise Financeira' || c.Estágio === 'Análise Jurídica')
                  ).length}
                </p>
                <p className="text-xs text-orange-100 mt-1">
                  Análise Financeira + Jurídica
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 border-red-600 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-red-100">Perdidos</p>
                <p className="text-3xl font-bold text-white">
                  {clientesFiltrados.filter(c => c.Situação === 'Perdida').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Visualization */}
      <Card className="bg-white shadow-md border-gray-200">
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <CardTitle className="flex items-center space-x-2 text-gray-900">
            <Users className="h-5 w-5" />
            <span>Pipeline de Clientes</span>
          </CardTitle>
          <CardDescription className="text-gray-700">
            Visualize o progresso dos clientes através dos diferentes estágios do processo
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
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
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Detalhes do Cliente</h2>
                <Button 
                  variant="outline" 
                  onClick={fecharModal}
                  className="bg-white border-gray-300 hover:bg-gray-50 w-10 h-10 p-0 rounded-full"
                >
                  ✕
                </Button>
              </div>
              
              <div className="space-y-8">
                {/* Informações básicas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h3 className="font-bold text-gray-900 mb-4 text-lg">Informações Básicas</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between"><span className="font-semibold text-gray-700">Cliente:</span> <span className="text-gray-900">{formatarNome(clienteSelecionado.Cliente)}</span></div>
                      <div className="flex justify-between"><span className="font-semibold text-gray-700">ID:</span> <span className="text-gray-900">{clienteSelecionado.Id}</span></div>
                      <div className="flex justify-between"><span className="font-semibold text-gray-700">Parceiro:</span> <span className="text-gray-900">{clienteSelecionado.Parceiros}</span></div>
                      <div className="flex justify-between"><span className="font-semibold text-gray-700">Responsável:</span> <span className="text-gray-900">{clienteSelecionado['Responsável (Parceiro)']}</span></div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h3 className="font-bold text-gray-900 mb-4 text-lg">Status e Valores</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between"><span className="font-semibold text-gray-700">Situação:</span> <span className="text-gray-900">{clienteSelecionado.Situação}</span></div>
                      <div className="flex justify-between"><span className="font-semibold text-gray-700">Estágio:</span> <span className="text-gray-900">{clienteSelecionado.Estágio}</span></div>
                      <div className="flex justify-between"><span className="font-semibold text-gray-700">Valor:</span> <span className="text-gray-900 font-bold">{formatarValor(clienteSelecionado.Valor)}</span></div>
                      {clienteSelecionado['Valor (FINAL)'] && (
                        <div className="flex justify-between"><span className="font-semibold text-gray-700">Valor Final:</span> <span className="text-gray-900 font-bold">{formatarValor(clienteSelecionado['Valor (FINAL)'])}</span></div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Datas importantes */}
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <h3 className="font-bold text-blue-900 mb-4 text-lg">Datas Importantes</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between"><span className="font-semibold text-blue-700">Início:</span> <span className="text-blue-900">{formatarData(clienteSelecionado.Início)}</span></div>
                    {clienteSelecionado.Término && (
                      <div className="flex justify-between"><span className="font-semibold text-blue-700">Término:</span> <span className="text-blue-900">{formatarData(clienteSelecionado.Término)}</span></div>
                    )}
                    {clienteSelecionado['Entrada Comercial'] && (
                      <div className="flex justify-between"><span className="font-semibold text-blue-700">Entrada Comercial:</span> <span className="text-blue-900">{formatarData(clienteSelecionado['Entrada Comercial'])}</span></div>
                    )}
                    {clienteSelecionado['Entrada Crédito'] && (
                      <div className="flex justify-between"><span className="font-semibold text-blue-700">Entrada Crédito:</span> <span className="text-blue-900">{formatarData(clienteSelecionado['Entrada Crédito'])}</span></div>
                    )}
                    {clienteSelecionado['Entrada Comitê'] && (
                      <div className="flex justify-between"><span className="font-semibold text-blue-700">Entrada Comitê:</span> <span className="text-blue-900">{formatarData(clienteSelecionado['Entrada Comitê'])}</span></div>
                    )}
                    {clienteSelecionado['Entrada Negociação'] && (
                      <div className="flex justify-between"><span className="font-semibold text-blue-700">Entrada Negociação:</span> <span className="text-blue-900">{formatarData(clienteSelecionado['Entrada Negociação'])}</span></div>
                    )}
                    {clienteSelecionado['Entrada Registro'] && (
                      <div className="flex justify-between"><span className="font-semibold text-blue-700">Entrada Registro:</span> <span className="text-blue-900">{formatarData(clienteSelecionado['Entrada Registro'])}</span></div>
                    )}
                    {clienteSelecionado['Entrada AIJ'] && (
                      <div className="flex justify-between"><span className="font-semibold text-blue-700">Entrada AIJ:</span> <span className="text-blue-900">{formatarData(clienteSelecionado['Entrada AIJ'])}</span></div>
                    )}
                  </div>
                </div>

                {/* Informações adicionais */}
                {(clienteSelecionado['Motivo de perda'] || clienteSelecionado['Pendências da etapa']) && (
                  <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                    <h3 className="font-bold text-yellow-900 mb-4 text-lg">Informações Adicionais</h3>
                    <div className="space-y-3 text-sm">
                      {clienteSelecionado['Motivo de perda'] && (
                        <div className="flex justify-between"><span className="font-semibold text-yellow-700">Motivo de Perda:</span> <span className="text-yellow-900">{clienteSelecionado['Motivo de perda']}</span></div>
                      )}
                      {clienteSelecionado['Pendências da etapa'] && (
                        <div className="flex justify-between"><span className="font-semibold text-yellow-700">Pendências:</span> <span className="text-yellow-900">{clienteSelecionado['Pendências da etapa']}</span></div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-8 space-x-4">
                <Button 
                  variant="outline" 
                  onClick={fecharModal}
                  className="bg-white border-gray-300 hover:bg-gray-50 font-semibold"
                >
                  Fechar
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
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