import React, { useState, useEffect, Fragment } from 'react';
import { usePloomesOptions, PloomesOption } from '@/hooks/usePloomesOptions';
import { SelectInput } from '@/components/FormMVP/SelectInput';
import { InputText } from '@/components/FormInputs/InputText';

const LOCAL_STORAGE_KEY = 'ploomes_selected_tomadores';
const TOMADORES_STORAGE_KEY = 'ploomes_tomadores_dados';
const etapas = ['Tomadores', 'Empréstimo', 'Garantia'];

const initialTomador = {
  nome: '',
  cpf: '',
  cnpj: '',
  telefone: '',
  endereco: '',
  juros: '',
  money: '',
  cep: '',
  data: '',
};

const EMPRESTIMO_STORAGE_KEY = 'ploomes_emprestimo_dados';
const initialEmprestimo = {
  amortizacao: '',
  carencia: '',
  valorSolicitado: '',
  rendaTotal: '',
  prazoSolicitado: '',
  jurosSolicitado: '',
  comentarios: '',
  motivo: '',
};

const GARANTIA_STORAGE_KEY = 'ploomes_garantia_dados';
const initialGarantia = {
  garantiaPertenceTomador: '',
  valorGarantia: '',
  cidadeGarantia: '',
  ruralUrbano: '',
  enderecoGarantia: '',
  unidadeFederativa: '',
  situacaoGarantia: '',
  escritura: '',
  nomeMatrícula: '',
  processoInventario: '',
  penhora: '',
  penhoraAtiva: '',
  dividaCondominio: '',
  dividaIPTU: '',
};

// Definições iniciais
const GARANTIDORES_STORAGE_KEY = 'ploomes_garantidores_dados';
const initialGarantidor = {
  estadoCivil: '',
  nome: '',
  cpf: '',
  cnpj: '',
  profissao: '',
};

const Formulario: React.FC = () => {
  const [etapa, setEtapa] = useState(0);
  const [quantidade, setQuantidade] = useState<number | null>(null);
  const [quantidadeId, setQuantidadeId] = useState<number | null>(null);
  const [tomadores, setTomadores] = useState(
    Array(4).fill(null).map(() => ({ ...initialTomador }))
  );

  // Estado dos dados do empréstimo
  const [emprestimo, setEmprestimo] = useState({ ...initialEmprestimo });

  // Estado dos dados da garantia
  const [garantia, setGarantia] = useState({ ...initialGarantia });

  // Estado dos dados dos garantidores
  const [garantidores, setGarantidores] = useState([{ ...initialGarantidor }]);
  const [showGarantidorModal, setShowGarantidorModal] = useState(false);
  const [showQtdGarantidores, setShowQtdGarantidores] = useState(false);
  const [showGarantidores, setShowGarantidores] = useState(false);
  const [qtdGarantidores, setQtdGarantidores] = useState(1);

  const { options, loading, error } = usePloomesOptions(31829);

  useEffect(() => {
    const savedQtd = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedQtd) {
      try {
        const { Id, Name } = JSON.parse(savedQtd);
        setQuantidade(Name ? Number(Name) : null);
        setQuantidadeId(Id ?? null);
      } catch {}
    }
    const savedTomadores = localStorage.getItem(TOMADORES_STORAGE_KEY);
    if (savedTomadores) {
      try {
        const parsed = JSON.parse(savedTomadores);
        if (Array.isArray(parsed) && parsed.length === 4) setTomadores(parsed);
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(TOMADORES_STORAGE_KEY, JSON.stringify(tomadores));
  }, [tomadores]);

  // Carregar dados do empréstimo do localStorage ao iniciar
  useEffect(() => {
    const savedEmprestimo = localStorage.getItem(EMPRESTIMO_STORAGE_KEY);
    if (savedEmprestimo) {
      try {
        const parsed = JSON.parse(savedEmprestimo);
        setEmprestimo({ ...initialEmprestimo, ...parsed });
      } catch {}
    }
  }, []);

  // Salvar dados do empréstimo no localStorage sempre que mudarem
  useEffect(() => {
    localStorage.setItem(EMPRESTIMO_STORAGE_KEY, JSON.stringify(emprestimo));
  }, [emprestimo]);

  // Carregar dados da garantia do localStorage ao iniciar
  useEffect(() => {
    const savedGarantia = localStorage.getItem(GARANTIA_STORAGE_KEY);
    if (savedGarantia) {
      try {
        const parsed = JSON.parse(savedGarantia);
        setGarantia({ ...initialGarantia, ...parsed });
      } catch {}
    }
  }, []);

  // Salvar dados da garantia no localStorage sempre que mudarem
  useEffect(() => {
    localStorage.setItem(GARANTIA_STORAGE_KEY, JSON.stringify(garantia));
  }, [garantia]);

  // Carregar garantidores do localStorage
  useEffect(() => {
    const saved = localStorage.getItem(GARANTIDORES_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setGarantidores(parsed);
      } catch {}
    }
  }, []);
  useEffect(() => {
    localStorage.setItem(GARANTIDORES_STORAGE_KEY, JSON.stringify(garantidores));
  }, [garantidores]);

  // Lógica para mostrar etapa garantidores
  useEffect(() => {
    if (garantia.garantiaPertenceTomador === 'Imóvel de terceiro') {
      setShowGarantidores(true);
    } else {
      setShowGarantidores(false);
      setShowQtdGarantidores(false);
      setShowGarantidorModal(false);
    }
  }, [garantia.garantiaPertenceTomador]);

  const handleSelect = (opt: PloomesOption) => {
    setQuantidade(Number(opt.Name));
    setQuantidadeId(opt.Id);
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify({ Id: opt.Id, Name: opt.Name })
    );
  };

  const handleContinuar = () => {
    if (etapa === 0 && quantidade) setEtapa(1);
    else if (etapa > 0 && etapa < (quantidade || 0)) setEtapa(etapa + 1);
  };

  const handleVoltar = () => {
    if (etapa > 1) setEtapa(etapa - 1);
    else if (etapa === 1) setEtapa(0);
  };

  const updateTomador = (
    idx: number,
    campo: keyof typeof initialTomador,
    valor: string
  ) => {
    setTomadores(prev => {
      const novo = [...prev];
      novo[idx] = { ...novo[idx], [campo]: valor };
      localStorage.setItem(TOMADORES_STORAGE_KEY, JSON.stringify(novo));
      return novo;
    });
  };

  // Função para exibir informações do localStorage
  const handleDebug = () => {
    const savedQtd = localStorage.getItem(LOCAL_STORAGE_KEY);
    const savedTomadores = localStorage.getItem(TOMADORES_STORAGE_KEY);
    const savedGarantia = localStorage.getItem(GARANTIA_STORAGE_KEY);
    const savedEmprestimo= localStorage.getItem(EMPRESTIMO_STORAGE_KEY);
    const savedGarantidores = localStorage.getItem(GARANTIDORES_STORAGE_KEY);
    let qtd = 0;
    if (savedQtd) {
      try {
        const parsed = JSON.parse(savedQtd);
        qtd = parsed.Name ? Number(parsed.Name) : 0;
      } catch {}
    }
    if (savedTomadores) {
      try {
        const parsed = JSON.parse(savedTomadores);
        const parsedEmprestimo = JSON.parse(savedEmprestimo);
        const parsedGarantia = JSON.parse(savedGarantia);
        const parsedGarantidores = JSON.parse(savedGarantidores);
        console.log('Quantidade:', qtd);
        console.log('Tomadores:', parsed);
        console.log('Emprestimo:', parsedEmprestimo);
        console.log('Garantia:', parsedGarantia);
        console.log('Garantidores:', parsedGarantidores);
      } catch (err) {
        console.log('Erro ao ler dados dos tomadores:', err);
      }
    } else {
      console.log('Nenhum dado de tomadores salvo.');
    }
  };

  const renderBanner = () => (
    <div className="w-full flex justify-center py-8 bg-gradient-to-r from-purple-100 to-indigo-100">
      <div className="flex items-center max-w-7xl w-full bg-white rounded-3xl shadow-xl p-6 space-x-6">
        <div className="flex flex-col items-center justify-center p-4 rounded-xl">
          <img src="https://www.libracredito.com.br/images/site/logo-libra-credito.png"></img>
        </div>
        <div className="flex-1 text-center">
          <h1 className="text-3xl font-semibold text-gray-800">
            Cadastro de Proposta
          </h1>
          <p className="mt-1 text-gray-600">
            Preencha os dados em cada etapa para prosseguir com a proposta.
          </p>
        </div>
      </div>
    </div>
  );

  // Sidebar dinâmica
  const etapasSidebar = showGarantidores
    ? [...etapas, 'Garantidores']
    : etapas;

  const renderSidebar = () => (
    <aside className="w-64 bg-white rounded-2xl shadow-lg p-6 space-y-8">
      <nav className="space-y-6">
        {etapasSidebar.map((label, idx) => {
          // Lógica para destacar a etapa correta
          let isActive = false;
          let isEnabled = false;
          if (idx === 0) {
            isActive = (etapa === 0) || (etapa > 0 && etapa <= (quantidade || 0));
            isEnabled = etapa >= 0;
          } else if (idx === 1) {
            isActive = etapa === (quantidade || 0) + 1;
            isEnabled = etapa === (quantidade || 0) + 1;
          } else if (idx === 2) {
            isActive = etapa === (quantidade || 0) + 2;
            isEnabled = etapa === (quantidade || 0) + 2;
          } else if (showGarantidores && idx === 3) {
            isActive = (showGarantidores && showQtdGarantidores && etapa === (quantidade || 0) + 3) || (etapa >= (quantidade || 0) + 4 && etapa < (quantidade || 0) + 4 + qtdGarantidores);
            isEnabled = (showGarantidores && showQtdGarantidores && etapa === (quantidade || 0) + 3) || (etapa >= (quantidade || 0) + 4 && etapa < (quantidade || 0) + 4 + qtdGarantidores);
          }
          return (
            <Fragment key={label}>
              <button
                className={`flex items-center w-full space-x-3 px-2 py-2 rounded-lg transition font-semibold text-left ${
                  isActive
                    ? 'bg-indigo-100 text-blue-900'
                    : isEnabled
                      ? 'bg-white text-gray-700 hover:bg-gray-100'
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                disabled={!isEnabled}
                onClick={() => {
                  if (!isEnabled) return;
                  if (idx === 0) setEtapa(1);
                  else if (idx === 1) setEtapa((quantidade || 0) + 1);
                  else if (idx === 2) setEtapa((quantidade || 0) + 2);
                  else if (showGarantidores && idx === 3) setEtapa((quantidade || 0) + 4);
                }}
              >
                <div className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${isActive ? 'border-blue-800 bg-blue-800 text-white' : 'border-gray-300 bg-white'}`}>
                  {idx === 0 ? '👤' : idx === 1 ? '💰' : idx === 2 ? '🏠' : '🛡️'}
                </div>
                <span className="ml-2">
                  {label}
                </span>
              </button>
              {idx < etapasSidebar.length - 1 && <hr className="border-gray-200" />}
            </Fragment>
          );
        })}
      </nav>
      <div className="text-sm text-gray-600">
        <h2 className="font-semibold text-gray-800 mb-2">O que é um Tomador?</h2>
        <p>
          Pessoa física ou jurídica que solicita o crédito, com dados pessoais,
          endereço e informações financeiras para análise.
        </p>
      </div>
    </aside>
  );

  // Estado de loading para seleção de quantidade de tomadores
  const [showQtdLoading, setShowQtdLoading] = useState(true);
  useEffect(() => {
    if (etapa === 0) {
      setShowQtdLoading(true);
      const timer = setTimeout(() => setShowQtdLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [etapa]);

  // Renderização da etapa de seleção de quantidade
  const renderSelecaoQuantidade = () => {
    if (showQtdLoading) {
      return <LoadingStep msg="Carregando opções de quantidade de tomadores..." />;
    }
    return (
      <section className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-2xl space-y-6 flex flex-col items-center">
        <h2 className="text-2xl font-semibold text-gray-800">
          1. Quantidade de Tomadores
        </h2>
        <div>
          {loading && <p className="text-gray-500">Carregando opções...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && !error && (
            <SelectInput
              options={options.filter(o => o.Name !== '0')}
              value={quantidadeId ?? undefined}
              onChange={handleSelect}
            />
          )}
        </div>
        <button
          className="w-full py-3 font-semibold rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition transform hover:scale-105 disabled:opacity-50"
          onClick={handleContinuar}
          disabled={!quantidade}
        >
          Continuar
        </button>
      </section>
    );
  };

  // Estado de loading para transição entre etapas
  const [showLoading, setShowLoading] = useState(false);
  useEffect(() => {
    if (etapa > 0) {
      setShowLoading(true);
      const timer = setTimeout(() => setShowLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [etapa]);

  // Componente de loading
  const LoadingStep = ({ msg }: { msg: string }) => (
    <div className="flex flex-col items-center justify-center h-96">
      <svg className="animate-spin h-8 w-8 text-indigo-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
      </svg>
      <span className="text-indigo-700 text-sm font-medium">{msg}</span>
    </div>
  );

  // Renderização do formulário de cada tomador
  const renderCadastroTomador = () => {
    const idx = etapa - 1;
    const tomador = tomadores[idx];
    if (showLoading) {
      return <LoadingStep msg={`Agora iremos cadastrar o Tomador ${etapa}...`} />;
    }
    return (
      <section className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-2xl space-y-6 flex flex-col items-center">
        <h2 className="text-2xl font-semibold text-gray-800">
          Cadastro do Tomador {etapa} de {quantidade}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          {(
            [
              ['nome', 'Nome'],
              ['cpf', 'CPF'],
              ['cnpj', 'CNPJ'],
              ['telefone', 'Telefone'],
              ['endereco', 'Endereço'],
              ['juros', 'Juros'],
              ['money', 'Valor'],
              ['cep', 'CEP'],
              ['data', 'Data'],
            ] as const
          ).map(([campo, label]) => (
            <InputText
              key={campo}
              inputName={label}
              termo={tomador[campo]}
              onSetName={v => updateTomador(idx, campo, v)}
              placeholder={`Digite ${label.toLowerCase()}`}
              typeInput={campo === 'cpf' ? 'Cpf' : campo === 'cnpj' ? 'Cnpj' : 
                campo === 'cep' ? 'Cep' : campo === 'data' ? 'Data' : 'Text'}
            />
          ))}
        </div>
        <div className="flex justify-between space-x-4 w-full">
          <button
            className="flex-1 py-2 font-medium rounded-full bg-gray-200 text-gray-700 \
              hover:bg-gray-300 transition transform hover:scale-105"
            onClick={handleVoltar}
          >
            Voltar
          </button>
          <button
            className={`flex-1 py-2 font-medium rounded-full transition transform hover:scale-105 \
              ${etapa < (quantidade || 0)
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-green-600 text-white hover:bg-green-700'}`}
            onClick={() => {
              if (etapa < (quantidade || 0)) handleContinuar();
              else setEtapa((quantidade || 0) + 1); // Avança para empréstimo
            }}
          >
            {etapa < (quantidade || 0) ? 'Próximo' : 'Avançar para Empréstimo'}
          </button>
        </div>
      </section>
    );
  };

  // Renderização da etapa de empréstimo (formulário preenchível)
  const renderEmprestimo = () => {
    if (showLoading) {
      return <LoadingStep msg="Agora iremos cadastrar o Empréstimo..." />;
    }
    return (
      <section className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-2xl space-y-6 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Informações do empréstimo</h2>
        <div className="w-full bg-blue-50 border border-blue-200 rounded-xl p-6 mb-4">
          <h3 className="font-bold text-blue-900 mb-4">Informações do Empréstimo</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <InputText
              inputName="Amortização Escolhida"
              termo={emprestimo.amortizacao}
              onSetName={v => setEmprestimo(e => ({ ...e, amortizacao: v }))}
              placeholder="Selecione entre PRICE e SAC"
              typeInput="Text"
            />
            <InputText
              inputName="Carência"
              termo={emprestimo.carencia}
              onSetName={v => setEmprestimo(e => ({ ...e, carencia: v }))}
              placeholder="Selecione Carência Solicitada"
              typeInput="Text"
            />
            <InputText
              inputName="Valor Solicitado"
              termo={emprestimo.valorSolicitado}
              onSetName={v => setEmprestimo(e => ({ ...e, valorSolicitado: v }))}
              placeholder="Informe o Valor Solicitado (R$)"
              typeInput="Money"
            />
            <InputText
              inputName="Renda Total"
              termo={emprestimo.rendaTotal}
              onSetName={v => setEmprestimo(e => ({ ...e, rendaTotal: v }))}
              placeholder="Informe a Renda Total (R$)"
              typeInput="Money"
            />
            <InputText
              inputName="Prazo Solicitado"
              termo={emprestimo.prazoSolicitado}
              onSetName={v => setEmprestimo(e => ({ ...e, prazoSolicitado: v }))}
              placeholder="Digite o prazo solicitado"
              typeInput="Text"
            />
            <InputText
              inputName="Juros Solicitado"
              termo={emprestimo.jurosSolicitado}
              onSetName={v => setEmprestimo(e => ({ ...e, jurosSolicitado: v }))}
              placeholder="Juros da operação"
              typeInput="Juros"
            />
          </div>
          <h3 className="font-bold text-blue-900 mb-2 mt-6">Motivo e Comentários</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputText
              inputName="Comentários"
              termo={emprestimo.comentarios}
              onSetName={v => setEmprestimo(e => ({ ...e, comentarios: v }))}
              placeholder="Comentários sobre o motivo"
              typeInput="Text"
            />
            <InputText
              inputName="Motivo do Empréstimo"
              termo={emprestimo.motivo}
              onSetName={v => setEmprestimo(e => ({ ...e, motivo: v }))}
              placeholder="Selecione o Motivo do Empréstimo"
              typeInput="Text"
            />
          </div>
        </div>
        <div className="flex w-full justify-between mt-2">
          <button
            className="flex-1 py-2 font-medium rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition transform hover:scale-105"
            onClick={() => setEtapa(quantidade || 1)}
          >
            Voltar
          </button>
          <button
            className="flex-1 py-2 font-medium rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition transform hover:scale-105 ml-4"
            onClick={() => setEtapa((quantidade || 0) + 2)}
          >
            Próxima Etapa
          </button>
        </div>
      </section>
    );
  };

  // Renderização da etapa de garantia (formulário preenchível)
  const renderGarantia = () => {
    if (showLoading) {
      return <LoadingStep msg="Agora iremos cadastrar a Garantia..." />;
    }
    return (
      <section className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-2xl space-y-6 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Condições de Garantia</h2>
        <div className="w-full bg-blue-50 border border-blue-200 rounded-xl p-6 mb-4">
          <h3 className="font-bold text-blue-900 mb-4">Dados Básicos da Garantia</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <InputText
              inputName="Garantia pertence ao tomador?"
              termo={garantia.garantiaPertenceTomador}
              onSetName={v => setGarantia(e => ({ ...e, garantiaPertenceTomador: v }))}
              placeholder="Selecione Sim ou Não"
              typeInput="Text"
            />
            <InputText
              inputName="Valor da Garantia"
              termo={garantia.valorGarantia}
              onSetName={v => setGarantia(e => ({ ...e, valorGarantia: v }))}
              placeholder="Digite o valor da garantia (R$)"
              typeInput="Money"
            />
          </div>
          <h3 className="font-bold text-blue-900 mb-2 mt-6">Localização</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <InputText
              inputName="Cidade da garantia"
              termo={garantia.cidadeGarantia}
              onSetName={v => setGarantia(e => ({ ...e, cidadeGarantia: v }))}
              placeholder="Selecione a cidade"
              typeInput="Text"
            />
            <InputText
              inputName="Selecione Rural ou Urbano"
              termo={garantia.ruralUrbano}
              onSetName={v => setGarantia(e => ({ ...e, ruralUrbano: v }))}
              placeholder="Selecione Rural ou Urbano"
              typeInput="Text"
            />
            <InputText
              inputName="Endereço da Garantia"
              termo={garantia.enderecoGarantia}
              onSetName={v => setGarantia(e => ({ ...e, enderecoGarantia: v }))}
              placeholder="Digite o endereço"
              typeInput="Text"
            />
            <InputText
              inputName="Unidade Federativa"
              termo={garantia.unidadeFederativa}
              onSetName={v => setGarantia(e => ({ ...e, unidadeFederativa: v }))}
              placeholder="Selecione a unidade federativa"
              typeInput="Text"
            />
          </div>
          <h3 className="font-bold text-blue-900 mb-2 mt-6">Situação da Garantia</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <InputText
              inputName="Garantia quitada?"
              termo={garantia.situacaoGarantia}
              onSetName={v => setGarantia(e => ({ ...e, situacaoGarantia: v }))}
              placeholder="Selecione Sim ou Não"
              typeInput="Text"
            />
          </div>
          <h3 className="font-bold text-blue-900 mb-2 mt-6">Documentação</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <InputText
              inputName="Escritura individual?"
              termo={garantia.escritura}
              onSetName={v => setGarantia(e => ({ ...e, escritura: v }))}
              placeholder="Selecione Sim ou Não"
              typeInput="Text"
            />
            <InputText
              inputName="Nome está na matrícula?"
              termo={garantia.nomeMatrícula}
              onSetName={v => setGarantia(e => ({ ...e, nomeMatrícula: v }))}
              placeholder="Selecione Sim ou Não"
              typeInput="Text"
            />
          </div>
          <h3 className="font-bold text-blue-900 mb-2 mt-6">Situações Especiais</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <InputText
              inputName="Processo de inventário?"
              termo={garantia.processoInventario}
              onSetName={v => setGarantia(e => ({ ...e, processoInventario: v }))}
              placeholder="Selecione Sim ou Não"
              typeInput="Text"
            />
            <InputText
              inputName="Penhora?"
              termo={garantia.penhora}
              onSetName={v => setGarantia(e => ({ ...e, penhora: v }))}
              placeholder="Selecione Sim ou Não"
              typeInput="Text"
            />
            <InputText
              inputName="Penhora ativa?"
              termo={garantia.penhoraAtiva}
              onSetName={v => setGarantia(e => ({ ...e, penhoraAtiva: v }))}
              placeholder="Selecione Sim ou Não"
              typeInput="Text"
            />
          </div>
          <h3 className="font-bold text-blue-900 mb-2 mt-6">Dívidas</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputText
              inputName="Dívida de condomínio"
              termo={garantia.dividaCondominio}
              onSetName={v => setGarantia(e => ({ ...e, dividaCondominio: v }))}
              placeholder="Selecione Sim ou Não"
              typeInput="Text"
            />
            <InputText
              inputName="Dívida de IPTU"
              termo={garantia.dividaIPTU}
              onSetName={v => setGarantia(e => ({ ...e, dividaIPTU: v }))}
              placeholder="Selecione Sim ou Não"
              typeInput="Text"
            />
          </div>
        </div>
        <div className="flex w-full justify-between mt-2">
          <button
            className="flex-1 py-2 font-medium rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition transform hover:scale-105"
            onClick={() => setEtapa((quantidade || 0) + 1)}
          >
            Voltar
          </button>
          <button
            className="flex-1 py-2 font-medium rounded-full bg-blue-700 text-white hover:bg-blue-800 transition transform hover:scale-105 ml-4"
            onClick={() => {
              if (garantia.garantiaPertenceTomador === 'Imóvel de terceiro') {
                setShowGarantidorModal(true);
              } else {
                alert('Fluxo finalizado!');
              }
            }}
          >
            Finalizar Cadastro
          </button>
        </div>
      </section>
    );
  };

  // Modal de aviso para garantidores
  const renderGarantidorModal = () => (
    <div className="fixed z-50 inset-0 flex items-center justify-center">
      <div className="fixed inset-0 bg-black opacity-30" />
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-md mx-auto z-50 flex flex-col items-center relative">
        <div className="text-blue-600 text-5xl mb-4">i</div>
        <h2 className="text-xl font-bold mb-2">Atenção!</h2>
        <p className="text-gray-700 mb-6 text-center">Como o imóvel é de terceiros, é necessário cadastrar os garantidores da operação.</p>
        <div className="flex w-full justify-between mt-2">
          <button
            className="flex-1 py-2 font-medium rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition transform hover:scale-105 mr-4"
            onClick={() => {
              setShowGarantidorModal(false);
              setEtapa((quantidade || 0) + 1);
            }}
          >
            Voltar
          </button>
          <button
            className="flex-1 py-2 font-medium rounded-full bg-blue-700 text-white hover:bg-blue-800 transition transform hover:scale-105"
            onClick={() => {
              setShowGarantidorModal(false);
              setShowQtdGarantidores(true);
              setEtapa((quantidade || 0) + 3);
            }}
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );

  // Etapa para escolher quantidade de garantidores
  const renderQtdGarantidores = () => (
    <section className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md space-y-6 flex flex-col items-center">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Quantidade de Garantidores</h2>
      <div className="w-full flex flex-col items-center">
        <label className="block mb-2 font-medium">Selecione a quantidade de garantidores</label>
        <select
          className="border rounded px-4 py-2 w-40 text-center"
          value={qtdGarantidores}
          onChange={e => {
            const qtd = Number(e.target.value);
            setQtdGarantidores(qtd);
            setGarantidores(Array(qtd).fill(null).map(() => ({ ...initialGarantidor })));
          }}
        >
          {[1, 2, 3, 4].map(n => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>
      <button
        className="w-full py-3 font-semibold rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition transform hover:scale-105 disabled:opacity-50 mt-6"
        onClick={() => {
          setShowQtdGarantidores(false);
          setEtapa((quantidade || 0) + 4);
        }}
      >
        Continuar
      </button>
    </section>
  );

  // Formulário de garantidores
  const renderGarantidores = () => {
    // O índice do garantidor atual é etapa - ((quantidade || 0) + 4)
    const idx = etapa - ((quantidade || 0) + 4);
    const garantidor = garantidores[idx] || { ...initialGarantidor };
    return (
      <section className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-2xl space-y-6 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Garantidor {idx + 1}</h2>
        <div className="w-full bg-blue-50 border border-blue-200 rounded-xl p-6 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <InputText
              inputName="Estado Civil"
              termo={garantidor.estadoCivil}
              onSetName={v => {
                setGarantidores(prev => {
                  const novo = [...prev];
                  novo[idx] = { ...novo[idx], estadoCivil: v };
                  return novo;
                });
              }}
              placeholder="Selecione o estado civil"
              typeInput="Text"
            />
            <InputText
              inputName="Nome"
              termo={garantidor.nome}
              onSetName={v => {
                setGarantidores(prev => {
                  const novo = [...prev];
                  novo[idx] = { ...novo[idx], nome: v };
                  return novo;
                });
              }}
              placeholder="Digite o nome"
              typeInput="Text"
            />
            <InputText
              inputName="CPF"
              termo={garantidor.cpf}
              onSetName={v => {
                setGarantidores(prev => {
                  const novo = [...prev];
                  novo[idx] = { ...novo[idx], cpf: v };
                  return novo;
                });
              }}
              placeholder="Digite o CPF"
              typeInput="Cpf"
            />
            <InputText
              inputName="CNPJ"
              termo={garantidor.cnpj}
              onSetName={v => {
                setGarantidores(prev => {
                  const novo = [...prev];
                  novo[idx] = { ...novo[idx], cnpj: v };
                  return novo;
                });
              }}
              placeholder="Digite o CNPJ"
              typeInput="Cnpj"
            />
            <InputText
              inputName="Profissão"
              termo={garantidor.profissao}
              onSetName={v => {
                setGarantidores(prev => {
                  const novo = [...prev];
                  novo[idx] = { ...novo[idx], profissao: v };
                  return novo;
                });
              }}
              placeholder="Digite o nome do garantidor"
              typeInput="Text"
            />
          </div>
        </div>
        <div className="flex w-full justify-between mt-2">
          <button
            className="flex-1 py-2 font-medium rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition transform hover:scale-105"
            onClick={() => {
              if (idx > 0) setEtapa(etapa - 1);
              else setEtapa((quantidade || 0) + 2);
            }}
          >
            Voltar
          </button>
          <button
            className="flex-1 py-2 font-medium rounded-full bg-blue-700 text-white hover:bg-blue-800 transition transform hover:scale-105 ml-4"
            onClick={() => {
              if (idx + 1 < qtdGarantidores) {
                setEtapa(etapa + 1);
              } else {
                alert('Cadastro finalizado!');
              }
            }}
          >
            {idx + 1 < qtdGarantidores ? 'Próximo Garantidor' : 'Finalizar Cadastro'}
          </button>
        </div>
      </section>
    );
  };

  // Ajustar renderização principal para incluir fluxo correto
  return (
    <>
      {showGarantidorModal && renderGarantidorModal()}
      {renderBanner()}
      <main className="min-h-screen bg-gradient-to-r from-purple-100 to-indigo-100 flex items-start justify-center py-16">
        <div className="flex space-x-12 max-w-7xl w-full px-4">
          {renderSidebar()}
          <div className="flex-1 flex flex-col items-center">
            {etapa === 0
              ? renderSelecaoQuantidade()
              : etapa > 0 && etapa <= (quantidade || 0)
                ? renderCadastroTomador()
                : etapa === (quantidade || 0) + 1
                  ? renderEmprestimo()
                  : etapa === (quantidade || 0) + 2
                    ? renderGarantia()
                    : showGarantidores && showQtdGarantidores && etapa === (quantidade || 0) + 3
                      ? renderQtdGarantidores()
                      : showGarantidores && etapa >= (quantidade || 0) + 4 && etapa < (quantidade || 0) + 4 + qtdGarantidores
                        ? renderGarantidores()
                        : null}
          </div>
        </div>
        {/* Botão de debug fixo no canto inferior direito */}
        <button
          onClick={handleDebug}
          className="fixed bottom-6 right-6 bg-blue-900 text-white px-6 py-3 rounded-full shadow-xl hover:bg-blue-700 transition z-50 font-bold text-lg tracking-wide"
        >
          Debug
        </button>
      </main>
    </>
  );
};

export default Formulario;
